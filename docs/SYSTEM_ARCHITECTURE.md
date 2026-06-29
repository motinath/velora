# System Architecture

This document describes the technical architecture, data schemas, API endpoints, and compiler pipeline workflow of the VELORA AI-native semiconductor platform.

---

## 🏗️ Architecture Overview

```mermaid
graph TD
    User([User / Browser])
    
    subgraph Frontend [Next.js Web Application]
        UI[Workspace CAD Dashboard]
        Client[API Client lib/api.ts]
        ClientSim[Client-side Physics Solver & Re-Netlister]
    end
    
    subgraph Backend [FastAPI Application]
        Router[FastAPI API Router app/api/]
        
        subgraph Services [Business Logic Layer]
            Auth[Auth Service]
            Proj[Project Service]
            DesignS[Design Compiler Service]
        end
        
        subgraph Pipeline [Semiconductor Compiler Pipeline]
            Parser[Requirement Parser app/planner/parser.py]
            Planner[Design Planner app/planner/planner.py]
            Library[Component Library app/library/library.py]
            Engine[Connection Engine app/graph/connection_engine.py]
            Graph[Circuit Graph Model app/graph/circuit_graph.py]
            Checker[Constraint Checker app/graph/constraint_checker.py]
            Renderer[Schematic Renderer app/renderer/schematic_renderer.py]
            Netlist[Netlist Generator app/netlist/netlist_generator.py]
            Sim[Simulation Manager app/simulation/simulation_manager.py]
        end
        
        subgraph Storage [Persistence Layer]
            DB[(SQLite Database)]
        end
    end

    User <=> UI
    UI <=> Client
    UI <=> ClientSim
    Client <=> Router
    
    Router --> Services
    Services --> DB
    
    DesignS --> Pipeline
    Parser --> Planner
    Planner --> Engine
    Engine --> Graph
    Library --> Engine
    Graph --> Checker
    Graph --> Renderer
    Graph --> Netlist
    Graph --> Sim
```

---

## 🛠️ Technical Stack

- **Frontend**: Next.js 16 (Turbopack), React 19, TypeScript, Vanilla CSS (with Tailwind utilities), Lucide Icons, SVG Graph Plotting.
- **Backend**: FastAPI (Python 3.11), Uvicorn, SQLAlchemy, SQLite, PyTest.
- **Circuit Simulation**: Python-based transient solver fallback implementing physical MOSFET model equations + uvicorn ngspice interface wrapper.
- **Single Source of Truth**: Relational SQLite database tracking users, projects, and historical compiler design runs.

---

## 🗄️ Database Schemas

SQLite persists user profiles and compilation history. The SQLAlchemy tables are defined in `app/database/models.py`:

### `Users` Table
- `id` (INTEGER, PK): Unique identifier.
- `email` (VARCHAR, Unique): User email address.
- `password_hash` (VARCHAR): Hashed user password.
- `created_at` (DATETIME): Registration timestamp.

### `Projects` Table
- `id` (INTEGER, PK): Unique identifier.
- `user_id` (INTEGER, FK -> Users.id): Owner reference.
- `name` (VARCHAR): Project project name.
- `technology` (VARCHAR): PDK standard (defaults to `SKY130`).
- `design_type` (VARCHAR): Sizing topology category (`6T SRAM`, `Ring Oscillator`, etc.).
- `description` (TEXT): Project notes.
- `created_at` (DATETIME): Project initialization timestamp.

### `Designs` Table (Historical Compilation Records)
- `id` (INTEGER, PK): Unique identifier.
- `project_id` (INTEGER, FK -> Projects.id): Project run reference.
- `prompt` (TEXT): Free-form compiling instruction.
- `requirements_json` (JSON): Parsed requirement metrics.
- `plan_json` (JSON): Transistor sizing parameters.
- `circuit_graph_json` (JSON): Structured node/edge connectivity map.
- `constraint_results_json` (JSON): DRC status checks.
- `schematic_svg` (TEXT): Embedded orthographic drawing.
- `netlist_content` (TEXT): Compiled SPICE subcircuit block.
- `simulation_results_json` (JSON): Waveform coordinates and metrics.
- `explanation_markdown` (TEXT): Sizing decisions and stability margins.
- `logs_content` (TEXT): Verbose pipeline compile console logs.
- `created_at` (DATETIME): Compilation timestamp.

---

## 🔌 API Documentation

All routes prefix: `/api/v1`

### 1. Authentication
- `POST /auth/register`: Register new user profile.
- `POST /auth/login`: Authenticate credentials and issue JWT.

### 2. Project Manager
- `POST /projects/`: Create a new semiconductor project workspace.
- `GET /projects/`: List all project repositories for current user.
- `GET /projects/{project_id}`: Retrieve metadata for a project.
- `DELETE /projects/{project_id}`: Delete project workspace and associated run history.

### 3. Compiler & Design Services
- `POST /designs/project/{project_id}/generate`: Compile design specifications from a natural language prompt and execute simulations.
- `GET /designs/project/{project_id}/history`: Retrieve historical compiler runs for a project.
- `GET /designs/{design_id}`: Extract full compiler results for a specific run.

---

## ⚡ Semiconductor Compiler Pipeline Workflow

When a prompt is submitted, the backend executes the following operations:
1. **Requirement Parser**: Translates raw text inputs into operational constraints (VDD, size limits).
2. **Design Planner**: Calculates dimensions based on PDK technology (e.g. establishing the cell ratio needed for SRAM read stability).
3. **Connection Engine**: Instantiates PDK devices and maps ports to electrical net groups.
4. **Circuit Graph Model**: Builds a topological node-edge graph mapping components, pin contacts, and wires.
5. **Constraint Checker**: Runs electrical and physical checks to identify floating gates, shorts, and SKY130 rules.
6. **Schematic Renderer**: Arranges devices deterministically on an orthogonal coordinate grid and draws styled SVGs.
7. **Netlist Generator**: Compiles components into a valid SPICE subcircuit netlist (`.subckt`).
8. **Simulation Manager**: Sweeps stimulation patterns and returns transient/DC waveform arrays.
