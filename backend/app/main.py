import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.workspace.database.connection import engine, Base
from app.workspace.api import auth, projects, designs, plugins, library
from app.workspace.events.handlers import register_event_handlers

# Import plugins to trigger their auto-registration on startup
import app.plugins.synopsys
import app.plugins.siemens

# Setup logs
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger(__name__)

# Create database tables automatically
logger.info("Initializing database schemas...")
Base.metadata.create_all(bind=engine)

def seed_library_components():
    from app.workspace.database.connection import SessionLocal
    from app.workspace.database.models import LibraryComponent
    from app.engineering.library.library import component_library
    
    db = SessionLocal()
    try:
        logger.info("Syncing library_components table from primitive device specs on disk...")
        # Retrieve all loaded components (from _devices) instead of only enabled list
        comps = [device.to_json() for device in component_library._devices.values()]
        
        added_count = 0
        updated_count = 0
        
        for c in comps:
            name = c.get("name")
            pdk_list = c.get("pdk_compatibility", [])
            tech = pdk_list[0] if pdk_list else "Generic"
            
            # Generate default SPICE subcircuit model if empty
            pins_lower = [p.lower() for p in c.get("pins", [])]
            default_spice = (
                f".subckt {name.lower()} " + " ".join(pins_lower) + "\n"
                f"* Default SPICE netlist primitive subcircuit model\n"
                f"* PDK compatibility: {', '.join(pdk_list)}\n"
                f".ends\n"
            )
            
            db_comp = db.query(LibraryComponent).filter(LibraryComponent.name == name).first()
            if not db_comp:
                db_comp = LibraryComponent(
                    name=name,
                    technology=tech,
                    category=c.get("category"),
                    model=c.get("model"),
                    pins=c.get("pins", []),
                    parameters=c.get("parameters", {}),
                    desc=c.get("desc"),
                    symbol_svg=c.get("symbol_svg"),
                    spice_model=c.get("spice_model") or default_spice,
                    layout_gds_path=c.get("layout_gds_path"),
                    ai_metadata=c.get("ai_metadata"),
                    design_constraints=c.get("design_constraints"),
                    documentation=c.get("documentation")
                )
                db.add(db_comp)
                added_count += 1
            else:
                # Update existing records in case JSON definitions changed on disk
                db_comp.technology = tech
                db_comp.category = c.get("category")
                db_comp.model = c.get("model")
                db_comp.pins = c.get("pins", [])
                db_comp.parameters = c.get("parameters", {})
                db_comp.desc = c.get("desc")
                db_comp.symbol_svg = c.get("symbol_svg")
                if c.get("spice_model"):
                    db_comp.spice_model = c.get("spice_model")
                db_comp.layout_gds_path = c.get("layout_gds_path")
                db_comp.ai_metadata = c.get("ai_metadata")
                db_comp.design_constraints = c.get("design_constraints")
                db_comp.documentation = c.get("documentation")
                updated_count += 1
                
        db.commit()
        logger.info(f"Database components sync completed: {added_count} added, {updated_count} updated.")
    except Exception as e:
        logger.error(f"Seeding library components failed: {e}")
        db.rollback()
    finally:
        db.close()

seed_library_components()

app = FastAPI(
    title="VELORA API",
    description="AI Semiconductor Engineering Copilot Backend",
    version="1.0.0"
)

# CORS Setup for Next.js app
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Event Bus Handlers
register_event_handlers()

# Include Routers
app.include_router(auth.router, prefix="/api/v1")
app.include_router(projects.router, prefix="/api/v1")
app.include_router(designs.router, prefix="/api/v1")
app.include_router(plugins.router, prefix="/api/v1")
app.include_router(library.router, prefix="/api/v1")

@app.get("/api/v1/health")
def health_check():
    return {
        "status": "healthy",
        "environment": settings.ENVIRONMENT,
        "model_provider": settings.MODEL_PROVIDER
    }
