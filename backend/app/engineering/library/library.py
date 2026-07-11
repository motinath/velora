import os
from typing import Dict, Any, List
from .loader import DeviceLoader

class DeviceSpec:
    def __init__(
        self, 
        name: str, 
        pins: List[str], 
        parameters: Dict[str, Any], 
        model: str, 
        category: str, 
        desc: str = "",
        symbol_svg: str = "",
        spice_model: str = "",
        verilog_model: str = "",
        ai_metadata: Dict[str, Any] = None,
        design_constraints: Dict[str, Any] = None,
        pdk_compatibility: List[str] = None,
        documentation: Dict[str, Any] = None
    ):
        self.name = name
        self.pins = pins
        self.parameters = parameters
        self.model = model
        self.category = category
        self.desc = desc
        self.symbol_svg = symbol_svg
        self.spice_model = spice_model
        self.verilog_model = verilog_model
        self.ai_metadata = ai_metadata or {}
        self.design_constraints = design_constraints or {}
        self.pdk_compatibility = pdk_compatibility or []
        self.documentation = documentation or {}

    def to_json(self) -> Dict[str, Any]:
        return {
          "name": self.name,
          "pins": self.pins,
          "parameters": self.parameters,
          "model": self.model,
          "category": self.category,
          "desc": self.desc,
          "symbol_svg": self.symbol_svg,
          "spice_model": self.spice_model,
          "verilog_model": self.verilog_model,
          "ai_metadata": self.ai_metadata,
          "design_constraints": self.design_constraints,
          "pdk_compatibility": self.pdk_compatibility,
          "documentation": self.documentation
        }

class ComponentLibrary:
    def __init__(self):
        self.technology = "SKY130"
        self._devices: Dict[str, DeviceSpec] = {}
        self.enabled_pdks = {
            "SKY130": True,
            "GF180": False,
            "IHP130": False,
            "TSMC65": True,
            "Generic CMOS": True,
            "Digital": True,
            "Analog": True,
            "RF": True,
            "Memory": True,
            "Custom": True
        }
        self.load_library()

    def load_library(self):
        # Locate the local devices directory
        current_dir = os.path.dirname(os.path.abspath(__file__))
        devices_dir = os.path.join(current_dir, "devices")
        
        loaded = DeviceLoader.load_devices_from_dir(devices_dir)
        for key, data in loaded.items():
            self._devices[key] = DeviceSpec(
                name=data.get("name"),
                pins=data.get("pins", []),
                parameters=data.get("parameters", {}),
                model=data.get("model", ""),
                category=data.get("category", ""),
                desc=data.get("desc", ""),
                symbol_svg=data.get("symbol_svg", ""),
                spice_model=data.get("spice_model", ""),
                verilog_model=data.get("verilog_model", ""),
                ai_metadata=data.get("ai_metadata", {}),
                design_constraints=data.get("design_constraints", {}),
                pdk_compatibility=data.get("pdk_compatibility", []),
                documentation=data.get("documentation", {})
            )

    def get_device(self, device_type: str) -> Dict[str, Any]:
        if device_type in self._devices:
            return self._devices[device_type].to_json()
        raise ValueError(f"Device type '{device_type}' not supported in {self.technology} library.")

    def list_components(self) -> List[Dict[str, Any]]:
        # Filter components to only those belonging to enabled PDKs/libraries
        results = []
        for device in self._devices.values():
            # Check technology compatibility
            is_compatible = False
            if not device.pdk_compatibility:
                is_compatible = True
            else:
                for pdk in device.pdk_compatibility:
                    if self.enabled_pdks.get(pdk, False):
                        is_compatible = True
                        break
            
            if is_compatible:
                results.append(device.to_json())
        return results

# Global component library instance
component_library = ComponentLibrary()
