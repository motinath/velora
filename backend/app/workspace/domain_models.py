from dataclasses import dataclass, field
from datetime import datetime
from typing import Dict, Any, List, Optional

@dataclass
class DomainProject:
    id: int
    name: str
    technology: str
    created_at: datetime
    description: Optional[str] = None
    settings: Dict[str, Any] = field(default_factory=dict)

    def validate(self) -> None:
        if not self.name.strip():
            raise ValueError("Project name cannot be empty.")
        if self.technology not in ("SKY130", "GF180", "TSMC180", "ASAP7"):
            raise ValueError(f"Unsupported process technology node: {self.technology}")

@dataclass
class DomainDesign:
    id: int
    project_id: int
    name: str
    design_type: str
    parameters: Dict[str, Any] = field(default_factory=dict)
    optimization_goal: str = "speed"  # 'speed', 'power', 'area'
    created_at: datetime = field(default_factory=datetime.utcnow)

    def validate(self) -> None:
        if not self.name.strip():
            raise ValueError("Design name cannot be empty.")

@dataclass
class DomainJob:
    id: str
    project_id: int
    job_type: str  # 'compile', 'simulate', 'verify', 'ai'
    status: str  # 'pending', 'running', 'success', 'failed'
    created_at: datetime
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    logs: str = ""
    parameters: Dict[str, Any] = field(default_factory=dict)

    def is_completed(self) -> bool:
        return self.status in ("success", "failed")

@dataclass
class DomainArtifact:
    id: int
    project_id: int
    name: str
    file_path: str
    artifact_type: str  # 'rtl', 'netlist', 'gds', 'report', 'waveform', 'log'
    mime_type: str
    size_bytes: int
    created_at: datetime
    version: int = 1

    def validate(self) -> None:
        if not self.name.strip():
            raise ValueError("Artifact name cannot be empty.")
        if not self.file_path.strip():
            raise ValueError("Artifact path cannot be empty.")

@dataclass
class DomainWorkspaceState:
    project_id: int
    open_tabs: List[str] = field(default_factory=list)
    active_tab: Optional[str] = None
    pinned_files: List[str] = field(default_factory=list)
    cursor_line: int = 1
    cursor_column: int = 1
    scroll_top: int = 0
    zoom_level: int = 100
