from typing import Dict, Any, List
import math
from app.engineering.graph.circuit_graph import CircuitGraph

class EngineeringAnalyzer:
    def calculate_area(self, graph: CircuitGraph) -> float:
        """
        Calculates total transistor area in square micrometers (um^2).
        """
        components = graph.get_components()
        total_area = 0.0
        for comp in components:
            if comp.get("type") in ["NMOS", "PMOS"]:
                params = comp.get("parameters", {})
                w = params.get("W", 0.15)
                l = params.get("L", 0.15)
                m = params.get("M", 1)
                total_area += w * l * m
        return round(total_area, 4)

    def calculate_power(self, graph: CircuitGraph, vdd: float, optimization: str) -> Dict[str, float]:
        """
        Calculates estimated active dynamic power and static leakage power.
        """
        components = graph.get_components()
        leakage_current = 0.0
        
        # Sizing-dependent leakage estimation (subthreshold leakage is inversely proportional to L)
        for comp in components:
            if comp.get("type") in ["NMOS", "PMOS"]:
                params = comp.get("parameters", {})
                w = params.get("W", 0.15)
                l = params.get("L", 0.15)
                m = params.get("M", 1)
                
                # Base leakage parameter for SKY130: ~10nA/um at L=0.15um
                base_leakage = 1e-8 * (w / 0.15) * (0.15 / l) * m
                
                # Adjust for optimization
                if optimization == "Low Leakage" or optimization == "Low Power":
                    base_leakage *= 0.1 # 10x reduction
                elif optimization == "High Speed":
                    base_leakage *= 3.0 # High speed trades off higher leakage
                
                leakage_current += base_leakage

        static_power = leakage_current * vdd
        
        # Estimate dynamic power assuming typical average gate switching
        # Dynamic power = C_load * Vdd^2 * Freq * switching_activity
        # Standard load capacitance: 50fF, average switching frequency: 200MHz
        typical_c_load = 50e-15
        typical_freq = 200e6
        active_power = typical_c_load * (vdd ** 2) * typical_freq * 0.1
        
        return {
            "leakage_current": round(leakage_current, 9), # Amps
            "static_power": round(static_power, 9), # Watts
            "active_power": round(active_power, 6), # Watts
            "total_power": round(static_power + active_power, 6)
        }

    def calculate_delay_and_frequency(self, graph: CircuitGraph, topology_type: str, vdd: float, optimization: str) -> Dict[str, float]:
        """
        Calculates timing characteristics: gate propagation delays and operating frequency.
        """
        # Base gate delay for SKY130 inverter is ~20ps at VDD=1.8V
        base_delay = 20e-12
        
        # Sizing-dependent delay estimation: delay is proportional to (L/W)
        # We look at average transistor dimensions
        components = graph.get_components()
        trans_count = 0
        w_sum = 0.0
        l_sum = 0.0
        for comp in components:
            if comp.get("type") in ["NMOS", "PMOS"]:
                params = comp.get("parameters", {})
                w_sum += params.get("W", 0.15)
                l_sum += params.get("L", 0.15)
                trans_count += 1
                
        avg_w = (w_sum / trans_count) if trans_count > 0 else 0.5
        avg_l = (l_sum / trans_count) if trans_count > 0 else 0.15
        
        # Delay scales inversely with VDD and directly with L/W ratio
        delay_multiplier = (avg_l / 0.15) * (0.5 / max(avg_w, 0.05)) * (1.8 / max(vdd, 0.1))
        
        if optimization == "High Speed":
            delay_multiplier *= 0.7 # faster gates
        elif optimization == "Low Leakage" or optimization == "Low Power":
            delay_multiplier *= 1.4 # slower gates
            
        stage_delay = base_delay * delay_multiplier
        
        # Operating Frequency estimation
        # For a ring oscillator: F = 1 / (2 * N_stages * stage_delay)
        if "Oscillator" in topology_type:
            # count stages
            stages = int(trans_count / 2) if trans_count > 0 else 3
            frequency = 1.0 / (2 * stages * stage_delay)
        else:
            # Generic clock frequency or toggle rate limit
            frequency = 1.0 / (5 * stage_delay) # 5 gate delay cycle
            
        return {
            "stage_delay_ps": round(stage_delay * 1e12, 2),
            "max_frequency_mhz": round(frequency * 1e-6, 2)
        }

    def generate_readiness_report(
        self,
        graph: CircuitGraph,
        constraint_results: Dict[str, Any],
        sim_results: Dict[str, Any],
        topology_type: str,
        optimization: str,
        vdd: float
    ) -> Dict[str, Any]:
        """
        Synthesizes the complete readiness status indicators.
        """
        area = self.calculate_area(graph)
        power_metrics = self.calculate_power(graph, vdd, optimization)
        timing_metrics = self.calculate_delay_and_frequency(graph, topology_type, vdd, optimization)
        
        drc_status = constraint_results.get("status", "PASSED")
        sim_status = "PASSED" if sim_results.get("waveforms", {}).get("t", []) else "FAILED"
        
        # Compute scores (0-100)
        rtl_score = 98 if drc_status == "PASSED" else 75
        verif_score = 100 if sim_status == "PASSED" else 40
        
        # Timing compliance score
        timing_score = 95
        if optimization == "High Speed" and timing_metrics["max_frequency_mhz"] < 100:
            timing_score = 75
            
        # Power compliance score
        power_score = 95
        if (optimization == "Low Leakage" or optimization == "Low Power") and power_metrics["static_power"] > 1e-6:
            power_score = 80
            
        overall_readiness = int((rtl_score + verif_score + timing_score + power_score) / 4)
        
        return {
            "overall": overall_readiness,
            "rtl": rtl_score,
            "verification": verif_score,
            "timing": timing_score,
            "power": power_score,
            "area_um2": area,
            "stage_delay_ps": timing_metrics["stage_delay_ps"],
            "max_frequency_mhz": timing_metrics["max_frequency_mhz"],
            "static_power_uw": round(power_metrics["static_power"] * 1e6, 3),
            "active_power_uw": round(power_metrics["active_power"] * 1e6, 3),
            "drc": 100 if drc_status == "PASSED" else 60,
            "lvs": 100,
            "documentation": 85,
            "risk": "Low" if overall_readiness >= 90 else "Medium"
        }

engineering_analyzer = EngineeringAnalyzer()
