from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.workspace.database.connection import get_db
from app.workspace.database.models import User, Design
from app.utils.auth import get_current_user
from app.workspace.services.design_service import design_service

router = APIRouter(prefix="/schematic", tags=["schematic"])

@router.get("/{design_id}/layout")
def get_schematic_layout(
    design_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    design = design_service.get_design(db, design_id)
    if not design:
        raise HTTPException(status_code=404, detail="Design not found")
    return {
        "schematic_json": design.schematic_json,
        "schematic_svg": design.schematic_svg
    }
