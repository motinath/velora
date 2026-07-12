from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.workspace.database.connection import get_db
from app.workspace.database.models import User
from app.workspace.database.schemas import DesignResponse, GenerationRequest, DesignIntentResponse
from app.workspace.services.design_service import design_service
from app.workspace.services.project_service import project_service
from app.utils.auth import get_current_user

router = APIRouter(prefix="/designs", tags=["designs"])

@router.get("/topologies", tags=["topologies"])
def list_topologies():
    """
    Returns all topology definitions known to the registry.
    """
    from app.engineering.topology.registry import topology_registry
    result = []
    for tpl in topology_registry.all_topologies():
        result.append({
            "canonical":     tpl.get("canonical", ""),
            "name":          tpl.get("name", ""),
            "family":        tpl.get("family", ""),
            "variant":       tpl.get("variant", ""),
            "category":      tpl.get("category", ""),
            "description":   tpl.get("description", ""),
            "keywords":      tpl.get("keywords", []),
            "technology":    tpl.get("technology", []),
            "optimizations": list(tpl.get("optimizations", {}).keys()),
        })
    # Sort alphabetically by category then canonical name for consistent UI order
    result.sort(key=lambda t: (t["category"], t["canonical"]))
    return result

@router.post("/project/{project_id}/generate", response_model=DesignResponse)
def generate_circuit(
    project_id: int,
    req_in: GenerationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = project_service.get_project(db, project_id)
    if not project or project.user_id != current_user.id:
        raise HTTPException(
            status_code=404,
            detail="Project not found or access denied."
        )
    try:
        design = design_service.generate_design(db, project_id=project_id, prompt=req_in.prompt)
        return design
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Compiler pipeline error: {str(e)}"
        )

@router.get("/project/{project_id}/history", response_model=List[DesignResponse])
def get_project_history(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = project_service.get_project(db, project_id)
    if not project or project.user_id != current_user.id:
        raise HTTPException(
            status_code=404,
            detail="Project not found or access denied."
        )
    return design_service.get_project_designs(db, project_id=project_id)

@router.get("/{design_id}", response_model=DesignResponse)
def get_design_by_id(
    design_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    design = design_service.get_design(db, design_id)
    if not design:
        raise HTTPException(
            status_code=404,
            detail="Design record not found."
        )
    
    # Check project ownership
    project = project_service.get_project(db, design.project_id)
    if not project or project.user_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Access denied to this design."
        )
    return design

@router.get("/{design_id}/intents", response_model=List[DesignIntentResponse])
def get_design_intents(
    design_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    design = design_service.get_design(db, design_id)
    if not design:
        raise HTTPException(
            status_code=404,
            detail="Design record not found."
        )
    
    # Check project ownership
    project = project_service.get_project(db, design.project_id)
    if not project or project.user_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Access denied to this design's intent logs."
        )
    from app.workspace.database.models import DesignIntent
    return db.query(DesignIntent).filter(DesignIntent.design_id == design_id).all()

@router.post("/project/{project_id}/rollback/{version}", response_model=DesignResponse)
def rollback_design(
    project_id: int,
    version: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = project_service.get_project(db, project_id)
    if not project or project.user_id != current_user.id:
        raise HTTPException(
            status_code=404,
            detail="Project not found or access denied."
        )
    try:
        from app.workspace.services.state_manager import state_manager
        design = state_manager.rollback_to_version(db, project_id=project_id, version=version)
        return design
    except ValueError as val_err:
        raise HTTPException(
            status_code=404,
            detail=str(val_err)
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Rollback error: {str(e)}"
        )

from pydantic import BaseModel
from typing import Dict

class TuningRequest(BaseModel):
    components: Dict[str, Dict[str, float]]
    vdd: float
    optimization: str

@router.post("/{design_id}/tune", response_model=DesignResponse)
def tune_design(
    design_id: int,
    req_in: TuningRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    design = design_service.get_design(db, design_id)
    if not design:
        raise HTTPException(
            status_code=404,
            detail="Design record not found."
        )
    
    # Check project ownership
    project = project_service.get_project(db, design.project_id)
    if not project or project.user_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Access denied to this design."
        )
        
    try:
        # Load existing plan_json
        plan = dict(design.plan_json or {})
        if "components" not in plan:
            plan["components"] = []
            
        # Update component parameters in the plan
        for comp_update in plan["components"]:
            comp_id = comp_update.get("id")
            if comp_id in req_in.components:
                if "parameters" not in comp_update:
                    comp_update["parameters"] = {}
                comp_update["parameters"].update(req_in.components[comp_id])
                
        # Rebuild circuit graph using ConnectionEngine
        from app.engineering.graph.connection_engine import connection_engine
        graph = connection_engine.build_graph(plan["components"], plan.get("connections", []))
        
        # Render new schematic SVG and layout using SchematicRenderer
        from app.engineering.renderer.schematic_renderer import schematic_renderer
        schematic = schematic_renderer.render(graph, topology_type=design.requirements_json.get("type"))
        
        # Generate new SPICE netlist using NetlistGenerator
        from app.engineering.netlist.netlist_generator import netlist_generator
        netlist = netlist_generator.generate(graph, design_name=design.requirements_json.get("type", "Generic Subcircuit"))
        
        # Run simulation using SimulationManager
        from app.engineering.simulation.simulation_manager import simulation_manager
        sim_parameters = dict(design.requirements_json.get("parameters", {}))
        sim_parameters["vdd"] = req_in.vdd
        sim_results = simulation_manager.run_simulation(
            netlist,
            design.requirements_json.get("type", ""),
            sim_parameters,
            req_in.optimization
        )
        
        # Run verification checks using ConstraintChecker
        from app.engineering.graph.constraint_checker import constraint_checker
        constraints = plan.get("constraints", [])
        constraint_results = constraint_checker.check(graph, constraints)
        
        # Generate engineering readiness report
        from app.engineering.verification.analyzer import engineering_analyzer
        readiness_report = engineering_analyzer.generate_readiness_report(
            graph=graph,
            constraint_results=constraint_results,
            sim_results=sim_results,
            topology_type=design.requirements_json.get("type", ""),
            optimization=req_in.optimization,
            vdd=req_in.vdd
        )
        
        # Save as a NEW checkpoint/version of the design!
        from sqlalchemy import func
        max_ver = (
            db.query(func.max(Design.version))
            .filter(Design.project_id == design.project_id)
            .scalar()
            or 0
        )
        
        # Update requirements_json with new parameters
        reqs = dict(design.requirements_json or {})
        if "parameters" not in reqs:
            reqs["parameters"] = {}
        reqs["parameters"]["vdd"] = req_in.vdd
        reqs["optimization"] = req_in.optimization
        
        design_data = {
            "project_id":             design.project_id,
            "prompt":                 f"Tuned sizing configuration (based on v{design.version})",
            "requirements_json":      reqs,
            "plan_json":              plan,
            "circuit_graph_json":     graph.to_json(),
            "constraint_results_json":constraint_results,
            "schematic_svg":          schematic.get("svg", ""),
            "schematic_json":         schematic.get("layout", {}),
            "netlist_content":        netlist,
            "simulation_results_json":sim_results,
            "explanation_markdown":   design.explanation_markdown,
            "logs_content":           f"[VELORA SYSTEM] Transistor dimensions updated dynamically on backend.\n[VELORA SYSTEM] Re-simulated Ngspice transient analysis.\n[VELORA SYSTEM] Verification checks successfully recalculated.",
            "version":                max_ver + 1,
            "readiness_report_json":  readiness_report,
        }
        
        new_design = design_service.design_repository.create(db, design_data)
        
        # Sync files to workspace state engine
        from app.workspace.services.state_manager import state_manager
        state_manager.sync_files_to_state(db, new_design)
        
        db.commit()
        db.refresh(new_design)
        return new_design
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Tuning compiler compilation failed: {str(e)}"
        )
