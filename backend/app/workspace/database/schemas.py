from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime

# User Schemas
class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    created_at: datetime

class UserLogin(UserBase):
    password: str

# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    user_id: Optional[int] = None

# File Schemas
class FileBase(BaseModel):
    filename: str
    type: str

class FileResponse(FileBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    project_id: int
    path: str
    version: int
    created_at: datetime
    content: Optional[str] = None

# Chat Message Schemas
class ChatMessageBase(BaseModel):
    role: str
    content: str
    context_metadata: Optional[Dict[str, Any]] = None

class ChatMessageCreate(BaseModel):
    content: str
    context_metadata: Optional[Dict[str, Any]] = None

class ChatMessageResponse(ChatMessageBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    session_id: int
    timestamp: datetime

# Chat Session Schemas
class ChatSessionBase(BaseModel):
    name: str

class ChatSessionCreate(ChatSessionBase):
    project_id: int

class ChatSessionResponse(ChatSessionBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    project_id: int
    created_at: datetime

class ChatSessionDetail(ChatSessionResponse):
    model_config = ConfigDict(from_attributes=True)
    messages: List[ChatMessageResponse] = []

# Design Schemas
class DesignResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    project_id: int
    prompt: str
    requirements_json: Optional[Dict[str, Any]] = None
    plan_json: Optional[Dict[str, Any]] = None
    circuit_graph_json: Optional[Dict[str, Any]] = None
    constraint_results_json: Optional[Dict[str, Any]] = None
    schematic_svg: Optional[str] = None
    schematic_json: Optional[Dict[str, Any]] = None
    netlist_content: Optional[str] = None
    simulation_results_json: Optional[Dict[str, Any]] = None
    explanation_markdown: Optional[str] = None
    logs_content: Optional[str] = None
    version: int
    readiness_report_json: Optional[Dict[str, Any]] = None
    created_at: datetime

class GenerationRequest(BaseModel):
    prompt: str

# Design Intent Schemas
class DesignIntentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    project_id: int
    design_id: Optional[int] = None
    decision: str
    reason: str
    tradeoffs: Optional[str] = None
    alternatives: Optional[List[str]] = None
    references: Optional[List[str]] = None
    engineer_id: int
    affected_files: Optional[List[str]] = None
    affected_blocks: Optional[List[str]] = None
    verification_status: str
    created_at: datetime

# Project Schemas
class ProjectBase(BaseModel):
    name: str
    technology: Optional[str] = "SKY130"
    design_type: Optional[str] = "Memory Cell"
    description: Optional[str] = ""

class ProjectCreate(ProjectBase):
    pass

class ProjectResponse(ProjectBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    user_id: int
    created_at: datetime

class ProjectDetail(ProjectResponse):
    model_config = ConfigDict(from_attributes=True)
    files: List[FileResponse] = []
    chat_sessions: List[ChatSessionResponse] = []
    designs: List[DesignResponse] = []

class LibraryComponentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    technology: str
    category: str
    model: Optional[str] = None
    pins: List[str]
    parameters: Dict[str, Any]
    desc: Optional[str] = ""
    symbol_svg: Optional[str] = ""
    spice_model: Optional[str] = ""
    layout_gds_path: Optional[str] = None
    ai_metadata: Optional[Dict[str, Any]] = None
    design_constraints: Optional[Dict[str, Any]] = None
    documentation: Optional[Dict[str, Any]] = None
