import logging
from typing import Dict, Set, List
from app.workspace.di_container import di

logger = logging.getLogger(__name__)

class ProjectGraph:
    """
    Tracks and models the dependency graph between cells, RTL modules, and netlists.
    Allows discovering dependent blocks to coordinate validation invalidations.
    """
    def __init__(self):
        # Maps module_name -> set of modules that instantiate/depend on it
        self._graph: Dict[str, Set[str]] = {}
        # Maps module_name -> set of child modules it instantiates
        self._instantiates: Dict[str, Set[str]] = {}

    def add_dependency(self, parent_module: str, child_module: str) -> None:
        """Records that parent_module instantiates/depends on child_module."""
        if child_module not in self._graph:
            self._graph[child_module] = set()
        self._graph[child_module].add(parent_module)

        if parent_module not in self._instantiates:
            self._instantiates[parent_module] = set()
        self._instantiates[parent_module].add(child_module)
        
        logger.debug(f"[ProjectGraph] Added dependency: {parent_module} instantiates {child_module}")

    def clear_module(self, parent_module: str) -> None:
        """Clears all outward instantiations from a module (useful before re-indexing)."""
        if parent_module in self._instantiates:
            children = self._instantiates[parent_module]
            for child in children:
                if child in self._graph and parent_module in self._graph[child]:
                    self._graph[child].remove(parent_module)
            del self._instantiates[parent_module]

    def get_dependents(self, module_name: str) -> List[str]:
        """Returns list of modules that depend on/instantiate this module."""
        return list(self._graph.get(module_name, set()))

    def get_instantiated_modules(self, module_name: str) -> List[str]:
        """Returns list of child modules instantiated by this module."""
        return list(self._instantiates.get(module_name, set()))

# Register in DI Container
di.register_singleton("project_graph", ProjectGraph())
