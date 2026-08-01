import logging
from typing import Dict, List, Callable, Any

logger = logging.getLogger(__name__)

# Strong type constants
PROJECT_OPENED = "ProjectOpened"
PROJECT_CLOSED = "ProjectClosed"
COMPILE_STARTED = "CompileStarted"
COMPILE_FINISHED = "CompileFinished"
COMPILE_FAILED = "CompileFailed"
SIMULATION_STARTED = "SimulationStarted"
SIMULATION_FINISHED = "SimulationFinished"
VERIFICATION_FINISHED = "VerificationFinished"
REPORT_GENERATED = "ReportGenerated"
ARTIFACT_CREATED = "ArtifactCreated"
FILE_CHANGED = "FileChanged"
GIT_COMMIT = "GitCommit"
SETTINGS_UPDATED = "SettingsUpdated"
WORKSPACE_LOADED = "WorkspaceLoaded"

EVENT_TYPES = [
    PROJECT_OPENED, PROJECT_CLOSED, COMPILE_STARTED, COMPILE_FINISHED, COMPILE_FAILED,
    SIMULATION_STARTED, SIMULATION_FINISHED, VERIFICATION_FINISHED, REPORT_GENERATED,
    ARTIFACT_CREATED, FILE_CHANGED, GIT_COMMIT, SETTINGS_UPDATED, WORKSPACE_LOADED
]

class EventBus:
    """
    Publish-Subscribe event bus for the VELORA semiconductor workspace.
    Enables decoupled event-driven workflows across services and compilation tasks.
    """
    def __init__(self):
        self._listeners: Dict[str, List[Callable[..., Any]]] = {e: [] for e in EVENT_TYPES}

    def subscribe(self, event_type: str, callback: Callable[..., Any]) -> None:
        """Subscribes a listener to a specific event type."""
        if event_type not in self._listeners:
            self._listeners[event_type] = []
        self._listeners[event_type].append(callback)
        logger.info(f"[EventBus] Subscribed listener to event: {event_type}")

    def publish(self, event_type: str, *args, **kwargs) -> None:
        """Publishes an event to all subscribed listeners."""
        if event_type not in self._listeners:
            logger.warning(f"[EventBus] Event type '{event_type}' has no listeners registered.")
            return
            
        logger.info(f"[EventBus] Publishing event '{event_type}' with payload: {kwargs}")
        for listener in self._listeners[event_type]:
            try:
                listener(*args, **kwargs)
            except Exception as e:
                logger.error(f"[EventBus] Listener error handling event '{event_type}': {e}")

# Register in DI Container
from app.workspace.di_container import di
di.register_singleton("event_bus", EventBus())
