from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List

from app.workspace.database.connection import get_db
from app.workspace.database.models import User, Project, ProjectPermission, WorkspaceComment
from app.workspace.services.project_service import project_service
from app.utils.auth import get_current_user

router = APIRouter(prefix="/projects", tags=["overview"])

class ProjectShareRequest(BaseModel):
    email: str
    role: str # 'viewer' or 'editor'

class CommentCreateRequest(BaseModel):
    comment_text: str

@router.post("/{project_id}/share")
def share_project(
    project_id: int,
    req_in: ProjectShareRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Verify current user owns the project
    project = project_service.get_project(db, project_id)
    if not project or project.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found or you are not the owner"
        )
    
    # Find the target user by email
    target_user = db.query(User).filter(User.email == req_in.email).first()
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with email '{req_in.email}' not found."
        )
        
    # Check if permission already exists
    existing = db.query(ProjectPermission).filter(
        ProjectPermission.project_id == project_id,
        ProjectPermission.user_id == target_user.id
    ).first()
    
    if existing:
        existing.role = req_in.role
        db.commit()
        db.refresh(existing)
        return {"status": "success", "message": f"Updated {req_in.email} permission to {req_in.role}."}
        
    # Create new permission
    new_perm = ProjectPermission(
        project_id=project_id,
        user_id=target_user.id,
        role=req_in.role
    )
    db.add(new_perm)
    db.commit()
    return {"status": "success", "message": f"Shared project with {req_in.email} as {req_in.role}."}

@router.get("/{project_id}/permissions")
def list_project_permissions(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Verify ownership or member status
    project = project_service.get_project(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    is_member = (project.user_id == current_user.id) or db.query(ProjectPermission).filter(
        ProjectPermission.project_id == project_id,
        ProjectPermission.user_id == current_user.id
    ).first()
    
    if not is_member:
        raise HTTPException(status_code=403, detail="Not authorized to view project permissions")
        
    perms = db.query(ProjectPermission).filter(ProjectPermission.project_id == project_id).all()
    
    results = []
    # Owner
    owner = db.query(User).filter(User.id == project.user_id).first()
    results.append({
        "email": owner.email if owner else "unknown",
        "role": "owner"
      })
    for p in perms:
        u = db.query(User).filter(User.id == p.user_id).first()
        results.append({
            "email": u.email if u else "unknown",
            "role": p.role
        })
    return results

@router.post("/{project_id}/comments")
def add_project_comment(
    project_id: int,
    req_in: CommentCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = project_service.get_project(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    # Member verification
    is_member = (project.user_id == current_user.id) or db.query(ProjectPermission).filter(
        ProjectPermission.project_id == project_id,
        ProjectPermission.user_id == current_user.id
    ).first()
    
    if not is_member:
        raise HTTPException(status_code=403, detail="Not authorized to comment")
        
    comment = WorkspaceComment(
        project_id=project_id,
        user_id=current_user.id,
        comment_text=req_in.comment_text
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return {
        "id": comment.id,
        "email": current_user.email,
        "comment_text": comment.comment_text,
        "created_at": comment.created_at
    }

@router.get("/{project_id}/comments")
def list_project_comments(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = project_service.get_project(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    is_member = (project.user_id == current_user.id) or db.query(ProjectPermission).filter(
        ProjectPermission.project_id == project_id,
        ProjectPermission.user_id == current_user.id
    ).first()
    
    if not is_member:
        raise HTTPException(status_code=403, detail="Not authorized to read comments")
        
    comments = db.query(WorkspaceComment).filter(WorkspaceComment.project_id == project_id).order_by(WorkspaceComment.created_at.asc()).all()
    
    results = []
    for c in comments:
        u = db.query(User).filter(User.id == c.user_id).first()
        results.append({
            "id": c.id,
            "email": u.email if u else "unknown",
            "comment_text": c.comment_text,
            "created_at": c.created_at
        })
    return results
