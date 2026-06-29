from typing import Dict, Any, List
from app.graph.circuit_graph import CircuitGraph
import logging

logger = logging.getLogger(__name__)

class SchematicRenderer:
    def render(self, graph: CircuitGraph) -> Dict[str, Any]:
        """
        Calculates coordinates and outputs SVG and JSON.
        """
        components = graph.get_components()
        comp_ids = {c["id"] for c in components}

        # 1. Determine Topology Layout Mode
        mode = "SRAM"
        if "M_PU1" in comp_ids and "M_PG1" in comp_ids:
            mode = "SRAM"
        elif any("M_P" in cid for cid in comp_ids) and any("M_N" in cid for cid in comp_ids) and not "M_PU1" in comp_ids:
            mode = "OSCILLATOR"
        elif "M_REF" in comp_ids and "M_MIR" in comp_ids:
            mode = "MIRROR"
        elif "M_IN1" in comp_ids and "M_TAIL" in comp_ids:
            mode = "DIFFPAIR"
        else:
            mode = "GENERIC"

        # Width and height of schematic canvas
        width, height = 800, 500
        nodes_layout: List[Dict[str, Any]] = []
        wires: List[Dict[str, Any]] = []

        # 2. Assign coordinates depending on topology
        if mode == "SRAM":
            # SRAM Coordinates mapping
            coords = {
                "M_PU1": (320, 150),
                "M_PD1": (320, 300),
                "M_PU2": (480, 150),
                "M_PD2": (480, 300),
                "M_PG1": (200, 300),
                "M_PG2": (600, 300),
                "V_VDD": (400, 50),
                "V_GND": (400, 450),
                "P_WL": (400, 380),
                "P_BL": (100, 300),
                "P_BLB": (700, 300),
                "P_Q": (270, 220),
                "P_QB": (530, 220)
            }
            
            # Wires definition for SRAM
            wires = [
                # Power rails
                {"x1": 320, "y1": 110, "x2": 480, "y2": 110, "net": "VDD"},
                {"x1": 400, "y1": 50, "x2": 400, "y2": 110, "net": "VDD"},
                {"x1": 320, "y1": 110, "x2": 320, "y2": 130, "net": "VDD"},
                {"x1": 480, "y1": 110, "x2": 480, "y2": 130, "net": "VDD"},
                
                {"x1": 320, "y1": 320, "x2": 320, "y2": 410, "net": "GND"},
                {"x1": 480, "y1": 320, "x2": 480, "y2": 410, "net": "GND"},
                {"x1": 320, "y1": 410, "x2": 480, "y2": 410, "net": "GND"},
                {"x1": 400, "y1": 410, "x2": 400, "y2": 450, "net": "GND"},

                # Q Cross connection
                {"x1": 320, "y1": 220, "x2": 380, "y2": 220, "net": "Q"},
                {"x1": 380, "y1": 220, "x2": 380, "y2": 280, "net": "Q"},
                {"x1": 380, "y1": 280, "x2": 460, "y2": 280, "net": "Q"}, # to M_PU2 Gate
                {"x1": 320, "y1": 220, "x2": 320, "y2": 280, "net": "Q"}, # to PG1 Source
                {"x1": 220, "y1": 300, "x2": 320, "y2": 300, "net": "Q"}, # PG1 Drain

                # QB Cross connection
                {"x1": 480, "y1": 220, "x2": 420, "y2": 220, "net": "QB"},
                {"x1": 420, "y1": 220, "x2": 420, "y2": 170, "net": "QB"},
                {"x1": 420, "y1": 170, "x2": 340, "y2": 170, "net": "QB"}, # to M_PU1 Gate
                {"x1": 480, "y1": 220, "x2": 480, "y2": 280, "net": "QB"}, # to PG2 Source
                {"x1": 580, "y1": 300, "x2": 480, "y2": 300, "net": "QB"}, # PG2 Drain

                # Wordline connections
                {"x1": 400, "y1": 380, "x2": 400, "y2": 350, "net": "WL"},
                {"x1": 200, "y1": 350, "x2": 600, "y2": 350, "net": "WL"},
                {"x1": 200, "y1": 350, "x2": 200, "y2": 320, "net": "WL"},
                {"x1": 600, "y1": 350, "x2": 600, "y2": 320, "net": "WL"},

                # Bitlines
                {"x1": 100, "y1": 300, "x2": 180, "y2": 300, "net": "BL"},
                {"x1": 700, "y1": 300, "x2": 620, "y2": 300, "net": "BLB"}
            ]

        elif mode == "OSCILLATOR":
            stages = len([c for c in components if c["category"] == "PMOS"])
            coords = {
                "V_VDD": (400, 50),
                "V_GND": (400, 450),
                "P_OUT": (150 + stages * 130 + 50, 250)
            }
            # Calculate coordinates dynamically
            for i in range(1, stages + 1):
                coords[f"M_P{i}"] = (150 + i * 130, 180)
                coords[f"M_N{i}"] = (150 + i * 130, 320)
                
            # Connect rails
            wires = [
                {"x1": 280, "y1": 110, "x2": 150 + stages * 130, "y2": 110, "net": "VDD"},
                {"x1": 400, "y1": 50, "x2": 400, "y2": 110, "net": "VDD"},
                {"x1": 280, "y1": 390, "x2": 150 + stages * 130, "y2": 390, "net": "GND"},
                {"x1": 400, "y1": 450, "x2": 400, "y2": 390, "net": "GND"}
            ]
            for i in range(1, stages + 1):
                x = 150 + i * 130
                wires.extend([
                    {"x1": x, "y1": 110, "x2": x, "y2": 160, "net": "VDD"},
                    {"x1": x, "y1": 390, "x2": x, "y2": 340, "net": "GND"},
                    {"x1": x, "y1": 200, "x2": x, "y2": 300, "net": f"net_{i}"} # Drain to Drain output
                ])
                # Routing stage connection loops
                in_x = 150 + (stages if i == 1 else i - 1) * 130
                wires.extend([
                    {"x1": in_x, "y1": 250, "x2": x - 20, "y2": 250, "net": f"net_{stages if i == 1 else i - 1}"},
                    {"x1": x - 20, "y1": 180, "x2": x - 20, "y2": 320, "net": f"net_{stages if i == 1 else i - 1}"},
                    {"x1": x - 20, "y1": 180, "x2": x, "y2": 180, "net": f"net_{stages if i == 1 else i - 1}"},
                    {"x1": x - 20, "y1": 320, "x2": x, "y2": 320, "net": f"net_{stages if i == 1 else i - 1}"}
                ])
            
            # Connect output pin
            last_x = 150 + stages * 130
            wires.append({"x1": last_x, "y1": 250, "x2": last_x + 50, "y2": 250, "net": f"net_{stages}"})

        elif mode == "MIRROR":
            coords = {
                "M_REF": (320, 250),
                "M_MIR": (480, 250),
                "V_VDD": (400, 50),
                "V_GND": (400, 450),
                "P_IREF": (320, 120),
                "P_IOUT": (480, 120)
            }
            wires = [
                {"x1": 320, "y1": 120, "x2": 320, "y2": 230, "net": "REF_DRAIN"},
                {"x1": 480, "y1": 120, "x2": 480, "y2": 230, "net": "MIR_DRAIN"},
                
                # Diode Gate link
                {"x1": 320, "y1": 180, "x2": 480, "y2": 180, "net": "REF_DRAIN"},
                {"x1": 320, "y1": 180, "x2": 320, "y2": 250, "net": "REF_DRAIN"},
                {"x1": 480, "y1": 180, "x2": 480, "y2": 250, "net": "REF_DRAIN"}, # GATE M_MIR
                
                # GND ties
                {"x1": 320, "y1": 270, "x2": 320, "y2": 390, "net": "GND"},
                {"x1": 480, "y1": 270, "x2": 480, "y2": 390, "net": "GND"},
                {"x1": 320, "y1": 390, "x2": 480, "y2": 390, "net": "GND"},
                {"x1": 400, "y1": 390, "x2": 400, "y2": 450, "net": "GND"}
            ]

        else: # DIFFPAIR or fallbacks
            coords = {
                "M_L1": (300, 150),
                "M_L2": (500, 150),
                "M_IN1": (300, 280),
                "M_IN2": (500, 280),
                "M_TAIL": (400, 380),
                "V_VDD": (400, 50),
                "V_GND": (400, 480),
                "P_INP": (200, 280),
                "P_INN": (600, 280),
                "P_OUTN": (300, 210),
                "P_OUTP": (500, 210),
                "P_VBIAS": (300, 380)
            }
            wires = [
                # Power rails
                {"x1": 300, "y1": 110, "x2": 500, "y2": 110, "net": "VDD"},
                {"x1": 400, "y1": 50, "x2": 400, "y2": 110, "net": "VDD"},
                {"x1": 300, "y1": 110, "x2": 300, "y2": 130, "net": "VDD"},
                {"x1": 500, "y1": 110, "x2": 500, "y2": 130, "net": "VDD"},

                # Active load mirror connection (L1 diode link)
                {"x1": 300, "y1": 200, "x2": 300, "y2": 150, "net": "VOUT_N"}, # D_L1 to G_L1
                {"x1": 300, "y1": 150, "x2": 500, "y2": 150, "net": "VOUT_N"}, # to G_L2
                {"x1": 300, "y1": 200, "x2": 300, "y2": 260, "net": "VOUT_N"}, # to D_IN1

                # Right branch D_L2 to D_IN2
                {"x1": 500, "y1": 170, "x2": 500, "y2": 260, "net": "VOUT_P"},

                # Inputs
                {"x1": 200, "y1": 280, "x2": 300, "y2": 280, "net": "VIN_P"},
                {"x1": 600, "y1": 280, "x2": 500, "y2": 280, "net": "VIN_N"},

                # Source connects to Tail
                {"x1": 300, "y1": 300, "x2": 300, "y2": 330, "net": "TAIL"},
                {"x1": 500, "y1": 300, "x2": 500, "y2": 330, "net": "TAIL"},
                {"x1": 300, "y1": 330, "x2": 500, "y2": 330, "net": "TAIL"},
                {"x1": 400, "y1": 330, "x2": 400, "y2": 360, "net": "TAIL"},

                # Tail current source Bias
                {"x1": 300, "y1": 380, "x2": 400, "y2": 380, "net": "VBIAS"},
                {"x1": 400, "y1": 400, "x2": 400, "y2": 440, "net": "GND"},
                {"x1": 400, "y1": 440, "x2": 400, "y2": 480, "net": "GND"}
            ]

        # 3. Compile layout json
        for comp in components:
            comp_id = comp["id"]
            x, y = coords.get(comp_id, (width // 2, height // 2))
            nodes_layout.append({
                "id": comp_id,
                "label": comp["label"],
                "type": comp["category"],
                "x": x,
                "y": y,
                "properties": comp["properties"]
            })

        # 4. Generate SVG String
        svg_lines = [
            f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" width="100%" height="100%" style="background-color: #0b0f19;">',
            '<!-- Grid Background -->',
            '  <defs>',
            '    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">',
            '      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1f293d" stroke-width="0.5"/>',
            '    </pattern>',
            '  </defs>',
            '  <rect width="100%" height="100%" fill="url(#grid)" />'
        ]

        # Draw electrical wires (Nets)
        svg_lines.append('  <!-- Wires -->')
        for w in wires:
            # Wire color depending on net
            stroke_color = "#3b82f6"  # Blue for generic signals
            if w["net"] == "VDD":
                stroke_color = "#ef4444"  # Red
            elif w["net"] == "GND":
                stroke_color = "#10b981"  # Green
            elif w["net"] in ["WL", "CLK"]:
                stroke_color = "#eab308"  # Yellow
            elif w["net"] in ["Q", "QB", "VOUT_P", "VOUT_N"]:
                stroke_color = "#a855f7"  # Purple
                
            svg_lines.append(
                f'  <line x1="{w["x1"]}" y1="{w["y1"]}" x2="{w["x2"]}" y2="{w["y2"]}" '
                f'stroke="{stroke_color}" stroke-width="2.0" stroke-linecap="round" />'
            )

        # Draw component symbols
        svg_lines.append('  <!-- Symbols -->')
        for nl in nodes_layout:
            cid = nl["id"]
            ctype = nl["type"]
            cx = nl["x"]
            cy = nl["y"]
            
            svg_lines.append(f'  <g id="symbol_{cid}" class="schematic-symbol" cursor="pointer" transform="translate({cx}, {cy})">')
            
            if ctype == "PMOS":
                # Draw PMOS symbol
                svg_lines.extend([
                    f'    <line x1="-20" y1="0" x2="-10" y2="0" stroke="#f1f5f9" stroke-width="2" />', # Gate line out
                    f'    <line x1="-10" y1="-20" x2="-10" y2="20" stroke="#f1f5f9" stroke-width="3" />', # Gate bar
                    f'    <circle cx="-5" cy="0" r="4" fill="#0b0f19" stroke="#f1f5f9" stroke-width="2" />', # PMOS bubble
                    f'    <line x1="0" y1="-20" x2="0" y2="20" stroke="#f1f5f9" stroke-width="3" />', # Channel bar
                    f'    <line x1="0" y1="-15" x2="20" y2="-15" stroke="#f1f5f9" stroke-width="2" />', # Source line
                    f'    <line x1="0" y1="15" x2="20" y2="15" stroke="#f1f5f9" stroke-width="2" />', # Drain line
                    f'    <line x1="0" y1="0" x2="10" y2="0" stroke="#ef4444" stroke-width="1.5" />', # Bulk
                    f'    <text x="15" y="-25" fill="#94a3b8" font-size="10" font-family="monospace">{cid}</text>'
                ])
            elif ctype == "NMOS":
                # Draw NMOS symbol
                svg_lines.extend([
                    f'    <line x1="-20" y1="0" x2="0" y2="0" stroke="#f1f5f9" stroke-width="2" />', # Gate line
                    f'    <line x1="0" y1="-20" x2="0" y2="20" stroke="#f1f5f9" stroke-width="3" />', # Gate bar
                    f'    <line x1="10" y1="-20" x2="10" y2="20" stroke="#f1f5f9" stroke-width="3" />', # Channel bar
                    f'    <line x1="10" y1="-15" x2="30" y2="-15" stroke="#f1f5f9" stroke-width="2" />', # Drain line
                    f'    <line x1="10" y1="15" x2="30" y2="15" stroke="#f1f5f9" stroke-width="2" />', # Source line
                    f'    <polygon points="12,15 22,10 22,20" fill="#f1f5f9" />', # Source Arrow pointing out
                    f'    <text x="25" y="-25" fill="#94a3b8" font-size="10" font-family="monospace">{cid}</text>'
                ])
            elif ctype == "VDD":
                svg_lines.extend([
                    f'    <line x1="0" y1="0" x2="0" y2="20" stroke="#ef4444" stroke-width="2" />',
                    f'    <polygon points="0,-10 -10,5 10,5" fill="#ef4444" />',
                    f'    <text x="15" y="5" fill="#ef4444" font-weight="bold" font-size="10" font-family="monospace">VDD</text>'
                ])
            elif ctype == "GND":
                svg_lines.extend([
                    f'    <line x1="0" y1="-10" x2="0" y2="10" stroke="#10b981" stroke-width="2" />',
                    f'    <line x1="-15" y1="10" x2="15" y2="10" stroke="#10b981" stroke-width="3" />',
                    f'    <line x1="-10" y1="15" x2="10" y2="15" stroke="#10b981" stroke-width="2" />',
                    f'    <line x1="-5" y1="20" x2="5" y2="20" stroke="#10b981" stroke-width="1.5" />',
                    f'    <text x="18" y="15" fill="#10b981" font-weight="bold" font-size="10" font-family="monospace">GND</text>'
                ])
            elif ctype == "PIN":
                label = nl["properties"].get("parameters", {}).get("label", "PORT")
                svg_lines.extend([
                    f'    <circle cx="0" cy="0" r="6" fill="#eab308" stroke="#0b0f19" stroke-width="2" />',
                    f'    <text x="10" y="4" fill="#eab308" font-size="11" font-weight="bold" font-family="monospace">{label}</text>'
                ])
            else: # Generic passive or unknown
                svg_lines.extend([
                    f'    <rect x="-10" y="-15" width="20" height="30" fill="#0b0f19" stroke="#94a3b8" stroke-width="2" />',
                    f'    <line x1="0" y1="-25" x2="0" y2="-15" stroke="#f1f5f9" stroke-width="2" />',
                    f'    <line x1="0" y1="15" x2="0" y2="25" stroke="#f1f5f9" stroke-width="2" />',
                    f'    <text x="15" y="5" fill="#94a3b8" font-size="10" font-family="monospace">{cid}</text>'
                ])
                
            svg_lines.append('  </g>')

        svg_lines.append('</svg>')
        svg_content = "\n".join(svg_lines)

        logger.info(f"SchematicRenderer successfully completed SVG output. Mode: {mode}")
        return {
            "svg": svg_content,
            "layout": {
                "width": width,
                "height": height,
                "nodes": nodes_layout,
                "mode": mode
            }
        }

schematic_renderer = SchematicRenderer()
