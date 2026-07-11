from app.engineering.graph.connection_engine import connection_engine
from ..context import CompilationContext

class ConnectionEngineStage:
    def run(self, ctx: CompilationContext) -> None:
        ctx.graph = connection_engine.build_graph(ctx.plan["components"], ctx.plan["connections"])
        ctx.log(f"Circuit Graph successfully constructed: {len(ctx.graph.nodes)} nodes, {len(ctx.graph.edges)} edges.")
