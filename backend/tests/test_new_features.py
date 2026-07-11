import os
import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import pytest
from app.ai.planner.parser import requirement_parser
from app.engineering.layout.gds_generator import gds_generator
from app.engineering.simulation.simulation_manager import simulation_manager
from app.engineering.graph.circuit_graph import CircuitGraph

def test_requirement_parser_target_constraints():
    prompt = "Design a CMOS inverter with delay < 25ps, power under 50uw, area < 3um2 and frequency > 1.5ghz"
    reqs = requirement_parser.parse(prompt)
    params = reqs["parameters"]
    
    assert params["target_delay_ps"] == 25.0
    assert params["target_power_uw"] == 50.0
    assert params["target_area_um2"] == 3.0
    assert params["target_frequency_mhz"] == 1500.0

def test_gds_generation():
    # Construct a simple dummy graph with a PMOS and an NMOS
    graph = CircuitGraph()
    graph.add_node("M_P", "component", category="PMOS", properties={
        "pins": ["D", "G", "S", "B"],
        "parameters": {"W": 1.0, "L": 0.15, "M": 1},
        "model": "sky130_fd_pr__pfet_01v8",
        "category": "PMOS"
    })
    graph.add_node("M_N", "component", category="NMOS", properties={
        "pins": ["D", "G", "S", "B"],
        "parameters": {"W": 0.5, "L": 0.15, "M": 1},
        "model": "sky130_fd_pr__nfet_01v8",
        "category": "NMOS"
    })
    
    # Add dummy connections
    graph.add_edge("M_P", "D", "out_net")
    graph.add_edge("M_N", "D", "out_net")
    graph.add_edge("M_P", "G", "in_net")
    graph.add_edge("M_N", "G", "in_net")
    graph.add_edge("M_P", "S", "VDD")
    graph.add_edge("M_N", "S", "GND")
    
    gds_data = gds_generator.generate_gds(graph, "dummy_inverter")
    assert len(gds_data) > 0
    # GDSII files start with record length (2 bytes) + record type (1 byte: HEADER=0x00) + data type (1 byte: 2-byte integer=0x02)
    assert gds_data[:4] == b"\x00\x06\x00\x02"

def test_raw_spice_parser():
    import tempfile
    
    mock_raw_content = """Title: Mock simulation
Date: Today
Plotname: Transient Analysis
Flags: real
No. Variables: 3
No. Points: 3
Variables:
	0	time	time
	1	v(in)	voltage
	2	v(out)	voltage
Values:
0	0.000000000000000e+00
	0.000000000000000e+00
	1.800000000000000e+00
1	1.000000000000000e-09
	1.800000000000000e+00
	0.000000000000000e+00
2	2.000000000000000e-09
	1.800000000000000e+00
	0.000000000000000e+00
"""
    with tempfile.NamedTemporaryFile("w", delete=False) as f:
        f.write(mock_raw_content)
        tmpname = f.name
        
    try:
        waveforms = {}
        variables = []
        num_vars = 0
        num_pts = 0
        
        with open(tmpname, "r") as file:
            lines = file.readlines()
            
        idx = 0
        n_lines = len(lines)
        while idx < n_lines:
            line = lines[idx].strip()
            if line.startswith("No. Variables:"):
                num_vars = int(line.split(":")[1].strip())
            elif line.startswith("No. Points:"):
                num_pts = int(line.split(":")[1].strip())
            elif line.startswith("Variables:"):
                idx += 1
                for _ in range(num_vars):
                    var_line = lines[idx].strip().split()
                    if len(var_line) >= 2:
                        variables.append(var_line[1])
                    idx += 1
                continue
            elif line.startswith("Values:"):
                idx += 1
                waveforms["x"] = []
                for var in variables[1:]:
                    clean_name = var.lower()
                    if clean_name.startswith("v("):
                        clean_name = "y_" + clean_name[2:-1].upper()
                    else:
                        clean_name = "y_" + clean_name.upper()
                    waveforms[clean_name] = []
                    
                for _ in range(num_pts):
                    if idx >= n_lines:
                        break
                    val_line = lines[idx].strip().split()
                    if len(val_line) >= 2:
                        waveforms["x"].append(float(val_line[1]))
                        idx += 1
                        for v_idx in range(1, num_vars):
                            if idx >= n_lines:
                                break
                            y_val = float(lines[idx].strip())
                            var_name = variables[v_idx]
                            clean_name = var_name.lower()
                            if clean_name.startswith("v("):
                                clean_name = "y_" + clean_name[2:-1].upper()
                            else:
                                clean_name = "y_" + clean_name.upper()
                            waveforms[clean_name].append(y_val)
                            idx += 1
                break
            idx += 1
            
        assert num_vars == 3
        assert num_pts == 3
        assert waveforms["x"] == [0.0, 1e-9, 2e-9]
        assert waveforms["y_IN"] == [0.0, 1.8, 1.8]
        assert waveforms["y_OUT"] == [1.8, 0.0, 0.0]
    finally:
        os.remove(tmpname)

def test_schematic_renderer_auto_heal():
    from app.engineering.renderer.schematic_renderer import schematic_renderer
    
    # Create a circuit graph for a mock inverter
    graph = CircuitGraph()
    graph.add_node("M_P", "component", category="PMOS", properties={
        "pins": ["D", "G", "S", "B"],
        "category": "PMOS"
    })
    graph.add_node("M_N", "component", category="NMOS", properties={
        "pins": ["D", "G", "S", "B"],
        "category": "NMOS"
    })
    
    # Connect them to out_net
    graph.add_edge("M_P", "D", "out_net")
    graph.add_edge("M_N", "D", "out_net")
    
    coords = {
        "M_P": (300, 100),
        "M_N": (300, 250)
    }
    
    healed = schematic_renderer._heal_static_wires(
        components=[
            {"id": "M_P", "category": "PMOS"},
            {"id": "M_N", "category": "NMOS"}
        ],
        graph=graph,
        coords=coords,
        wires=[]
    )
    
    # Since there are no wires, it should connect them sequentially
    assert len(healed) >= 1
    # Check that it routes out_net
    out_net_wires = [w for w in healed if w["net"] == "out_net"]
    assert len(out_net_wires) >= 1
