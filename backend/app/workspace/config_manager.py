import os
import json
import logging
from typing import Dict, Any, Optional
from app.workspace.di_container import di

logger = logging.getLogger(__name__)

class ConfigManager:
    """
    Unified configuration service loading terminal policies, plugin parameters, and workspace properties.
    """
    def __init__(self):
        self._configs: Dict[str, Any] = {}
        self._load_configs()

    def _load_configs(self) -> None:
        # Load terminal policy
        policy_path = os.path.join(
            os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
            "api", "rtl", "terminal_policy.json"
        )
        self._configs["terminal_policy"] = self._load_json(policy_path, {
            "allowed": ["iverilog", "yosys", "verilator", "git", "python", "ngspice", "ls", "grep"]
        })

        # Load default plugin configs
        self._configs["plugin_config"] = {
            "ngspice": {"timeout_seconds": 12, "precision": 6},
            "verilator": {"warnings_as_errors": False, "lint_style": "default"}
        }
        logger.info("[ConfigManager] Configured default plugins configurations.")

    def _load_json(self, filepath: str, default: Any) -> Any:
        if os.path.exists(filepath):
            try:
                with open(filepath, "r", encoding="utf-8") as f:
                    logger.info(f"[ConfigManager] Loading configuration file from {filepath}")
                    return json.load(f)
            except Exception as e:
                logger.error(f"[ConfigManager] Failed to load JSON config {filepath}: {e}")
        return default

    def get_config(self, section: str) -> Any:
        """Returns the configuration structure for a specific section."""
        return self._configs.get(section, {})

    def get_value(self, section: str, key: str, default: Any = None) -> Any:
        """Returns a specific key value in a configuration section."""
        section_config = self.get_config(section)
        if isinstance(section_config, dict):
            return section_config.get(key, default)
        return default

    def set_config(self, section: str, config_data: Any) -> None:
        """Sets the configuration structure for a section at runtime."""
        self._configs[section] = config_data
        logger.info(f"[ConfigManager] Updated configuration section: {section}")

# Register in DI Container
di.register_singleton("config_manager", ConfigManager())
