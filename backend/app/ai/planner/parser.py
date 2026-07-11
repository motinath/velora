import re
from typing import Dict, Any
import logging
from app.config import settings

logger = logging.getLogger(__name__)

class RequirementParser:
    def parse(self, prompt: str, project_design_type: str = None) -> Dict[str, Any]:
        """
        Parses a natural language engineering query into structured circuit requirements.
        """
        prompt_lower = prompt.lower()
        
        # 1. Determine design type (topology)
        design_type = "6T SRAM"
        if any(w in prompt_lower for w in ["sram", "6t", "memory"]):
            design_type = "6T SRAM"
        elif any(w in prompt_lower for w in ["oscillator", "ring", "ring_osc", "clock gen"]):
            design_type = "Ring Oscillator"
        elif any(w in prompt_lower for w in ["mirror", "current mirror", "bias mirror"]):
            design_type = "Current Mirror"
        elif any(w in prompt_lower for w in ["diff", "differential", "differential pair", "diff pair", "opamp"]):
            design_type = "Differential Pair"
        elif project_design_type:
            design_type = project_design_type

        # 2. Technology (defaults to SKY130)
        technology = "SKY130"
        if "sky130" in prompt_lower:
            technology = "SKY130"

        # 3. Optimization target
        optimization = "None"
        if any(w in prompt_lower for w in ["low leakage", "leakage", "leak"]):
            optimization = "Low Leakage"
        elif any(w in prompt_lower for w in ["high speed", "speed", "fast", "delay"]):
            optimization = "High Speed"
        elif any(w in prompt_lower for w in ["low power", "power"]):
            optimization = "Low Power"
        elif any(w in prompt_lower for w in ["area", "size", "minimal area"]):
            optimization = "Minimal Area"

        # 4. Parameters extraction (e.g. VDD, frequency, size parameters)
        parameters = {}
        
        # Look for VDD
        vdd_match = re.search(r'vdd\s*=\s*([0-9\.]+)\s*v?', prompt_lower) or re.search(r'([0-9\.]+)\s*v\b', prompt_lower)
        if vdd_match:
            parameters["vdd"] = float(vdd_match.group(1))
        else:
            parameters["vdd"] = 1.8  # Default SKY130 VDD

        # Look for stages (for ring oscillator)
        stages_match = re.search(r'(\d+)\s*-?\s*stage', prompt_lower) or re.search(r'stages\s*=\s*(\d+)', prompt_lower)
        if stages_match:
            parameters["stages"] = int(stages_match.group(1))
        elif design_type == "Ring Oscillator":
            parameters["stages"] = 3  # Default stages

        # Look for custom currents or resistors/capacitors
        current_match = re.search(r'([0-9\.]+)\s*(u|m)?a\b', prompt_lower)
        if current_match:
            val = float(current_match.group(1))
            unit = current_match.group(2)
            if unit == "u":
                val *= 1e-6
            elif unit == "m":
                val *= 1e-3
            parameters["current"] = val
        elif design_type == "Current Mirror":
            parameters["current"] = 10e-6  # 10 uA default

        logger.info(f"RequirementParser output: Type={design_type}, Tech={technology}, Opt={optimization}, Params={parameters}")
        
        return {
            "type": design_type,
            "technology": technology,
            "optimization": optimization,
            "parameters": parameters
        }

requirement_parser = RequirementParser()
