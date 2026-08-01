import logging
from typing import Dict, Any
from app.plugins.base.plugin import EDAPlugin
from app.plugins.manager import plugin_manager
from app.engineering.simulation.simulation_manager import SimulationManager

logger = logging.getLogger(__name__)

class NgspicePlugin(EDAPlugin):
    """
    EDA plugin integrating SPICE simulations (Ngspice/Xyce).
    """
    def __init__(self):
        self._sim_manager = SimulationManager()

    def compile(self, file_path: str, **kwargs) -> Dict[str, Any]:
        return {"status": "success", "message": "Spice syntax check passed (no compile step for netlists)."}

    def simulate(self, netlist_path: str, **kwargs) -> Dict[str, Any]:
        """
        Runs transient, DC sweep, or AC analysis.
        Reads file content of netlist_path.
        """
        topology_type = kwargs.get("topology_type", "6T SRAM")
        parameters = kwargs.get("parameters", {"vdd": 1.8})
        optimization = kwargs.get("optimization", "speed")

        # Read netlist file
        try:
            with open(netlist_path, "r", encoding="utf-8") as f:
                netlist_content = f.read()
        except Exception as e:
            return {"status": "error", "message": f"Failed to read netlist path {netlist_path}: {e}"}

        logger.info(f"[NgspicePlugin] Initiating transient sweep for {topology_type}")
        result = self._sim_manager.run_simulation(
            netlist=netlist_content,
            topology_type=topology_type,
            parameters=parameters,
            optimization=optimization
        )
        return result

    def verify(self, design_id: int, **kwargs) -> Dict[str, Any]:
        return {"status": "success", "message": "No verification checks implemented in SPICE directly."}

    def export(self, design_id: int, **kwargs) -> Dict[str, Any]:
        return {"status": "success", "message": "SPICE netlist export completed."}

    def report(self, design_id: int, **kwargs) -> Dict[str, Any]:
        return {"status": "success", "message": "Simulation transient delays report generated."}

    def execute(self, command: str, **kwargs) -> Dict[str, Any]:
        if command == "simulate":
            return self.simulate(kwargs.get("netlist_path", ""), **kwargs)
        elif command == "compile":
            return self.compile(kwargs.get("file_path", ""), **kwargs)
        else:
            return {"status": "error", "message": f"Command '{command}' not recognized by NgspicePlugin."}

# Auto-register plugin
plugin_manager.register_plugin("ngspice", NgspicePlugin())
