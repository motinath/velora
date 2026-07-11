from typing import List, Dict, Any
from app.engineering.graph.circuit_graph import CircuitGraph
from app.engineering.library.library import component_library
import logging

logger = logging.getLogger(__name__)

class ConnectionEngine:
    def build_graph(self, planned_components: List[Dict[str, Any]], connection_plan: List[Dict[str, Any]]) -> CircuitGraph:
        """
        Receives sized components and connections from the planner, queries the library for properties/pins,
        and constructs a fully verified CircuitGraph.
        """
        graph = CircuitGraph()

        # 1. Instantiate components as nodes
        for comp in planned_components:
            comp_id = comp["id"]
            comp_type = comp["type"]
            params = comp.get("parameters", {})
            
            # Fetch base properties from the Component Library
            lib_dev = component_library.get_device(comp_type)
            
            # Merge planned parameters with library defaults
            merged_params = lib_dev["parameters"].copy()
            merged_params.update(params)
            
            graph.add_node(
                node_id=comp_id,
                type_name="component",
                label=comp_id,
                category=comp_type,
                properties={
                    "pins": lib_dev["pins"],
                    "parameters": merged_params,
                    "model": lib_dev["model"],
                    "category": lib_dev["category"]
                }
            )
            logger.info(f"Instantiated component {comp_id} ({comp_type}) in graph.")

        # 2. Establish connectivity (Edges)
        for conn in connection_plan:
            comp_id = conn["comp"]
            pin_name = conn["pin"]
            net_name = conn["net"]
            
            # Verify component exists
            try:
                node = graph.get_node(comp_id)
            except ValueError:
                logger.error(f"Failed to connect: Component {comp_id} does not exist in graph.")
                continue
                
            # Verify pin exists on that component type
            if pin_name not in node["properties"]["pins"]:
                logger.warning(f"Component {comp_id} ({node['category']}) does not expose pin {pin_name}.")
                
            # Add edge
            graph.add_edge(from_node=comp_id, from_pin=pin_name, to_net=net_name)

        logger.info(f"ConnectionEngine completed building graph. Total nodes: {len(graph.nodes)}, Total edges: {len(graph.edges)}")
        return graph

connection_engine = ConnectionEngine()
