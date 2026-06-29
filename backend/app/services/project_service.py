from sqlalchemy.orm import Session
from typing import List, Optional
from app.repositories.project_repo import project_repository
from app.database.models import Project

class ProjectService:
    def create_project(self, db: Session, name: str, user_id: int, technology: str = "SKY130", design_type: str = "Memory Cell", description: str = "") -> Project:
        return project_repository.create(db, {
            "name": name,
            "user_id": user_id,
            "technology": technology,
            "design_type": design_type,
            "description": description
        })

    def get_project(self, db: Session, project_id: int) -> Optional[Project]:
        return project_repository.get(db, project_id)

    def list_projects(self, db: Session, user_id: int) -> List[Project]:
        return project_repository.get_by_user(db, user_id)

    def delete_project(self, db: Session, project_id: int) -> Optional[Project]:
        return project_repository.remove(db, project_id)

project_service = ProjectService()
