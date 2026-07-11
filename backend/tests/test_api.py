import os
import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.workspace.database.connection import Base, get_db

from sqlalchemy.pool import StaticPool

# Setup test DB (SQLite in-memory with StaticPool to share connection)
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

from app.workspace.database.models import User, Project, File, ChatSession, ChatMessage
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
    assert res_data["version"] == 1
    design_id = res_data["id"]

    # 6. Check Design History
    history_response = client.get(f"/api/v1/designs/project/{proj_id}/history", headers=headers)
    assert history_response.status_code == 200
    assert len(history_response.json()) >= 1
    assert history_response.json()[0]["id"] == design_id

    # 7. Check Design Intent logs
    intent_response = client.get(f"/api/v1/designs/{design_id}/intents", headers=headers)
    assert intent_response.status_code == 200
    intents = intent_response.json()
    assert len(intents) >= 2
    assert "Pull-up" in intents[0]["decision"] or "Pull-down" in intents[0]["decision"]
    assert intents[0]["verification_status"] == "PASSED"

    # 8. Rollback to version 1
    rollback_response = client.post(f"/api/v1/designs/project/{proj_id}/rollback/1", headers=headers)
    assert rollback_response.status_code == 200
    rb_data = rollback_response.json()
    assert rb_data["version"] == 2
    assert "[Rollback to v1]" in rb_data["prompt"]
    
    # 9. Verify files synchronized
    from app.workspace.database.models import File
    db = next(override_get_db())
    sync_files = db.query(File).filter(File.project_id == proj_id).all()
    assert len(sync_files) >= 3
    assert sync_files[0].version == 2

    # 10. List Plugins
    plugins_response = client.get("/api/v1/plugins/", headers=headers)
    assert plugins_response.status_code == 200
    plugins_list = plugins_response.json()
    assert "cadence" in plugins_list
    assert "synopsys" in plugins_list
    assert "siemens" in plugins_list

    # 11. Execute Plugin Command
    exec_response = client.post("/api/v1/plugins/synopsys/execute", json={
        "command": "run synthesis constraints",
        "args": {}
    }, headers=headers)
    assert exec_response.status_code == 200
    res = exec_response.json()
    assert res["status"] == "success"
    assert "PrimeTime" in res["results"]["script_generated"]

    # 12. Create Another User to share with
    reg2_response = client.post("/api/v1/auth/register", json={
        "email": "test2@velora.ai",
        "password": "testpassword"
    })
    assert reg2_response.status_code == 200

    # 13. Share Project with the second user
    share_response = client.post(f"/api/v1/projects/{proj_id}/share", json={
        "email": "test2@velora.ai",
        "role": "editor"
    }, headers=headers)
    assert share_response.status_code == 200
    assert "Shared" in share_response.json()["message"]

    # 14. List permissions
    perms_response = client.get(f"/api/v1/projects/{proj_id}/permissions", headers=headers)
    assert perms_response.status_code == 200
    perms_list = perms_response.json()
    assert len(perms_list) == 2
    assert perms_list[0]["role"] == "owner"
    assert perms_list[1]["email"] == "test2@velora.ai"
    assert perms_list[1]["role"] == "editor"

    # 15. Add Comment
    comment_response = client.post(f"/api/v1/projects/{proj_id}/comments", json={
        "comment_text": "Need to check write noise margin stability on SRAM."
    }, headers=headers)
    assert comment_response.status_code == 200
    assert comment_response.json()["comment_text"] == "Need to check write noise margin stability on SRAM."

    # 16. List Comments
    list_comments = client.get(f"/api/v1/projects/{proj_id}/comments", headers=headers)
    assert list_comments.status_code == 200
    assert len(list_comments.json()) == 1
    assert list_comments.json()[0]["comment_text"] == "Need to check write noise margin stability on SRAM."
