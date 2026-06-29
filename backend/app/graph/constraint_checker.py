from typing import Dict, Any, List
from app.graph.circuit_graph import CircuitGraph
import logging

logger = logging.getLogger(__name__)

class ConstraintChecker:
    def check(self, graph: CircuitGraph, design_constraints: Dict[str, Any]) -> Dict[str, Any]:
        """
        Runs design rules and electrical checks on the circuit graph.
        Returns a dictionary with status, errors list, and warnings list.
        """
        errors: List[str] = []
        warnings: List[str] = []

        components = graph.get_components()
        nets = graph.get_nets()
        edges = graph.edges

        # 1. Check for Duplicate Nodes (handled by add_node, but check IDs list)
        seen_ids = set()
        for node in graph.nodes:
            if node["id"] in seen_ids:
                errors.append(f"Duplicate node ID detected: {node['id']}")
            seen_ids.add(node["id"])

        # 2. Check for Missing Power/Ground reference nets
        net_names = {n["label"] for n in nets}
        if "VDD" not in net_names:
            errors.append("Missing electrical reference: VDD supply net not defined.")
        if "GND" not in net_names:
            errors.append("Missing electrical reference: GND ground net not defined.")

        # 3. Check for Floating Gates and Unconnected Pins
        for comp in components:
            comp_id = comp["id"]
            comp_category = comp["category"]
            pins = comp["properties"].get("pins", [])
            parameters = comp["properties"].get("parameters", {})

            # Technology limits verification (SKY130 W/L bounds)
            if "W" in parameters:
                w_val = parameters["W"]
                if w_val < design_constraints.get("min_channel_width", 0.15):
                    errors.append(f"DRC Error: Component {comp_id} width {w_val}um is below technology limit of 0.15um.")
            if "L" in parameters:
                l_val = parameters["L"]
                if l_val < design_constraints.get("min_channel_length", 0.15):
                    errors.append(f"DRC Error: Component {comp_id} length {l_val}um is below technology limit of 0.15um.")

            # Identify connected pins
            connected_pins = {e["from_pin"] for e in edges if e["from_node"] == comp_id}
            
            # Check if any pins are left floating
            for pin in pins:
                if pin not in connected_pins:
                    # PMOS / NMOS Bulk (B) pin can be implicitly connected to VDD/GND or warning issued
                    if comp_category in ["NMOS", "PMOS"] and pin == "B":
                        warnings.append(f"Electrical Warning: Bulk (B) pin of {comp_id} is floating. Usually tied to VDD (PMOS) or GND (NMOS).")
                    else:
                        errors.append(f"DRC Error: Component {comp_id} pin '{pin}' is floating / unconnected.")

            # Check MOS gates specifically for active drive (connected to net with other connections)
            if comp_category in ["NMOS", "PMOS"] and "G" in connected_pins:
                gate_edge = next(e for e in edges if e["from_node"] == comp_id and e["from_pin"] == "G")
                gate_net = gate_edge["to_net"]
                # Count connections to this gate net
                net_conns = [e for e in edges if e["to_net"] == gate_net]
                if len(net_conns) <= 1:
                    errors.append(f"Electrical Error: Floating gate detected on {comp_id}. Net '{gate_net}' has no drivers.")

        status = "PASSED" if not errors else "FAILED"
        logger.info(f"ConstraintChecker result: Status={status}, Errors={len(errors)}, Warnings={len(warnings)}")

        return {
            "status": status,
            "errors": errors,
            "warnings": warnings
        }

constraint_checker = ConstraintChecker()
