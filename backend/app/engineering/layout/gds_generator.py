import struct
import datetime
import logging
from typing import List, Dict, Any, Tuple
from app.engineering.graph.circuit_graph import CircuitGraph

logger = logging.getLogger(__name__)

class GdsWriter:
    """
    Standard GDSII Stream Format Binary Writer.
    Implements core GDSII records for library, structures, and boundary elements.
    """
    def __init__(self):
        self.stream = bytearray()

    def _write_record(self, record_type: int, data_type: int, data: bytes = b""):
        length = len(data) + 4
        self.stream.extend(struct.pack(">HBB", length, record_type, data_type))
        self.stream.extend(data)

    def _gds_real8(self, val: float) -> bytes:
        """Converts double-precision IEEE float to 8-byte GDSII excess-64 format."""
        if val == 0.0:
            return b"\x00" * 8
        sign = 0x80 if val < 0 else 0x00
        val = abs(val)
        import math
        f_exp = math.ceil(math.log2(val) / 4)
        mantissa = val / (16 ** f_exp)
        while mantissa < 1.0 / 16:
            mantissa *= 16
            f_exp -= 1
        while mantissa >= 1.0:
            mantissa /= 16
            f_exp += 1
        exponent = f_exp + 64
        if exponent < 0 or exponent > 127:
            raise ValueError("Value out of GDSII range")
        mantissa_int = int(mantissa * (2 ** 56))
        data = bytearray(8)
        data[0] = sign | exponent
        for i in range(1, 8):
            data[i] = (mantissa_int >> (8 * (7 - i))) & 0xff
        return bytes(data)

    def begin_library(self, lib_name: str = "VELORA_LIB"):
        # HEADER (version 600)
        self._write_record(0x00, 0x02, struct.pack(">H", 600))
        # BGNLIB
        now = datetime.datetime.now()
        date_data = struct.pack(">12H", 
            now.year, now.month, now.day, now.hour, now.minute, now.second,
            now.year, now.month, now.day, now.hour, now.minute, now.second
        )
        self._write_record(0x01, 0x02, date_data)
        # LIBNAME
        name_bytes = lib_name.encode("ascii")
        if len(name_bytes) % 2 != 0:
            name_bytes += b"\x00"
        self._write_record(0x02, 0x06, name_bytes)
        # UNITS
        # User unit = 1 micron (1e-6m), Database unit = 1 nm (1e-9m)
        units_data = self._gds_real8(0.001) + self._gds_real8(1e-9)
        self._write_record(0x03, 0x04, units_data)

    def begin_structure(self, str_name: str = "CELL_TOP"):
        now = datetime.datetime.now()
        date_data = struct.pack(">12H", 
            now.year, now.month, now.day, now.hour, now.minute, now.second,
            now.year, now.month, now.day, now.hour, now.minute, now.second
        )
        self._write_record(0x05, 0x02, date_data)
        # STRNAME
        name_bytes = str_name.encode("ascii")
        if len(name_bytes) % 2 != 0:
            name_bytes += b"\x00"
        self._write_record(0x06, 0x06, name_bytes)

    def add_boundary(self, layer: int, points: List[Tuple[float, float]]):
        """Adds a closed polygon boundary to the active structure."""
        self._write_record(0x08, 0x00) # BOUNDARY
        self._write_record(0x0d, 0x02, struct.pack(">h", layer)) # LAYER
        self._write_record(0x0e, 0x02, struct.pack(">h", 0)) # DATATYPE
        
        xy_data = bytearray()
        for x, y in points:
            xy_data.extend(struct.pack(">ii", int(x), int(y)))
        # GDSII requires closed boundaries, so copy the first point to the end if not already closed
        if points and points[0] != points[-1]:
            xy_data.extend(struct.pack(">ii", int(points[0][0]), int(points[0][1])))
        
        self._write_record(0x10, 0x03, bytes(xy_data)) # XY
        self._write_record(0x11, 0x00) # ENDEL

    def end_structure(self):
        self._write_record(0x07, 0x00)

    def end_library(self):
        self._write_record(0x04, 0x00)

    def get_bytes(self) -> bytes:
        return bytes(self.stream)


class GdsLayoutGenerator:
    """
    Compiles CircuitGraph components and connections into a valid, physical GDSII layout.
    Applies heuristics for placement (PMOS top, NMOS bottom) and cell routing.
    """
    def generate_gds(self, graph: CircuitGraph, topology_name: str) -> bytes:
        if not graph:
            raise ValueError("No circuit graph provided.")

        writer = GdsWriter()
        writer.begin_library("VELORA_PDK_LIB")
        writer.begin_structure(topology_name.upper().replace(" ", "_"))

        components = graph.get_components()
        edges = graph.edges

        # Group transistors by type
        pmos_list = [c for c in components if c.get("type") == "PMOS"]
        nmos_list = [c for c in components if c.get("type") == "NMOS"]

        # Constants in nanometers (nm)
        P_WELL_LAYER = 13
        N_DIFFUSION_LAYER = 1  # active P-diff
        P_DIFFUSION_LAYER = 2  # active N-diff
        POLY_LAYER = 3
        CONTACT_LAYER = 4
        METAL1_LAYER = 5

        # Placement parameters
        y_pmos_center = 12000
        y_nmos_center = -12000
        x_spacing = 6000
        x_start = 10000

        pin_contacts: Dict[Tuple[str, str], Tuple[int, int]] = {} # (comp_id, pin) -> (x, y) nm
        net_pins: Dict[str, List[Tuple[str, str]]] = {} # net -> list of (comp_id, pin)

        # 1. Place PMOS transistors
        for idx, pm in enumerate(pmos_list):
            comp_id = pm["id"]
            params = pm.get("parameters", {})
            w_nm = int(params.get("W", 0.5) * 1000)
            l_nm = int(params.get("L", 0.15) * 1000)
            
            x_pos = x_start + idx * x_spacing
            y_pos = y_pmos_center

            # Active diffusion box
            # gate length + source/drain diffusion regions
            active_width = l_nm + 1200
            w1 = x_pos - active_width // 2
            w2 = x_pos + active_width // 2
            h1 = y_pos - w_nm // 2
            h2 = y_pos + w_nm // 2
            
            # P-Diffusion boundary
            writer.add_boundary(P_DIFFUSION_LAYER, [(w1, h1), (w2, h1), (w2, h2), (w1, h2)])

            # Polysilicon Gate crossing vertical stripe
            g1 = x_pos - l_nm // 2
            g2 = x_pos + l_nm // 2
            # extends slightly beyond diffusion
            gh1 = h1 - 400
            gh2 = h2 + 400
            writer.add_boundary(POLY_LAYER, [(g1, gh1), (g2, gh1), (g2, gh2), (g1, gh2)])

            # Contacts & Metal 1 patches for Source, Gate, Drain
            contact_sz = 200
            # Source (left of gate)
            s_cx = x_pos - l_nm // 2 - 400
            s_cy = y_pos
            writer.add_boundary(CONTACT_LAYER, [
                (s_cx - contact_sz // 2, s_cy - contact_sz // 2),
                (s_cx + contact_sz // 2, s_cy - contact_sz // 2),
                (s_cx + contact_sz // 2, s_cy + contact_sz // 2),
                (s_cx - contact_sz // 2, s_cy + contact_sz // 2)
            ])
            writer.add_boundary(METAL1_LAYER, [
                (s_cx - contact_sz, s_cy - contact_sz),
                (s_cx + contact_sz, s_cy - contact_sz),
                (s_cx + contact_sz, s_cy + contact_sz),
                (s_cx - contact_sz, s_cy + contact_sz)
            ])
            pin_contacts[(comp_id, "S")] = (s_cx, s_cy)
            pin_contacts[(comp_id, "B")] = (s_cx, s_cy) # Bulk connected to Source in simple layout

            # Drain (right of gate)
            d_cx = x_pos + l_nm // 2 + 400
            d_cy = y_pos
            writer.add_boundary(CONTACT_LAYER, [
                (d_cx - contact_sz // 2, d_cy - contact_sz // 2),
                (d_cx + contact_sz // 2, d_cy - contact_sz // 2),
                (d_cx + contact_sz // 2, d_cy + contact_sz // 2),
                (d_cx - contact_sz // 2, d_cy + contact_sz // 2)
            ])
            writer.add_boundary(METAL1_LAYER, [
                (d_cx - contact_sz, d_cy - contact_sz),
                (d_cx + contact_sz, d_cy - contact_sz),
                (d_cx + contact_sz, d_cy + contact_sz),
                (d_cx - contact_sz, d_cy + contact_sz)
            ])
            pin_contacts[(comp_id, "D")] = (d_cx, d_cy)

            # Gate Contact (at the top)
            g_cx = x_pos
            g_cy = gh2 - 200
            writer.add_boundary(CONTACT_LAYER, [
                (g_cx - contact_sz // 2, g_cy - contact_sz // 2),
                (g_cx + contact_sz // 2, g_cy - contact_sz // 2),
                (g_cx + contact_sz // 2, g_cy + contact_sz // 2),
                (g_cx - contact_sz // 2, g_cy + contact_sz // 2)
            ])
            writer.add_boundary(METAL1_LAYER, [
                (g_cx - contact_sz, g_cy - contact_sz),
                (g_cx + contact_sz, g_cy - contact_sz),
                (g_cx + contact_sz, g_cy + contact_sz),
                (g_cx - contact_sz, g_cy + contact_sz)
            ])
            pin_contacts[(comp_id, "G")] = (g_cx, g_cy)

        # 2. Place NMOS transistors
        for idx, nm in enumerate(nmos_list):
            comp_id = nm["id"]
            params = nm.get("parameters", {})
            w_nm = int(params.get("W", 0.3) * 1000)
            l_nm = int(params.get("L", 0.15) * 1000)
            
            x_pos = x_start + idx * x_spacing
            y_pos = y_nmos_center

            # Active diffusion box
            active_width = l_nm + 1200
            w1 = x_pos - active_width // 2
            w2 = x_pos + active_width // 2
            h1 = y_pos - w_nm // 2
            h2 = y_pos + w_nm // 2
            
            # N-Diffusion boundary
            writer.add_boundary(N_DIFFUSION_LAYER, [(w1, h1), (w2, h1), (w2, h2), (w1, h2)])

            # Polysilicon Gate crossing vertical stripe
            g1 = x_pos - l_nm // 2
            g2 = x_pos + l_nm // 2
            gh1 = h1 - 400
            gh2 = h2 + 400
            writer.add_boundary(POLY_LAYER, [(g1, gh1), (g2, gh1), (g2, gh2), (g1, gh2)])

            # Contacts & Metal 1 patches for Source, Gate, Drain
            contact_sz = 200
            # Source (left of gate)
            s_cx = x_pos - l_nm // 2 - 400
            s_cy = y_pos
            writer.add_boundary(CONTACT_LAYER, [
                (s_cx - contact_sz // 2, s_cy - contact_sz // 2),
                (s_cx + contact_sz // 2, s_cy - contact_sz // 2),
                (s_cx + contact_sz // 2, s_cy + contact_sz // 2),
                (s_cx - contact_sz // 2, s_cy + contact_sz // 2)
            ])
            writer.add_boundary(METAL1_LAYER, [
                (s_cx - contact_sz, s_cy - contact_sz),
                (s_cx + contact_sz, s_cy - contact_sz),
                (s_cx + contact_sz, s_cy + contact_sz),
                (s_cx - contact_sz, s_cy + contact_sz)
            ])
            pin_contacts[(comp_id, "S")] = (s_cx, s_cy)
            pin_contacts[(comp_id, "B")] = (s_cx, s_cy) # Bulk connected to Source in simple layout

            # Drain (right of gate)
            d_cx = x_pos + l_nm // 2 + 400
            d_cy = y_pos
            writer.add_boundary(CONTACT_LAYER, [
                (d_cx - contact_sz // 2, d_cy - contact_sz // 2),
                (d_cx + contact_sz // 2, d_cy - contact_sz // 2),
                (d_cx + contact_sz // 2, d_cy + contact_sz // 2),
                (d_cx - contact_sz // 2, d_cy + contact_sz // 2)
            ])
            writer.add_boundary(METAL1_LAYER, [
                (d_cx - contact_sz, d_cy - contact_sz),
                (d_cx + contact_sz, d_cy - contact_sz),
                (d_cx + contact_sz, d_cy + contact_sz),
                (d_cx - contact_sz, d_cy + contact_sz)
            ])
            pin_contacts[(comp_id, "D")] = (d_cx, d_cy)

            # Gate Contact (at the bottom)
            g_cx = x_pos
            g_cy = gh1 + 200
            writer.add_boundary(CONTACT_LAYER, [
                (g_cx - contact_sz // 2, g_cy - contact_sz // 2),
                (g_cx + contact_sz // 2, g_cy - contact_sz // 2),
                (g_cx + contact_sz // 2, g_cy + contact_sz // 2),
                (g_cx - contact_sz // 2, g_cy + contact_sz // 2)
            ])
            writer.add_boundary(METAL1_LAYER, [
                (g_cx - contact_sz, g_cy - contact_sz),
                (g_cx + contact_sz, g_cy - contact_sz),
                (g_cx + contact_sz, g_cy + contact_sz),
                (g_cx - contact_sz, g_cy + contact_sz)
            ])
            pin_contacts[(comp_id, "G")] = (g_cx, g_cy)

        # 3. Add Wells & Power Rails
        total_width = max(len(pmos_list), len(nmos_list), 1) * x_spacing + x_start + 4000
        # N-Well over PMOS
        writer.add_boundary(P_WELL_LAYER, [(4000, 4000), (total_width, 4000), (total_width, 24000), (4000, 24000)])
        
        # Power Rails (horizontal Metal 1 stripes)
        # VDD Rail at Y=22,000
        writer.add_boundary(METAL1_LAYER, [
            (2000, 22000), (total_width, 22000), (total_width, 24000), (2000, 24000)
        ])
        # GND Rail at Y=-22,000
        writer.add_boundary(METAL1_LAYER, [
            (2000, -24000), (total_width, -24000), (total_width, -22000), (2000, -22000)
        ])

        # 4. Map edges to net connections
        for edge in edges:
            from_node = edge["from_node"]
            from_pin = edge["from_pin"]
            to_net = edge["to_net"]

            if to_net not in net_pins:
                net_pins[to_net] = []
            net_pins[to_net].append((from_node, from_pin))

        # 5. Route nets
        wire_width = 300
        for net, pins in net_pins.items():
            net_name_upper = net.upper()
            
            # Group pins by coordinate
            coords = []
            for comp_id, pin in pins:
                if (comp_id, pin) in pin_contacts:
                    coords.append(pin_contacts[(comp_id, pin)])

            if not coords:
                continue

            # Route VDD / GND nets to the rails
            if net_name_upper in ("VDD", "VCC"):
                for cx, cy in coords:
                    # Draw vertical route from contact (cx, cy) to VDD rail at Y=22000
                    writer.add_boundary(METAL1_LAYER, [
                        (cx - wire_width // 2, cy),
                        (cx + wire_width // 2, cy),
                        (cx + wire_width // 2, 22000),
                        (cx - wire_width // 2, 22000)
                    ])
            elif net_name_upper in ("GND", "VSS"):
                for cx, cy in coords:
                    # Draw vertical route from contact (cx, cy) to GND rail at Y=-22000
                    writer.add_boundary(METAL1_LAYER, [
                        (cx - wire_width // 2, -22000),
                        (cx + wire_width // 2, -22000),
                        (cx + wire_width // 2, cy),
                        (cx - wire_width // 2, cy)
                    ])
            else:
                # Signal Routing: Connect coordinates together using vertical/horizontal routes
                coords.sort(key=lambda coord: coord[0]) # sort by X coordinate
                for idx in range(len(coords) - 1):
                    x1, y1 = coords[idx]
                    x2, y2 = coords[idx + 1]

                    # Standard L-Routing: Vertical from (x1, y1) to (x1, y2), then horizontal to (x2, y2)
                    # Vertical segment
                    vy1, vy2 = min(y1, y2), max(y1, y2)
                    if vy1 != vy2:
                        writer.add_boundary(METAL1_LAYER, [
                            (x1 - wire_width // 2, vy1),
                            (x1 + wire_width // 2, vy1),
                            (x1 + wire_width // 2, vy2),
                            (x1 - wire_width // 2, vy2)
                        ])

                    # Horizontal segment
                    hx1, hx2 = min(x1, x2), max(x1, x2)
                    if hx1 != hx2:
                        writer.add_boundary(METAL1_LAYER, [
                            (hx1, y2 - wire_width // 2),
                            (hx2, y2 - wire_width // 2),
                            (hx2, y2 + wire_width // 2),
                            (hx1, y2 + wire_width // 2)
                        ])

        writer.end_structure()
        writer.end_library()
        return writer.get_bytes()

gds_generator = GdsLayoutGenerator()
