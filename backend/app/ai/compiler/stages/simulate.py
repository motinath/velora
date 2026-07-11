from app.engineering.simulation.simulation_manager import simulation_manager
from ..context import CompilationContext

class SimulationStage:
    def run(self, ctx: CompilationContext) -> None:
        ctx.sim_results = simulation_manager.run_simulation(
            netlist=ctx.netlist,
            topology_type=ctx.reqs["type"],
            parameters=ctx.reqs["parameters"],
            optimization=ctx.reqs["optimization"]
        )
        ctx.log(f"Simulation completed with status: {ctx.sim_results['status']}")
        ctx.log(f"Calculated performance metrics: {list(ctx.sim_results.get('metrics', {}).keys())}")
