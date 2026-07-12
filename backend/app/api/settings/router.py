from fastapi import APIRouter, Depends
from app.workspace.database.models import User
from app.utils.auth import get_current_user

router = APIRouter(prefix="/settings", tags=["settings"])

@router.get("/config")
def get_user_settings(current_user: User = Depends(get_current_user)):
    return {
        "email": current_user.email,
        "theme": "dark",
        "pdk_default": "SKY130",
        "compile_threads": 4
    }
