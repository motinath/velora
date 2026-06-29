# Product Roadmap

This document outlines the strategic product vision, completed features, and upcoming phases for the **VELORA AI-Native Semiconductor Circuit Design Platform**.

---

## 👁️ Vision
VELORA is an AI-native semiconductor circuit design platform that converts natural language requirements into optimized, physical IC layouts. Rather than acting as a simple chatbot copilot, VELORA functions like an experienced IC Design Engineer—performing requirement parsing, topology planning, electrical routing, schematic synthesis, SPICE compiling, and physical simulation checks directly in a browser-based CAD workbench.

---

## ✅ Phase 1: Completed Core Foundation & CAD Workspace
The initial phase established the core compiler pipeline and a premium interactive workbench for analog and digital design components.

### Supported Topologies
- **6T SRAM Cell**: Symmetric latch PMOS/NMOS inverters with access transistors.
- **Ring Oscillator**: Dynamic odd-stage inverter ring loops generating clock waveforms.
- **Current Mirror**: Diode-connected reference NMOS mirroring current to an output branch.
- **Differential Pair**: Symmetrical input pair with active load PMOS mirror and tail bias current source.

### Implemented Features
- **PDK Component Library**: SKY130 primitive definitions (transistor dimensions, models, parameters).
- **Semiconductor Compiler**: Automatic parsing, topology layout generation, ERC/DRC verification, and SPICE netlisting.
- **Visual Orthogonal Schematic Drawing**: Grid-based layout generation and glowing SVG rendering.
- **Scope Waveforms Plotting**: Interactive oscilloscope with probe toggles (`WL`, `BL`, `Q`, `QB`).
- **Interactive Sizing & Re-Simulation**: Width and Length sliders in the Properties Inspector that trigger real-time client-side re-netlisting and re-simulation.
- **Bidirectional Cross-Probing**: Clicking schematic symbols highlights SPICE lines, and clicking SPICE netlist lines outlines schematic symbols.
- **Generated Files Drawer**: Virtual file tree mapping workspace views directly to tabs.

---

## 🚀 Phase 2: Toolchain Integrations & Physical Layout (Upcoming)
The next phase focuses on connecting compiler outputs to physical layout generator suites.

### Physical Layout Visualizer
- **GDSII/OASIS Stream Viewer**: Renders physical layouts directly inside the browser canvas.
- **Cross-Probing (Schematic to Layout)**: Selecting a transistor or net in the schematic highlights its corresponding physical polygon group in the GDSII layout.

### Open-Source Toolchain Integrations
- **Active Synthesis & Simulation Hooks**:
  - Direct shell interfaces to trigger local `ngspice` sweeps.
  - Integration with OpenLane, Yosys, and OpenROAD to trigger auto-layout and macro placement.
- **Formal LVS (Layout-Versus-Schematic)**: Automatically compares generated layouts against the compiler's Single Source of Truth graph.

---

## 🧠 Phase 3: Autonomous Synthesis & Mixed-Signal AI Agents
The final phase scale VELORA into an autonomous circuit compiler.

### Closed-Loop Parameter Sizing
- **Autonomous Optimization Agents**: AI agents that read simulation results (rise times, delays, leakage) and iteratively sweep transistor sizes to converge on spec targets.
- **DRC Violation Auto-Repair**: Automated layout correction algorithms to adjust spacing, width, and routing paths to resolve design rule violations.

### Analog Co-Design & Reinforcement Learning
- **Sizing Models**: Neural networks trained to optimize operational amplifiers, phase-locked loops (PLLs), and analog filter layouts based on user-defined gain, bandwidth, and phase margin targets.
