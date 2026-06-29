from sqlalchemy.orm import Session
from typing import Dict, Any, List, Optional
import logging
import datetime

# Database models
from app.database.models import Design, Project
from app.repositories.base import BaseRepository

# Pipeline Engines
from app.planner.parser import requirement_parser
from app.planner.planner import design_planner
from app.graph.connection_engine import connection_engine
from app.graph.constraint_checker import constraint_checker
from app.renderer.schematic_renderer import schematic_renderer
from app.netlist.netlist_generator import netlist_generator
from app.simulation.simulation_manager import simulation_manager

# LLM routing
from app.providers.router import model_router
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
        logs = []
        def log_step(msg: str):
            timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S.%f")[:-3]
            log_line = f"[{timestamp}] [VELORA-CORE] {msg}"
            logs.append(log_line)
            logger.info(msg)

        log_step(f"Starting compiler pipeline for prompt: '{prompt}'")

        # 0. Retrieve project to verify tech and type defaults
        project = db.query(Project).filter(Project.id == project_id).first()
        if not project:
            raise ValueError("Project not found")

        # 1. Requirement Parser
        log_step("Executing Stage 1: Requirement Parser...")
        reqs = requirement_parser.parse(prompt, project_design_type=project.design_type)
        log_step(f"Parsed requirements: Type='{reqs['type']}', Optimization='{reqs['optimization']}', VDD={reqs['parameters']['vdd']}V")

        # 2. Design Planner
        log_step("Executing Stage 2: Design Planner...")
        plan = design_planner.plan(reqs)
        log_step(f"Sized {len(plan['components'])} circuit components and established topology layout.")

        # 3. Connection Engine & Circuit Graph
        log_step("Executing Stage 3: Connection Engine...")
        graph = connection_engine.build_graph(plan["components"], plan["connections"])
        log_step(f"Circuit Graph successfully constructed: {len(graph.nodes)} nodes, {len(graph.edges)} edges.")

        # 4. Constraint Checker
        log_step("Executing Stage 4: Constraint Checker (DRC / ERC)...")
        constraint_results = constraint_checker.check(graph, plan["constraints"])
        log_step(f"Design Rule Checks finished. Status: {constraint_results['status']}")
        for err in constraint_results["errors"]:
            log_step(f"[DRC-ERROR] {err}")
        for warn in constraint_results["warnings"]:
            log_step(f"[DRC-WARNING] {warn}")

        # 5. Schematic Renderer
        log_step("Executing Stage 5: Schematic Renderer Layout...")
        schematic = schematic_renderer.render(graph)
        log_step(f"Deterministic coordinates placed. Generated SVG: {len(schematic['svg'])} chars.")

        # 6. Netlist Generator
        log_step("Executing Stage 6: Netlist Generator...")
        netlist = netlist_generator.generate(graph, design_name=project.name)
        log_step(f"Valid SPICE netlist compiled.")

        # 7. Simulation Manager
        log_step("Executing Stage 7: Simulation Manager (Ngspice Solver)...")
        sim_results = simulation_manager.run_simulation(
            netlist=netlist,
            topology_type=reqs["type"],
            parameters=reqs["parameters"],
            optimization=reqs["optimization"]
        )
        log_step(f"Simulation completed with status: {sim_results['status']}")
        log_step(f"Calculated performance metrics: {list(sim_results['metrics'].keys())}")

        # 8. Explanation / AI Analysis (Optionally call LLM to enrich explanation if key is present)
        explanation = plan["explanation"]
        provider = model_router.get_provider()
        
        # If we have an active LLM API provider and it is not Mock, enrich the summary
        if settings.MODEL_PROVIDER != "mock" and (
            settings.OPENAI_API_KEY or settings.CLAUDE_API_KEY or settings.GEMINI_API_KEY or settings.DEEPSEEK_API_KEY
        ):
            log_step("Enriching design analysis using active LLM router...")
            try:
                system_prompt = (
                    "You are a Senior Principal IC Design Engineer. Analyze the given circuit topology and parameters. "
                    "Provide a technical explanation covering: 1. Sizing ratios and stability, 2. Power vs delay trade-offs, "
                    "3. Layout constraints in SKY130 PDK. Be extremely professional. Format in Markdown."
                )
                user_prompt = f"Topology: {reqs['type']}\nParameters: {reqs['parameters']}\nNetlist:\n{netlist}\nDRC warnings: {constraint_results['warnings']}"
                enriched_explanation = provider.generate(system_prompt=system_prompt, user_prompt=user_prompt)
                if enriched_explanation:
                    explanation = enriched_explanation
                    log_step("LLM commentary appended successfully.")
            except Exception as llm_err:
                log_step(f"[WARNING] LLM enrichment failed: {str(llm_err)}. Using default planner description.")

        log_step("Pipeline compilation completed successfully. Committing to database...")
        logs_content = "\n".join(logs)

        # 9. Create Design Record
        design_data = {
            "project_id": project_id,
            "prompt": prompt,
            "requirements_json": reqs,
            "plan_json": plan,
            "circuit_graph_json": graph.to_json(),
            "constraint_results_json": constraint_results,
            "schematic_svg": schematic["svg"],
            "schematic_json": schematic["layout"],
            "netlist_content": netlist,
            "simulation_results_json": sim_results,
            "explanation_markdown": explanation,
            "logs_content": logs_content
        }
        
        design = design_repository.create(db, design_data)
        return design

    def get_project_designs(self, db: Session, project_id: int) -> List[Design]:
        return design_repository.get_by_project(db, project_id)

    def get_design(self, db: Session, design_id: int) -> Optional[Design]:
        return design_repository.get(db, design_id)

design_service = DesignService()
