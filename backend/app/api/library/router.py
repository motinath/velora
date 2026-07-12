from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict, Any
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.engineering.library.library import component_library
from app.workspace.database.models import User, LibraryComponent
from app.workspace.database.connection import get_db
from app.utils.auth import get_current_user
from app.workspace.database.schemas import LibraryComponentResponse

router = APIRouter(prefix="/library", tags=["library"])

class TogglePDKRequest(BaseModel):
    pdk_name: str
    enabled: bool

@router.get("/components", response_model=List[LibraryComponentResponse])
def list_components(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Returns the list of all active components available in enabled PDK packages.
    """
    try:
        enabled_pdk_list = [pdk for pdk, enabled in component_library.enabled_pdks.items() if enabled]
        
        comps = db.query(LibraryComponent).all()
        filtered_comps = []
        for c in comps:
            if c.technology in enabled_pdk_list or c.technology == "Generic":
                filtered_comps.append(c)
        return filtered_comps
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/pdk", response_model=Dict[str, bool])
def list_pdk_status(current_user: User = Depends(get_current_user)):
    """
    Returns the status of all registered component packs and PDK libraries.
    """
    return component_library.enabled_pdks

@router.post("/pdk/toggle")
def toggle_pdk(req: TogglePDKRequest, current_user: User = Depends(get_current_user)):
    """
    Enable or disable a specific PDK component package.
    """
    pdk = req.pdk_name
    component_library.enabled_pdks[pdk] = req.enabled
    return {
        "status": "success",
        "pdk_name": pdk,
        "enabled": req.enabled,
        "active_count": len(component_library.list_components())
    }
