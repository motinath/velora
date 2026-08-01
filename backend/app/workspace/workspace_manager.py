import logging
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.workspace.database.models import WorkspaceState
from app.workspace.di_container import di

logger = logging.getLogger(__name__)

class WorkspaceManager:
    """
    Manages IDE workspace state (open tabs, active tab, pinned files, cursor positions, scroll offsets, zoom levels)
    with SQL database persistence.
    """
    def get_state(self, project_id: int, db: Session) -> Dict[str, Any]:
        """
        Retrieves the workspace state for a given project.
        """
        state = db.query(WorkspaceState).filter(WorkspaceState.project_id == project_id).first()
        if state:
            return {
                "project_id": state.project_id,
                "open_tabs": state.open_tabs or [],
                "active_tab": state.active_tab,
                "pinned_files": state.pinned_files or [],
                "cursor_line": state.cursor_line,
                "cursor_column": state.cursor_column,
                "scroll_top": state.scroll_top,
                "zoom_level": state.zoom_level
            }
            
        return {
            "project_id": project_id,
            "open_tabs": [],
            "active_tab": None,
            "pinned_files": [],
            "cursor_line": 1,
            "cursor_column": 1,
            "scroll_top": 0,
            "zoom_level": 100
        }

    def save_state(
        self,
        project_id: int,
        open_tabs: List[str],
        active_tab: Optional[str],
        pinned_files: List[str],
        cursor_line: int,
        cursor_column: int,
        scroll_top: int,
        zoom_level: int,
        db: Session
    ) -> Dict[str, Any]:
        """
        Saves or updates the workspace state in the database.
        """
        state = db.query(WorkspaceState).filter(WorkspaceState.project_id == project_id).first()
        if not state:
            state = WorkspaceState(project_id=project_id)
            db.add(state)
            
        state.open_tabs = open_tabs
        state.active_tab = active_tab
        state.pinned_files = pinned_files
        state.cursor_line = cursor_line
        state.cursor_column = cursor_column
        state.scroll_top = scroll_top
        state.zoom_level = zoom_level
        
        db.commit()
        db.refresh(state)
        
        logger.info(f"[WorkspaceManager] Persisted workspace state for project {project_id}")
        return self.get_state(project_id, db)

# Register in DI Container
di.register_singleton("workspace_manager", WorkspaceManager())
