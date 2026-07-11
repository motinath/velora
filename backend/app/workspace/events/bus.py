import logging
from typing import Callable, Dict, List, Any
import asyncio

logger = logging.getLogger(__name__)

class EventBus:
    def __init__(self):
        self._listeners: Dict[str, List[Callable[[Any], Any]]] = {}

    def subscribe(self, event_type: str, callback: Callable[[Any], Any]):
        if event_type not in self._listeners:
            self._listeners[event_type] = []
        self._listeners[event_type].append(callback)
        logger.info(f"Subscribed callback to event '{event_type}'")

    def publish(self, event_type: str, data: Any):
        logger.info(f"Publishing event '{event_type}' with payload: {type(data)}")
        if event_type not in self._listeners:
            return
            
        for callback in self._listeners[event_type]:
            try:
                if asyncio.iscoroutinefunction(callback):
                    # Schedule it on current loop or run it
                    asyncio.create_task(callback(data))
                else:
                    callback(data)
            except Exception as e:
                logger.error(f"Error in listener for event '{event_type}': {e}", exc_info=True)

# Global Event Bus Instance
event_bus = EventBus()
