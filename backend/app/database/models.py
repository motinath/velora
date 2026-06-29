import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database.connection import Base

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
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    project = relationship("Project", back_populates="designs")

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
