from typing import List, Dict, Any

class CircuitGraph:
    def __init__(self):
        # Nodes: list of dicts. Example: {"id": "M_PU1", "type": "component", "category": "PMOS", "properties": {...}}
        # Or: {"id": "net_VDD", "type": "net", "label": "VDD"}
        self.nodes: List[Dict[str, Any]] = []
        # Edges: list of dicts. Example: {"from_node": "M_PU1", "from_pin": "S", "to_net": "VDD"}
        self.edges: List[Dict[str, Any]] = []

    def add_node(self, node_id: str, type_name: str, label: str = "", category: str = "", properties: Dict[str, Any] = None):
        if not any(n["id"] == node_id for n in self.nodes):
            self.nodes.append({
                "id": node_id,
                "type": type_name, # "component", "net", "pin"
                "label": label or node_id,
                "category": category,
                "properties": properties or {}
            })

    def add_edge(self, from_node: str, from_pin: str, to_net: str):
        # Add net node automatically if it doesn't exist
        net_id = f"net_{to_net}"
        self.add_node(net_id, "net", label=to_net)
        
        edge = {
            "from_node": from_node,
            "from_pin": from_pin,
            "to_net": to_net,
            "net_node_id": net_id
        }
        if edge not in self.edges:
            self.edges.append(edge)

    def get_node(self, node_id: str) -> Dict[str, Any]:
        for n in self.nodes:
            if n["id"] == node_id:
                return n
        raise ValueError(f"Node {node_id} not found in graph.")

    def get_components(self) -> List[Dict[str, Any]]:
        return [n for n in self.nodes if n["type"] == "component"]

    def get_nets(self) -> List[Dict[str, Any]]:
        return [n for n in self.nodes if n["type"] == "net"]

    def to_json(self) -> Dict[str, Any]:
        return {
            "nodes": self.nodes,
            "edges": self.edges
        }

    @classmethod
    def from_json(cls, data: Dict[str, Any]) -> "CircuitGraph":
        graph = cls()
        graph.nodes = data.get("nodes", [])
        graph.edges = data.get("edges", [])
        return graph
