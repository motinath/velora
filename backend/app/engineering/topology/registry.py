"""
Topology Registry — the single source of truth for every circuit topology
Velora knows how to build.

A topology definition (JSON file) lives under:
    engineering/topology/definitions/<family>/<variant>.json

The registry:
  - scans and loads all definitions at startup
  - exposes lookup by (family, variant) or by canonical type string
  - exposes a keyword index so the parser can match arbitrary prompts
    without any hardcoded if/elif logic
  - exposes knowledge-graph metadata (nodes + edges) per topology
    so knowledge_graph.py can stay free of hardcoded topology data

Schema for a topology JSON (all fields):
{
  "family":       "SRAM",                  # grouping (Memory, Analog, Digital …)
  "variant":      "6T",                    # distinguishing label inside the family
  "canonical":    "6T SRAM",               # canonical display / lookup string
  "name":         "6T SRAM Cell …",
  "description":  "…",
  "keywords":     ["sram", "6t", "memory"],# prompt-matching keywords
  "technology":   ["SKY130"],              # compatible PDKs
  "category":     "Memory",               # top-level category

  "dynamic": false,                        # true = component list is built at plan-time
                                           # (e.g. Ring Oscillator stage expansion)
  "dynamic_strategy": null,               # string key used by planner for dynamic builds

  "optimizations": {
    "Low Leakage": { "w_pd": 0.60, "l_val": 0.25, "reasoning": "…" },
    "default":     { "w_pd": 0.54, "l_val": 0.15, "reasoning": "…" }
  },

  # For static topologies:
  "components": [
    {"id": "M_PU1", "type": "PMOS", "w_key": "w_pu", "l_key": "l_val"},
    {"id": "V_VDD", "type": "VDD"},
    {"id": "P_WL",  "type": "PIN", "label": "WL"}
  ],
  "connections": [ … ],

  # For dynamic topologies only (base components/connections before expansion):
  "base_components": [ … ],
  "base_connections": [ … ],

  # Knowledge Graph metadata
  "kg_nodes": [
    {"id": "6T SRAM", "type": "Circuit Block", "description": "…"}
  ],
  "kg_edges": [
    {"source": "6T SRAM", "relation": "uses", "target": "Cross-Coupled Latch"}
  ],

  # Component-level explanations per optimization (for the report)
  "sizing_notes": {
    "Low Leakage": "Increased channel length L=0.25um to reduce subthreshold leakage."
  }
}
"""

import os
import json
import logging
from typing import Dict, Any, List, Optional, Tuple

logger = logging.getLogger(__name__)

_DEFINITIONS_DIR = os.path.join(os.path.dirname(__file__), "definitions")


class TopologyRegistry:
    """
    Loads all topology JSON definitions from disk and provides fast lookups.

    Usage:
        topology_registry.get("6T SRAM")
        topology_registry.get_by_family_variant("SRAM", "9T")
        topology_registry.match_prompt("design a 9t sram with low leakage")
        topology_registry.all_topologies()
        topology_registry.all_kg_nodes()
        topology_registry.all_kg_edges()
    """

    def __init__(self):
        # canonical string → topology dict
        self._by_canonical: Dict[str, Dict[str, Any]] = {}
        # (family.lower(), variant.lower()) → canonical string
        self._by_family_variant: Dict[Tuple[str, str], str] = {}
        # keyword → list[canonical string]  (one keyword may match multiple topologies)
        self._keyword_index: Dict[str, List[str]] = {}

        self._load_all()

    # ------------------------------------------------------------------
    # Loading
    # ------------------------------------------------------------------

    def _load_all(self):
        if not os.path.isdir(_DEFINITIONS_DIR):
            logger.warning(f"[TopologyRegistry] Definitions directory not found: {_DEFINITIONS_DIR}")
            return

        count = 0
        for category_dir in sorted(os.listdir(_DEFINITIONS_DIR)):
            category_path = os.path.join(_DEFINITIONS_DIR, category_dir)
            if not os.path.isdir(category_path):
                continue
            for filename in sorted(os.listdir(category_path)):
                if not filename.endswith(".json"):
                    continue
                filepath = os.path.join(category_path, filename)
                try:
                    with open(filepath, "r", encoding="utf-8") as f:
                        topology = json.load(f)
                    self._register(topology, filepath)
                    count += 1
                except Exception as e:
                    logger.error(f"[TopologyRegistry] Failed to load {filepath}: {e}")

        logger.info(f"[TopologyRegistry] Loaded {count} topology definitions.")

    def _register(self, topology: Dict[str, Any], filepath: str):
        canonical = topology.get("canonical")
        if not canonical:
            logger.warning(f"[TopologyRegistry] Skipping topology with no 'canonical' field in {filepath}")
            return

        self._by_canonical[canonical] = topology

        family = topology.get("family", "")
        variant = topology.get("variant", "")
        if family and variant:
            key = (family.lower(), variant.lower())
            self._by_family_variant[key] = canonical

        for kw in topology.get("keywords", []):
            kw_lower = kw.lower()
            if kw_lower not in self._keyword_index:
                self._keyword_index[kw_lower] = []
            if canonical not in self._keyword_index[kw_lower]:
                self._keyword_index[kw_lower].append(canonical)

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def get(self, canonical: str) -> Optional[Dict[str, Any]]:
        """Return a topology by its canonical string (case-insensitive)."""
        # Try exact match first
        if canonical in self._by_canonical:
            return self._by_canonical[canonical]
        # Try case-insensitive fallback
        cl = canonical.lower()
        for key, tpl in self._by_canonical.items():
            if key.lower() == cl:
                return tpl
        return None

    def get_by_family_variant(self, family: str, variant: str) -> Optional[Dict[str, Any]]:
        """Return a topology by family + variant strings."""
        key = (family.lower(), variant.lower())
        canonical = self._by_family_variant.get(key)
        if canonical:
            return self._by_canonical.get(canonical)
        return None

    def match_prompt(self, prompt: str) -> Optional[str]:
        """
        Find the best-matching canonical topology string for a free-text prompt.

        Strategy:
        1. Build a score for every candidate topology by counting how many
           of its keywords appear in the prompt (longer/more specific keywords
           score higher so "9t sram" beats "sram").
        2. Apply a variant-specificity bonus: if the topology's variant string
           (e.g. "9t", "6t", "cascode") appears verbatim in the prompt, add +5.
           This guarantees that "9T SRAM" wins over "6T SRAM" whenever the user
           explicitly mentions "9t" in their prompt.
        3. Return the canonical string of the highest-scoring topology.
        4. Return None if nothing matches.
        """
        prompt_lower = prompt.lower()
        scores: Dict[str, int] = {}

        for kw, canonicals in self._keyword_index.items():
            if kw in prompt_lower:
                weight = len(kw.split())  # multi-word keywords score more
                for canonical in canonicals:
                    scores[canonical] = scores.get(canonical, 0) + weight

        if not scores:
            return None

        # Variant-specificity bonus: if the topology's own variant string
        # appears in the prompt, it almost certainly is the intended topology.
        for canonical, tpl in self._by_canonical.items():
            if canonical not in scores:
                continue
            variant = tpl.get("variant", "").lower()
            if variant and variant in prompt_lower:
                scores[canonical] = scores.get(canonical, 0) + 5

        # Pick highest score; ties broken by longer canonical (more specific)
        best = max(scores, key=lambda c: (scores[c], len(c)))
        return best

    def match_prompt_full(self, prompt: str) -> Tuple[Optional[str], Optional[str]]:
        """
        Returns (canonical_type, optimization_label) extracted from the prompt.

        Optimization is detected by matching the 'optimizations' keys of the
        matched topology against the prompt.
        """
        canonical = self.match_prompt(prompt)
        if not canonical:
            return None, None

        tpl = self._by_canonical.get(canonical, {})
        opt_label = self._extract_optimization(prompt.lower(), tpl)
        return canonical, opt_label

    def _extract_optimization(self, prompt_lower: str, topology: Dict[str, Any]) -> Optional[str]:
        """
        Scan the topology's optimization keys for any that appear in the prompt.
        Fallback order: exact key match → common alias map → None.
        """
        ALIAS_MAP = {
            "low leakage": "Low Leakage",
            "leakage":     "Low Leakage",
            "leak":        "Low Leakage",
            "high speed":  "High Speed",
            "fast":        "High Speed",
            "speed":       "High Speed",
            "delay":       "High Speed",
            "low power":   "Low Power",
            "power":       "Low Power",
            "minimal area": "Minimal Area",
            "area":         "Minimal Area",
            "small":        "Minimal Area",
            "high gain":    "High Gain",
            "gain":         "High Gain",
            "high precision": "High Precision",
            "precision":    "High Precision",
            "accurate":     "High Precision",
        }

        opts = topology.get("optimizations", {})
        # Try exact optimization key first
        for key in opts:
            if key != "default" and key.lower() in prompt_lower:
                return key
        # Try aliases
        for alias, opt_key in ALIAS_MAP.items():
            if alias in prompt_lower and opt_key in opts:
                return opt_key
        return None

    def all_topologies(self) -> List[Dict[str, Any]]:
        """Return all registered topologies."""
        return list(self._by_canonical.values())

    def all_canonicals(self) -> List[str]:
        """Return all canonical type strings."""
        return list(self._by_canonical.keys())

    def all_kg_nodes(self) -> List[Dict[str, Any]]:
        """Collect kg_nodes from all topologies for the knowledge graph."""
        nodes = []
        seen_ids = set()
        for tpl in self._by_canonical.values():
            for node in tpl.get("kg_nodes", []):
                if node["id"] not in seen_ids:
                    nodes.append(node)
                    seen_ids.add(node["id"])
        return nodes

    def all_kg_edges(self) -> List[Dict[str, str]]:
        """Collect kg_edges from all topologies for the knowledge graph."""
        edges = []
        seen_pairs = set()
        for tpl in self._by_canonical.values():
            for edge in tpl.get("kg_edges", []):
                pair = (edge["source"], edge["relation"], edge["target"])
                if pair not in seen_pairs:
                    edges.append(edge)
                    seen_pairs.add(pair)
        return edges


# Global singleton
topology_registry = TopologyRegistry()
