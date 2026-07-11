from app.ai.planner.planner import design_planner
from ..context import CompilationContext
from typing import Dict, Any, List

class DesignPlannerStage:
    def run(self, ctx: CompilationContext) -> None:
        if ctx.template:
            ctx.log("Planning component sizes dynamically using database template...")
            tpl = ctx.template
            optimization = ctx.reqs.get("optimization", "default")
            
            opts = tpl.get("optimizations", {})
            opt_profile = opts.get(optimization) or opts.get("default") or {}
            
            ctx.log(f"Applying template optimization: '{optimization}'. Sizing details: {opt_profile.get('reasoning', '')}")
            
            components: List[Dict[str, Any]] = []
            connections: List[Dict[str, Any]] = list(tpl.get("connections", []))
            
            # Special case for Ring Oscillator which expands stages dynamically
            if ctx.reqs.get("type") == "Ring Oscillator":
                stages = ctx.reqs["parameters"].get("stages", 3)
                if stages % 2 == 0:
                    stages += 1
                ctx.log(f"Generating odd stage inverter loop of length: {stages}")
                
                w_p = opt_profile.get("w_p", 0.54)
                w_n = opt_profile.get("w_n", 0.36)
                l_val = opt_profile.get("l_val", 0.15)
                
                components = list(tpl.get("base_components", []))
                connections = list(tpl.get("base_connections", []))
                
                for i in range(1, stages + 1):
                    components.extend([
                        {"id": f"M_P{i}", "type": "PMOS", "parameters": {"W": w_p, "L": l_val, "M": 1}},
                        {"id": f"M_N{i}", "type": "NMOS", "parameters": {"W": w_n, "L": l_val, "M": 1}}
                    ])
                    in_net = f"net_{stages}" if i == 1 else f"net_{i-1}"
                    out_net = f"net_{i}"
                    
                    connections.extend([
                        {"comp": f"M_P{i}", "pin": "S", "net": "VDD"},
                        {"comp": f"M_P{i}", "pin": "B", "net": "VDD"},
                        {"comp": f"M_P{i}", "pin": "G", "net": in_net},
                        {"comp": f"M_P{i}", "pin": "D", "net": out_net},
                        {"comp": f"M_N{i}", "pin": "S", "net": "GND"},
                        {"comp": f"M_N{i}", "pin": "B", "net": "GND"},
                        {"comp": f"M_N{i}", "pin": "G", "net": in_net},
                        {"comp": f"M_N{i}", "pin": "D", "net": out_net}
                    ])
                connections.append({"comp": "P_OUT", "pin": "IO", "net": f"net_{stages}"})
            else:
                # Standard templates (SRAM, Current Mirror, Diff Pair)
                for item in tpl.get("components", []):
                    resolved_item = {
                        "id": item["id"],
                        "type": item["type"],
                        "parameters": {}
                    }
                    
                    if "w_key" in item:
                        resolved_item["parameters"]["W"] = opt_profile.get(item["w_key"], 0.5)
                    if "l_key" in item:
                        resolved_item["parameters"]["L"] = opt_profile.get(item["l_key"], 0.15)
                    if "label" in item:
                        resolved_item["parameters"]["label"] = item["label"]
                        
                    components.append(resolved_item)
            
            vdd = ctx.reqs["parameters"].get("vdd", 1.8)
            constraints = {
                "target_vdd": vdd,
                "max_allowable_current": 10e-3,
                "min_channel_width": 0.15,
                "min_channel_length": 0.15
            }
            
            explanation = f"# DESIGN DECISIONS - {ctx.reqs['type'].upper()}\n\n"
            explanation += f"**Technology PDK:** SKY130  \n"
            explanation += f"**Optimization Target:** {optimization}  \n"
            explanation += f"**Supply Voltage (VDD):** {vdd} V  \n\n"
            explanation += f"### Topology Selected\n"
            explanation += f"**Topology:** {tpl.get('name')}  \n"
            explanation += f"**Reason:** {tpl.get('description')}  \n\n"
            explanation += f"### Sizing Details\n"
            explanation += f"- **Optimizations Applied:**  \n"
            explanation += f"  - *Heuristics:* `{opt_profile.get('reasoning')}`  \n"
            
            ctx.plan = {
                "components": components,
                "connections": connections,
                "constraints": constraints,
                "explanation": explanation
            }
            ctx.log(f"Planned {len(components)} components dynamically from template.")
        else:
            ctx.log("Planning component layout via default design planner...")
            ctx.plan = design_planner.plan(ctx.reqs)
            ctx.log(f"Planned {len(ctx.plan['components'])} components from default heuristics solver.")
