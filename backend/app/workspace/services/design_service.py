"""
DesignService — orchestrates the full compiler pipeline and persists results.

Design intent generation is now fully driven by the topology registry.
Each topology JSON carries a 'design_intents' list; this service reads it,
formats the decision_template with the resolved optimization profile values,
and inserts DesignIntent records. No hardcoded if/elif topology branches.
"""

import logging
from typing import Dict, Any, List, Optional

from sqlalchemy.orm import Session

from app.workspace.database.models import Design, Project
from app.workspace.repositories.base import BaseRepository
from app.ai.compiler.context import CompilationContext

logger = logging.getLogger(__name__)


class DesignRepository(BaseRepository[Design]):
    def __init__(self):
        super().__init__(Design)

    def get_by_project(self, db: Session, project_id: int) -> List[Design]:
        return (
            db.query(Design)
            .filter(Design.project_id == project_id)
            .order_by(Design.created_at.desc())
            .all()
        )


design_repository = DesignRepository()


class DesignService:

    # ------------------------------------------------------------------
    # Main generation entry point
    # ------------------------------------------------------------------

    def generate_design(self, db: Session, project_id: int, prompt: str) -> Design:
        """
        Full pipeline:
          prompt → compiler → graph → renderer → netlist → simulation
          → constraint check → readiness report → DB persist → design intents
        """
        project = db.query(Project).filter(Project.id == project_id).first()
        if not project:
            raise ValueError("Project not found")

        # ----------------------------------------------------------------
        # 1. Run compiler pipeline
        # ----------------------------------------------------------------
        from app.ai.compiler.compiler import design_compiler
        ctx = design_compiler.compile(
            prompt=prompt,
            project_id=project_id,
            project_design_type=project.design_type,
            project_name=project.name,
        )

        logs_content = "\n".join(ctx.logs)

        # ----------------------------------------------------------------
        # 2. Persist design record
        # ----------------------------------------------------------------
        from sqlalchemy import func
        max_ver = (
            db.query(func.max(Design.version))
            .filter(Design.project_id == project_id)
            .scalar()
            or 0
        )

        design_data = {
            "project_id":             project_id,
            "prompt":                 prompt,
            "requirements_json":      ctx.reqs,
            "plan_json":              ctx.plan,
            "circuit_graph_json":     ctx.graph.to_json() if ctx.graph else {},
            "constraint_results_json":ctx.constraint_results,
            "schematic_svg":          ctx.schematic.get("svg", ""),
            "schematic_json":         ctx.schematic.get("layout", {}),
            "netlist_content":        ctx.netlist,
            "simulation_results_json":ctx.sim_results,
            "explanation_markdown":   ctx.explanation,
            "logs_content":           logs_content,
            "version":                max_ver + 1,
            "readiness_report_json":  getattr(ctx, "readiness_report", {}),
        }

        design = design_repository.create(db, design_data)

        # ----------------------------------------------------------------
        # 3. Design intents — registry-driven
        # ----------------------------------------------------------------
        intents_list = self._build_design_intents(ctx, project_id)

        from app.workspace.database.models import DesignIntent
        for intent_data in intents_list:
            db.add(
                DesignIntent(
                    project_id=        project_id,
                    design_id=         design.id,
                    decision=          intent_data["decision"],
                    reason=            intent_data["reason"],
                    tradeoffs=         intent_data["tradeoffs"],
                    alternatives=      intent_data["alternatives"],
                    references=        intent_data["references"],
                    engineer_id=       project.user_id,
                    affected_files=    intent_data["affected_files"],
                    affected_blocks=   intent_data["affected_blocks"],
                    verification_status=intent_data["verification_status"],
                )
            )

        db.commit()
        db.refresh(design)

        # ----------------------------------------------------------------
        # 4. Sync files to workspace state engine
        # ----------------------------------------------------------------
        design.gds_data = getattr(ctx, "gds_data", None)
        from app.workspace.services.state_manager import state_manager
        state_manager.sync_files_to_state(db, design)

        return design

    # ------------------------------------------------------------------
    # Registry-driven design intent builder
    # ------------------------------------------------------------------

    def _build_design_intents(
        self,
        ctx: CompilationContext,
        project_id: int,
    ) -> List[Dict[str, Any]]:
        """
        Read the topology's design_intents list from the registry JSON,
        format decision templates with the resolved optimization values,
        and return a list of intent dicts ready for DB insertion.
        """
        from app.engineering.topology.registry import topology_registry

        design_type = ctx.reqs.get("type", "")
        tpl = topology_registry.get(design_type)

        if not tpl:
            logger.warning(
                f"[DesignService] No registry topology found for '{design_type}'. "
                f"Skipping design intent generation."
            )
            return []

        raw_intents = tpl.get("design_intents", [])
        if not raw_intents:
            logger.info(
                f"[DesignService] Topology '{design_type}' has no design_intents defined."
            )
            return []

        # Resolve the active optimization profile for template substitution
        opt_key   = ctx.reqs.get("optimization") or "default"
        opts      = tpl.get("optimizations", {})
        opt_profile = opts.get(opt_key) or opts.get("default") or {}

        verification_status = (
            "PASSED"
            if ctx.constraint_results.get("status") == "PASSED"
            else "FAILED"
        )

        result = []
        for intent in raw_intents:
            # Format decision_template with optimization profile values
            template = intent.get("decision_template", "")
            try:
                decision = template.format(**opt_profile)
            except KeyError:
                # Template references a key not in the profile — use as-is
                decision = template

            # Expand dynamic block refs e.g. stage counts for ring oscillators
            affected_blocks = list(intent.get("affected_blocks", []))
            stages = ctx.reqs.get("parameters", {}).get("stages", 3)
            expanded_blocks = []
            for b in affected_blocks:
                if "{" in b:
                    try:
                        expanded_blocks.append(b.format(stages=stages, **opt_profile))
                    except KeyError:
                        expanded_blocks.append(b)
                else:
                    expanded_blocks.append(b)

            result.append({
                "decision":            decision,
                "reason":              intent.get("reason", ""),
                "tradeoffs":           intent.get("tradeoffs", ""),
                "alternatives":        intent.get("alternatives", []),
                "references":          intent.get("references", []),
                "affected_files":      ["schematic_layout.json", "spice_netlist.sp"],
                "affected_blocks":     expanded_blocks,
                "verification_status": verification_status,
            })

        logger.info(
            f"[DesignService] Built {len(result)} design intents for '{design_type}' "
            f"(opt='{opt_key}')."
        )
        return result

    # ------------------------------------------------------------------
    # Read helpers
    # ------------------------------------------------------------------

    def get_project_designs(self, db: Session, project_id: int) -> List[Design]:
        return design_repository.get_by_project(db, project_id)

    def get_design(self, db: Session, design_id: int) -> Optional[Design]:
        return design_repository.get(db, design_id)


design_service = DesignService()
