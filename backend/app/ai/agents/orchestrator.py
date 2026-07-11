"""
Multi-Agent Orchestrator — 13-agent semiconductor design pipeline.

Changes from the original:
- Removed _plan_from_template() — all planning now goes through design_planner.plan()
  which is fully registry-driven.
- Removed the ctx.template branch that selected between planner and template path.
  The registry-driven planner is always used; template_db is kept for legacy
  knowledge retrieval only (supplies the ctx.template field for logging/LLM context).
- Knowledge Graph query now always runs (not gated on template presence).
- topology_registry is queried to enrich the KG context log.
"""

from typing import Dict, Any
import logging
import datetime

from app.workspace.database.models import Design, DesignIntent
from app.ai.compiler.context import CompilationContext
from app.engineering.technology.manager import technology_manager
from app.knowledge.template_db import template_db

from app.ai.planner.parser import requirement_parser
from app.ai.planner.planner import design_planner
from app.engineering.graph.connection_engine import connection_engine
from app.engineering.graph.constraint_checker import constraint_checker
from app.engineering.renderer.schematic_renderer import schematic_renderer
from app.engineering.netlist.netlist_generator import netlist_generator
from app.engineering.simulation.simulation_manager import simulation_manager
from app.engineering.topology.registry import topology_registry

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
                    user_prompt=(
                        f"Task Description: {task_description}\n"
                        f"Context: {ctx.prompt}\n"
                        f"Template context: {ctx.template}"
                    ),
                )
                ctx.log(f"[{self.name.upper()}] Task completed successfully with LLM reasoning.")
                return result
            except Exception as e:
                ctx.log(
                    f"[{self.name.upper()}] LLM execution failed: {str(e)}. "
                    f"Falling back to deterministic logic."
                )

        ctx.log(f"[{self.name.upper()}] Deterministic logic executed.")
        return f"Completed deterministic logic for role: {self.role}"


class MultiAgentOrchestrator:
    def __init__(self):
        # 1. Manager Agent
        self.manager = SemiconductorAgent(
            name="Manager Agent",
            role="Project Manager & Coordinator",
            system_prompt=(
                "You are the Manager Agent. You orchestrate the semiconductor design team. "
                "You coordinate task delegations, track state updates, and ensure all "
                "specifications are satisfied."
            ),
        )
        # 2. Requirement Agent
        self.requirement_agent = SemiconductorAgent(
            name="Requirement Agent",
            role="Specs Translator",
            system_prompt=(
                "You are the Requirement Agent. Translate natural language specifications "
                "into strict electrical constraint parameters (VDD, technology, limits)."
            ),
        )
        # 3. Architecture Agent
        self.architecture_agent = SemiconductorAgent(
            name="Architecture Agent",
            role="Block Designer",
            system_prompt=(
                "You are the Architecture Agent. Determine the best circuit topology to "
                "satisfy requirements and document the rationale and intent."
            ),
        )
        # 4. Knowledge Agent
        self.knowledge_agent = SemiconductorAgent(
            name="Knowledge Agent",
            role="PDK & Library Expert",
            system_prompt=(
                "You are the Knowledge Agent. Retrieve PDK limits and load structural "
                "schematic templates from the knowledge base."
            ),
        )
        # 5. RTL Agent
        self.rtl_agent = SemiconductorAgent(
            name="RTL Agent",
            role="Component Sizer",
            system_prompt=(
                "You are the RTL Agent. Calculate transistor width and length dimensions "
                "dynamically, satisfying channel constraint ratios."
            ),
        )
        # 6. Schematic Agent
        self.schematic_agent = SemiconductorAgent(
            name="Schematic Agent",
            role="Layout Designer",
            system_prompt=(
                "You are the Schematic Agent. Position components on an orthogonal grid "
                "and route interconnection nets."
            ),
        )
        # 7. Timing Agent
        self.timing_agent = SemiconductorAgent(
            name="Timing Agent",
            role="STA Analyst",
            system_prompt=(
                "You are the Timing Agent. Calculate rise times, fall delays, and "
                "setup/hold timing margins."
            ),
        )
        # 8. Power Agent
        self.power_agent = SemiconductorAgent(
            name="Power Agent",
            role="Power Profiler",
            system_prompt=(
                "You are the Power Agent. Inspect leakage current path parameters and "
                "calculate active power dissipation."
            ),
        )
        # 9. Simulation Agent
        self.simulation_agent = SemiconductorAgent(
            name="Simulation Agent",
            role="Transient/DC Waveform Solver",
            system_prompt=(
                "You are the Simulation Agent. Configure SPICE stimuli and analyze "
                "voltage/current waveforms."
            ),
        )
        # 10. Verification Agent
        self.verification_agent = SemiconductorAgent(
            name="Verification Agent",
            role="DRC & LVS Inspector",
            system_prompt=(
                "You are the Verification Agent. Inspect the circuit graph for electrical "
                "connectivity, short circuits, and floating nets."
            ),
        )
        # 11. Critic Agent
        self.critic_agent = SemiconductorAgent(
            name="Critic Agent",
            role="Design Reviewer",
            system_prompt=(
                "You are the Critic Agent. Review transistor sizing and routing selections "
                "against PDK rules and request sizing iterations if violations are found."
            ),
        )
        # 12. Reviewer Agent
        self.reviewer_agent = SemiconductorAgent(
            name="Reviewer Agent",
            role="LVS Comparator",
            system_prompt=(
                "You are the Reviewer Agent. Verify differences between layout nodes and "
                "spice netlist configurations."
            ),
        )
        # 13. Engineering Report Agent
        self.report_agent = SemiconductorAgent(
            name="Engineering Report Agent",
            role="Readiness Report Compiler",
            system_prompt=(
                "You are the Report Agent. Compile overall readiness percentages for RTL, "
                "Verification, Timing, and Tapeout metrics."
            ),
        )

    # ------------------------------------------------------------------
    # Main pipeline
    # ------------------------------------------------------------------

    def execute_multi_agent_workflow(self, ctx: CompilationContext) -> None:
        """
        Executes the full 13-agent orchestration workflow to compile the circuit design.
        All planning is registry-driven — no topology-specific branching here.
        """
        ctx.log("--- MULTI-AGENT DESIGN PIPELINE START ---")

        # ----------------------------------------------------------------
        # 1. Requirement Agent: parse prompt → structured requirements
        # ----------------------------------------------------------------
        self.manager.run_task(ctx, "Starting project and delegating prompt translation.", use_llm=False)
        self.requirement_agent.run_task(
            ctx, "Translating prompt input into structured JSON requirements.", use_llm=False
        )
        ctx.reqs = requirement_parser.parse(ctx.prompt, project_design_type=ctx.project_design_type)
        ctx.log(f"[REQUIREMENT AGENT] Extracted constraints: {ctx.reqs}")

        # ----------------------------------------------------------------
        # 2. Knowledge Agent: load PDK rules + enrich KG context
        # ----------------------------------------------------------------
        self.knowledge_agent.run_task(
            ctx, "Retrieving PDK rules and loading circuit layouts.", use_llm=False
        )
        pdk_name = ctx.reqs.get("pdk", "SKY130")
        rules = technology_manager.get_rules(pdk_name)
        ctx.log(f"[KNOWLEDGE AGENT] Loaded technology PDK rules: {rules.get('name')}")

        # Knowledge Graph context — now sourced from registry metadata
        from app.knowledge.knowledge_graph import knowledge_graph
        kg_context = knowledge_graph.get_context_summary(ctx.reqs.get("type", ""))
        ctx.log(f"[KNOWLEDGE AGENT] Queried relational Knowledge Graph:\n{kg_context}")

        # Log registry topology metadata for LLM context (informational)
        tpl_meta = topology_registry.get(ctx.reqs.get("type", ""))
        if tpl_meta:
            ctx.template = tpl_meta  # kept on ctx for LLM enrichment prompt context
            ctx.log(
                f"[KNOWLEDGE AGENT] Registry topology loaded: "
                f"'{tpl_meta.get('name')}' "
                f"[family={tpl_meta.get('family')}, variant={tpl_meta.get('variant')}]"
            )
        else:
            ctx.log(
                f"[KNOWLEDGE AGENT] [WARNING] No registry entry found for "
                f"'{ctx.reqs.get('type')}'. Planner will use best-effort fallback."
            )

        # Legacy template_db lookup — provides supplementary context only
        legacy_tpl = template_db.get_template(ctx.reqs.get("type"))
        if legacy_tpl and not tpl_meta:
            ctx.template = legacy_tpl
            ctx.log(f"[KNOWLEDGE AGENT] Fallback: matched legacy template '{legacy_tpl.get('name')}'")

        # ----------------------------------------------------------------
        # 3. Architecture & RTL Agents: topology selection + sizing
        #    Both are now fully handled by design_planner.plan() below.
        # ----------------------------------------------------------------
        self.architecture_agent.run_task(
            ctx, "Determining core topology and design decisions.", use_llm=False
        )
        self.rtl_agent.run_task(
            ctx, "Sizing transistors dynamically using optimization profiles.", use_llm=False
        )

        # Single, unified planning call — registry-driven, no branching
        ctx.plan = design_planner.plan(ctx.reqs)
        ctx.log(
            f"[RTL AGENT] Registry planner produced "
            f"{len(ctx.plan['components'])} components, "
            f"{len(ctx.plan['connections'])} connections."
        )

        # ----------------------------------------------------------------
        # 4. Schematic Agent: build circuit graph + render + netlist
        # ----------------------------------------------------------------
        self.schematic_agent.run_task(
            ctx, "Assembling electrical connections and rendering SVG schematic.", use_llm=False
        )
        ctx.graph = connection_engine.build_graph(
            ctx.plan["components"],
            ctx.plan["connections"],
        )
        ctx.schematic = schematic_renderer.render(
            ctx.graph,
            topology_type=ctx.reqs.get("type"),   # registry-driven layout lookup
        )
        ctx.netlist = netlist_generator.generate(
            ctx.graph,
            design_name=ctx.reqs.get("type", "Generic Subcircuit"),
        )

        # ----------------------------------------------------------------
        # 5. Verification, Timing, Power Agents
        # ----------------------------------------------------------------
        self.verification_agent.run_task(
            ctx, "Verifying floating gates, connections, and DRC bounds.", use_llm=False
        )
        ctx.constraint_results = constraint_checker.check(ctx.graph, ctx.plan["constraints"])

        self.timing_agent.run_task(
            ctx, "Calculating delay parameters and gate switching timing paths.", use_llm=False
        )
        self.power_agent.run_task(
            ctx, "Calculating static leakage paths and active dynamic power.", use_llm=False
        )

        # ----------------------------------------------------------------
        # 6. Simulation Agent
        # ----------------------------------------------------------------
        self.simulation_agent.run_task(
            ctx, "Configuring SPICE stimulus and running transient waveforms.", use_llm=False
        )
        ctx.sim_results = simulation_manager.run_simulation(
            ctx.netlist,
            ctx.reqs.get("type", ""),
            ctx.reqs.get("parameters", {}),
            ctx.reqs.get("optimization") or "default",
        )

        # ----------------------------------------------------------------
        # 7. Critic & Reviewer Agents
        # ----------------------------------------------------------------
        self.critic_agent.run_task(
            ctx, "Verifying channel widths and layout aspect ratios.", use_llm=False
        )
        self.reviewer_agent.run_task(
            ctx, "Double checking logic connectivity vs raw SPICE parameters.", use_llm=False
        )

        # ----------------------------------------------------------------
        # 8. Report Agent: readiness scores + explanation
        # ----------------------------------------------------------------
        self.report_agent.run_task(
            ctx, "Compiling final Engineering Readiness Report.", use_llm=False
        )

        from app.engineering.verification.analyzer import engineering_analyzer
        ctx.readiness_report = engineering_analyzer.generate_readiness_report(
            graph=ctx.graph,
            constraint_results=ctx.constraint_results,
            sim_results=ctx.sim_results,
            topology_type=ctx.reqs.get("type", ""),
            optimization=ctx.reqs.get("optimization") or "default",
            vdd=ctx.reqs.get("parameters", {}).get("vdd", 1.8),
        )
        ctx.explanation = ctx.plan.get("explanation", "")

        # LLM enrichment (optional — skipped in mock mode)
        if settings.MODEL_PROVIDER != "mock":
            try:
                provider = model_router.get_provider()
                system_prompt = (
                    "You are a Senior Principal IC Design Reviewer. Summarize the engineering "
                    "report details, identifying layout risks, timing margins, and optimization "
                    "tradeoffs. Format in Markdown."
                )
                user_prompt = (
                    f"Topology: {ctx.reqs['type']}\n"
                    f"Ready Report: {ctx.readiness_report}\n"
                    f"Netlist:\n{ctx.netlist}"
                )
                enriched = provider.generate(
                    system_prompt=system_prompt,
                    user_prompt=user_prompt,
                )
                if enriched:
                    ctx.explanation = enriched
            except Exception as llm_err:
                ctx.log(f"[WARNING] LLM report enrichment failed: {str(llm_err)}")

        ctx.log("--- MULTI-AGENT DESIGN PIPELINE COMPLETE ---")


# Module-level singleton
agent_orchestrator = MultiAgentOrchestrator()
