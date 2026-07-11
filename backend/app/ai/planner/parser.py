"""
RequirementParser — registry-driven prompt → structured requirements.

All topology detection is delegated to the TopologyRegistry keyword index.
No hardcoded if/elif topology branches exist here.

Returns a dict with the shape:
{
    "type":         "9T SRAM",          # canonical topology string from registry
    "family":       "SRAM",             # topology family
    "variant":      "9T",               # topology variant
    "technology":   "SKY130",
    "optimization": "Low Leakage",      # or None
    "parameters":   {
        "vdd":    1.8,
        "stages": 3,                    # only present if topology is dynamic
        "current": 10e-6                # only present when mentioned
    },
    "pdk":          "SKY130"
}
"""

import re
import logging
from typing import Dict, Any, Optional

from app.engineering.topology.registry import topology_registry

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Technology / PDK aliases
# ---------------------------------------------------------------------------
_PDK_ALIASES: Dict[str, str] = {
    "sky130":   "SKY130",
    "sky 130":  "SKY130",
    "tsmc65":   "TSMC65",
    "tsmc 65":  "TSMC65",
    "gf180":    "GF180",
    "gf 180":   "GF180",
}

# Default VDD by PDK
_PDK_DEFAULT_VDD: Dict[str, float] = {
    "SKY130": 1.8,
    "TSMC65": 1.2,
    "GF180":  3.3,
}


class RequirementParser:
    """
    Converts a free-text engineering prompt into a structured requirements dict.

    Topology detection is fully driven by the registry keyword index — adding
    a new topology only requires a JSON definition file with a 'keywords' list;
    no changes to this parser are needed.
    """

    def parse(self, prompt: str, project_design_type: Optional[str] = None) -> Dict[str, Any]:
        prompt_lower = prompt.lower()

        # ------------------------------------------------------------------
        # 1. Topology detection via registry keyword matching
        #
        # Priority order:
        #   a) Registry keyword match on the prompt itself (highest priority)
        #   b) project_design_type fallback — ONLY when the prompt has NO match
        #   c) Hard default "6T SRAM" (backwards compatibility)
        #
        # IMPORTANT: project_design_type is never allowed to OVERRIDE a
        # successful prompt match.  The whole point of the registry is that
        # "design a 9T SRAM" produces "9T SRAM" regardless of what the
        # project was originally created as.
        # ------------------------------------------------------------------
        canonical, opt_label = topology_registry.match_prompt_full(prompt_lower)

        logger.info(
            f"[RequirementParser] Prompt match result: canonical={canonical!r}, "
            f"opt={opt_label!r} (from prompt: {prompt_lower[:80]!r})"
        )

        # Fallback: use project_design_type ONLY if prompt gave NO match at all
        if not canonical and project_design_type:
            canonical = topology_registry.match_prompt(project_design_type.lower()) or project_design_type
            logger.info(
                f"[RequirementParser] No prompt match — using project_design_type "
                f"fallback: '{canonical}'"
            )

        # Last resort: default to 6T SRAM (maintains backwards compatibility)
        if not canonical:
            canonical = "6T SRAM"
            logger.warning(
                f"[RequirementParser] Could not identify topology from prompt or "
                f"project_design_type. Defaulting to '{canonical}'."
            )

        tpl = topology_registry.get(canonical) or {}
        family  = tpl.get("family", "")
        variant = tpl.get("variant", "")

        # ------------------------------------------------------------------
        # 2. Optimization — registry-aware extraction (already done above)
        #    but let opt_label be None if not found (planner uses "default")
        # ------------------------------------------------------------------
        optimization = opt_label  # may be None → planner falls back to "default"

        # ------------------------------------------------------------------
        # 3. Technology / PDK
        # ------------------------------------------------------------------
        technology = self._extract_pdk(prompt_lower, tpl)

        # ------------------------------------------------------------------
        # 4. Electrical parameters
        # ------------------------------------------------------------------
        parameters = self._extract_parameters(prompt_lower, canonical, tpl, technology)

        result = {
            "type":         canonical,
            "family":       family,
            "variant":      variant,
            "technology":   technology,
            "optimization": optimization,
            "parameters":   parameters,
            "pdk":          technology,
        }

        logger.info(
            f"[RequirementParser] Parsed → type={canonical!r}, "
            f"variant={variant!r}, opt={optimization!r}, params={parameters}"
        )
        return result

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    def _extract_pdk(self, prompt_lower: str, tpl: Dict[str, Any]) -> str:
        for alias, canonical_pdk in _PDK_ALIASES.items():
            if alias in prompt_lower:
                return canonical_pdk
        # Use the first PDK listed in the topology's compatibility list
        compat = tpl.get("technology", [])
        if compat:
            return compat[0]
        return "SKY130"

    def _extract_parameters(
        self,
        prompt_lower: str,
        canonical: str,
        tpl: Dict[str, Any],
        technology: str,
    ) -> Dict[str, Any]:
        params: Dict[str, Any] = {}

        # --- VDD ---
        vdd = self._extract_vdd(prompt_lower)
        params["vdd"] = vdd if vdd is not None else _PDK_DEFAULT_VDD.get(technology, 1.8)

        # --- Stage count (for dynamic / ring-oscillator-style topologies) ---
        if tpl.get("dynamic"):
            stages = self._extract_stages(prompt_lower)
            if stages is None:
                stages = 3  # sensible default for a ring oscillator
            # Ring oscillators must have an odd number of stages
            if tpl.get("dynamic_strategy") == "ring_oscillator_expand":
                if stages % 2 == 0:
                    stages += 1
                    logger.info(
                        f"[RequirementParser] Stage count adjusted to {stages} "
                        f"(ring oscillator requires an odd count)."
                    )
            params["stages"] = stages

        # --- Bias / reference current ---
        current = self._extract_current(prompt_lower)
        if current is not None:
            params["current"] = current
        elif "current mirror" in canonical.lower() or tpl.get("family", "") == "Current Mirror":
            params["current"] = 10e-6  # 10 µA default bias

        # --- Frequency (informational; kept for simulation use) ---
        freq = self._extract_frequency(prompt_lower)
        if freq is not None:
            params["frequency"] = freq

        return params

    # ------------------------------------------------------------------
    # Individual extraction helpers — pure regex, no topology knowledge
    # ------------------------------------------------------------------

    @staticmethod
    def _extract_vdd(text: str) -> Optional[float]:
        # "vdd = 1.8v", "1.8v", "1.8 v"
        m = re.search(r'vdd\s*=\s*([0-9]+(?:\.[0-9]+)?)\s*v?', text)
        if m:
            return float(m.group(1))
        m = re.search(r'\b([0-9]+(?:\.[0-9]+)?)\s*v\b', text)
        if m:
            val = float(m.group(1))
            # Sanity-check: VDD values are between 0.4V and 5.5V
            if 0.4 <= val <= 5.5:
                return val
        return None

    @staticmethod
    def _extract_stages(text: str) -> Optional[int]:
        # "5-stage", "5 stage", "stages=5"
        m = (
            re.search(r'(\d+)\s*-?\s*stage', text)
            or re.search(r'stages\s*=\s*(\d+)', text)
            or re.search(r'(\d+)\s*stages', text)
        )
        return int(m.group(1)) if m else None

    @staticmethod
    def _extract_current(text: str) -> Optional[float]:
        # "10ua", "10 ua", "10 µa", "100na", "1ma"
        m = re.search(r'([0-9]+(?:\.[0-9]+)?)\s*(u|µ|n|m)a\b', text)
        if m:
            val  = float(m.group(1))
            unit = m.group(2).lower().replace('µ', 'u')
            if unit == 'u':
                return val * 1e-6
            if unit == 'n':
                return val * 1e-9
            if unit == 'm':
                return val * 1e-3
        return None

    @staticmethod
    def _extract_frequency(text: str) -> Optional[float]:
        # "100mhz", "2.4 ghz", "500 khz"
        m = re.search(r'([0-9]+(?:\.[0-9]+)?)\s*(k|m|g)hz\b', text)
        if m:
            val  = float(m.group(1))
            unit = m.group(2).lower()
            if unit == 'k':
                return val * 1e3
            if unit == 'm':
                return val * 1e6
            if unit == 'g':
                return val * 1e9
        return None


# Module-level singleton — same interface as before
requirement_parser = RequirementParser()
