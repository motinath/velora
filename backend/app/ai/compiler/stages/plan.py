"""
Plan Stage — delegates entirely to DesignPlanner.

The old version duplicated the Ring Oscillator stage-expansion logic and
had its own template-resolution path. Both are gone. The planner now owns
all component instantiation logic, driven by the topology registry.
"""

import logging
from app.ai.planner.planner import design_planner
from ..context import CompilationContext

logger = logging.getLogger(__name__)


class DesignPlannerStage:
    def run(self, ctx: CompilationContext) -> None:
        ctx.log(
            f"[PLAN STAGE] Planning topology '{ctx.reqs.get('type')}' "
            f"(opt='{ctx.reqs.get('optimization')}') via registry-driven planner..."
        )
        ctx.plan = design_planner.plan(ctx.reqs)
        ctx.log(
            f"[PLAN STAGE] Complete — "
            f"{len(ctx.plan['components'])} components, "
            f"{len(ctx.plan['connections'])} connections."
        )
