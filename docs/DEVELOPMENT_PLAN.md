# Phase 1 Completed Implementation Specifications

This document outlines the implemented modules and features of the **VELORA Phase 1** core compiler and CAD workspace, providing a clear record of completed technical deliverables.

---

## 💻 1. Core Foundation & Database Schema
Established the foundational persistence and user management layers using FastAPI, SQLAlchemy, and SQLite:
- **User Authentication**: Integrated JWT-secured user registration, secure login, password hashing, and token validation.
- **Project Repository Model**: Designed database structures to model user projects, specifying key metadata such as target technology (e.g., `SKY130`) and design topology (e.g., `6T SRAM`).
- **Design History Log**: Developed the `designs` table to log prior compiler run iterations, storing parsed specifications, circuit graphs, netlists, schematic drawings, simulation datasets, and logs.

---

## 🔍 2. Natural Language Requirement Parser
Developed the heuristic parsing engine under `app/planner/parser.py`:
- Extracts topology classes, target parameters (VDD voltages, number of stages, reference currents), and optimization rules (e.g., `Low Leakage`, `High Speed`) from plain engineering prompts.
- Translates unstructured prompts into a clean JSON-formatted specification dictionary to drive downstream compiler stages.

---

## 📐 3. Design Planner & PDK Sizing Reasoning
Developed the design configuration logic under `app/planner/planner.py`:
- Sizes active devices (PMOS/NMOS channel widths $W$ and lengths $L$) based on target PDK rules.
- Incorporates physical stability guidelines (e.g., calculating Pull-up Ratios and Cell Ratios for 6T SRAM writeability/read stability).
- Outputs structural component lists and device placement guidelines, coupled with designer-centric explanations detailing the physical tradeoffs of chosen channel lengths and widths.

---

## 🧬 4. Connection Engine & Circuit Graph Model
Developed the net connection logic under `app/graph/`:
- **Component Library (`library/library.py`)**: Defines physical SKY130 primitive device definitions (NMOS, PMOS, Resistors, Capacitors, Pins, VDD/GND ties) and default parameter bounds.
- **Connection Engine (`graph/connection_engine.py`)**: Dynamically resolves port linkages and connects ports, bulk terminals, and nodes.
- **Circuit Graph (`graph/circuit_graph.py`)**: Models the complete netlist as a unified topological graph of components, pins, and nets, serving as the single source of truth for downstream compilers.

---

## ⚠️ 5. Constraint & DRC Rules Checker
Developed the electrical rule checking engine under `app/graph/constraint_checker.py`:
- Inspects the active circuit graph for connectivity compliance.
- Detects critical design bugs such as floating gates, short circuits (e.g., direct VDD-to-GND shorts), unconnected pins, and missing power references.
- Validates PDK design limits, ensuring all NMOS/PMOS widths and lengths satisfy the minimum SKY130 channel threshold (min $0.15\,\mu\text{m}$).

---

## 🎨 6. Orthogonal Schematic Layout Renderer
Developed the dark-mode layout renderer under `app/renderer/schematic_renderer.py`:
- Computes orthogonal layouts for analog and digital gates on a virtual coordinate grid.
- Draws electrical routes and device shapes, generating stylized, glowing dark-theme SVGs.
- Embeds interactive classes into the SVG groups to enable direct click interactions in the browser.

---

## ⚡ 7. SPICE Netlist Generator
Developed the subcircuit compiler under `app/netlist/netlist_generator.py`:
- Iterates over the unified circuit graph nodes and connections.
- Formats and writes syntactically valid SPICE netlists (`.subckt` definitions) using standard SKY130 FET model conventions (`sky130_fd_pr__nfet_01v8`, `sky130_fd_pr__pfet_01v8`).
- Preserves sizing configurations ($W$, $L$, $M$) to match standard SPICE netlist syntax.

---

## 📈 8. Simulation Manager & Physical Solver Fallback
Developed the simulation manager under `app/simulation/simulation_manager.py`:
- Configures simulation stimuli (such as transient pulse signals and voltage sweeps) depending on the topology type.
- Interfaces with local `ngspice` executables for raw data sweeps.
- Implements a high-fidelity physical solver fallback in Python using standard MOSFET current equations (saturation, triode, subthreshold leakage, stage delay time constants) to generate waveform coordinate datasets when `ngspice` is absent.

---

## 🛠️ 9. Interactive CAD Workbench Frontend
Developed the Next.js workspace under `frontend/app/dashboard/page.tsx`:
- **Workspace Navigation Panel**: Sidebar layout incorporating design project selection, a PDK library device inspector, and run histories.
- **Generated Files Tree**: A workspace directory displaying compiled files (`schematic.svg`, `spice_netlist.sp`, `simulation.raw`, `design_reasoning.md`, `compiler_run.log`), allowing developers to switch viewpoints instantly.
- **Progress Stepper Overlay**: Visual progress stepper showing compilation pipeline stages sequentially with a terminal console logger during design generation.
- **Tabbed CAD Workspace**:
  - *Schematic Tab*: Displays the glowing orthographic circuit drawing.
  - *Spice Netlist Tab*: Renders the formatted code with line numbers.
  - *Simulation Tab*: Houses an interactive SVG oscilloscope plotting waveforms.
  - *Design Reasoning Tab*: Displays markdown sizing reports and tradeoffs.
  - *Compiler Logs Tab*: Renders stream terminal outputs.

---

## 🎛️ 10. Real-Time Sizing Sliders & Bidirectional Cross-Probing
Implemented deep interactive features:
- **Interactive Sizing Sliders**: Properties Inspector displays slider controls for Width ($W$) and Length ($L$) when a component is clicked on the schematic.
- **Real-Time Client-Side Re-Simulation**: Modifying sliders automatically updates the SPICE netlist text and runs the client-side physical equations to redraw oscilloscope waveforms and metrics instantly.
- **Bidirectional Cross-Probing**:
  - Clicking a transistor on the schematic highlights its netlist line in the SPICE tab.
  - Clicking a SPICE netlist line outlines the corresponding symbol on the schematic.
- **Signal Probing Filters**: Checkbox controls allow engineers to toggle individual signal traces (`WL`, `BL`, `Q`, `QB`) on and off the oscilloscope grid dynamically.
