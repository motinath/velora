from typing import Dict, Any, List
from app.engineering.graph.circuit_graph import CircuitGraph
import logging

logger = logging.getLogger(__name__)

class NetlistGenerator:
    def generate(self, graph: CircuitGraph, design_name: str = "velora_cell") -> str:
        """
        Parses CircuitGraph and generates a standard SPICE syntax netlist file.
        """
        components = graph.get_components()
        edges = graph.edges

        # Clean design name for SPICE
        safe_name = design_name.lower().replace(" ", "_")

        # 1. Identify external Port Pins
        ports: List[str] = []
        for c in components:
            if c["category"] == "PIN":
                # Find the net connected to this Pin
                pin_edges = [e for e in edges if e["from_node"] == c["id"]]
                if pin_edges:
                    net_name = pin_edges[0]["to_net"]
                    if net_name not in ports:
                        ports.append(net_name)

        # Build spice lines list
        lines = [
            f"* ===================================================================",
            f"* VELORA AI-Generated SPICE Netlist",
            f"* Technology PDK: SKY130",
            f"* Design: {design_name}",
            f"* ===================================================================",
            f"",
            f"* Include SKY130 Device Models",
            f".include sky130_fd_pr/models/sky130.lib.spice tt",
            f"",
            f".subckt {safe_name} " + " ".join(ports),
            f""
        ]

        # 2. Add devices
        for comp in components:
            cid = comp["id"]
            category = comp["category"]
            props = comp["properties"]
            model = props.get("model", "")
            params = props.get("parameters", {})

            # Skip supply and terminal port markers in netlist body as they represent boundary nets/sources
            if category in ["VDD", "GND", "PIN"]:
                continue

            # Gather pin connectivity mapping for this component
            comp_edges = [e for e in edges if e["from_node"] == cid]
            
            # Map nets connected to pins
            pin_to_net = {e["from_pin"]: e["to_net"] for e in comp_edges}

            if category in ["NMOS", "PMOS"]:
                # SKY130 transistors are instantiated with X prefix as they map to subcircuit primitives
                d_net = pin_to_net.get("D", "GND")
                g_net = pin_to_net.get("G", "GND")
                s_net = pin_to_net.get("S", "GND")
                b_net = pin_to_net.get("B", "GND")
                
                w_val = params.get("W", 0.36)
                l_val = params.get("L", 0.15)
                m_val = params.get("M", 1)

                lines.append(f"X{cid} {d_net} {g_net} {s_net} {b_net} {model} W={w_val}u L={l_val}u mult={m_val}")
                
            elif category == "RES":
                p1_net = pin_to_net.get("1", "GND")
                p2_net = pin_to_net.get("2", "GND")
                r_val = params.get("R", 1000)
                lines.append(f"R{cid} {p1_net} {p2_net} {r_val}")
                
            elif category == "CAP":
                p1_net = pin_to_net.get("1", "GND")
                p2_net = pin_to_net.get("2", "GND")
                c_val = params.get("C", 1e-12)
                # Format to standard SPICE unit
                lines.append(f"C{cid} {p1_net} {p2_net} {c_val}pf")

        lines.extend([
            f"",
            f".ends {safe_name}",
            f"",
            f"* ==================================================================="
        ])

        netlist_text = "\n".join(lines)
        logger.info(f"NetlistGenerator successfully compiled netlist for '{safe_name}' ({len(components)} devices).")
        return netlist_text

netlist_generator = NetlistGenerator()
