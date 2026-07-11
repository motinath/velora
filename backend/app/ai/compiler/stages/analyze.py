from app.ai.providers.router import model_router
from app.config import settings
from ..context import CompilationContext

class AIAnalysisStage:
    def run(self, ctx: CompilationContext) -> None:
        explanation = ctx.plan.get("explanation", "")
        provider = model_router.get_provider()
        
        if settings.MODEL_PROVIDER != "mock" and (
            settings.OPENAI_API_KEY or settings.CLAUDE_API_KEY or settings.GEMINI_API_KEY or settings.DEEPSEEK_API_KEY
        ):
            ctx.log("Enriching design analysis using active LLM router...")
            try:
                system_prompt = (
                    "You are a Senior Principal IC Design Engineer. Analyze the given circuit topology and parameters. "
                    "Provide a technical explanation covering: 1. Sizing ratios and stability, 2. Power vs delay trade-offs, "
                    "3. Layout constraints in SKY130 PDK. Be extremely professional. Format in Markdown."
                )
                user_prompt = f"Topology: {ctx.reqs['type']}\nParameters: {ctx.reqs['parameters']}\nNetlist:\n{ctx.netlist}\nDRC warnings: {ctx.constraint_results.get('warnings', [])}"
                enriched_explanation = provider.generate(system_prompt=system_prompt, user_prompt=user_prompt)
                if enriched_explanation:
                    explanation = enriched_explanation
                    ctx.log("LLM commentary appended successfully.")
            except Exception as llm_err:
                ctx.log(f"[WARNING] LLM enrichment failed: {str(llm_err)}. Using default planner description.")
        
        ctx.explanation = explanation
