import abc
import uuid
import logging
import datetime
import threading
from typing import Dict, Any, Callable, Optional, List
from sqlalchemy.orm import Session

from app.workspace.di_container import di
from app.workspace.database.models import Job

logger = logging.getLogger(__name__)

class JobExecutor(abc.ABC):
    """
    Abstract interface for executing background EDA tasks.
    """
    @abc.abstractmethod
    def execute(self, job_id: str, task_fn: Callable[[], Any], on_complete: Optional[Callable[[Any], None]] = None) -> None:
        pass

    @abc.abstractmethod
    def cancel(self, job_id: str) -> bool:
        pass


class LocalJobExecutor(JobExecutor):
    """
    Concrete JobExecutor running tasks locally in background threads.
    """
    def __init__(self):
        self._threads: Dict[str, threading.Thread] = {}
        self._cancellation_events: Dict[str, threading.Event] = {}

    def execute(self, job_id: str, task_fn: Callable[[], Any], on_complete: Optional[Callable[[Any], None]] = None) -> None:
        cancel_evt = threading.Event()
        self._cancellation_events[job_id] = cancel_evt

        def wrapper():
            logger.info(f"[LocalJobExecutor] Running job thread: {job_id}")
            result = None
            try:
                # Execute the callable task
                result = task_fn()
            except Exception as e:
                logger.error(f"[LocalJobExecutor] Exception running job {job_id}: {e}")
                result = {"status": "failed", "error": str(e)}
            finally:
                if job_id in self._threads:
                    del self._threads[job_id]
                if job_id in self._cancellation_events:
                    del self._cancellation_events[job_id]
                if on_complete:
                    on_complete(result)

        t = threading.Thread(target=wrapper, name=f"job_{job_id}")
        self._threads[job_id] = t
        t.start()

    def cancel(self, job_id: str) -> bool:
        if job_id in self._cancellation_events:
            self._cancellation_events[job_id].set()
            logger.info(f"[LocalJobExecutor] Sent cancel signal to job: {job_id}")
            return True
        return False


class JobOrchestrator:
    """
    Orchestrates scheduling, running, and cancellation of semiconductor design jobs.
    Uses ResourceScheduler to check capacity bounds before execution.
    """
    def __init__(self, executor: Optional[JobExecutor] = None):
        self._executor = executor or LocalJobExecutor()

    def start_job(
        self,
        project_id: int,
        job_type: str,
        task_fn: Callable[[], Any],
        db: Session,
        parameters: Optional[Dict[str, Any]] = None
    ) -> str:
        """
        Submits and schedules a background job.
        Checks with ResourceScheduler first.
        """
        scheduler = di.resolve("resource_scheduler")
        if not scheduler.acquire_slots(job_type, 1):
            raise RuntimeError(f"Resource Scheduler: Queue full. No free execution slots for '{job_type}'.")

        job_id = str(uuid.uuid4())
        
        # Save to database
        db_job = Job(
            id=job_id,
            project_id=project_id,
            job_type=job_type,
            status="running",
            logs=f"[{datetime.datetime.utcnow().isoformat()}] Job initialized and queued.\n",
            parameters=parameters or {},
            started_at=datetime.datetime.utcnow()
        )
        db.add(db_job)
        db.commit()

        def complete_callback(result: Any):
            # Resolve database session local scope
            from app.workspace.database.connection import SessionLocal
            session = SessionLocal()
            try:
                finished_job = session.query(Job).filter(Job.id == job_id).first()
                if finished_job:
                    status = "success"
                    if isinstance(result, dict) and result.get("status") == "failed":
                        status = "failed"
                    
                    finished_job.status = status
                    finished_job.completed_at = datetime.datetime.utcnow()
                    log_entry = f"[{datetime.datetime.utcnow().isoformat()}] Job finished with status: {status}\n"
                    if finished_job.logs:
                        finished_job.logs += log_entry
                    else:
                        finished_job.logs = log_entry
                    
                    session.commit()
                    
                    # Publish event to bus
                    event_bus = di.resolve("event_bus")
                    event_name = "CompileFinished" if job_type == "compile" else "SimulationFinished"
                    event_bus.publish(event_name, project_id=project_id, job_id=job_id, status=status)
            except Exception as ex:
                logger.error(f"[JobOrchestrator] Error updating completed job database row: {ex}")
            finally:
                session.close()
                scheduler.release_slots(job_type, 1)

        # Run via executor
        self._executor.execute(job_id, task_fn, on_complete=complete_callback)
        return job_id

    def cancel_job(self, job_id: str, db: Session) -> bool:
        """Attempts to cancel a running job."""
        job = db.query(Job).filter(Job.id == job_id).first()
        if not job or job.status != "running":
            return False

        cancelled = self._executor.cancel(job_id)
        if cancelled:
            job.status = "failed"
            job.completed_at = datetime.datetime.utcnow()
            log_msg = f"[{datetime.datetime.utcnow().isoformat()}] Job cancelled by user request.\n"
            if job.logs:
                job.logs += log_msg
            else:
                job.logs = log_msg
            db.commit()
            
            scheduler = di.resolve("resource_scheduler")
            scheduler.release_slots(job.job_type, 1)
            return True
        return False

# Register in DI Container
di.register_singleton("job_orchestrator", JobOrchestrator())
