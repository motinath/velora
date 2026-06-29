import sys
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Setup path so python can find app package
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "app")))
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.database.connection import Base
from app.database.models import User, Project, Design
from app.services.project_service import project_service
from app.services.design_service import design_service

def verify_pipeline():
    print("=== STARTING VELORA COMPILER PIPELINE VERIFICATION ===")
    
    # 1. Setup temporary in-memory database for testing
    print("[1/5] Initializing in-memory verification database...")
    engine = create_engine("sqlite:///:memory:")
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # 2. Create User and Project
        print("[2/5] Initializing mock engineering user and project workspace...")
        user = User(email="test_engineer@velora.ai", password_hash="hash")
        db.add(user)
        db.commit()
        db.refresh(user)

        project = project_service.create_project(
            db, 
            name="SRAM Cell Array", 
            user_id=user.id, 
            technology="SKY130", 
            design_type="6T SRAM",
            description="High-density static memory cell block test"
        )
        print(f"Created project: '{project.name}' | Tech: {project.technology} | Type: {project.design_type}")

        # 3. Trigger Design Pipeline
        print("[3/5] Executing semiconductor design pipeline...")
        prompt = "Generate a 6T SRAM cell using SKY130 optimized for low leakage"
        design = design_service.generate_design(db, project_id=project.id, prompt=prompt)

        # 4. Verify outputs
        print("[4/5] Inspecting compiler outputs...")
        
        # Requirements Parser verification
        reqs = design.requirements_json
        print(f"  - Parsed Type: {reqs.get('type')} (Expected: '6T SRAM')")
        print(f"  - Parsed Optimization: {reqs.get('optimization')} (Expected: 'Low Leakage')")
        assert reqs.get('type') == "6T SRAM", "Failed parsing design type"
        assert reqs.get('optimization') == "Low Leakage", "Failed parsing optimization"

        # Plan verification
        plan = design.plan_json
        print(f"  - Sized Components: {len(plan.get('components', []))} devices")
        assert len(plan.get('components', [])) > 0, "Planned component list is empty"

        # Circuit Graph verification
        graph = design.circuit_graph_json
        print(f"  - Graph Nodes: {len(graph.get('nodes', []))} nodes")
        print(f"  - Graph Edges: {len(graph.get('edges', []))} nets")
        assert len(graph.get('nodes', [])) > 0, "Circuit graph has no nodes"

        # Constraint results
        drc = design.constraint_results_json
        print(f"  - DRC Check Status: {drc.get('status')} (Warnings: {len(drc.get('warnings', []))})")
        assert drc.get('status') == "PASSED", f"DRC check failed: {drc.get('errors')}"

        # Schematic verification
        svg = design.schematic_svg
        print(f"  - Generated SVG length: {len(svg)} characters")
        assert "<svg" in svg and "</svg>" in svg, "Schematic SVG is malformed"

        # Netlist verification
        netlist = design.netlist_content
        print("  - Generated SPICE Netlist snippet:")
        snippet = "\n".join(netlist.split("\n")[7:18])
        print(f"    ---\n{snippet}\n    ---")
        assert ".subckt" in netlist and ".ends" in netlist, "Netlist is malformed"

        # Simulation verification
        sim = design.simulation_results_json
        print(f"  - Simulation Status: {sim.get('status')}")
        print(f"  - Simulation Metrics: {sim.get('metrics')}")
        assert sim.get('status') == "SUCCESS", "Simulation failed"
        assert "y_Q" in sim.get('waveforms', {}), "Simulation didn't return waveforms for nodes"

        # Logs verification
        print(f"  - Pipeline Console Log lines: {len(design.logs_content.splitlines())}")

        # 5. Success
        print("\n[5/5] PIPELINE INTEGRITY CHECK PASSED SUCCESSFULLY!")

    finally:
        db.close()

if __name__ == "__main__":
    verify_pipeline()
