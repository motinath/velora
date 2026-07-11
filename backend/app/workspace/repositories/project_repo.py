from typing import List
from sqlalchemy.orm import Session
from app.workspace.database.models import Project
from app.workspace.repositories.base import BaseRepository

class ProjectRepository(BaseRepository[Project]):
    def __init__(self):
        super().__init__(Project)

    def get_by_user(self, db: Session, user_id: int, skip: int = 0, limit: int = 100) -> List[Project]:
        return db.query(Project).filter(Project.user_id == user_id).offset(skip).limit(limit).all()

project_repository = ProjectRepository()
