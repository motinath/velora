from app.engineering.graph.constraint_checker import constraint_checker
from ..context import CompilationContext

class ConstraintValidationStage:
    def run(self, ctx: CompilationContext) -> None:
        ctx.constraint_results = constraint_checker.check(ctx.graph, ctx.plan["constraints"])
        ctx.log(f"Design Rule Checks finished. Status: {ctx.constraint_results['status']}")
        for err in ctx.constraint_results.get("errors", []):
            ctx.log(f"[DRC-ERROR] {err}")
        for warn in ctx.constraint_results.get("warnings", []):
            ctx.log(f"[DRC-WARNING] {warn}")
