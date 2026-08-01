import pytest
from app.workspace.di_container import di
from app.engineering.pdk_manager import PdkManager
from app.workspace.resource_scheduler import ResourceScheduler
from app.workspace.feature_flags import FeatureFlags
from app.workspace.config_manager import ConfigManager
from app.workspace.workspace_manager import WorkspaceManager
from app.workspace.database.connection import SessionLocal

def test_di_container():
    # Verify di resolutions
    pdk_mgr = di.resolve("pdk_manager")
    assert isinstance(pdk_mgr, PdkManager)
    
    scheduler = di.resolve("resource_scheduler")
    assert isinstance(scheduler, ResourceScheduler)
    
    flags = di.resolve("feature_flags")
    assert isinstance(flags, FeatureFlags)
    
    config = di.resolve("config_manager")
    assert isinstance(config, ConfigManager)

def test_pdk_manager():
    pdk_mgr = di.resolve("pdk_manager")
    pdks = pdk_mgr.list_pdks()
    assert "SKY130" in pdks
    assert "GF180" in pdks
    
    rules = pdk_mgr.get_pdk_rules("GF180")
    assert rules["typical_vdd"] == 3.3

def test_resource_scheduler():
    scheduler = di.resolve("resource_scheduler")
    # Verify slot acquire/release
    assert scheduler.acquire_slots("compile", 1) is True
    scheduler.release_slots("compile", 1)

def test_feature_flags():
    flags = di.resolve("feature_flags")
    assert flags.is_enabled("rtl_ai_assistant") is True
    assert flags.is_enabled("nonexistent_flag") is False

def test_workspace_manager():
    # WorkspaceManager persistence
    db = SessionLocal()
    try:
        manager = di.resolve("workspace_manager")
        # Save a test workspace state (using project_id 9999 as dummy)
        manager.save_state(
            project_id=9999,
            open_tabs=["rtl/sram_bitcell.sv", "rtl/sram_control.sv"],
            active_tab="rtl/sram_bitcell.sv",
            pinned_files=["rtl/sram_bitcell.sv"],
            cursor_line=10,
            cursor_column=5,
            scroll_top=150,
            zoom_level=120,
            db=db
        )
        
        state = manager.get_state(9999, db)
        assert state["active_tab"] == "rtl/sram_bitcell.sv"
        assert state["cursor_line"] == 10
        assert state["zoom_level"] == 120
    finally:
        db.close()
