import logging
from typing import List, Any
from .context import CompilationContext

logger = logging.getLogger(__name__)

class CompilerPipeline:
    def __init__(self, stages: List[Any]):
        self.stages = stages

    def execute(self, ctx: CompilationContext) -> None:
        ctx.log("Starting Compiler pipeline execution...")
        for idx, stage in enumerate(self.stages):
            stage_name = stage.__class__.__name__
            ctx.log(f"Executing Stage {idx + 1}: {stage_name}...")
            try:
                stage.run(ctx)
                ctx.log(f"Stage {stage_name} completed successfully.")
            except Exception as e:
                ctx.log(f"[FATAL-ERROR] Stage {stage_name} failed: {str(e)}")
                logger.error(f"Compiler pipeline failed at stage {stage_name}: {e}", exc_info=True)
                raise e
        ctx.log("Compiler pipeline executed successfully.")
