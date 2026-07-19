"""
SchematicRenderer — registry-driven SVG + layout JSON generator.

Layout data comes from the topology's JSON 'layout' block.
Three modes:
  1. Static layout   — component_positions + wires from topology JSON
  2. Dynamic layout  — Ring Oscillator: positions computed from stage count
  3. Auto-placer     — any topology with no layout block: grid placement
                        derived from actual circuit graph edges

The renderer receives topology_type so it can look up the correct layout.
The SVG symbol drawing code is unchanged.
"""

import math
import logging
from typing import Dict, Any, List, Optional, Tuple

from app.engineering.graph.circuit_graph import CircuitGraph

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Wire net colour map
# ---------------------------------------------------------------------------
_NET_COLORS: Dict[str, str] = {
    "VDD":    "#ef4444",   # red
    "GND":    "#10b981",   # green
    "WL":     "#eab308",   # yellow
    "CLK":    "#eab308",
    "CLKN":   "#f59e0b",
    "Q":      "#a855f7",   # purple
    "QB":     "#a855f7",
    "VOUT_P": "#a855f7",
    "VOUT_N": "#a855f7",
    "out_p":  "#a855f7",
    "out_m":  "#a855f7",
    "SLP":    "#06b6d4",   # cyan  (sleep/power-gating)
    "EN":     "#06b6d4",
    "RWL":    "#f97316",   # orange (read word line)
    "RBL":    "#f97316",
    "WAE":    "#ec4899",   # pink  (write-assist enable)
}
_DEFAULT_WIRE_COLOR = "#3b82f6"  # blue


def _wire_color(net: str) -> str:
    return _NET_COLORS.get(net, _DEFAULT_WIRE_COLOR)


class SchematicRenderer:

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def render(
        self,
        graph: CircuitGraph,
        topology_type: Optional[str] = None,
        custom_layout: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Render the circuit graph to SVG + layout JSON.

        Parameters
        ----------
        graph         : CircuitGraph built by the connection engine
        topology_type : canonical topology string (e.g. "9T SRAM").
                        Used to look up layout hints from the registry.
        custom_layout : Optional custom layout coordinates and wires from the editor.
        """
        components = graph.get_components()
        width, height = 800, 500
        coords: Dict[str, Tuple[int, int]] = {}
        wires: List[Dict[str, Any]] = []

        # ------------------------------------------------------------------
        # 1. Load layout from registry or use custom layout
        # ------------------------------------------------------------------
        if custom_layout:
            width = custom_layout.get("width", 800)
            height = custom_layout.get("height", 500)
            if "nodes" in custom_layout:
                # handles case where nodes are passed as a list of dicts with x, y
                coords = {node["id"]: (int(node["x"]), int(node["y"])) for node in custom_layout["nodes"] if "id" in node}
            elif "component_positions" in custom_layout:
                raw_pos = custom_layout["component_positions"]
                coords = {cid: (int(pos["x"]), int(pos["y"])) for cid, pos in raw_pos.items()}
            wires = custom_layout.get("wires", [])
        else:
            tpl = None
            if topology_type:
                from app.engineering.topology.registry import topology_registry
                tpl = topology_registry.get(topology_type)

            layout_data = tpl.get("layout", {}) if tpl else {}

            if layout_data and layout_data.get("dynamic_layout"):
                # --- Dynamic (Ring Oscillator) --------------------------------
                coords, wires, width, height = self._build_ring_osc_layout(
                    components, layout_data
                )

            elif layout_data and layout_data.get("component_positions"):
                # --- Static layout from JSON ----------------------------------
                canvas   = layout_data.get("canvas", {})
                width    = canvas.get("width",  800)
                height   = canvas.get("height", 500)
                raw_pos  = layout_data.get("component_positions", {})
                coords   = {cid: (pos["x"], pos["y"]) for cid, pos in raw_pos.items()}
                wires    = layout_data.get("wires", [])

            else:
                # --- Auto-placer fallback ------------------------------------
                coords, wires, width, height = self._auto_place(components, graph.edges)

        # Fill in any component not covered by the layout data
        coords = self._fill_missing(components, coords, width, height)

        # Self-heal missing wires for static layout definitions
        if layout_data and layout_data.get("component_positions"):
            wires = self._heal_static_wires(components, graph, coords, wires)

        # ------------------------------------------------------------------
        # 2. Build nodes_layout list
        # ------------------------------------------------------------------
        nodes_layout: List[Dict[str, Any]] = []
        for comp in components:
            cid  = comp["id"]
            x, y = coords.get(cid, (width // 2, height // 2))
            nodes_layout.append({
                "id":         cid,
                "label":      comp["label"],
                "type":       comp["category"],
                "x":          x,
                "y":          y,
                "properties": comp["properties"],
            })

        # ------------------------------------------------------------------
        # 3. Generate SVG
        # ------------------------------------------------------------------
        svg_content = self._build_svg(width, height, wires, nodes_layout)

        mode = self._detect_mode(topology_type, tpl)
        logger.info(
            f"[SchematicRenderer] Rendered '{topology_type or 'unknown'}' "
            f"| mode={mode} | {len(components)} components"
        )

        return {
            "svg": svg_content,
            "layout": {
                "width":  width,
                "height": height,
                "nodes":  nodes_layout,
                "mode":   mode,
            },
        }

    # ------------------------------------------------------------------
    # Dynamic layout — Ring Oscillator
    # ------------------------------------------------------------------

    def _build_ring_osc_layout(
        self,
        components: List[Dict],
        layout_data: Dict,
    ) -> Tuple[Dict, List, int, int]:
        stages     = sum(1 for c in components if c["category"] == "PMOS")
        x_start    = layout_data.get("stage_x_start", 150)
        x_step     = layout_data.get("stage_x_step", 130)
        pmos_y     = layout_data.get("pmos_y", 180)
        nmos_y     = layout_data.get("nmos_y", 300)
        vdd_y      = layout_data.get("vdd_y", 50)
        gnd_y      = layout_data.get("gnd_y", 420)
        pin_x_off  = layout_data.get("out_pin_x_offset", 60)
        pin_y      = layout_data.get("out_pin_y", 240)

        width  = x_start + stages * x_step + 120
        height = gnd_y + 60
        mid_x  = x_start + (stages * x_step) // 2

        coords: Dict[str, Tuple[int, int]] = {
            "V_VDD": (mid_x, vdd_y),
            "V_GND": (mid_x, gnd_y + 40),
            "P_OUT": (x_start + stages * x_step + pin_x_off, pin_y),
        }
        for i in range(1, stages + 1):
            x = x_start + i * x_step
            coords[f"M_P{i}"] = (x, pmos_y)
            coords[f"M_N{i}"] = (x, nmos_y)

        rail_x1 = x_start + x_step - 20
        rail_x2 = x_start + stages * x_step

        wires: List[Dict] = [
            {"x1": rail_x1, "y1": vdd_y + 30, "x2": rail_x2, "y2": vdd_y + 30, "net": "VDD"},
            {"x1": mid_x,   "y1": vdd_y,       "x2": mid_x,   "y2": vdd_y + 30, "net": "VDD"},
            {"x1": rail_x1, "y1": gnd_y,        "x2": rail_x2, "y2": gnd_y,     "net": "GND"},
            {"x1": mid_x,   "y1": gnd_y,        "x2": mid_x,   "y2": gnd_y + 40,"net": "GND"},
        ]
        for i in range(1, stages + 1):
            x = x_start + i * x_step
            wires += [
                {"x1": x, "y1": vdd_y + 30, "x2": x, "y2": pmos_y - 20, "net": "VDD"},
                {"x1": x, "y1": gnd_y,      "x2": x, "y2": nmos_y + 20, "net": "GND"},
                {"x1": x, "y1": pmos_y + 20,"x2": x, "y2": nmos_y - 20, "net": f"net_{i}"},
            ]
            prev_x = x_start + (stages if i == 1 else i - 1) * x_step
            gate_x = x - 22
            wires += [
                {"x1": prev_x, "y1": pin_y, "x2": gate_x, "y2": pin_y,   "net": f"net_{stages if i==1 else i-1}"},
                {"x1": gate_x, "y1": pmos_y,"x2": gate_x, "y2": nmos_y,  "net": f"net_{stages if i==1 else i-1}"},
                {"x1": gate_x, "y1": pmos_y,"x2": x,      "y2": pmos_y,  "net": f"net_{stages if i==1 else i-1}"},
                {"x1": gate_x, "y1": nmos_y,"x2": x,      "y2": nmos_y,  "net": f"net_{stages if i==1 else i-1}"},
            ]
        last_x = x_start + stages * x_step
        wires.append({"x1": last_x, "y1": pin_y,
                      "x2": last_x + pin_x_off, "y2": pin_y, "net": f"net_{stages}"})

        return coords, wires, width, height

    # ------------------------------------------------------------------
    # Auto-placer — grid placement from circuit graph
    # ------------------------------------------------------------------

    def _auto_place(
        self,
        components: List[Dict],
        edges: List[Dict],
    ) -> Tuple[Dict, List, int, int]:
        """
        Organises components into functional rows:
          Row 0 (top)    : VDD supply symbols
          Row 1          : PMOS transistors
          Row 2 (middle) : Input/bias PINs
          Row 3          : NMOS transistors
          Row 4 (bottom) : GND supply symbols + output PINs
        Wires are traced directly from the edge list.
        """
        groups: Dict[str, List[str]] = {
            "VDD":  [], "PMOS": [], "PIN_in": [],
            "NMOS": [], "GND":  [], "PIN_out": [],
        }
        for c in components:
            cid = c["id"]
            cat = c["category"]
            if cat == "VDD":
                groups["VDD"].append(cid)
            elif cat == "PMOS":
                groups["PMOS"].append(cid)
            elif cat == "NMOS":
                groups["NMOS"].append(cid)
            elif cat == "GND":
                groups["GND"].append(cid)
            elif cat == "PIN":
                label = c.get("properties", {}).get("parameters", {}).get("label", "")
                if any(k in label for k in ("IN", "CLK", "WL", "BL", "EN", "SLP", "WAE", "BIAS")):
                    groups["PIN_in"].append(cid)
                else:
                    groups["PIN_out"].append(cid)
            else:
                groups["NMOS"].append(cid)  # catch-all

        canvas_w = max(800, (max(len(g) for g in groups.values()) + 1) * 130)
        canvas_h = 520

        row_y = {
            "VDD":     70,
            "PMOS":   160,
            "PIN_in": 240,
            "NMOS":   320,
            "GND":    420,
            "PIN_out":460,
        }

        coords: Dict[str, Tuple[int, int]] = {}

        def place_group(key: str, y: int):
            items = groups[key]
            if not items:
                return
            spacing = max(120, canvas_w // (len(items) + 1))
            for i, cid in enumerate(items):
                coords[cid] = (spacing * (i + 1), y)

        for key, y in row_y.items():
            place_group(key, y)

        # Build wires from edge list: connect pin-to-pin via net midpoints
        net_to_nodes: Dict[str, List[str]] = {}
        for e in edges:
            net = e.get("to_net", "")
            node = e.get("from_node", "")
            if net not in ("VDD", "GND") and node:
                net_to_nodes.setdefault(net, []).append(node)

        wires: List[Dict] = []
        seen_vdd_wire = seen_gnd_wire = False

        for net, nodes in net_to_nodes.items():
            pts = [(coords[n][0], coords[n][1]) for n in nodes if n in coords]
            if len(pts) < 2:
                continue
            # Sort by x then y and connect sequentially
            pts.sort()
            for k in range(len(pts) - 1):
                x1, y1 = pts[k]
                x2, y2 = pts[k + 1]
                wires.append({"x1": x1, "y1": y1, "x2": x2, "y2": y2, "net": net})

        # Add VDD and GND rail lines
        if groups["VDD"] and groups["PMOS"]:
            for vid in groups["VDD"]:
                vx, vy = coords[vid]
                if not seen_vdd_wire:
                    wires.append({"x1": 60, "y1": 100, "x2": canvas_w - 60, "y2": 100, "net": "VDD"})
                    seen_vdd_wire = True
                wires.append({"x1": vx, "y1": vy, "x2": vx, "y2": 100, "net": "VDD"})

        if groups["GND"] and groups["NMOS"]:
            for gid in groups["GND"]:
                gx, gy = coords[gid]
                if not seen_gnd_wire:
                    wires.append({"x1": 60, "y1": 395, "x2": canvas_w - 60, "y2": 395, "net": "GND"})
                    seen_gnd_wire = True
                wires.append({"x1": gx, "y1": gy, "x2": gx, "y2": 395, "net": "GND"})

        return coords, wires, canvas_w, canvas_h

    # ------------------------------------------------------------------
    # Fill missing component positions
    # ------------------------------------------------------------------

    def _fill_missing(
        self,
        components: List[Dict],
        coords: Dict[str, Tuple[int, int]],
        width: int,
        height: int,
    ) -> Dict[str, Tuple[int, int]]:
        """Assign a fallback grid position to any component not in coords."""
        missing = [c["id"] for c in components if c["id"] not in coords]
        if not missing:
            return coords

        cols = max(1, int(math.ceil(math.sqrt(len(missing)))))
        for idx, cid in enumerate(missing):
            row = idx // cols
            col = idx % cols
            x = width // 2 + (col - cols // 2) * 100
            y = height // 2 + row * 80
            coords[cid] = (x, y)
            logger.debug(f"[SchematicRenderer] Auto-placed missing component '{cid}' at ({x},{y})")

        return coords

    # ------------------------------------------------------------------
    # SVG builder (symbol drawing unchanged from original)
    # ------------------------------------------------------------------

    def _build_svg(
        self,
        width: int,
        height: int,
        wires: List[Dict],
        nodes_layout: List[Dict],
    ) -> str:
        lines = [
            f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" '
            f'width="100%" height="100%" style="background-color: #ffffff;">',
            "  <defs>",
            '    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">',
            '      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e2e8f0" stroke-width="0.5"/>',
            "    </pattern>",
            "  </defs>",
            '  <rect width="100%" height="100%" fill="url(#grid)" />',
            "  <!-- Wires -->",
        ]

        for w in wires:
            color = _wire_color(w.get("net", ""))
            lines.append(
                f'  <line x1="{w["x1"]}" y1="{w["y1"]}" x2="{w["x2"]}" y2="{w["y2"]}" '
                f'stroke="{color}" stroke-width="2.0" stroke-linecap="round" />'
            )

        lines.append("  <!-- Symbols -->")
        for nl in nodes_layout:
            cid   = nl["id"]
            ctype = nl["type"]
            cx    = nl["x"]
            cy    = nl["y"]

            lines.append(
                f'  <g id="symbol_{cid}" class="schematic-symbol" cursor="pointer" '
                f'transform="translate({cx}, {cy})">'
            )
            lines.extend(self._symbol_svg(cid, ctype, nl))
            lines.append("  </g>")

        lines.append("</svg>")
        return "\n".join(lines)

    # ------------------------------------------------------------------
    # Component symbol definitions
    # ------------------------------------------------------------------

    def _symbol_svg(self, cid: str, ctype: str, nl: Dict) -> List[str]:
        if ctype == "PMOS":
            return [
                '    <line x1="-20" y1="0" x2="-10" y2="0" stroke="#0f172a" stroke-width="2" />',
                '    <line x1="-10" y1="-20" x2="-10" y2="20" stroke="#0f172a" stroke-width="3" />',
                '    <circle cx="-5" cy="0" r="4" fill="#ffffff" stroke="#0f172a" stroke-width="2" />',
                '    <line x1="0" y1="-20" x2="0" y2="20" stroke="#0f172a" stroke-width="3" />',
                '    <line x1="0" y1="-15" x2="20" y2="-15" stroke="#0f172a" stroke-width="2" />',
                '    <line x1="0" y1="15" x2="20" y2="15" stroke="#0f172a" stroke-width="2" />',
                '    <line x1="0" y1="0" x2="10" y2="0" stroke="#ef4444" stroke-width="1.5" />',
                f'   <text x="15" y="-25" fill="#64748b" font-size="10" font-family="monospace">{cid}</text>',
            ]
        elif ctype == "NMOS":
            return [
                '    <line x1="-20" y1="0" x2="0" y2="0" stroke="#0f172a" stroke-width="2" />',
                '    <line x1="0" y1="-20" x2="0" y2="20" stroke="#0f172a" stroke-width="3" />',
                '    <line x1="10" y1="-20" x2="10" y2="20" stroke="#0f172a" stroke-width="3" />',
                '    <line x1="10" y1="-15" x2="30" y2="-15" stroke="#0f172a" stroke-width="2" />',
                '    <line x1="10" y1="15" x2="30" y2="15" stroke="#0f172a" stroke-width="2" />',
                '    <polygon points="12,15 22,10 22,20" fill="#0f172a" />',
                f'   <text x="25" y="-25" fill="#64748b" font-size="10" font-family="monospace">{cid}</text>',
            ]
        elif ctype == "VDD":
            return [
                '    <line x1="0" y1="0" x2="0" y2="20" stroke="#ef4444" stroke-width="2" />',
                '    <polygon points="0,-10 -10,5 10,5" fill="#ef4444" />',
                '    <text x="15" y="5" fill="#ef4444" font-weight="bold" font-size="10" font-family="monospace">VDD</text>',
            ]
        elif ctype == "GND":
            return [
                '    <line x1="0" y1="-10" x2="0" y2="10" stroke="#10b981" stroke-width="2" />',
                '    <line x1="-15" y1="10" x2="15" y2="10" stroke="#10b981" stroke-width="3" />',
                '    <line x1="-10" y1="15" x2="10" y2="15" stroke="#10b981" stroke-width="2" />',
                '    <line x1="-5" y1="20" x2="5" y2="20" stroke="#10b981" stroke-width="1.5" />',
                '    <text x="18" y="15" fill="#10b981" font-weight="bold" font-size="10" font-family="monospace">GND</text>',
            ]
        elif ctype == "PIN":
            label = nl.get("properties", {}).get("parameters", {}).get("label", "PORT")
            return [
                '    <circle cx="0" cy="0" r="6" fill="#eab308" stroke="#ffffff" stroke-width="2" />',
                f'   <text x="10" y="4" fill="#eab308" font-size="11" font-weight="bold" font-family="monospace">{label}</text>',
            ]
        else:
            return [
                '    <rect x="-10" y="-15" width="20" height="30" fill="#ffffff" stroke="#64748b" stroke-width="2" />',
                '    <line x1="0" y1="-25" x2="0" y2="-15" stroke="#0f172a" stroke-width="2" />',
                '    <line x1="0" y1="15" x2="0" y2="25" stroke="#0f172a" stroke-width="2" />',
                f'   <text x="15" y="5" fill="#64748b" font-size="10" font-family="monospace">{cid}</text>',
            ]

    def _heal_static_wires(
        self,
        components: List[Dict],
        graph: CircuitGraph,
        coords: Dict[str, Tuple[int, int]],
        wires: List[Dict],
    ) -> List[Dict]:
        """
        Calculates exact terminal coordinates for all pins of all components in the graph.
        If any terminal is not connected to a wire segment of its corresponding net,
        routes a Manhattan wire to the closest segment or node on that net.
        """
        healed_wires = list(wires)

        comp_types = {comp["id"]: comp["category"] for comp in components}

        pin_offsets = {
            "PMOS": {"G": (-20, 0), "S": (0, -15), "D": (0, 15), "B": (10, 0)},
            "NMOS": {"G": (-20, 0), "S": (10, 15), "D": (10, -15), "B": (10, 0)},
            "VDD":  {"VDD": (0, 20)},
            "GND":  {"GND": (0, -10)},
            "PIN":  {"IO": (0, 0)},
        }

        net_terminals = {}
        for e in graph.edges:
            net  = e.get("to_net", "")
            node = e.get("from_node", "")
            pin  = e.get("from_pin", "")
            if not net or not node or node not in coords:
                continue

            cx, cy = coords[node]
            cat    = comp_types.get(node, "PIN")
            
            offset_dict  = pin_offsets.get(cat, pin_offsets["PIN"])
            off_x, off_y = offset_dict.get(pin, (0, 0))
            
            tx = cx + off_x
            ty = cy + off_y
            
            net_terminals.setdefault(net, []).append((tx, ty))

        for net, terminals in net_terminals.items():
            net_wires = [w for w in healed_wires if w.get("net") == net]

            if not net_wires:
                for k in range(len(terminals) - 1):
                    tx1, ty1 = terminals[k]
                    tx2, ty2 = terminals[k + 1]
                    if tx1 == tx2 or ty1 == ty2:
                        healed_wires.append({"x1": tx1, "y1": ty1, "x2": tx2, "y2": ty2, "net": net})
                    else:
                        healed_wires.append({"x1": tx1, "y1": ty1, "x2": tx2, "y2": ty1, "net": net})
                        healed_wires.append({"x1": tx2, "y1": ty1, "x2": tx2, "y2": ty2, "net": net})
                continue

            for tx, ty in terminals:
                min_dist = float("inf")
                closest_pt = None

                for w in net_wires:
                    x1, y1 = w["x1"], w["y1"]
                    x2, y2 = w["x2"], w["y2"]

                    dx = x2 - x1
                    dy = y2 - y1
                    if dx == 0 and dy == 0:
                        t = 0.0
                    else:
                        t = ((tx - x1) * dx + (ty - y1) * dy) / (dx * dx + dy * dy)
                        t = max(0.0, min(1.0, t))

                    cx_val = x1 + t * dx
                    cy_val = y1 + t * dy
                    dist   = math.sqrt((tx - cx_val) ** 2 + (ty - cy_val) ** 2)

                    if dist < min_dist:
                        min_dist   = dist
                        closest_pt = (int(cx_val), int(cy_val))

                if min_dist > 5 and closest_pt:
                    cx_val, cy_val = closest_pt
                    if tx == cx_val or ty == cy_val:
                        healed_wires.append({"x1": tx, "y1": ty, "x2": cx_val, "y2": cy_val, "net": net})
                    else:
                        healed_wires.append({"x1": tx, "y1": ty, "x2": cx_val, "y2": ty, "net": net})
                        healed_wires.append({"x1": cx_val, "y1": ty, "x2": cx_val, "y2": cy_val, "net": net})

        return healed_wires

    # ------------------------------------------------------------------
    # Helper
    # ------------------------------------------------------------------

    @staticmethod
    def _detect_mode(topology_type: Optional[str], tpl: Optional[Dict]) -> str:
        if not topology_type:
            return "GENERIC"
        if tpl and tpl.get("layout", {}).get("dynamic_layout"):
            return "DYNAMIC"
        if tpl and tpl.get("layout", {}).get("component_positions"):
            return topology_type.upper().replace(" ", "_")
        return "AUTO_PLACED"


schematic_renderer = SchematicRenderer()
