from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Dict, Any
from pydantic import BaseModel

from app.plugins.manager import plugin_manager
from app.workspace.database.models import User
from app.utils.auth import get_current_user

router = APIRouter(prefix="/plugins", tags=["plugins"])

class PluginCommandRequest(BaseModel):
    command: str
    args: Dict[str, Any] = {}

@router.get("/", response_model=List[str])
def list_available_plugins(current_user: User = Depends(get_current_user)):
    """
    Returns list of all registered EDA integration plugins.
    """
    return plugin_manager.list_plugins()

@router.post("/{plugin_name}/execute")
def execute_plugin_command(
    plugin_name: str,
    req_in: PluginCommandRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Runs a tool command against the specified EDA plugin.
    """
    result = plugin_manager.run_tool_command(
        plugin_name=plugin_name,
        command=req_in.command,
        **req_in.args
    )
    if result.get("status") == "error":
        raise HTTPException(
            status_code=400,
            detail=result.get("message")
        )
    return result
