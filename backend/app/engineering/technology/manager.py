import os
import json
from typing import Dict, Any, Optional

class TechnologyManager:
    def __init__(self):
        self.pdk_rules: Dict[str, Dict[str, Any]] = {}
        self.load_rules()

    def load_rules(self):
        current_dir = os.path.dirname(os.path.abspath(__file__))
        
        for root, dirs, files in os.walk(current_dir):
            for file in files:
                if file.endswith("_rules.json"):
                    filepath = os.path.join(root, file)
                    try:
                        with open(filepath, "r") as f:
                            data = json.load(f)
                            pdk_name = data.get("name", "UNKNOWN").upper()
                            self.pdk_rules[pdk_name] = data
                    except Exception as e:
                        import logging
                        logging.getLogger(__name__).error(f"Failed to load rule {filepath}: {e}")

    def get_rules(self, pdk_name: str) -> Dict[str, Any]:
        pdk_name_upper = pdk_name.upper()
        if pdk_name_upper in self.pdk_rules:
            return self.pdk_rules[pdk_name_upper]
        
        return {
            "name": pdk_name_upper,
            "min_channel_width": 0.15,
            "min_channel_length": 0.15,
            "typical_vdd": 1.8,
            "max_allowable_current": 0.01
        }

technology_manager = TechnologyManager()
