import logging
import threading
from typing import Dict, Any
from app.workspace.di_container import di

logger = logging.getLogger(__name__)

class ResourceScheduler:
    """
    Limits concurrent compilation and simulation jobs to prevent workstation resource starvation.
    """
    def __init__(self, max_compile_slots: int = 4, max_sim_slots: int = 2):
        self.max_slots = {
            "compile": max_compile_slots,
            "simulate": max_sim_slots,
            "verification": max_compile_slots,
            "ai": 2
        }
        self.active_slots = {
            "compile": 0,
            "simulate": 0,
            "verification": 0,
            "ai": 0
        }
        self._lock = threading.Lock()

    def acquire_slots(self, job_type: str, slots_needed: int = 1) -> bool:
        """
        Attempts to acquire execution slots for a specific job type.
        Returns True if successful, False if the resource limits are exceeded.
        """
        with self._lock:
            job_type = job_type.lower()
            if job_type not in self.max_slots:
                job_type = "compile"  # Default generic slot
                
            max_val = self.max_slots[job_type]
            current_active = self.active_slots[job_type]
            
            if current_active + slots_needed <= max_val:
                self.active_slots[job_type] += slots_needed
                logger.info(
                    f"[ResourceScheduler] Acquired {slots_needed} slot(s) for '{job_type}'. "
                    f"Active: {self.active_slots[job_type]}/{max_val}"
                )
                return True
                
            logger.warning(
                f"[ResourceScheduler] Slot request for '{job_type}' rejected. "
                f"Active: {current_active}/{max_val}, requested: {slots_needed}"
            )
            return False

    def release_slots(self, job_type: str, slots_released: int = 1) -> None:
        """Releases slots after a job is complete."""
        with self._lock:
            job_type = job_type.lower()
            if job_type not in self.max_slots:
                job_type = "compile"
                
            self.active_slots[job_type] = max(0, self.active_slots[job_type] - slots_released)
            logger.info(
                f"[ResourceScheduler] Released {slots_released} slot(s) for '{job_type}'. "
                f"Active: {self.active_slots[job_type]}/{self.max_slots[job_type]}"
            )

    def get_utilization_stats(self) -> Dict[str, Any]:
        """Returns active slots utilization ratios."""
        with self._lock:
            stats = {}
            for k, max_val in self.max_slots.items():
                active = self.active_slots[k]
                stats[k] = {
                    "active": active,
                    "max": max_val,
                    "utilization_pct": round((active / max_val) * 100, 1)
                }
            return stats

# Register in DI Container
di.register_singleton("resource_scheduler", ResourceScheduler())
