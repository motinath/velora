import os
import shutil
import logging
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.workspace.database.models import Artifact
from app.workspace.di_container import di

logger = logging.getLogger(__name__)

class ArtifactManager:
    """
    Manages storing, retrieving, exporting, and deleting generated circuit design files, 
    waveforms, netlists, and layout reports.
    """
    def register_artifact(
        self,
        project_id: int,
        name: str,
        file_path: str,
        artifact_type: str,
        mime_type: str,
        size_bytes: int,
        db: Session
    ) -> Artifact:
        """Registers a new artifact in the database."""
        # Check if an artifact with this file path already exists
        existing = db.query(Artifact).filter(Artifact.file_path == file_path).first()
        if existing:
            existing.version += 1
            existing.size_bytes = size_bytes
            existing.created_at = datetime.datetime.utcnow()
            db.commit()
            db.refresh(existing)
            logger.info(f"[ArtifactManager] Updated existing artifact: {name} (v{existing.version})")
            return existing

        db_artifact = Artifact(
            project_id=project_id,
            name=name,
            file_path=file_path.replace("\\", "/"),
            artifact_type=artifact_type,
            mime_type=mime_type,
            size_bytes=size_bytes,
            version=1
        )
        db.add(db_artifact)
        db.commit()
        db.refresh(db_artifact)
        logger.info(f"[ArtifactManager] Registered new artifact: {name} at {file_path}")

        # Publish event
        event_bus = di.resolve("event_bus")
        event_bus.publish("ArtifactCreated", project_id=project_id, artifact_id=db_artifact.id)

        return db_artifact

    def get_artifacts(self, project_id: int, db: Session) -> List[Artifact]:
        """Retrieves all registered artifacts for a project."""
        return db.query(Artifact).filter(Artifact.project_id == project_id).all()

    def get_artifact(self, artifact_id: int, db: Session) -> Optional[Artifact]:
        """Retrieves a specific artifact by ID."""
        return db.query(Artifact).filter(Artifact.id == artifact_id).first()

    def delete_artifact(self, artifact_id: int, db: Session) -> bool:
        """Deletes an artifact record and removes its physical file from disk."""
        db_art = db.query(Artifact).filter(Artifact.id == artifact_id).first()
        if not db_art:
            return False

        if os.path.exists(db_art.file_path):
            try:
                os.remove(db_art.file_path)
                logger.info(f"[ArtifactManager] Physically deleted artifact file from disk: {db_art.file_path}")
            except Exception as e:
                logger.error(f"[ArtifactManager] Failed to delete file {db_art.file_path}: {e}")

        db.delete(db_art)
        db.commit()
        return True

import datetime
# Register in DI Container
di.register_singleton("artifact_manager", ArtifactManager())
