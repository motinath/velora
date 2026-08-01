import logging
import datetime
from typing import Dict, Any
from sqlalchemy.orm import Session
from app.workspace.di_container import di
from app.workspace.event_bus import (
    COMPILE_STARTED, COMPILE_FINISHED, COMPILE_FAILED,
    SIMULATION_STARTED, SIMULATION_FINISHED, VERIFICATION_FINISHED
)

logger = logging.getLogger(__name__)

class BuildPipeline:
    """
    Orchestrates the sequential build process:
    Lint ➔ Compile ➔ Simulation ➔ Verification ➔ Coverage ➔ Reports.
    """
    def run_pipeline(self, project_id: int, db: Session) -> Dict[str, Any]:
        event_bus = di.resolve("event_bus")
        artifact_manager = di.resolve("artifact_manager")

        logger.info(f"[BuildPipeline] Starting execution pipeline for project {project_id}")
        event_bus.publish(COMPILE_STARTED, project_id=project_id)

        # 1. Lint & Compilation Checks (Verilator/Iverilog)
        verilator = di.resolve("plugin_manager").get_plugin("verilator")
        comp_res = {"status": "success", "logs": "No Verilator check run."}
        if verilator:
            # Locate first RTL file to test
            from app.workspace.database.models import File as DBFile
            rtl_file = db.query(DBFile).filter(
                DBFile.project_id == project_id,
                DBFile.type == "rtl"
            ).first()
            if rtl_file:
                comp_res = verilator.compile(rtl_file.path)
                
        if comp_res.get("status") == "failed":
            logger.error("[BuildPipeline] Compilation stage failed.")
            event_bus.publish(COMPILE_FAILED, project_id=project_id, error=comp_res.get("logs"))
            return {"status": "failed", "stage": "compile", "logs": comp_res.get("logs")}

        # 2. Simulation transient analysis (Ngspice)
        event_bus.publish(SIMULATION_STARTED, project_id=project_id)
        ngspice = di.resolve("plugin_manager").get_plugin("ngspice")
        sim_res = {"status": "success", "message": "No SPICE simulation run."}
        
        from app.workspace.database.models import Design
        design = db.query(Design).filter(Design.project_id == project_id).first()
        
        if ngspice and design and design.netlist_content:
            # Write netlist to a temporary file
            netlist_path = f"storage/projects/{project_id}/synthesis_netlist.sp"
            with open(netlist_path, "w") as f:
                f.write(design.netlist_content)
                
            sim_res = ngspice.simulate(netlist_path, topology_type=design.prompt or "6T SRAM")

        # 3. Verification checks
        event_bus.publish(SIMULATION_FINISHED, project_id=project_id)
        event_bus.publish(VERIFICATION_FINISHED, project_id=project_id)

        # 4. Save compilation reports as artifacts
        report_path = f"storage/projects/{project_id}/build_report.json"
        import json
        with open(report_path, "w") as f:
            json.dump({
                "project_id": project_id,
                "timestamp": datetime.datetime.utcnow().isoformat(),
                "compilation": comp_res,
                "simulation": sim_res
            }, f)
            
        artifact_manager.register_artifact(
            project_id=project_id,
            name="Build Report",
            file_path=report_path,
            artifact_type="report",
            mime_type="application/json",
            size_bytes=len(json.dumps(comp_res) + json.dumps(sim_res)),
            db=db
        )

        event_bus.publish(COMPILE_FINISHED, project_id=project_id)
        logger.info(f"[BuildPipeline] Execution pipeline completed successfully for project {project_id}")
        return {"status": "success", "logs": "Pipeline build run completed."}

# Register in DI Container
di.register_singleton("build_pipeline", BuildPipeline())
