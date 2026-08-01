import os
import logging
from typing import Dict
from app.workspace.di_container import di

logger = logging.getLogger(__name__)

class FeatureFlags:
    """
    Unified manager for application feature flags.
    Allows enabling/disabling experimental features dynamically.
    """
    def __init__(self):
        self._flags: Dict[str, bool] = {
            "ai_design_v2": False,
            "rtl_ai_assistant": True,
            "monte_carlo_sim": False,
            "cloud_simulation": False,
            "interactive_gds_viewer": True,
            "websocket_logs": True
        }
        self._load_from_env()

    def _load_from_env(self) -> None:
        for flag in self._flags.keys():
            env_key = f"VELORA_FEATURE_{flag.upper()}"
            val = os.getenv(env_key)
            if val is not None:
                is_enabled = val.lower() in ("true", "1", "yes")
                self._flags[flag] = is_enabled
                logger.info(f"[FeatureFlags] Feature flag '{flag}' set by env to: {is_enabled}")

    def is_enabled(self, flag_name: str) -> bool:
        """Returns True if the feature flag is enabled, False otherwise."""
        key = flag_name.lower().replace("-", "_")
        return self._flags.get(key, False)

    def set_flag(self, flag_name: str, enabled: bool) -> None:
        """Sets the state of a feature flag at runtime."""
        key = flag_name.lower().replace("-", "_")
        self._flags[key] = enabled
        logger.info(f"[FeatureFlags] Runtime updated feature flag '{key}' to: {enabled}")

    def get_all_flags(self) -> Dict[str, bool]:
        """Returns all configured feature flags."""
        return self._flags.copy()

# Register in DI Container
di.register_singleton("feature_flags", FeatureFlags())
