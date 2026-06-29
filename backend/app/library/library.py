import os
from typing import Dict, Any, List

class DeviceSpec:
    def __init__(self, name: str, pins: List[str], parameters: Dict[str, Any], model: str, category: str):
        self.name = name
        self.pins = pins
        self.parameters = parameters
        self.model = model
        self.category = category

    def to_json(self) -> Dict[str, Any]:
        return {
            "name": self.name,
            "pins": self.pins,
            "parameters": self.parameters,
            "model": self.model,
            "category": self.category
        }

class ComponentLibrary:
    def __init__(self):
        self.technology = "SKY130"
        self._devices: Dict[str, DeviceSpec] = {
            "NMOS": DeviceSpec(
                name="NMOS",
                pins=["D", "G", "S", "B"],
                parameters={"W": 0.36, "L": 0.15, "M": 1},
                model="sky130_fd_pr__nfet_01v8",
                category="transistor"
            ),
            "PMOS": DeviceSpec(
                name="PMOS",
                pins=["D", "G", "S", "B"],
                parameters={"W": 0.54, "L": 0.15, "M": 1},
                model="sky130_fd_pr__pfet_01v8",
                category="transistor"
            ),
            "RES": DeviceSpec(
                name="RES",
                pins=["1", "2"],
                parameters={"R": 1000},
                model="sky130_fd_pr__res_generic_m1",
                category="passive"
            ),
            "CAP": DeviceSpec(
                name="CAP",
                pins=["1", "2"],
                parameters={"C": 1e-12},
                model="sky130_fd_pr__cap_mim_m3_1",
                category="passive"
            ),
            "VDD": DeviceSpec(
                name="VDD",
                pins=["VDD"],
                parameters={},
                model="VDD",
                category="supply"
            ),
            "GND": DeviceSpec(
                name="GND",
                pins=["GND"],
                parameters={},
                model="GND",
                category="supply"
            ),
            "PIN": DeviceSpec(
                name="PIN",
                pins=["IO"],
                parameters={"label": "PORT"},
                model="PIN",
                category="terminal"
            )
        }

    def get_device(self, device_type: str) -> Dict[str, Any]:
        if device_type in self._devices:
            return self._devices[device_type].to_json()
        raise ValueError(f"Device type '{device_type}' not supported in {self.technology} library.")

    def list_components(self) -> List[Dict[str, Any]]:
        return [device.to_json() for device in self._devices.values()]

# Global component library instance
component_library = ComponentLibrary()
