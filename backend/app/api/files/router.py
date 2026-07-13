from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File as FastAPIFile, Form
from fastapi.responses import Response
from sqlalchemy.orm import Session
import os

from app.workspace.database.connection import get_db
from app.workspace.database.models import User, Project, File as DBFile
from app.utils.auth import get_current_user
from pydantic import BaseModel

router = APIRouter(prefix="/files", tags=["files"])

class RenameRequest(BaseModel):
    new_filename: str

class MoveRequest(BaseModel):
    new_project_id: int

@router.post("/upload")
def upload_file(
    project_id: int = Form(...),
    file: UploadFile = FastAPIFile(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project or project.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Project not found")

    content_bytes = file.file.read()
    try:
        content_str = content_bytes.decode("utf-8")
    except UnicodeDecodeError:
        content_str = f"[Binary file - {len(content_bytes)} bytes]"

    filename = file.filename
    ext = os.path.splitext(filename)[1].lower()
    file_type = "doc"
    if ext in (".v", ".sv", ".sp", ".spice"):
        file_type = "rtl"
    elif ext in (".log",):
        file_type = "log"
    elif ext in (".json",):
        file_type = "report"

    # Save to disk
    proj_dir = f"storage/projects/{project_id}"
    os.makedirs(proj_dir, exist_ok=True)
    file_path = f"{proj_dir}/{filename}"
    with open(file_path, "wb") as f:
        f.write(content_bytes)

    # Check if exists
    db_file = db.query(DBFile).filter(
        DBFile.project_id == project_id,
        DBFile.filename == filename
    ).first()

    if db_file:
        db_file.content = content_str
        db_file.path = file_path
        db_file.version += 1
    else:
        db_file = DBFile(
            project_id=project_id,
            filename=filename,
            type=file_type,
            path=file_path,
            content=content_str,
            version=1
        )
        db.add(db_file)

    db.commit()
    db.refresh(db_file)

    return {
        "id": db_file.id,
        "project_id": db_file.project_id,
        "filename": db_file.filename,
        "type": db_file.type,
        "path": db_file.path,
        "version": db_file.version,
        "size": len(content_bytes),
        "created_at": db_file.created_at
    }

@router.get("/project/{project_id}")
def list_files(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project or project.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Project not found")

    files = db.query(DBFile).filter(DBFile.project_id == project_id).all()
    result = []
    for f in files:
        size = len(f.content or "")
        if os.path.exists(f.path):
            size = os.path.getsize(f.path)
        
        result.append({
            "id": f.id,
            "project_id": f.project_id,
            "filename": f.filename,
            "type": f.type,
            "path": f.path,
            "content": f.content,
            "version": f.version,
            "size": size,
            "created_at": f.created_at
        })
    return result

@router.get("/{file_id}/download")
def download_file(
    file_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_file = db.query(DBFile).filter(DBFile.id == file_id).first()
    if not db_file:
        raise HTTPException(status_code=404, detail="File not found")

    project = db.query(Project).filter(Project.id == db_file.project_id).first()
    if not project or project.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    if os.path.exists(db_file.path):
        with open(db_file.path, "rb") as f:
            data = f.read()
    else:
        data = (db_file.content or "").encode("utf-8")

    return Response(
        content=data,
        media_type="application/octet-stream",
        headers={"Content-Disposition": f"attachment; filename={db_file.filename}"}
    )

@router.post("/{file_id}/rename")
def rename_file(
    file_id: int,
    req: RenameRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_file = db.query(DBFile).filter(DBFile.id == file_id).first()
    if not db_file:
        raise HTTPException(status_code=404, detail="File not found")

    project = db.query(Project).filter(Project.id == db_file.project_id).first()
    if not project or project.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    old_path = db_file.path
    new_filename = req.new_filename
    proj_dir = f"storage/projects/{db_file.project_id}"
    new_path = f"{proj_dir}/{new_filename}"

    if os.path.exists(old_path):
        os.rename(old_path, new_path)

    db_file.filename = new_filename
    db_file.path = new_path
    db_file.version += 1
    db.commit()
    db.refresh(db_file)

    return {"status": "success", "filename": db_file.filename, "path": db_file.path}

@router.post("/{file_id}/move")
def move_file(
    file_id: int,
    req: MoveRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_file = db.query(DBFile).filter(DBFile.id == file_id).first()
    if not db_file:
        raise HTTPException(status_code=404, detail="File not found")

    old_project = db.query(Project).filter(Project.id == db_file.project_id).first()
    if not old_project or old_project.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    new_project = db.query(Project).filter(Project.id == req.new_project_id).first()
    if not new_project or new_project.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Target project not found")

    old_path = db_file.path
    new_dir = f"storage/projects/{new_project.id}"
    os.makedirs(new_dir, exist_ok=True)
    new_path = f"{new_dir}/{db_file.filename}"

    if os.path.exists(old_path):
        os.rename(old_path, new_path)

    db_file.project_id = new_project.id
    db_file.path = new_path
    db_file.version += 1
    db.commit()
    db.refresh(db_file)

    return {"status": "success", "project_id": db_file.project_id, "path": db_file.path}

@router.delete("/{file_id}")
def delete_file(
    file_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_file = db.query(DBFile).filter(DBFile.id == file_id).first()
    if not db_file:
        raise HTTPException(status_code=404, detail="File not found")

    project = db.query(Project).filter(Project.id == db_file.project_id).first()
    if not project or project.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    if os.path.exists(db_file.path):
        try:
            os.remove(db_file.path)
        except Exception:
            pass

    db.delete(db_file)
    db.commit()

    return {"status": "success", "message": f"File '{db_file.filename}' deleted."}
