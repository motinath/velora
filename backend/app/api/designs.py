from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database.connection import get_db
from app.database.models import User
from app.database.schemas import DesignResponse, GenerationRequest
from app.services.design_service import design_service
from app.services.project_service import project_service
from app.utils.auth import get_current_user

router = APIRouter(prefix="/designs", tags=["designs"])

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
