from app.engineering.technology.manager import technology_manager
from app.knowledge.template_db import template_db
from ..context import CompilationContext

class KnowledgeRetrievalStage:
    def run(self, ctx: CompilationContext) -> None:
        pdk_name = ctx.reqs.get("pdk", "SKY130")
        rules = technology_manager.get_rules(pdk_name)
        ctx.log(f"Retrieved technology PDK rules: {rules.get('name')}")
        
        tpl = template_db.get_template(ctx.reqs.get("type"))
        if tpl:
            ctx.template = tpl
            ctx.log(f"Matched circuit template: {tpl.get('name')} (Description: {tpl.get('description')})")
        else:
            ctx.log(f"[WARNING] No layout template found for: {ctx.reqs.get('type')}. Planner fallback will be used.")
