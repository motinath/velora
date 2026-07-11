"""
TemplateDatabase — legacy compatibility shim.

The topology registry (engineering/topology/registry.py) is now the single
source of truth for all topology definitions. This module wraps the registry
so that existing callers of template_db.get_template() continue to work
without any changes.

The old behaviour of loading templates from
    knowledge/templates/<dir>/template.json
is preserved as a fallback for any template files that have not yet been
migrated into the registry format. New topologies should be added as
registry definition files, not as legacy template.json files.
"""

import os
import json
import logging
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)


class TemplateDatabase:
    def __init__(self):
        # Registry is the primary source
        from app.engineering.topology.registry import topology_registry
        self._registry = topology_registry

        # Legacy templates loaded from knowledge/templates/ as a secondary source
        self._legacy: Dict[str, Dict[str, Any]] = {}
        self._load_legacy_templates()

    # ------------------------------------------------------------------
    # Legacy loader (kept for backwards compatibility)
    # ------------------------------------------------------------------

    def _load_legacy_templates(self):
        current_dir = os.path.dirname(os.path.abspath(__file__))
        templates_root = os.path.join(current_dir, "templates")
        if not os.path.isdir(templates_root):
            return

        for dir_name in os.listdir(templates_root):
            tpl_dir  = os.path.join(templates_root, dir_name)
            tpl_file = os.path.join(tpl_dir, "template.json")
            if not os.path.exists(tpl_file):
                continue
            try:
                with open(tpl_file, "r", encoding="utf-8") as f:
                    tpl = json.load(f)
                design_type = tpl.get("design_type", dir_name)
                self._legacy[design_type] = tpl
                logger.debug(f"[TemplateDatabase] Loaded legacy template: '{design_type}'")
            except Exception as e:
                logger.error(f"[TemplateDatabase] Failed to load legacy template {tpl_file}: {e}")

        if self._legacy:
            logger.info(
                f"[TemplateDatabase] {len(self._legacy)} legacy templates loaded "
                f"(these are superseded by the topology registry)."
            )

    # ------------------------------------------------------------------
    # Public API — unchanged interface
    # ------------------------------------------------------------------

    def get_template(self, design_type: Optional[str]) -> Optional[Dict[str, Any]]:
        """
        Return the topology/template for the given design type string.

        Lookup order:
          1. TopologyRegistry (canonical or keyword match)
          2. Legacy templates/ directory (backwards compatibility)
        """
        if not design_type:
            return None

        # Primary: registry exact match
        tpl = self._registry.get(design_type)
        if tpl:
            return tpl

        # Primary: registry keyword match
        matched = self._registry.match_prompt(design_type.lower())
        if matched:
            tpl = self._registry.get(matched)
            if tpl:
                return tpl

        # Fallback: legacy templates
        for key, legacy_tpl in self._legacy.items():
            if key.lower() == design_type.lower() or design_type.lower() in key.lower():
                logger.debug(
                    f"[TemplateDatabase] Serving legacy template '{key}' "
                    f"for design_type='{design_type}' — "
                    f"consider migrating to the topology registry."
                )
                return legacy_tpl

        return None


# Module-level singleton — same interface as before
template_db = TemplateDatabase()
