from app.engineering.renderer.schematic_renderer import schematic_renderer
from ..context import CompilationContext

class SchematicRenderStage:
    def run(self, ctx: CompilationContext) -> None:
        ctx.schematic = schematic_renderer.render(ctx.graph)
        ctx.log(f"Deterministic coordinate rendering finished. Generated SVG length: {len(ctx.schematic['svg'])} chars.")
