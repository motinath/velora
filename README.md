# VELORA: Enterprise AI Semiconductor CAD Operating System

VELORA is a next-generation, AI-native semiconductor circuit design and verification platform. Organized as an enterprise-grade engineering workspace, VELORA coordinates a cooperative system of **13 specialized AI agents** to synthesize, size, simulate, and verify integrated circuit layouts dynamically.

Rather than a simple conversational chatbot dialog, the UI is built entirely around engineering tasks ("One Workspace, One Task") to provide a streamlined, focused workflow for semiconductor engineers.

---

## 📂 Project Architecture & Directory Layout

The platform is designed following Clean Architecture principles, ensuring strict separation of concerns between logic, physics modeling, agent routing, and visual presentations.

```
velora/
├── frontend/               # Next.js Frontend (React + TypeScript + TailwindCSS)
│   ├── app/
│   │   ├── page.tsx        # CAD focus workspaces routing logic
│   │   └── ...
│   ├── components/
│   │   ├── layout/
│   │   │   ├── GlobalSidebar.tsx  # Workspace/activity navigator
│   │   │   └── GlobalHeader.tsx   # Global project status and commands
│   │   └── workspace/
│   │       ├── PropertiesInspector.tsx  # Progressive component settings
│   │       ├── SchematicCanvas.tsx      # CAD vector drawing canvas
│   │       ├── SimulationScope.tsx      # Vector waveforms oscilloscope
│   │       └── SpiceInspector.tsx       # SPICE netlist syntax viewer
│   └── lib/
│       └── api.ts          # API Client integration helper
│
├── backend/                # FastAPI Backend (Python 3.11+ + SQLAlchemy + SQLite)
│   ├── app/
│   │   ├── ai/             # Multi-Agent Compiler & Sizing Heuristics
│   │   │   └── agents/     # 13 Specialized Agent configurations (orchestrator)
│   │   ├── engineering/    # Physical Sizing & Verification modules
│   │   │   └── verification/ # DRC/LVS parser, Area/Delay math, and Readiness scorecards
│   │   ├── knowledge/      # Relational Knowledge Graph database (PDK reference lookup)
│   │   ├── plugins/        # Synopsys, Siemens, and Cadence EDA integrations
│   │   ├── workspace/      # Project directories database models, services, & API endpoints
│   │   ├── utils/          # Authentication & token helpers
│   │   ├── config.py       # global configs settings loader
│   │   └── main.py         # FastAPI bootloader entry-point
│   ├── requirements.txt    # Python packaging dependencies
│   ├── run.py              # Backend boot entry-point
│   └── velora.db           # SQLite persistent repository database
│
└── README.md               # This documentation
```

---

## 🤖 13-Agent Cooperative Synthesis Flow

When an engineer initializes a design and enters sizing constraints:
1. **Manager Agent**: Evaluates the request constraints and coordinates downstream agents.
2. **Requirement Agent**: Decodes user prompt targets into strict electrical specifications (voltage, delays, target area).
3. **Architecture Agent**: Selects the optimal cell topology configuration (e.g. 6-Transistor latch, 3-stage inverter ring, differential op-amp pairs).
4. **Knowledge Agent**: Matches components, checks PDK boundaries, and queries the local Knowledge Graph relationships.
5. **PDK Agent**: Retrieves channel dimension boundaries, threshold voltages ($V_{th}$), and temperature corner factors.
6. **RTL Agent**: Writes clean logic descriptions and performs initial syntax validations.
7. **Netlist Agent**: Translates the design circuit graph into standardized SPICE netlist syntax.
8. **Schematic Agent**: Positions component nodes on an orthogonal CAD grid to render SVGs.
9. **Simulation Agent**: Configures test stimulates, executes SPICE transients, and parses voltage waveform results.
10. **Verification Agent**: Performs physical Layout vs. Schematic (LVS) comparison checks and verifies port connections.
11. **Timing Agent**: Inspects delay paths and calculates timing slack margins.
12. **Power Agent**: Models power grids, and calculates standby leakage and active dynamic dissipation rates.
13. **Critic Agent**: Reviews layout trade-offs and appends sizing suggestions (e.g., scaling PMOS gate widths).

---

## ⚡ Focus Workspaces UI Flow

VELORA organizes the entire engineering experience around 10 task-oriented workspaces:
* 🏠 **Dashboard**: Recent projects log, templates loader, and activity feed.
* 📁 **Projects**: Repositories management list with deletion and sharing indicators.
* ✏️ **AI Design**: Prompt spec input, cooperative agent stepper progress timeline, and Compiled Scorecard metric cards.
* ⚡ **Schematic**: Interactive CAD canvas featuring component nodes selection and a progressive properties inspector (Body Bias, parasitics, finger count).
* 💻 **RTL Workspace**: Filer tree, logic file editor, and lint compile terminal.
* 📈 **Simulation**: Dark-themed vector oscilloscope tracking Vertical tracking marker coordinates.
* ✔️ **Verification**: Tabulated DRC, LVS, and Timing checklists with recommendations.
* 📄 **Reports**: Signed readiness scoreboard index (Area, Delay, Power, DRC) for tapeout.
* 📚 **Knowledge**: Relational PDK primitives graph references.
* ⚙️ **Settings**: Co-pilot LLM settings, routing configurations, and simulator paths.

---

## ⚙️ Setup & Execution Guide

### Prerequisites
* **Python 3.11 or later**
* **Node.js 18 or later**

### 1. Boot the FastAPI Backend
1. Open a terminal and navigate to the project directory:
   ```bash
   pip install -r backend/requirements.txt
   ```
2. Run the startup script:
   ```bash
   python backend/run.py
   ```
   - The backend runs on **[http://localhost:8000](http://localhost:8000)**.
   - Interactive API docs can be reviewed at **[http://localhost:8000/docs](http://localhost:8000/docs)**.

### 2. Boot the Next.js Frontend
1. Open a new terminal and navigate to the `frontend` folder:
   ```bash
   cd frontend
   npm install
   ```
2. Start the dev server:
   ```bash
   npm run dev
   ```
   - Access the main workspaces operating system dashboard on **[http://localhost:3000](http://localhost:3000)**.
