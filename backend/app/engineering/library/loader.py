import os
import json
from typing import Dict, Any, List

class DeviceLoader:
    @staticmethod
    def load_devices_from_dir(directory: str) -> Dict[str, Dict[str, Any]]:
        """
        Loads all component specifications from JSON files in the specified directory recursively.
        """
        devices = {}
        if not os.path.exists(directory):
            os.makedirs(directory, exist_ok=True)
            return devices

        for root, dirs, files in os.walk(directory):
            for filename in files:
                if filename.endswith(".json"):
                    filepath = os.path.join(root, filename)
                    try:
                        with open(filepath, "r") as f:
                            data = json.load(f)
                            device_key = data.get("name", filename.replace(".json", "").upper())
                            devices[device_key] = data
                    except Exception as e:
                        import logging
                        logging.getLogger(__name__).error(f"Failed to load device spec {filepath}: {e}")
        return devices
