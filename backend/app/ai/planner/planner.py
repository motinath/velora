from typing import Dict, Any, List
import logging

logger = logging.getLogger(__name__)

class DesignPlanner:
    def plan(self, requirements: Dict[str, Any]) -> Dict[str, Any]:
        """
        Takes structured requirements and generates a Component List and a Connection Plan.
        """
        design_type = requirements["type"]
        optimization = requirements["optimization"]
        params = requirements["parameters"]
        vdd = params.get("vdd", 1.8)

        components: List[Dict[str, Any]] = []
        connections: List[Dict[str, Any]] = []
        design_constraints: Dict[str, Any] = {
            "target_vdd": vdd,
            "max_allowable_current": 10e-3, # 10mA default
            "min_channel_width": 0.15,
            "min_channel_length": 0.15
        }

        explanation = f"# DESIGN DECISIONS - {design_type.upper()}\n\n"
        explanation += f"**Technology PDK:** SKY130  \n"
        explanation += f"**Optimization Target:** {optimization}  \n"
        explanation += f"**Supply Voltage (VDD):** {vdd} V  \n\n"

        if design_type == "6T SRAM":
            # Determine sizing based on optimization
            if optimization == "Low Leakage":
                l_val = 0.25
                w_pd = 0.60
                w_pu = 0.40
                w_pg = 0.45
                reasoning = "Sizing optimized for low subthreshold leakage: Increased channel length L=0.25um."
            elif optimization == "High Speed":
                l_val = 0.15
                w_pd = 0.80
                w_pu = 0.54
                w_pg = 0.60
                reasoning = "Sizing optimized for high-speed read/write access: Minimum length L=0.15um and wider channels."
            else:
                l_val = 0.15
                w_pd = 0.54
                w_pu = 0.36
                w_pg = 0.40
                reasoning = "Standard sizing applied for SKY130 cell stability rules."

            explanation += f"### Topology Selected\n"
            explanation += f"**Topology:** Cross-Coupled CMOS Latch  \n"
            explanation += f"**Reason:** Provides positive feedback regenerative gain, forming the most stable bi-stable storage cell for SRAM structures.  \n\n"
            
            explanation += f"### Sizing Details\n"
            explanation += f"- **Pull-up PMOS (M_PU1, M_PU2):**  \n"
            explanation += f"  - *Width:* `{w_pu} um`, *Length:* `{l_val} um`  \n"
            explanation += f"  - *Reason:* Sized smaller to reduce subthreshold leakage path to ground and maintain the Pull-up Ratio (PR = {round((w_pu/l_val)/(w_pg/l_val), 2)} < 1.0) needed for reliable writeability when overwrite signals pull bitlines low.  \n"
            explanation += f"- **Pull-down NMOS (M_PD1, M_PD2):**  \n"
            explanation += f"  - *Width:* `{w_pd} um`, *Length:* `{l_val} um`  \n"
            explanation += f"  - *Reason:* Sized wider to provide high drive strength, maintaining a Cell Ratio (CR = {round((w_pd/l_val)/(w_pg/l_val), 2)} > 1.2) for read stability to prevent inadvertent cell flips during read operations.  \n"
            explanation += f"- **Access NMOS (M_PG1, M_PG2):**  \n"
            explanation += f"  - *Width:* `{w_pg} um`, *Length:* `{l_val} um`  \n"
            explanation += f"  - *Reason:* Sized to balance read stability and write margin (acting as a compromise between the stronger pull-down NMOS and the weaker pull-up PMOS).  \n\n"
            explanation += f"**Compiler Heuristic:** {reasoning}\n\n"

            # 1. Component list
            components = [
                {"id": "M_PU1", "type": "PMOS", "parameters": {"W": w_pu, "L": l_val, "M": 1}},
                {"id": "M_PD1", "type": "NMOS", "parameters": {"W": w_pd, "L": l_val, "M": 1}},
                {"id": "M_PU2", "type": "PMOS", "parameters": {"W": w_pu, "L": l_val, "M": 1}},
                {"id": "M_PD2", "type": "NMOS", "parameters": {"W": w_pd, "L": l_val, "M": 1}},
                {"id": "M_PG1", "type": "NMOS", "parameters": {"W": w_pg, "L": l_val, "M": 1}},
                {"id": "M_PG2", "type": "NMOS", "parameters": {"W": w_pg, "L": l_val, "M": 1}},
                {"id": "V_VDD", "type": "VDD", "parameters": {}},
                {"id": "V_GND", "type": "GND", "parameters": {}},
                {"id": "P_WL", "type": "PIN", "parameters": {"label": "WL"}},
                {"id": "P_BL", "type": "PIN", "parameters": {"label": "BL"}},
                {"id": "P_BLB", "type": "PIN", "parameters": {"label": "BLB"}},
                {"id": "P_Q", "type": "PIN", "parameters": {"label": "Q"}},
                {"id": "P_QB", "type": "PIN", "parameters": {"label": "QB"}}
            ]

            # 2. Connection list
            connections = [
                # VDD and GND references
                {"comp": "V_VDD", "pin": "VDD", "net": "VDD"},
                {"comp": "V_GND", "pin": "GND", "net": "GND"},
                
                # PMOS/NMOS Pull-up/down inverter 1
                {"comp": "M_PU1", "pin": "S", "net": "VDD"},
                {"comp": "M_PU1", "pin": "B", "net": "VDD"},
                {"comp": "M_PU1", "pin": "D", "net": "Q"},
                {"comp": "M_PU1", "pin": "G", "net": "QB"},
                
                {"comp": "M_PD1", "pin": "S", "net": "GND"},
                {"comp": "M_PD1", "pin": "B", "net": "GND"},
                {"comp": "M_PD1", "pin": "D", "net": "Q"},
                {"comp": "M_PD1", "pin": "G", "net": "QB"},

                # PMOS/NMOS Pull-up/down inverter 2
                {"comp": "M_PU2", "pin": "S", "net": "VDD"},
                {"comp": "M_PU2", "pin": "B", "net": "VDD"},
                {"comp": "M_PU2", "pin": "D", "net": "QB"},
                {"comp": "M_PU2", "pin": "G", "net": "Q"},
                
                {"comp": "M_PD2", "pin": "S", "net": "GND"},
                {"comp": "M_PD2", "pin": "B", "net": "GND"},
                {"comp": "M_PD2", "pin": "D", "net": "QB"},
                {"comp": "M_PD2", "pin": "G", "net": "Q"},

                # Access transistors (Pass Gates)
                {"comp": "M_PG1", "pin": "D", "net": "BL"},
                {"comp": "M_PG1", "pin": "G", "net": "WL"},
                {"comp": "M_PG1", "pin": "S", "net": "Q"},
                {"comp": "M_PG1", "pin": "B", "net": "GND"},

                {"comp": "M_PG2", "pin": "D", "net": "BLB"},
                {"comp": "M_PG2", "pin": "G", "net": "WL"},
                {"comp": "M_PG2", "pin": "S", "net": "QB"},
                {"comp": "M_PG2", "pin": "B", "net": "GND"},

                # Pins exposure
                {"comp": "P_WL", "pin": "IO", "net": "WL"},
                {"comp": "P_BL", "pin": "IO", "net": "BL"},
                {"comp": "P_BLB", "pin": "IO", "net": "BLB"},
                {"comp": "P_Q", "pin": "IO", "net": "Q"},
                {"comp": "P_QB", "pin": "IO", "net": "QB"}
            ]

        elif design_type == "Ring Oscillator":
            stages = params.get("stages", 3)
            if stages % 2 == 0:
                stages += 1 # Ring oscillator must have odd number of stages
                explanation += f"* Corrected number of stages to {stages} (must be odd to oscillate).\n"
            
            if optimization == "Low Leakage" or optimization == "Low Power":
                w_p, w_n, l_val = 0.54, 0.36, 0.35
            elif optimization == "High Speed":
                w_p, w_n, l_val = 1.62, 1.08, 0.15
            else:
                w_p, w_n, l_val = 0.54, 0.36, 0.15

            components = [
                {"id": "V_VDD", "type": "VDD", "parameters": {}},
                {"id": "V_GND", "type": "GND", "parameters": {}},
                {"id": "P_OUT", "type": "PIN", "parameters": {"label": "OSC_OUT"}}
            ]
            
            connections = [
                {"comp": "V_VDD", "pin": "VDD", "net": "VDD"},
                {"comp": "V_GND", "pin": "GND", "net": "GND"}
            ]

            # Instantiating inverters dynamically
            for i in range(1, stages + 1):
                components.extend([
                    {"id": f"M_P{i}", "type": "PMOS", "parameters": {"W": w_p, "L": l_val, "M": 1}},
                    {"id": f"M_N{i}", "type": "NMOS", "parameters": {"W": w_n, "L": l_val, "M": 1}}
                ])
                
                # Nets: input of stage i is connected to output of stage i-1
                # Output of stage i is net_i. Input of stage 1 is net_stages (loop back)
                in_net = f"net_{stages}" if i == 1 else f"net_{i-1}"
                out_net = f"net_{i}"
                
                # PMOS i
                connections.extend([
                    {"comp": f"M_P{i}", "pin": "S", "net": "VDD"},
                    {"comp": f"M_P{i}", "pin": "B", "net": "VDD"},
                    {"comp": f"M_P{i}", "pin": "G", "net": in_net},
                    {"comp": f"M_P{i}", "pin": "D", "net": out_net}
                ])
                
                # NMOS i
                connections.extend([
                    {"comp": f"M_N{i}", "pin": "S", "net": "GND"},
                    {"comp": f"M_N{i}", "pin": "B", "net": "GND"},
                    {"comp": f"M_N{i}", "pin": "G", "net": in_net},
                    {"comp": f"M_N{i}", "pin": "D", "net": out_net}
                ])

            # Output pin connected to last stage output
            connections.append({"comp": "P_OUT", "pin": "IO", "net": f"net_{stages}"})
            explanation += f"### Topology Selected\n"
            explanation += f"**Topology:** Odd-Stage Inverter Loop  \n"
            explanation += f"**Reason:** Loop gain with 180° phase shift triggers self-sustaining oscillation at the frequency set by stage delay. Designed a {stages}-stage ring.  \n\n"
            
            explanation += f"### Sizing Details\n"
            explanation += f"- **Inverter PMOS (M_P1 to M_P{stages}):**  \n"
            explanation += f"  - *Width:* `{w_p} um`, *Length:* `{l_val} um`  \n"
            explanation += f"  - *Reason:* Sized wider than NMOS to compensate for lower hole mobility, ensuring symmetric rise/fall times and balanced duty cycles.  \n"
            explanation += f"- **Inverter NMOS (M_N1 to M_N{stages}):**  \n"
            explanation += f"  - *Width:* `{w_n} um`, *Length:* `{l_val} um`  \n"
            explanation += f"  - *Reason:* Sized to achieve target charging rates; longer length is used in low power mode to increase path resistance and reduce current.  \n\n"

        elif design_type == "Current Mirror":
            target_current = params.get("current", 10e-6)
            if optimization == "Low Leakage":
                w_val, l_val = 2.0, 1.0
            else:
                w_val, l_val = 1.0, 0.5

            components = [
                {"id": "M_REF", "type": "NMOS", "parameters": {"W": w_val, "L": l_val, "M": 1}},
                {"id": "M_MIR", "type": "NMOS", "parameters": {"W": w_val, "L": l_val, "M": 1}},
                {"id": "V_VDD", "type": "VDD", "parameters": {}},
                {"id": "V_GND", "type": "GND", "parameters": {}},
                {"id": "P_IREF", "type": "PIN", "parameters": {"label": "IREF_IN"}},
                {"id": "P_IOUT", "type": "PIN", "parameters": {"label": "IMIR_OUT"}}
            ]

            connections = [
                {"comp": "V_VDD", "pin": "VDD", "net": "VDD"},
                {"comp": "V_GND", "pin": "GND", "net": "GND"},
                
                # Diode connection for M_REF
                {"comp": "M_REF", "pin": "S", "net": "GND"},
                {"comp": "M_REF", "pin": "B", "net": "GND"},
                {"comp": "M_REF", "pin": "D", "net": "REF_DRAIN"},
                {"comp": "M_REF", "pin": "G", "net": "REF_DRAIN"}, # GATE tied to DRAIN
                
                # Mirror transistor
                {"comp": "M_MIR", "pin": "S", "net": "GND"},
                {"comp": "M_MIR", "pin": "B", "net": "GND"},
                {"comp": "M_MIR", "pin": "D", "net": "MIR_DRAIN"},
                {"comp": "M_MIR", "pin": "G", "net": "REF_DRAIN"}, # GATE tied to REF_DRAIN
                
                # Terminals
                {"comp": "P_IREF", "pin": "IO", "net": "REF_DRAIN"},
                {"comp": "P_IOUT", "pin": "IO", "net": "MIR_DRAIN"}
            ]
            explanation += f"### Topology Selected\n"
            explanation += f"**Topology:** Diode-Connected Reference Current Mirror  \n"
            explanation += f"**Reason:** Converts reference bias current into a gate voltage, which is then distributed to the matching mirror transistor gates to replicate current.  \n\n"
            
            explanation += f"### Sizing Details\n"
            explanation += f"- **Reference NMOS (M_REF):**  \n"
            explanation += f"  - *Width:* `{w_val} um`, *Length:* `{l_val} um`  \n"
            explanation += f"  - *Reason:* Diode-connected reference configuration. In Low Leakage mode, Length is increased to mitigate channel-length modulation and raise output resistance. Bias target is {round(target_current * 1e6, 2)} uA.  \n"
            explanation += f"- **Mirror NMOS (M_MIR):**  \n"
            explanation += f"  - *Width:* `{w_val} um`, *Length:* `{l_val} um`  \n"
            explanation += f"  - *Reason:* Replicates reference current; matching dimensions ensure 1:1 mirroring accuracy.  \n\n"

        elif design_type == "Differential Pair":
            if optimization == "High Speed":
                w_in, l_in = 5.0, 0.15
                w_load, l_load = 10.0, 0.15
            else:
                w_in, l_in = 2.0, 0.5
                w_load, l_load = 4.0, 0.5

            components = [
                {"id": "M_IN1", "type": "NMOS", "parameters": {"W": w_in, "L": l_in, "M": 1}},
                {"id": "M_IN2", "type": "NMOS", "parameters": {"W": w_in, "L": l_in, "M": 1}},
                {"id": "M_L1", "type": "PMOS", "parameters": {"W": w_load, "L": l_load, "M": 1}},
                {"id": "M_L2", "type": "PMOS", "parameters": {"W": w_load, "L": l_load, "M": 1}},
                {"id": "M_TAIL", "type": "NMOS", "parameters": {"W": w_in * 2, "L": l_in, "M": 1}},
                {"id": "V_VDD", "type": "VDD", "parameters": {}},
                {"id": "V_GND", "type": "GND", "parameters": {}},
                {"id": "P_INP", "type": "PIN", "parameters": {"label": "VIN_P"}},
                {"id": "P_INN", "type": "PIN", "parameters": {"label": "VIN_N"}},
                {"id": "P_OUTP", "type": "PIN", "parameters": {"label": "VOUT_P"}},
                {"id": "P_OUTN", "type": "PIN", "parameters": {"label": "VOUT_N"}},
                {"id": "P_VBIAS", "type": "PIN", "parameters": {"label": "VBIAS"}}
            ]

            connections = [
                {"comp": "V_VDD", "pin": "VDD", "net": "VDD"},
                {"comp": "V_GND", "pin": "GND", "net": "GND"},
                
                # Active load PMOS (Diode-load structure for load)
                {"comp": "M_L1", "pin": "S", "net": "VDD"},
                {"comp": "M_L1", "pin": "B", "net": "VDD"},
                {"comp": "M_L1", "pin": "D", "net": "VOUT_N"},
                {"comp": "M_L1", "pin": "G", "net": "VOUT_N"}, # Diode load 1
                
                {"comp": "M_L2", "pin": "S", "net": "VDD"},
                {"comp": "M_L2", "pin": "B", "net": "VDD"},
                {"comp": "M_L2", "pin": "D", "net": "VOUT_P"},
                {"comp": "M_L2", "pin": "G", "net": "VOUT_N"}, # Current mirror load
                
                # Input transistors
                {"comp": "M_IN1", "pin": "D", "net": "VOUT_N"},
                {"comp": "M_IN1", "pin": "G", "net": "VIN_P"},
                {"comp": "M_IN1", "pin": "S", "net": "TAIL"},
                {"comp": "M_IN1", "pin": "B", "net": "GND"},
                
                {"comp": "M_IN2", "pin": "D", "net": "VOUT_P"},
                {"comp": "M_IN2", "pin": "G", "net": "VIN_N"},
                {"comp": "M_IN2", "pin": "S", "net": "TAIL"},
                {"comp": "M_IN2", "pin": "B", "net": "GND"},
                
                # Tail current sink
                {"comp": "M_TAIL", "pin": "D", "net": "TAIL"},
                {"comp": "M_TAIL", "pin": "G", "net": "VBIAS"},
                {"comp": "M_TAIL", "pin": "S", "net": "GND"},
                {"comp": "M_TAIL", "pin": "B", "net": "GND"},

                # Terminals
                {"comp": "P_INP", "pin": "IO", "net": "VIN_P"},
                {"comp": "P_INN", "pin": "IO", "net": "VIN_N"},
                {"comp": "P_OUTP", "pin": "IO", "net": "VOUT_P"},
                {"comp": "P_OUTN", "pin": "IO", "net": "VOUT_N"},
                {"comp": "P_VBIAS", "pin": "IO", "net": "VBIAS"}
            ]
            explanation += f"### Topology Selected\n"
            explanation += f"**Topology:** NMOS Differential Pair with Active PMOS Mirror Load  \n"
            explanation += f"**Reason:** Symmetrical input branches provide high differential voltage gain while suppressing common-mode noise.  \n\n"
            
            explanation += f"### Sizing Details\n"
            explanation += f"- **Input Pair NMOS (M_IN1, M_IN2):**  \n"
            explanation += f"  - *Width:* `{w_in} um`, *Length:* `{l_in} um`  \n"
            explanation += f"  - *Reason:* Wide channels maximize transconductance (gm) to increase overall gain and input bandwidth.  \n"
            explanation += f"- **Active Load PMOS (M_L1, M_L2):**  \n"
            explanation += f"  - *Width:* `{w_load} um`, *Length:* `{l_load} um`  \n"
            explanation += f"  - *Reason:* Sized wider to provide high impedance, converting differential current change into a single-ended output voltage.  \n"
            explanation += f"- **Tail NMOS (M_TAIL):**  \n"
            explanation += f"  - *Width:* `{w_in * 2} um`, *Length:* `{l_in} um`  \n"
            explanation += f"  - *Reason:* Sized large to handle the sum of the bias currents and provide a constant, high-impedance tail current sink.  \n\n"

        logger.info(f"DesignPlanner output: planned {len(components)} components, {len(connections)} connections.")
        
        return {
            "components": components,
            "connections": connections,
            "constraints": design_constraints,
            "explanation": explanation
        }

design_planner = DesignPlanner()
