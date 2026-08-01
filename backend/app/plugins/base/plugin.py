import abc
from typing import Dict, Any

class EDAPlugin(abc.ABC):
    """
    Abstract base interface for all EDA compilation, simulation, and layout tool integration plugins.
    Allows easy future additions (Cadence, Synopsys, Qiskit) without modifying VELORA core code.
    """
    @abc.abstractmethod
    def compile(self, file_path: str, **kwargs) -> Dict[str, Any]:
        """Runs lint checks and module compilation checks."""
        pass

    @abc.abstractmethod
    def simulate(self, netlist_path: str, **kwargs) -> Dict[str, Any]:
        """Executes SPICE transient/AC simulation sweeps."""
        pass

    @abc.abstractmethod
    def verify(self, design_id: int, **kwargs) -> Dict[str, Any]:
        """Runs electrical rule check (ERC), DRC, or LVS checks."""
        pass

    @abc.abstractmethod
    def export(self, design_id: int, **kwargs) -> Dict[str, Any]:
        """Exports layout/netlist outputs into target standard GDSII/SPICE formats."""
        pass

    @abc.abstractmethod
    def report(self, design_id: int, **kwargs) -> Dict[str, Any]:
        """Generates dynamic tool execution timing, area, or power reports."""
        pass

    @abc.abstractmethod
    def execute(self, command: str, **kwargs) -> Dict[str, Any]:
        """Executes generic actions mapping command names to specific methods."""
        pass
