from typing import Dict, Any, List, Set

class KnowledgeGraph:
    def __init__(self):
        self.nodes: Dict[str, Dict[str, Any]] = {}
        self.edges: List[Dict[str, str]] = []
        self._populate_default_graph()

    def add_node(self, node_id: str, node_type: str, description: str) -> None:
        self.nodes[node_id.lower()] = {
            "id": node_id,
            "type": node_type,
            "description": description
        }

    def add_edge(self, source: str, relation: str, target: str) -> None:
        self.edges.append({
            "source": source.lower(),
            "relation": relation,
            "target": target.lower()
        })

    def query_relations(self, term: str) -> List[Dict[str, str]]:
        """
        Finds all direct connections (incoming and outgoing) for a term.
        """
        term_lower = term.lower()
        connected = []
        for edge in self.edges:
            if edge["source"] == term_lower or edge["target"] == term_lower:
                # Find display casing
                source_display = self.nodes.get(edge["source"], {}).get("id", edge["source"])
                target_display = self.nodes.get(edge["target"], {}).get("id", edge["target"])
                
                connected.append({
                    "source": source_display,
                    "relation": edge["relation"],
                    "target": target_display
                })
        return connected

    def get_context_summary(self, term: str) -> str:
        """
        Generates a text description of the term's dependencies and verified relations.
        """
        relations = self.query_relations(term)
        if not relations:
            return f"No relational dependencies registered for term: {term}."
            
        summary_lines = [f"Relational Knowledge Graph context for '{term}':"]
        for rel in relations:
            summary_lines.append(f"- [{rel['source']}] --({rel['relation']})--> [{rel['target']}]")
            
        return "\n".join(summary_lines)

    def _populate_default_graph(self) -> None:
        # Node Definitions
        self.add_node("6T SRAM", "Circuit Block", "Standard 6-transistor Static RAM storage cell.")
        self.add_node("Cross-Coupled Latch", "Topology", "Positive feedback CMOS latch configuration.")
        self.add_node("Inverter", "Logic Gate", "Standard CMOS inversion driver cell.")
        self.add_node("Access Gate", "Subsystem", "Pass-transistor path controlled by the Word Line (WL).")
        self.add_node("Static Noise Margin", "Metric / Constraint", "Minimum DC voltage required to flip the cell state.")
        self.add_node("Cell Ratio", "DRC Sizing Guideline", "Driver NMOS size ratio over Access NMOS size.")
        self.add_node("Pull-up Ratio", "DRC Sizing Guideline", "Access NMOS size ratio over Pull-up PMOS size.")
        
        self.add_node("Ring Oscillator", "Circuit Block", "Odd-stage feedback loop generating clock signals.")
        self.add_node("Oscillation Frequency", "Metric / Constraint", "Cycle frequency dependent on stage count and delay path.")
        self.add_node("Propagation Delay", "Metric / Constraint", "Transistor charging/discharging time interval.")
        self.add_node("Jitter", "Metric / Constraint", "Frequency cycle deviation caused by noise.")
        
        self.add_node("Current Mirror", "Circuit Block", "Matched transistor paths replicating bias current values.")
        self.add_node("Diode Configuration", "Topology", "Transistor gate tied to its drain node to create bias reference.")
        self.add_node("Channel Length Modulation", "Physical Effect", "Effective channel width variations under VDS fluctuation.")
        
        self.add_node("Differential Pair", "Circuit Block", "Symmetrical transistor pair amplifying difference signals.")
        self.add_node("Common Mode Rejection", "Metric / Constraint", "Suppression of joint signal noise.")
        self.add_node("Active Load", "Subsystem", "PMOS mirror configuration acting as high-impedance loads.")
        self.add_node("Tail Current Source", "Subsystem", "NMOS current sink holding total branch current constant.")

        # Edge Definitions (Dependencies)
        # SRAM
        self.add_edge("6T SRAM", "uses", "Cross-Coupled Latch")
        self.add_edge("6T SRAM", "uses", "Access Gate")
        self.add_edge("Cross-Coupled Latch", "composed of", "Inverter")
        self.add_edge("6T SRAM", "verified by", "Static Noise Margin")
        self.add_edge("Cross-Coupled Latch", "constrained by", "Cell Ratio")
        self.add_edge("Access Gate", "constrained by", "Pull-up Ratio")
        
        # Ring Oscillator
        self.add_edge("Ring Oscillator", "composed of", "Inverter")
        self.add_edge("Ring Oscillator", "depends on", "Propagation Delay")
        self.add_edge("Oscillation Frequency", "limited by", "Propagation Delay")
        self.add_edge("Ring Oscillator", "verified by", "Oscillation Frequency")
        self.add_edge("Oscillation Frequency", "affects", "Jitter")
        
        # Current Mirror
        self.add_edge("Current Mirror", "uses", "Diode Configuration")
        self.add_edge("Current Mirror", "susceptible to", "Channel Length Modulation")
        
        # Differential Pair
        self.add_edge("Differential Pair", "uses", "Active Load")
        self.add_edge("Differential Pair", "uses", "Tail Current Source")
        self.add_edge("Tail Current Source", "composed of", "Current Mirror")
        self.add_edge("Differential Pair", "verified by", "Common Mode Rejection")

knowledge_graph = KnowledgeGraph()
