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
    Used by the frontend to populate the topology selector dropdown
    and dynamically populate the optimization options.
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
