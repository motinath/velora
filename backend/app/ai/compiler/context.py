import datetime
from typing import Dict, Any, List, Optional
from app.engineering.graph.circuit_graph import CircuitGraph

class CompilationContext:
    def __init__(self, prompt: str, project_id: int, project_design_type: str, project_name: str):
        self.prompt: str = prompt
        self.project_id: int = project_id
        self.project_design_type: str = project_design_type
        self.project_name: str = project_name
        self.logs: List[str] = []
        
        # Stage outputs
        self.reqs: Dict[str, Any] = {}
        self.template: Optional[Dict[str, Any]] = None
        self.plan: Dict[str, Any] = {}
        self.graph: Optional[CircuitGraph] = None
        self.constraint_results: Dict[str, Any] = {}
        self.schematic: Dict[str, Any] = {}
        self.netlist: str = ""
        self.sim_results: Dict[str, Any] = {}
        self.explanation: str = ""
        self.readiness_report: Dict[str, Any] = {}
        self.gds_data: Optional[bytes] = None

    def log(self, msg: str):
        timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S.%f")[:-3]
        log_line = f"[{timestamp}] [VELORA-COMPILER] {msg}"
        self.logs.append(log_line)
