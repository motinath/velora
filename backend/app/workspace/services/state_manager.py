from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Dict, Any, Optional, List
import os

from app.workspace.database.models import Project, Design, File, DesignIntent

class EngineeringStateManager:
    def sync_files_to_state(self, db: Session, design: Design) -> None:
        """
        Synchronizes all compiled artifacts (Netlist, Schematic, Reports, Logic Logs)
        into the Project's File table under versioned paths.
        """
        project = db.query(Project).filter(Project.id == design.project_id).first()
        if not project:
            return

        # Define the set of virtual files to sync
        file_specs = [
            {"filename": "spice_netlist.sp", "type": "rtl", "content": design.netlist_content},
            {"filename": "schematic_layout.json", "type": "report", "content": str(design.schematic_json)},
            {"filename": "design_reasoning.md", "type": "doc", "content": design.explanation_markdown},
            {"filename": "compiler_run.log", "type": "log", "content": design.logs_content}
        ]

        for spec in file_specs:
            if not spec["content"]:
                continue
            
            # Check if file already exists in database
            db_file = db.query(File).filter(
                File.project_id == design.project_id,
                File.filename == spec["filename"]
            ).first()

            if db_file:
                db_file.content = spec["content"]
                db_file.version = design.version
            else:
                new_file = File(
                    project_id=design.project_id,
                    filename=spec["filename"],
                    type=spec["type"],
                    path=f"storage/projects/{design.project_id}/{spec['filename']}",
                    content=spec["content"],
                    version=design.version
                )
                db.add(new_file)
        
        db.commit()

    def get_synchronized_state(self, db: Session, project_id: int) -> Dict[str, Any]:
        """
        Retrieves the complete state ('Digital Twin') of the project.
        """
        project = db.query(Project).filter(Project.id == project_id).first()
        if not project:
            raise ValueError("Project not found")

        latest_design = db.query(Design).filter(
            Design.project_id == project_id
        ).order_by(Design.version.desc()).first()

        files = db.query(File).filter(File.project_id == project_id).all()
        intents = db.query(DesignIntent).filter(DesignIntent.project_id == project_id).all()

        return {
            "project_id": project_id,
            "project_name": project.name,
            "technology": project.technology,
            "design_type": project.design_type,
            "active_version": latest_design.version if latest_design else 0,
            "active_design": latest_design,
            "files": files,
            "intents": intents
        }

    def rollback_to_version(self, db: Session, project_id: int, version: int) -> Design:
        """
        Rolls back the active files and configurations of the project to a historical version.
        This creates a new version commit duplicating the historical design state.
        """
        historical_design = db.query(Design).filter(
            Design.project_id == project_id,
            Design.version == version
        ).first()

        if not historical_design:
            raise ValueError(f"Design version {version} not found in this project.")

        # Calculate next version number
        max_ver = db.query(func.max(Design.version)).filter(Design.project_id == project_id).scalar() or 0
        new_version = max_ver + 1

        # Duplicate the design record as a new version checkpoint
        new_design_data = Design(
            project_id=project_id,
            prompt=f"[Rollback to v{version}] " + historical_design.prompt,
            requirements_json=historical_design.requirements_json,
            plan_json=historical_design.plan_json,
            circuit_graph_json=historical_design.circuit_graph_json,
            constraint_results_json=historical_design.constraint_results_json,
            schematic_svg=historical_design.schematic_svg,
            schematic_json=historical_design.schematic_json,
            netlist_content=historical_design.netlist_content,
            simulation_results_json=historical_design.simulation_results_json,
            explanation_markdown=historical_design.explanation_markdown,
            logs_content=f"--- ROLLBACK TRANSACTION ---\nRolled back state from version {historical_design.version} to new version {new_version}.\nOriginal execution logs below:\n" + (historical_design.logs_content or ""),
            version=new_version,
            readiness_report_json=historical_design.readiness_report_json
        )

        db.add(new_design_data)
        db.commit()
        db.refresh(new_design_data)

        # Re-sync design intents
        historical_intents = db.query(DesignIntent).filter(
            DesignIntent.design_id == historical_design.id
        ).all()

        for intent in historical_intents:
            new_intent = DesignIntent(
                project_id=project_id,
                design_id=new_design_data.id,
                decision=intent.decision,
                reason=intent.reason,
                tradeoffs=intent.tradeoffs,
                alternatives=intent.alternatives,
                references=intent.references,
                engineer_id=intent.engineer_id,
                affected_files=intent.affected_files,
                affected_blocks=intent.affected_blocks,
                verification_status=intent.verification_status
            )
            db.add(new_intent)
        
        db.commit()

        # Synchronize files table
        self.sync_files_to_state(db, new_design_data)
        
        return new_design_data

state_manager = EngineeringStateManager()
