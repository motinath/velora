import logging
from typing import Dict, Any, Type, TypeVar, Callable

logger = logging.getLogger(__name__)

T = TypeVar("T")

class DIContainer:
    """
    Dependency Injection Container for the VELORA EDA workspace backend.
    Manages registration, configuration, instantiation, and wiring of singletons.
    """
    def __init__(self):
        self._services: Dict[str, Any] = {}
        self._factories: Dict[str, Callable[[], Any]] = {}
        self._instances: Dict[str, Any] = {}

    def register_singleton(self, key: str, instance: Any) -> None:
        """Registers a pre-instantiated singleton."""
        self._instances[key] = instance
        logger.debug(f"[DIContainer] Registered singleton: {key}")

    def register_factory(self, key: str, factory_fn: Callable[[], Any]) -> None:
        """Registers a factory function for lazy instantiation of singletons."""
        self._factories[key] = factory_fn
        logger.debug(f"[DIContainer] Registered factory: {key}")

    def resolve(self, key: str) -> Any:
        """Resolves and returns the singleton instance by key."""
        if key in self._instances:
            return self._instances[key]
            
        if key in self._factories:
            logger.info(f"[DIContainer] Lazy instantiating singleton: {key}")
            # Instantiate using factory
            instance = self._factories[key]()
            self._instances[key] = instance
            return instance
            
        raise ValueError(f"Service {key} is not registered in the DI Container.")

    def clear(self) -> None:
        """Clears all registered services and instantiated singletons."""
        self._services.clear()
        self._factories.clear()
        self._instances.clear()
        logger.info("[DIContainer] Cleared all registrations.")

# Global DI Container singleton
di = DIContainer()
