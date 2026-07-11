from typing import Dict, Any
from .context import CompilationContext
from app.ai.agents.orchestrator import agent_orchestrator

class DesignCompiler:
    def compile(self, prompt: str, project_id: int, project_design_type: str, project_name: str) -> CompilationContext:
        ctx = CompilationContext(
            prompt=prompt,
            project_id=project_id,
            project_design_type=project_design_type,
            project_name=project_name
        )
        agent_orchestrator.execute_multi_agent_workflow(ctx)
        return ctx

design_compiler = DesignCompiler()
