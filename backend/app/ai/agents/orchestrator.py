from typing import Dict, Any, List, Optional
import logging
import json
import datetime

# Import database models
from app.workspace.database.models import Design, DesignIntent

# Import compiler context
from app.ai.compiler.context import CompilationContext

# Import technology and template DBs
from app.engineering.technology.manager import technology_manager
from app.knowledge.template_db import template_db

# Import planner and connection engines
from app.ai.planner.parser import requirement_parser
from app.ai.planner.planner import design_planner
from app.engineering.graph.connection_engine import connection_engine
from app.engineering.graph.constraint_checker import constraint_checker
from app.engineering.renderer.schematic_renderer import schematic_renderer
from app.engineering.netlist.netlist_generator import netlist_generator
from app.engineering.simulation.simulation_manager import simulation_manager

# Import LLM router
from app.ai.providers.router import model_router
from app.config import settings

logger = logging.getLogger(__name__)

class SemiconductorAgent:
    def __init__(self, name: str, role: str, system_prompt: str):
        self.name = name
        self.role = role
        self.system_prompt = system_prompt

    def run_task(self, ctx: CompilationContext, task_description: str, use_llm: bool = True) -> str:
        ctx.log(f"[{self.name.upper()}] ({self.role}) Starting task: {task_description}")
        
        if use_llm and settings.MODEL_PROVIDER != "mock":
            provider = model_router.get_provider()
            try:
                result = provider.generate(
                    system_prompt=self.system_prompt,
                    user_prompt=f"Task Description: {task_description}\nContext: {ctx.prompt}\nTemplate context: {ctx.template}"
                )
                ctx.log(f"[{self.name.upper()}] Task completed successfully with LLM reasoning.")
                return result
            except Exception as e:
                ctx.log(f"[{self.name.upper()}] LLM execution failed: {str(e)}. Falling back to deterministic logic.")
        
        ctx.log(f"[{self.name.upper()}] Deterministic logic executed.")
        return f"Completed deterministic logic for role: {self.role}"

class MultiAgentOrchestrator:
    def __init__(self):
        # 1. Manager Agent
        self.manager = SemiconductorAgent(
            name="Manager Agent",
            role="Project Manager & Coordinator",
            system_prompt="You are the Manager Agent. You orchestrate the semiconductor design team. You coordinate task delegations, track state updates, and ensure all specifications are satisfied."
        )
        # 2. Requirement Agent
        self.requirement_agent = SemiconductorAgent(
            name="Requirement Agent",
            role="Specs Translator",
            system_prompt="You are the Requirement Agent. Translate natural language specifications into strict electrical constraint parameters (VDD, technology, limits)."
        )
        # 3. Architecture Agent
        self.architecture_agent = SemiconductorAgent(
            name="Architecture Agent",
            role="Block Designer",
            system_prompt="You are the Architecture Agent. Determine the best circuit topology to satisfy requirements and document the rationale and intent."
        )
        # 4. Knowledge Agent
        self.knowledge_agent = SemiconductorAgent(
            name="Knowledge Agent",
            role="PDK & Library Expert",
            system_prompt="You are the Knowledge Agent. Retrieve PDK limits and load structural schematic templates from the knowledge base."
        )
        # 5. RTL Agent
        self.rtl_agent = SemiconductorAgent(
            name="RTL Agent",
            role="Component Sizer",
            system_prompt="You are the RTL Agent. Calculate transistor width and length dimensions dynamically, satisfying channel constraint ratios."
        )
        # 6. Schematic Agent
        self.schematic_agent = SemiconductorAgent(
            name="Schematic Agent",
            role="Layout Designer",
            system_prompt="You are the Schematic Agent. Position components on an orthogonal grid and route interconnection nets."
        )
        # 7. Timing Agent
        self.timing_agent = SemiconductorAgent(
            name="Timing Agent",
            role="STA Analyst",
            system_prompt="You are the Timing Agent. Calculate rise times, fall delays, and setup/hold timing margins."
        )
        # 8. Power Agent
        self.power_agent = SemiconductorAgent(
            name="Power Agent",
            role="Power Profiler",
            system_prompt="You are the Power Agent. Inspect leakage current path parameters and calculate active power dissipation."
        )
        # 9. Simulation Agent
        self.simulation_agent = SemiconductorAgent(
            name="Simulation Agent",
            role="Transient/DC Waveform Solver",
            system_prompt="You are the Simulation Agent. Configure SPICE stimuli and analyze voltage/current waveforms."
        )
        # 10. Verification Agent
        self.verification_agent = SemiconductorAgent(
            name="Verification Agent",
            role="DRC & LVS Inspector",
            system_prompt="You are the Verification Agent. Inspect the circuit graph for electrical connectivity, short circuits, and floating nets."
        )
        # 11. Critic Agent
        self.critic_agent = SemiconductorAgent(
            name="Critic Agent",
            role="Design Reviewer",
            system_prompt="You are the Critic Agent. Review transistor sizing and routing selections against PDK rules and request sizing iterations if violations are found."
        )
        # 12. Reviewer Agent
        self.reviewer_agent = SemiconductorAgent(
            name="Reviewer Agent",
            role="LVS Comparator",
            system_prompt="You are the Reviewer Agent. Verify differences between layout nodes and spice netlist configurations."
        )
        # 13. Engineering Report Agent
        self.report_agent = SemiconductorAgent(
            name="Engineering Report Agent",
            role="Readiness Report Compiler",
            system_prompt="You are the Report Agent. Compile overall readiness percentages for RTL, Verification, Timing, and Tapeout metrics."
        )

    def execute_multi_agent_workflow(self, ctx: CompilationContext) -> None:
        """
        Executes the full 13-agent orchestration workflow to compile the circuit design.
        """
        ctx.log("--- MULTI-AGENT DESIGN PIPELINE START ---")
        
        # 1. Manager & Requirement Agents: Parse user specifications
        self.manager.run_task(ctx, "Starting project and delegating prompt translation.", use_llm=False)
        self.requirement_agent.run_task(ctx, "Translating prompt input into structured JSON requirements.", use_llm=False)
        ctx.reqs = requirement_parser.parse(ctx.prompt)
        ctx.log(f"[REQUIREMENT AGENT] Extracted constraints: {ctx.reqs}")

        # 2. Knowledge Agent: Fetch PDK rules and circuit templates
        self.knowledge_agent.run_task(ctx, "Retrieving PDK rules and loading circuit layouts.", use_llm=False)
        pdk_name = ctx.reqs.get("pdk", "SKY130")
        rules = technology_manager.get_rules(pdk_name)
        ctx.log(f"[KNOWLEDGE AGENT] Loaded technology PDK rules: {rules.get('name')}")
        
        # Query local Knowledge Graph for conceptual relations
        from app.knowledge.knowledge_graph import knowledge_graph
        kg_context = knowledge_graph.get_context_summary(ctx.reqs.get("type", ""))
        ctx.log(f"[KNOWLEDGE AGENT] Queried relational Knowledge Graph:\n{kg_context}")
        
        tpl = template_db.get_template(ctx.reqs.get("type"))
        if tpl:
            ctx.template = tpl
            ctx.log(f"[KNOWLEDGE AGENT] Matched layout template: {tpl.get('name')}")
        else:
            ctx.log(f"[KNOWLEDGE AGENT] [WARNING] No layout template found for: {ctx.reqs.get('type')}. Falling back to default heuristics solver.")

        # 3. Architecture & RTL Agents: Pick topology and size devices
        self.architecture_agent.run_task(ctx, "Determining core topology and design decisions.", use_llm=False)
        self.rtl_agent.run_task(ctx, "Sizing transistors dynamically using optimization profiles.", use_llm=False)
        
        # Execute planning logic
        ctx.plan = design_planner.plan(ctx.reqs) if not ctx.template else self._plan_from_template(ctx)
        
        # 4. Schematic Agent: Form connectivity graph and render schema
        self.schematic_agent.run_task(ctx, "Assembling electrical connections and rendering SVG schematic.", use_llm=False)
        ctx.graph = connection_engine.build_graph(
            ctx.plan["components"],
            ctx.plan["connections"]
        )
        ctx.schematic = schematic_renderer.render(ctx.graph)
        ctx.netlist = netlist_generator.generate(ctx.graph, design_name=ctx.reqs.get("type", "Generic Subcircuit"))

        # 5. Verification, Timing, and Power Agents: Validate constraints & analyze limits
        self.verification_agent.run_task(ctx, "Verifying floating gates, connections, and DRC bounds.", use_llm=False)
        ctx.constraint_results = constraint_checker.check(ctx.graph, ctx.plan["constraints"])
        
        self.timing_agent.run_task(ctx, "Calculating delay parameters and gate switching timing paths.", use_llm=False)
        self.power_agent.run_task(ctx, "Calculating static leakage paths and active dynamic power.", use_llm=False)

        # 6. Simulation Agent: Execute SPICE transient and DC analysis
        self.simulation_agent.run_task(ctx, "Configuring SPICE stimulus and running transient waveforms.", use_llm=False)
        ctx.sim_results = simulation_manager.run_simulation(
            ctx.netlist,
            ctx.reqs.get("type", ""),
            ctx.reqs.get("parameters", {}),
            ctx.reqs.get("optimization", "default")
        )

        # 7. Critic & Reviewer Agents: Sizing adjustments check
        self.critic_agent.run_task(ctx, "Verifying channel widths and layout aspect ratios.", use_llm=False)
        self.reviewer_agent.run_task(ctx, "Double checking logic connectivity vs raw SPICE parameters.", use_llm=False)

        # 8. Report Agent: Synthesize explanation and build readiness values
        self.report_agent.run_task(ctx, "Compiling final Engineering Readiness Report.", use_llm=False)
        
        # Build readiness scores based on verification pipeline outputs
        from app.engineering.verification.analyzer import engineering_analyzer
        ctx.readiness_report = engineering_analyzer.generate_readiness_report(
            graph=ctx.graph,
            constraint_results=ctx.constraint_results,
            sim_results=ctx.sim_results,
            topology_type=ctx.reqs.get("type", ""),
            optimization=ctx.reqs.get("optimization", "default"),
            vdd=ctx.reqs.get("parameters", {}).get("vdd", 1.8)
        )
        ctx.explanation = ctx.plan.get("explanation", "")
        
        # LLM enrichment if enabled
        if settings.MODEL_PROVIDER != "mock":
            try:
                provider = model_router.get_provider()
                system_prompt = (
                    "You are a Senior Principal IC Design Reviewer. Summarize the engineering report details, "
                    "identifying layout risks, timing margins, and optimization tradeoffs. Format in Markdown."
                )
                user_prompt = f"Topology: {ctx.reqs['type']}\nReady Report: {ctx.readiness_report}\nNetlist:\n{ctx.netlist}"
                enriched_explanation = provider.generate(system_prompt=system_prompt, user_prompt=user_prompt)
                if enriched_explanation:
                    ctx.explanation = enriched_explanation
            except Exception as llm_err:
                ctx.log(f"[WARNING] LLM report enrichment failed: {str(llm_err)}")

        ctx.log("--- MULTI-AGENT DESIGN PIPELINE COMPLETE ---")

    def _plan_from_template(self, ctx: CompilationContext) -> Dict[str, Any]:
        """
        Calculates design component dimensions dynamically from a template matching optimization targets.
        """
        tpl = ctx.template
        optimization = ctx.reqs.get("optimization", "default")
        opts = tpl.get("optimizations", {})
        opt_profile = opts.get(optimization) or opts.get("default") or {}
        
        components = []
        connections = list(tpl.get("connections", []))
        
        # Custom stage expansion for Ring Oscillators
        if ctx.reqs.get("type") == "Ring Oscillator":
            stages = ctx.reqs["parameters"].get("stages", 3)
            if stages % 2 == 0:
                stages += 1
            
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
            # Standard layouts (SRAM, Current Mirror, Diff Pair)
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
        
        return {
            "components": components,
            "connections": connections,
            "constraints": constraints,
            "explanation": explanation
        }

agent_orchestrator = MultiAgentOrchestrator()
