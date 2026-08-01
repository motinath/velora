import os
import json
import logging
from typing import Dict, Any, List, Optional
from app.workspace.di_container import di

logger = logging.getLogger(__name__)

class PdkManager:
    """
    Centralized PDK Manager handling semiconductor process technology rules (SKY130, GF180, TSMC, ASAP7).
    """
    def __init__(self):
        self.pdk_rules: Dict[str, Dict[str, Any]] = {}
        self._load_all_pdks()

    def _load_all_pdks(self) -> None:
        # Load SKY130 rules from existing JSON path
        current_dir = os.path.dirname(os.path.abspath(__file__))
        tech_dir = os.path.join(current_dir, "technology")
        
        # Load local folder structure
        if os.path.exists(tech_dir):
            for root, dirs, files in os.walk(tech_dir):
                for file in files:
                    if file.endswith("_rules.json"):
                        filepath = os.path.join(root, file)
                        try:
                            with open(filepath, "r") as f:
                                data = json.load(f)
                                pdk_name = data.get("name", "UNKNOWN").upper()
                                self.pdk_rules[pdk_name] = data
                                logger.info(f"[PdkManager] Loaded rules for PDK: {pdk_name}")
                        except Exception as e:
                            logger.error(f"[PdkManager] Failed to load rules from {filepath}: {e}")

        # Seed other default PDKs for production-readiness
        self._seed_default_pdks()

    def _seed_default_pdks(self) -> None:
        default_pdks = {
            "GF180": {
                "name": "GF180",
                "min_channel_width": 0.22,
                "min_channel_length": 0.18,
                "typical_vdd": 3.3,
                "max_allowable_current": 0.015,
                "rules": {
                    "contact_size": 0.22,
                    "metal_spacing": 0.28
                }
            },
            "TSMC180": {
                "name": "TSMC180",
                "min_channel_width": 0.22,
                "min_channel_length": 0.18,
                "typical_vdd": 1.8,
                "max_allowable_current": 0.02,
                "rules": {
                    "contact_size": 0.22,
                    "metal_spacing": 0.24
                }
            },
            "ASAP7": {
                "name": "ASAP7",
                "min_channel_width": 0.016,
                "min_channel_length": 0.007,
                "typical_vdd": 0.7,
                "max_allowable_current": 0.002,
                "rules": {
                    "contact_size": 0.012,
                    "metal_spacing": 0.016
                }
            }
        }
        for pdk_name, rules in default_pdks.items():
            if pdk_name not in self.pdk_rules:
                self.pdk_rules[pdk_name] = rules
                logger.debug(f"[PdkManager] Seeded default PDK profile: {pdk_name}")

    def get_pdk_rules(self, pdk_name: str) -> Dict[str, Any]:
        """Returns rules for a given PDK name (case-insensitive)."""
        name_upper = pdk_name.upper()
        if name_upper in self.pdk_rules:
            return self.pdk_rules[name_upper]
            
        logger.warning(f"[PdkManager] PDK '{pdk_name}' not found. Falling back to default SKY130 rules.")
        return self.pdk_rules.get("SKY130", {
            "name": "SKY130",
            "min_channel_width": 0.15,
            "min_channel_length": 0.15,
            "typical_vdd": 1.8,
            "max_allowable_current": 0.01,
            "rules": {}
        })

    def list_pdks(self) -> List[str]:
        """Returns the list of registered PDK names."""
        return list(self.pdk_rules.keys())

# Register in DI Container
di.register_singleton("pdk_manager", PdkManager())
