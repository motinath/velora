"""
DesignPlanner — data-driven topology instantiation.

Replaces the old hardcoded if/elif chain with a registry-driven approach:

    requirements  →  TopologyRegistry.get(canonical)
                  →  resolve optimization profile
                  →  instantiate components   (static or dynamic)
                  →  build connection list
                  →  return plan dict

Adding a new topology requires only a JSON definition file in
engineering/topology/definitions/.  No Python changes needed.
"""

import logging
from typing import Dict, Any, List, Optional, Tuple

from app.engineering.topology.registry import topology_registry

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Dynamic build strategies
# ---------------------------------------------------------------------------

def _build_ring_oscillator(
    tpl: Dict[str, Any],
    opt_profile: Dict[str, Any],
    params: Dict[str, Any],
) -> Tuple[List[Dict], List[Dict]]:
    """
    Expands a Ring Oscillator topology by instantiating N inverter stages
    and wiring them into a feedback loop.

    Returns (components, connections).
    """
    stages = params.get("stages", 3)
    # Must be odd — parser should already enforce this, but double-check here
    if stages % 2 == 0:
        stages += 1

    w_p   = opt_profile.get("w_p",   0.54)
    w_n   = opt_profile.get("w_n",   0.36)
    l_val = opt_profile.get("l_val", 0.15)

    components: List[Dict] = list(tpl.get("base_components", []))
    connections: List[Dict] = list(tpl.get("base_connections", []))

    for i in range(1, stages + 1):
        components.extend([
            {"id": f"M_P{i}", "type": "PMOS", "parameters": {"W": w_p,   "L": l_val, "M": 1}},
            {"id": f"M_N{i}", "type": "NMOS", "parameters": {"W": w_n,   "L": l_val, "M": 1}},
        ])
        # Stage i input = output of stage i-1; stage 1 input loops back from last stage
        in_net  = f"net_{stages}" if i == 1 else f"net_{i - 1}"
        out_net = f"net_{i}"

        connections.extend([
            {"comp": f"M_P{i}", "pin": "S", "net": "VDD"},
            {"comp": f"M_P{i}", "pin": "B", "net": "VDD"},
            {"comp": f"M_P{i}", "pin": "G", "net": in_net},
            {"comp": f"M_P{i}", "pin": "D", "net": out_net},
            {"comp": f"M_N{i}", "pin": "S", "net": "GND"},
            {"comp": f"M_N{i}", "pin": "B", "net": "GND"},
            {"comp": f"M_N{i}", "pin": "G", "net": in_net},
            {"comp": f"M_N{i}", "pin": "D", "net": out_net},
        ])

    # Output pin on last stage
    connections.append({"comp": "P_OUT", "pin": "IO", "net": f"net_{stages}"})

    return components, connections


# Registry of dynamic build strategies
_DYNAMIC_STRATEGIES = {
    "ring_oscillator_expand": _build_ring_oscillator,
}


# ---------------------------------------------------------------------------
# Static component instantiation (w_key / l_key resolution)
# ---------------------------------------------------------------------------

def _resolve_static_components(
    tpl: Dict[str, Any],
    opt_profile: Dict[str, Any],
) -> Tuple[List[Dict], List[Dict]]:
    """
    Resolves component sizes for static topologies using w_key / l_key
    indirection from the optimization profile.

    Returns (components, connections).
    """
    components: List[Dict] = []
    for item in tpl.get("components", []):
        resolved: Dict[str, Any] = {
            "id":   item["id"],
            "type": item["type"],
            "parameters": {},
        }
        if "w_key" in item:
            resolved["parameters"]["W"] = opt_profile.get(item["w_key"], 0.5)
        if "l_key" in item:
            resolved["parameters"]["L"] = opt_profile.get(item["l_key"], 0.15)
        if "label" in item:
            resolved["parameters"]["label"] = item["label"]
        # Always include multiplier for transistors
        if item["type"] in ("NMOS", "PMOS"):
            resolved["parameters"].setdefault("M", 1)
        components.append(resolved)

    connections: List[Dict] = list(tpl.get("connections", []))
    return components, connections


# ---------------------------------------------------------------------------
# Explanation builder
# ---------------------------------------------------------------------------

def _build_explanation(
    canonical: str,
    tpl: Dict[str, Any],
    opt_label: str,
    opt_profile: Dict[str, Any],
    params: Dict[str, Any],
) -> str:
    vdd = params.get("vdd", 1.8)
    technology = tpl.get("technology", ["SKY130"])[0] if tpl.get("technology") else "SKY130"

    lines = [
        f"# DESIGN DECISIONS — {canonical.upper()}",
        "",
        f"**Technology PDK:** {technology}  ",
        f"**Optimization Target:** {opt_label}  ",
        f"**Supply Voltage (VDD):** {vdd} V  ",
        "",
        "### Topology Selected",
        f"**Topology:** {tpl.get('name', canonical)}  ",
        f"**Reason:** {tpl.get('description', '')}  ",
        "",
        "### Sizing Details",
        f"- **Optimizations Applied:**  ",
        f"  - *Heuristics:* `{opt_profile.get('reasoning', 'Default sizing applied.')}`  ",
    ]

    # Per-component sizing notes (from topology JSON)
    sizing_notes = tpl.get("sizing_notes", {})
    if sizing_notes:
        lines.append("")
        lines.append("### Component Notes")
        for comp_id, note in sizing_notes.items():
            lines.append(f"- **{comp_id}:** {note}  ")

    # Ring oscillator: add frequency estimate
    if tpl.get("dynamic_strategy") == "ring_oscillator_expand":
        stages = params.get("stages", 3)
        l_val  = opt_profile.get("l_val", 0.15)
        # Rough estimate: t_pd ≈ 20ps per stage at L=0.15um, scales with L
        t_pd_ns = 0.020 * (l_val / 0.15)
        freq_ghz = 1.0 / (2 * stages * t_pd_ns)
        lines.extend([
            "",
            "### Frequency Estimate",
            f"- **Stages:** {stages}  ",
            f"- **Estimated t_pd per stage:** ~{t_pd_ns * 1000:.1f} ps  ",
            f"- **Estimated oscillation frequency:** ~{freq_ghz:.2f} GHz  ",
            "  *(Post-layout simulation will give a precise value.)*  ",
        ])

    return "\n".join(lines)


# ---------------------------------------------------------------------------
# Main planner class
# ---------------------------------------------------------------------------

class DesignPlanner:
    """
    Converts structured requirements into a component list, connection list,
    constraints dict, and human-readable explanation.

    Topology logic is entirely data-driven via the TopologyRegistry.
    No if/elif topology branches exist in this class.
    """

    def plan(self, requirements: Dict[str, Any]) -> Dict[str, Any]:
        canonical    = requirements.get("type", "6T SRAM")
        optimization = requirements.get("optimization")  # may be None
        params       = requirements.get("parameters", {})
        vdd          = params.get("vdd", 1.8)

        # ----------------------------------------------------------------
        # 1. Load topology from registry
        # ----------------------------------------------------------------
        tpl = topology_registry.get(canonical)
        if tpl is None:
            logger.warning(
                f"[DesignPlanner] Topology '{canonical}' not found in registry. "
                f"Attempting partial match..."
            )
            # Try a keyword search as fallback
            matched = topology_registry.match_prompt(canonical.lower())
            if matched:
                tpl = topology_registry.get(matched)
                canonical = matched
                logger.info(f"[DesignPlanner] Fell back to matched topology: '{canonical}'")
            else:
                raise ValueError(
                    f"[DesignPlanner] No topology found for '{canonical}'. "
                    f"Available topologies: {topology_registry.all_canonicals()}"
                )

        # ----------------------------------------------------------------
        # 2. Resolve optimization profile
        # ----------------------------------------------------------------
        opt_label, opt_profile = self._resolve_optimization(tpl, optimization)

        # ----------------------------------------------------------------
        # 3. Build component list and connections
        # ----------------------------------------------------------------
        if tpl.get("dynamic"):
            strategy_key = tpl.get("dynamic_strategy")
            strategy_fn  = _DYNAMIC_STRATEGIES.get(strategy_key)
            if strategy_fn is None:
                raise ValueError(
                    f"[DesignPlanner] Unknown dynamic strategy '{strategy_key}' "
                    f"for topology '{canonical}'. "
                    f"Registered strategies: {list(_DYNAMIC_STRATEGIES.keys())}"
                )
            components, connections = strategy_fn(tpl, opt_profile, params)
        else:
            components, connections = _resolve_static_components(tpl, opt_profile)

        # ----------------------------------------------------------------
        # 4. Constraints
        # ----------------------------------------------------------------
        constraints = {
            "target_vdd":            vdd,
            "max_allowable_current": 10e-3,
            "min_channel_width":     0.15,
            "min_channel_length":    0.15,
        }

        # ----------------------------------------------------------------
        # 5. Explanation
        # ----------------------------------------------------------------
        explanation = _build_explanation(canonical, tpl, opt_label, opt_profile, params)

        logger.info(
            f"[DesignPlanner] Plan complete: topology='{canonical}', "
            f"opt='{opt_label}', "
            f"components={len(components)}, connections={len(connections)}"
        )

        return {
            "components":  components,
            "connections": connections,
            "constraints": constraints,
            "explanation": explanation,
        }

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    @staticmethod
    def _resolve_optimization(
        tpl: Dict[str, Any],
        requested: Optional[str],
    ) -> Tuple[str, Dict[str, Any]]:
        """
        Find the best-matching optimization profile in the topology JSON.

        Priority:
          1. Exact match on the requested label
          2. Case-insensitive match
          3. Fall back to the "default" profile
          4. Fall back to the first available profile
        """
        opts = tpl.get("optimizations", {})

        if requested:
            # Exact match
            if requested in opts:
                return requested, opts[requested]
            # Case-insensitive
            req_lower = requested.lower()
            for key, profile in opts.items():
                if key.lower() == req_lower:
                    return key, profile

        # Default profile
        if "default" in opts:
            label = requested or "default"
            return label, opts["default"]

        # First available profile
        if opts:
            first_key = next(iter(opts))
            return first_key, opts[first_key]

        # No profiles at all — return empty (topology JSON is malformed)
        logger.warning(f"[DesignPlanner] Topology '{tpl.get('canonical')}' has no optimization profiles.")
        return "default", {}


# Module-level singleton — same interface as before
design_planner = DesignPlanner()
