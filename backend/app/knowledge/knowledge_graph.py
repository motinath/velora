"""
KnowledgeGraph — relational graph of circuit concepts, topologies, and metrics.

All topology-specific nodes and edges are now loaded from the TopologyRegistry
at startup. The graph will automatically include every new topology added to
engineering/topology/definitions/ without any changes here.

Shared / cross-topology nodes (e.g. "Propagation Delay", "Inverter") that
appear in multiple topology definitions are de-duplicated automatically by
the registry's all_kg_nodes() / all_kg_edges() methods.
"""

import logging
from typing import Dict, Any, List

logger = logging.getLogger(__name__)


class KnowledgeGraph:
    def __init__(self):
        self.nodes: Dict[str, Dict[str, Any]] = {}
        self.edges: List[Dict[str, str]] = []
        self._build_from_registry()

    # ------------------------------------------------------------------
    # Population
    # ------------------------------------------------------------------

    def _build_from_registry(self) -> None:
        """
        Pull all kg_nodes and kg_edges from the topology registry and
        register them. Shared nodes referenced by multiple topologies are
        de-duplicated (first definition wins for the node body).
        """
        from app.engineering.topology.registry import topology_registry

        node_count = 0
        edge_count = 0

        for node in topology_registry.all_kg_nodes():
            node_id = node.get("id", "")
            if node_id and node_id not in self.nodes:
                self.add_node(
                    node_id=node_id,
                    node_type=node.get("type", "Unknown"),
                    description=node.get("description", ""),
                )
                node_count += 1

        for edge in topology_registry.all_kg_edges():
            self.add_edge(
                source=edge.get("source", ""),
                relation=edge.get("relation", "related to"),
                target=edge.get("target", ""),
            )
            edge_count += 1

        logger.info(
            f"[KnowledgeGraph] Built from registry: "
            f"{node_count} nodes, {edge_count} edges."
        )

    # ------------------------------------------------------------------
    # Graph primitives
    # ------------------------------------------------------------------

    def add_node(self, node_id: str, node_type: str, description: str) -> None:
        self.nodes[node_id.lower()] = {
            "id":          node_id,
            "type":        node_type,
            "description": description,
        }

    def add_edge(self, source: str, relation: str, target: str) -> None:
        self.edges.append({
            "source":   source.lower(),
            "relation": relation,
            "target":   target.lower(),
        })

    # ------------------------------------------------------------------
    # Query API
    # ------------------------------------------------------------------

    def query_relations(self, term: str) -> List[Dict[str, str]]:
        """
        Returns all edges (in either direction) that involve `term`.
        """
        term_lower = term.lower()
        connected = []
        for edge in self.edges:
            if edge["source"] == term_lower or edge["target"] == term_lower:
                source_display = self.nodes.get(edge["source"], {}).get("id", edge["source"])
                target_display = self.nodes.get(edge["target"], {}).get("id", edge["target"])
                connected.append({
                    "source":   source_display,
                    "relation": edge["relation"],
                    "target":   target_display,
                })
        return connected

    def get_context_summary(self, term: str) -> str:
        """
        Generates a markdown-style text description of a term's dependencies.
        """
        relations = self.query_relations(term)
        if not relations:
            return f"No relational dependencies registered for term: {term}."

        lines = [f"Relational Knowledge Graph context for '{term}':"]
        for rel in relations:
            lines.append(
                f"- [{rel['source']}] --({rel['relation']})--> [{rel['target']}]"
            )
        return "\n".join(lines)

    def get_node(self, node_id: str) -> Dict[str, Any]:
        """Return the node dict for a given ID (case-insensitive)."""
        return self.nodes.get(node_id.lower(), {})

    def all_nodes(self) -> List[Dict[str, Any]]:
        return list(self.nodes.values())

    def all_edges(self) -> List[Dict[str, str]]:
        return list(self.edges)


# Module-level singleton
knowledge_graph = KnowledgeGraph()
