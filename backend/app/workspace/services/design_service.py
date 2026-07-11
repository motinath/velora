from sqlalchemy.orm import Session
from typing import Dict, Any, List, Optional
import logging
import datetime

# Database models
from app.workspace.database.models import Design, Project
from app.workspace.repositories.base import BaseRepository

# Pipeline Engines
from app.ai.planner.parser import requirement_parser
from app.ai.planner.planner import design_planner
from app.engineering.graph.connection_engine import connection_engine
from app.engineering.graph.constraint_checker import constraint_checker
from app.engineering.renderer.schematic_renderer import schematic_renderer
from app.engineering.netlist.netlist_generator import netlist_generator
from app.engineering.simulation.simulation_manager import simulation_manager

# LLM routing
from app.ai.providers.router import model_router
from app.config import settings

logger = logging.getLogger(__name__)

class DesignRepository(BaseRepository[Design]):
    def __init__(self):
        super().__init__(Design)

    def get_by_project(self, db: Session, project_id: int) -> List[Design]:
        return db.query(Design).filter(Design.project_id == project_id).order_by(Design.created_at.desc()).all()

design_repository = DesignRepository()

class DesignService:
    def generate_design(self, db: Session, project_id: int, prompt: str) -> Design:
        """
        Executes the full Phase 1 semiconductor circuit design pipeline:
        Requirement Parser -> Design Planner -> Connection Engine -> Circuit Graph ->
        Constraint Checker -> Schematic Engine -> Netlist Generator -> Simulation Manager.
        """
        # 0. Retrieve project to verify tech and type defaults
        project = db.query(Project).filter(Project.id == project_id).first()
        if not project:
            raise ValueError("Project not found")

        # 1. Execute compiler pipeline
        from app.ai.compiler.compiler import design_compiler
        ctx = design_compiler.compile(
            prompt=prompt,
            project_id=project_id,
            project_design_type=project.design_type,
            project_name=project.name
        )

        logs_content = "\n".join(ctx.logs)

        # 2. Calculate next version and create Design Record
        from sqlalchemy import func
        max_ver = db.query(func.max(Design.version)).filter(Design.project_id == project_id).scalar() or 0
        new_version = max_ver + 1

        design_data = {
            "project_id": project_id,
            "prompt": prompt,
            "requirements_json": ctx.reqs,
            "plan_json": ctx.plan,
            "circuit_graph_json": ctx.graph.to_json() if ctx.graph else {},
            "constraint_results_json": ctx.constraint_results,
            "schematic_svg": ctx.schematic.get("svg", ""),
            "schematic_json": ctx.schematic.get("layout", {}),
            "netlist_content": ctx.netlist,
            "simulation_results_json": ctx.sim_results,
            "explanation_markdown": ctx.explanation,
            "logs_content": logs_content,
            "version": new_version,
            "readiness_report_json": getattr(ctx, "readiness_report", {})
        }
        
        design = design_repository.create(db, design_data)

        # 3. Create Design Intent Records based on the design type
        design_type = ctx.reqs.get("type", "")
        intents_list = []
        
        if "SRAM" in design_type:
            intents_list = [
                {
                    "decision": "Pull-up PMOS sizing (W=0.36um, L=0.15um)",
                    "reason": "Sized smaller to reduce subthreshold leakage path to ground and maintain the Pull-up Ratio (PR < 1.0) needed for reliable writeability.",
                    "tradeoffs": "Smaller size reduces subthreshold leakage but limits static noise margin (SNM).",
                    "alternatives": ["Asymmetric driver ratio", "High-Vt implant custom cells"],
                    "references": ["SKY130 SRAM Cell Design Guidelines", "SRAM Write Ability Standard JEDEC"],
                    "affected_files": ["schematic_layout.json", "spice_netlist.sp"],
                    "affected_blocks": ["M_PU1", "M_PU2"],
                    "verification_status": "PASSED" if ctx.constraint_results.get("status") == "PASSED" else "FAILED"
                },
                {
                    "decision": "Pull-down NMOS sizing (W=0.54um, L=0.15um)",
                    "reason": "Sized wider to provide high drive strength, maintaining a Cell Ratio (CR > 1.2) for read stability.",
                    "tradeoffs": "Larger gate capacitance vs improved Read Static Noise Margin.",
                    "alternatives": ["Symmetrical unit-size driver", "Dual-port dual-WL layout"],
                    "references": ["PDK SRAM Cell Stability Rules", "IEEE Transactions on Electron Devices - SRAM Scaling"],
                    "affected_files": ["schematic_layout.json", "spice_netlist.sp"],
                    "affected_blocks": ["M_PD1", "M_PD2"],
                    "verification_status": "PASSED" if ctx.constraint_results.get("status") == "PASSED" else "FAILED"
                }
            ]
        elif "Oscillator" in design_type:
            stages = ctx.reqs.get("parameters", {}).get("stages", 3)
            intents_list = [
                {
                    "decision": f"Odd-Stage Inverter Loop (stages={stages})",
                    "reason": "Loop gain with 180° phase shift triggers self-sustaining oscillation at the frequency set by stage delay.",
                    "tradeoffs": "More stages decrease frequency but improve phase stability and jitter metrics.",
                    "alternatives": ["LC Tank Oscillator", "Relaxation Oscillator"],
                    "references": ["CMOS Clock Generation Topologies", "IEEE Journal of Solid-State Circuits - Ring Oscillators"],
                    "affected_files": ["schematic_layout.json", "spice_netlist.sp"],
                    "affected_blocks": [f"M_P{i}" for i in range(1, stages+1)] + [f"M_N{i}" for i in range(1, stages+1)],
                    "verification_status": "PASSED" if ctx.constraint_results.get("status") == "PASSED" else "FAILED"
                },
                {
                    "decision": "Symmetric Inverter PMOS/NMOS driver ratios",
                    "reason": "Symmetric width parameters (PMOS sized wider than NMOS) compensate for lower mobility, ensuring equal rise/fall times.",
                    "tradeoffs": "Symmetric rise/fall times at the cost of larger input gate capacitance.",
                    "alternatives": ["Minimum width PMOS (Low power)", "Skewed transition inverters"],
                    "references": ["SKY130 PDK rules section 3.2", "Digital Integrated Circuits - Rabaey"],
                    "affected_files": ["schematic_layout.json", "spice_netlist.sp"],
                    "affected_blocks": ["M_P1", "M_N1"],
                    "verification_status": "PASSED" if ctx.constraint_results.get("status") == "PASSED" else "FAILED"
                }
            ]
        elif "Mirror" in design_type:
            intents_list = [
                {
                    "decision": "Diode-connected reference NMOS (M_REF)",
                    "reason": "Converts reference bias current into a gate voltage, which is then distributed to the matching mirror transistor gates to replicate current.",
                    "tradeoffs": "Simple topology but prone to channel-length modulation mismatch.",
                    "alternatives": ["Cascode Current Mirror", "Wilson Current Mirror"],
                    "references": ["Analog Bias Circuits, Sec 4.1", "Gray & Meyer - Analysis and Design of Analog ICs"],
                    "affected_files": ["schematic_layout.json", "spice_netlist.sp"],
                    "affected_blocks": ["M_REF"],
                    "verification_status": "PASSED" if ctx.constraint_results.get("status") == "PASSED" else "FAILED"
                },
                {
                    "decision": "Matched transistor dimensions (1:1 ratio)",
                    "reason": "Sized matching gate width and length to ensure highly accurate 1:1 mirroring of bias currents.",
                    "tradeoffs": "Balanced sizing, but susceptible to local threshold voltage variation.",
                    "alternatives": ["Scaled mirror ratio layout", "Common-centroid array layout"],
                    "references": ["PDK Device Matching Rules", "Design of Analog CMOS Integrated Circuits - Razavi"],
                    "affected_files": ["schematic_layout.json", "spice_netlist.sp"],
                    "affected_blocks": ["M_MIR"],
                    "verification_status": "PASSED" if ctx.constraint_results.get("status") == "PASSED" else "FAILED"
                }
            ]
        elif "Differential" in design_type:
            intents_list = [
                {
                    "decision": "Active PMOS mirror load",
                    "reason": "Converts differential current change into a single-ended output voltage, maximizing differential gain.",
                    "tradeoffs": "Higher gain at the expense of lower voltage headroom and asymmetric loading.",
                    "alternatives": ["Resistive load differential pair", "Folded cascode stage"],
                    "references": ["Differential Amplifier Active Load Design", "Razavi - Design of Analog CMOS Integrated Circuits"],
                    "affected_files": ["schematic_layout.json", "spice_netlist.sp"],
                    "affected_blocks": ["M_L1", "M_L2"],
                    "verification_status": "PASSED" if ctx.constraint_results.get("status") == "PASSED" else "FAILED"
                },
                {
                    "decision": "Large Tail NMOS transistor (M_TAIL)",
                    "reason": "Sized large to handle the sum of the bias currents and provide a constant, high-impedance tail current sink.",
                    "tradeoffs": "High CMRR at the expense of voltage headroom at the tail node.",
                    "alternatives": ["Resistor tail bias", "Ideal current source component"],
                    "references": ["Analog CMOS Integrated Circuits, Ch 3", "IEEE Journal of Solid-State Circuits - Tail Mismatches"],
                    "affected_files": ["schematic_layout.json", "spice_netlist.sp"],
                    "affected_blocks": ["M_TAIL"],
                    "verification_status": "PASSED" if ctx.constraint_results.get("status") == "PASSED" else "FAILED"
                }
            ]
        
        # Insert design intents
        from app.workspace.database.models import DesignIntent
        for intent_data in intents_list:
            intent_obj = DesignIntent(
                project_id=project_id,
                design_id=design.id,
                decision=intent_data["decision"],
                reason=intent_data["reason"],
                tradeoffs=intent_data["tradeoffs"],
                alternatives=intent_data["alternatives"],
                references=intent_data["references"],
                engineer_id=project.user_id,
                affected_files=intent_data["affected_files"],
                affected_blocks=intent_data["affected_blocks"],
                verification_status=intent_data["verification_status"]
            )
            db.add(intent_obj)
        db.commit()
        db.refresh(design)

        # Synchronize active files in state engine
        from app.workspace.services.state_manager import state_manager
        state_manager.sync_files_to_state(db, design)

        return design

    def get_project_designs(self, db: Session, project_id: int) -> List[Design]:
        return design_repository.get_by_project(db, project_id)

    def get_design(self, db: Session, design_id: int) -> Optional[Design]:
        return design_repository.get(db, design_id)

design_service = DesignService()
