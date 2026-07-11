import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.workspace.database.connection import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    projects = relationship("Project", back_populates="user", cascade="all, delete-orphan")

class Project(Base):
    __tablename__ = "projects"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    technology = Column(String, default="SKY130")
    design_type = Column(String, nullable=False, default="Memory Cell")
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    user = relationship("User", back_populates="projects")
    files = relationship("File", back_populates="project", cascade="all, delete-orphan")
    chat_sessions = relationship("ChatSession", back_populates="project", cascade="all, delete-orphan")
    designs = relationship("Design", back_populates="project", cascade="all, delete-orphan")
    permissions = relationship("ProjectPermission", back_populates="project", cascade="all, delete-orphan")
    comments = relationship("WorkspaceComment", back_populates="project", cascade="all, delete-orphan")
    intents = relationship("DesignIntent", back_populates="project", cascade="all, delete-orphan")

class Design(Base):
    __tablename__ = "designs"
    
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    prompt = Column(Text, nullable=False)
    requirements_json = Column(JSON, nullable=True)
    plan_json = Column(JSON, nullable=True)
    circuit_graph_json = Column(JSON, nullable=True)
    constraint_results_json = Column(JSON, nullable=True)
    schematic_svg = Column(Text, nullable=True)
    schematic_json = Column(JSON, nullable=True)
    netlist_content = Column(Text, nullable=True)
    simulation_results_json = Column(JSON, nullable=True)
    explanation_markdown = Column(Text, nullable=True)
    logs_content = Column(Text, nullable=True)
    version = Column(Integer, default=1)
    readiness_report_json = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    project = relationship("Project", back_populates="designs")
    intents = relationship("DesignIntent", back_populates="design", cascade="all, delete-orphan")

class File(Base):
    __tablename__ = "files"
    
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    filename = Column(String, nullable=False)
    type = Column(String, nullable=False)  # 'rtl', 'log', 'report', 'doc'
    path = Column(String, nullable=False)
    content = Column(Text, nullable=True)  # parsed text content
    version = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    project = relationship("Project", back_populates="files")

class ChatSession(Base):
    __tablename__ = "chat_sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    name = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    project = relationship("Project", back_populates="chat_sessions")
    messages = relationship("ChatMessage", back_populates="session", cascade="all, delete-orphan")

class ChatMessage(Base):
    __tablename__ = "chat_messages"
    
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("chat_sessions.id"), nullable=False)
    role = Column(String, nullable=False)  # 'user', 'assistant', 'system'
    content = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    context_metadata = Column(JSON, nullable=True)  # File references, selected segments, graph metadata, etc.
    
    session = relationship("ChatSession", back_populates="messages")

class ProjectPermission(Base):
    __tablename__ = "project_permissions"
    
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    role = Column(String, nullable=False, default="viewer") # 'owner', 'editor', 'viewer'
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    project = relationship("Project", back_populates="permissions")

class WorkspaceComment(Base):
    __tablename__ = "workspace_comments"
    
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    file_id = Column(Integer, ForeignKey("files.id"), nullable=True)
    line_number = Column(Integer, nullable=True)
    net_id = Column(String, nullable=True)
    comment_text = Column(Text, nullable=False)
    status = Column(String, default="open") # 'open', 'resolved'
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    project = relationship("Project", back_populates="comments")
    file = relationship("File")
    user = relationship("User")

class DesignIntent(Base):
    __tablename__ = "design_intents"
    
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    design_id = Column(Integer, ForeignKey("designs.id"), nullable=True)
    decision = Column(String, nullable=False)
    reason = Column(Text, nullable=False)
    tradeoffs = Column(Text, nullable=True)
    alternatives = Column(JSON, nullable=True)
    references = Column(JSON, nullable=True)
    engineer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    affected_files = Column(JSON, nullable=True)
    affected_blocks = Column(JSON, nullable=True)
    verification_status = Column(String, default="UNVERIFIED") # 'UNVERIFIED', 'PASSED', 'FAILED'
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    project = relationship("Project", back_populates="intents")
    design = relationship("Design", back_populates="intents")
    engineer = relationship("User")

class LibraryComponent(Base):
    __tablename__ = "library_components"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    technology = Column(String, index=True, nullable=False)
    category = Column(String, index=True, nullable=False)
    model = Column(String, nullable=True)
    pins = Column(JSON, nullable=False)
    parameters = Column(JSON, nullable=False)
    desc = Column(Text, nullable=True)
    symbol_svg = Column(Text, nullable=True)
    spice_model = Column(Text, nullable=True)
    layout_gds_path = Column(String, nullable=True)
    ai_metadata = Column(JSON, nullable=True)
    design_constraints = Column(JSON, nullable=True)
    documentation = Column(JSON, nullable=True)
