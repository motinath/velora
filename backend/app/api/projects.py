from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database.connection import get_db
from app.database.models import User, Project
from app.database.schemas import ProjectCreate, ProjectResponse, ProjectDetail
from app.services.project_service import project_service
from app.utils.auth import get_current_user

router = APIRouter(prefix="/projects", tags=["projects"])

@router.post("/", response_model=ProjectResponse)
def create_project(
    project_in: ProjectCreate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    return project_service.create_project(
        db, 
        name=project_in.name, 
        user_id=current_user.id,
        technology=project_in.technology,
        design_type=project_in.design_type,
        description=project_in.description
    )

@router.get("/", response_model=List[ProjectResponse])
def list_projects(
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    return project_service.list_projects(db, user_id=current_user.id)

@router.get("/{project_id}", response_model=ProjectDetail)
def get_project_detail(
    project_id: int, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    project = project_service.get_project(db, project_id)
    if not project or project.user_id != current_user.id:
        raise HTTPException(
            status_code=404,
            detail="Project not found"
        )
    return project

@router.delete("/{project_id}", response_model=ProjectResponse)
def delete_project(
    project_id: int, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    project = project_service.get_project(db, project_id)
    if not project or project.user_id != current_user.id:
        raise HTTPException(
            status_code=404,
            detail="Project not found"
        )
    return project_service.delete_project(db, project_id)
