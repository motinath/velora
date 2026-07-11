from app.ai.planner.parser import requirement_parser
from ..context import CompilationContext

class RequirementParserStage:
    def run(self, ctx: CompilationContext) -> None:
        ctx.reqs = requirement_parser.parse(ctx.prompt, project_design_type=ctx.project_design_type)
        ctx.log(f"Parsed requirements: Type='{ctx.reqs['type']}', Optimization='{ctx.reqs['optimization']}', VDD={ctx.reqs['parameters'].get('vdd', 1.8)}V")
