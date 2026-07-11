from app.engineering.netlist.netlist_generator import netlist_generator
from ..context import CompilationContext

class NetlistGenerationStage:
    def run(self, ctx: CompilationContext) -> None:
        ctx.netlist = netlist_generator.generate(ctx.graph, design_name=ctx.project_name)
        ctx.log("Valid SPICE netlist text generated successfully.")
