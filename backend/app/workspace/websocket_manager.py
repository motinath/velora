import logging
from typing import Dict, List
from fastapi import WebSocket
from app.workspace.di_container import di

logger = logging.getLogger(__name__)

class WebSocketManager:
    """
    Manages active WebSocket connections from frontend clients.
    Supports real-time streaming of compiler output logs and execution progress status.
    """
    def __init__(self):
        # Maps project_id (int) -> List of WebSocket connections
        self._active_connections: Dict[int, List[WebSocket]] = {}

    async def connect(self, project_id: int, websocket: WebSocket) -> None:
        """Accepts and stores a new client websocket connection."""
        await websocket.accept()
        if project_id not in self._active_connections:
            self._active_connections[project_id] = []
        self._active_connections[project_id].append(websocket)
        logger.info(f"[WebSocketManager] Connected client to project {project_id}")

    def disconnect(self, project_id: int, websocket: WebSocket) -> None:
        """Removes a client websocket connection."""
        if project_id in self._active_connections:
            if websocket in self._active_connections[project_id]:
                self._active_connections[project_id].remove(websocket)
                logger.info(f"[WebSocketManager] Disconnected client from project {project_id}")
            if not self._active_connections[project_id]:
                del self._active_connections[project_id]

    async def broadcast_to_project(self, project_id: int, message: Dict[str, Any]) -> None:
        """Sends a JSON message to all active clients of a project."""
        if project_id not in self._active_connections:
            return
            
        logger.info(f"[WebSocketManager] Broadcasting to project {project_id}: {message}")
        for connection in list(self._active_connections[project_id]):
            try:
                await connection.send_json(message)
            except Exception as e:
                logger.error(f"[WebSocketManager] Error sending message, disconnecting: {e}")
                self.disconnect(project_id, connection)

# Register in DI Container
di.register_singleton("websocket_manager", WebSocketManager())
