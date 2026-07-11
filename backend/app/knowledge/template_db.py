"""
TemplateDatabase — compatibility shim.

The topology registry (app/engineering/topology/registry.py) is now the single
source of truth for all topology definitions. This module wraps the registry
so that existing callers of template_db.get_template() continue to work
without any changes.
"""

import logging
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)


class TemplateDatabase:
    def __init__(self):
        from app.engineering.topology.registry import topology_registry
        self._registry = topology_registry

    def get_template(self, design_type: Optional[str]) -> Optional[Dict[str, Any]]:
        """
        Return the topology/template for the given design type string.

        Queries the TopologyRegistry (canonical or keyword match).
        """
        if not design_type:
            return None

        # Primary: registry exact match
        tpl = self._registry.get(design_type)
        if tpl:
            return tpl

        # Secondary: registry keyword match
        matched = self._registry.match_prompt(design_type.lower())
        if matched:
            tpl = self._registry.get(matched)
            if tpl:
                return tpl

        return None


# Module-level singleton — same interface as before
template_db = TemplateDatabase()
