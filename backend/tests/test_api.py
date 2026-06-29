import os
import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.database.connection import Base, get_db

from sqlalchemy.pool import StaticPool

# Setup test DB (SQLite in-memory with StaticPool to share connection)
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

from app.database.models import User, Project, File, ChatSession, ChatMessage
Base.metadata.create_all(bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)

def test_health_check():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_auth_and_project_flow():
    # 1. Register User
    reg_response = client.post("/api/v1/auth/register", json={
        "email": "test@velora.ai",
        "password": "testpassword"
    })
    assert reg_response.status_code == 200
    assert reg_response.json()["email"] == "test@velora.ai"

    # 2. Login User
    login_response = client.post("/api/v1/auth/login", json={
        "email": "test@velora.ai",
        "password": "testpassword"
    })
    assert login_response.status_code == 200
    token = login_response.json()["access_token"]
    assert token is not None

    headers = {"Authorization": f"Bearer {token}"}

    # 3. Create Project with new specifications
    proj_response = client.post("/api/v1/projects/", json={
        "name": "Test Core Subsystem",
        "technology": "SKY130",
        "design_type": "6T SRAM",
        "description": "Verification test cell"
    }, headers=headers)
    assert proj_response.status_code == 200
    assert proj_response.json()["name"] == "Test Core Subsystem"
    assert proj_response.json()["technology"] == "SKY130"
    assert proj_response.json()["design_type"] == "6T SRAM"
    proj_id = proj_response.json()["id"]

    # 4. List Projects
    list_response = client.get("/api/v1/projects/", headers=headers)
    assert list_response.status_code == 200
    assert len(list_response.json()) >= 1

    # 5. Generate Circuit Design via Pipeline
    gen_response = client.post(f"/api/v1/designs/project/{proj_id}/generate", json={
        "prompt": "Generate a 6T SRAM cell using SKY130 optimized for low leakage"
    }, headers=headers)
    assert gen_response.status_code == 200
    res_data = gen_response.json()
    assert res_data["prompt"] == "Generate a 6T SRAM cell using SKY130 optimized for low leakage"
    assert "requirements_json" in res_data
    assert "netlist_content" in res_data
    assert "schematic_svg" in res_data
    assert res_data["constraint_results_json"]["status"] == "PASSED"
    assert "y_Q" in res_data["simulation_results_json"]["waveforms"]

    # 6. Check Design History
    history_response = client.get(f"/api/v1/designs/project/{proj_id}/history", headers=headers)
    assert history_response.status_code == 200
    assert len(history_response.json()) >= 1
    assert history_response.json()[0]["id"] == res_data["id"]
