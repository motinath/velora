# VELORA: AI-Native Semiconductor Circuit Design Platform (Phase 1)

VELORA is an AI-native semiconductor circuit design platform. Rather than acting as a standard conversational chatbot, VELORA acts as an experienced IC Design Engineer.

Semiconductor engineers can describe desired circuits in natural language (e.g. *"Generate a 6T SRAM cell using SKY130 optimized for low leakage"*), and VELORA compiles the design using an open-source component library. It features:

1. **Interactive CAD Workbench Dashboard**: A Virtuoso/Figma-style dark IDE showing Schematic, SPICE Netlist, Simulation Scope, Design Reasoning, and Compiler Logs.
2. **Timed Pipeline Execution Progress**: Displays visual progress indicators stepping through 8 compilation compiler stages alongside real-time console log streams.
3. **Bidirectional Cross-Probing**: Clicking symbols in the schematic highlights their netlist lines, and clicking SPICE netlist lines outlines schematic devices.
4. **Real-time Sizing Sliders**: Click devices on the schematic to tune width ($W$) and length ($L$) parameters with sliders (satisfying SKY130 minimum rules). Modifying dimensions triggers client-side re-netlisting and re-simulation instantly.
5. **Custom Oscilloscope Signal Probes**: Toggle checkbox probes (`WL`, `BL`, `Q`, `QB`) to select which waveform traces are displayed on the scope.
6. **Virtual Generated Files Directory**: Navigate compiled outputs (`schematic.svg`, `spice_netlist.sp`, `simulation.raw`, `design_reasoning.md`, `compiler_run.log`) from the sidebar.
7. **PDK DRC Constraint Validation**: Checks the circuit graph topology for floating gates, shorts, and bounds rules.

---

## 📂 Modular Architecture & Directory Structure

The platform is designed following Clean Architecture principles, ensuring every component has a single responsibility.

```
velora/
├── frontend/               # Next.js Frontend (React + TypeScript + TailwindCSS)
│   ├── app/
│   │   ├── dashboard/      # Workspace CAD workbench dashboard
│   │   │   └── page.tsx    # Figma/Virtuoso-style dark IDE
│   │   ├── layout.tsx      
│   │   └── page.tsx        # Login & Signup screen
│   └── lib/
│       └── api.ts          # API Client integration helper
│
├── backend/                # FastAPI Backend (Python 3.11 + SQLAlchemy + SQLite)
│   ├── app/
│   │   ├── api/            # API Router layer (auth, projects, designs)
│   │   ├── database/       # SQLAlchemy models, connection, and schema definitions
│   │   ├── services/       # Design compilation & project business logic services
│   │   ├── library/        # PDK SKY130 Component Library models
│   │   ├── planner/        # Requirement Parser & Design Topology Planner
│   │   ├── graph/          # Connection Engine, Circuit Graph & Constraint Checker
│   │   ├── renderer/       # Deterministic SVG Layout Schematic Renderer
│   │   ├── netlist/        # SPICE Netlist Generator
│   │   ├── simulation/     # Ngspice Manager & High-Fidelity Physics Solver fallback
│   │   ├── config.py       # Pydantic global settings loader
│   │   └── main.py         # FastAPI application bootstrap
│   ├── requirements.txt    # Python dependencies
│   ├── run.py              # Server run entry-point script
│   └── velora.db           # Local SQLite database
│
└── README.md               # This documentation
```

---

## ⚙️ Design Compilation Workflow

When an engineer inputs a prompt:
1. **Requirement Parser (`planner/parser.py`)**: Uses heuristic patterns and optional LLM classification to convert natural language into a structured JSON configuration (e.g. topology type, target PDK, optimization targets, VDD voltages).
2. **Design Planner (`planner/planner.py`)**: Determines the circuit sizing parameters ($W$, $L$, $M$) depending on PDK design guidelines (e.g., cell ratios and pull-up ratios for SRAM cell stability) and optimization goals. Outputs a component list and a node connection plan.
3. **Connection Engine (`graph/connection_engine.py`)**: Gathers the sized components, queries the Component Library (`library/library.py`) for pin boundaries, and links nodes.
4. **Circuit Graph (`graph/circuit_graph.py`)**: Compiles nodes (components, pins, nets) and edges (electrical net paths) to establish the single source of truth for the circuit.
5. **Constraint Checker (`graph/constraint_checker.py`)**: Inspects the graph for floating gates, missing power/GND reference nodes, unconnected pins, and PDK-specific DRC limits.
6. **Schematic Renderer (`renderer/schematic_renderer.py`)**: Positions devices deterministically on an orthogonal routing grid based on topology and exports high-quality styled SVGs.
7. **Netlist Generator (`netlist/netlist_generator.py`)**: Iterates through the graph nodes and generates a valid SPICE file (`.subckt`) formatted for SKY130 models.
8. **Simulation Manager (`simulation/simulation_manager.py`)**: Configures test stimulations. Attempts to run `ngspice` locally, falling back to an internal physics-based transient and DC solver to compute delay, frequency, and leakage, returning a set of waveform coordinates.
9. **AI Analysis**: Captures pipeline progress and appends IC design tradeoffs (with optional active LLM router explanation).

---

## 🚀 Setup & Execution Guide

### 1. Start the Backend API
1. Navigate to the root directory `velora/`.
2. Install Python packages:
   ```bash
   pip install -r backend/requirements.txt
   ```
3. Boot the FastAPI API server:
   ```bash
   python backend/run.py
   ```
   - The API will listen on **[http://localhost:8000](http://localhost:8000)**.
   - Swagger interactive docs will be available at **[http://localhost:8000/docs](http://localhost:8000/docs)**.

### 2. Start the Frontend IDE
1. Navigate to the `frontend/` directory:
   ```bash
   cd frontend
   ```
2. Install web packages:
   ```bash
   npm install
   ```
3. Run the Next.js dev server:
   ```bash
   npm run dev
   ```
   - The workbench GUI serves on **[http://localhost:3000](http://localhost:3000)**.

---

## 🛠️ Phase 1 Supported Topologies

VELORA supports compiling and simulating four core analog/digital blocks for Phase 1:
1. **6T SRAM Cell**: Symmetric latch PMOS/NMOS inverters with NMOS pass gate access, optimized using SRAM cell stability ratios.
2. **Ring Oscillator**: Dynamic odd-stage inverter ring loops generating clock waveforms. Frequency varies with stage count, VDD, and width/length sizing.
3. **Current Mirror**: Diode-connected reference NMOS mirroring current to an output branch, demonstrating channel-length modulation.
4. **Differential Pair**: Symmetrical input pair with active load PMOS mirror and tail bias current source.
