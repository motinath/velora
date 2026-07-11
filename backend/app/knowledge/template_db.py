import os
import json
from typing import Dict, Any, Optional

class TemplateDatabase:
    def __init__(self):
        self.templates: Dict[str, Dict[str, Any]] = {}
        self.load_templates()

    def load_templates(self):
        current_dir = os.path.dirname(os.path.abspath(__file__))
        templates_root = os.path.join(current_dir, "templates")
        
        dir_mappings = {
            "6t_sram": "6T SRAM",
            "ring_oscillator": "Ring Oscillator",
            "current_mirror": "Current Mirror",
            "differential_pair": "Differential Pair"
        }
        
        for dir_name, type_name in dir_mappings.items():
            tpl_dir = os.path.join(templates_root, dir_name)
            tpl_file = os.path.join(tpl_dir, "template.json")
            if os.path.exists(tpl_file):
                try:
                    with open(tpl_file, "r") as f:
                        self.templates[type_name] = json.load(f)
                except Exception as e:
                    import logging
                    logging.getLogger(__name__).error(f"Failed to load template {tpl_file}: {e}")

    def get_template(self, design_type: str) -> Optional[Dict[str, Any]]:
        for key, template in self.templates.items():
            if key.lower() == design_type.lower() or design_type.lower() in key.lower():
                return template
        return None

template_db = TemplateDatabase()
