import logging
from typing import Dict, Callable, Any

logger = logging.getLogger(__name__)

class CommandRegistry:
    """
    Registry of system commands mapping action IDs (e.g. 'rtl.compile', 'sim.run')
    to business service handlers, similar to VS Code command palettes.
    """
    def __init__(self):
        self._commands: Dict[str, Callable[..., Any]] = {}

    def register_command(self, cmd_id: str, handler: Callable[..., Any]) -> None:
        """Registers a command execution handler."""
        self._commands[cmd_id] = handler
        logger.info(f"[CommandRegistry] Registered command handler for: {cmd_id}")

    def execute_command(self, cmd_id: str, *args, **kwargs) -> Any:
        """Executes a registered command handler by ID."""
        if cmd_id not in self._commands:
            raise ValueError(f"Command '{cmd_id}' is not registered in the Command Registry.")
        
        logger.info(f"[CommandRegistry] Executing command: {cmd_id}")
        return self._commands[cmd_id](*args, **kwargs)

    def has_command(self, cmd_id: str) -> bool:
        """Returns True if the command is registered, False otherwise."""
        return cmd_id in self._commands

# Register in DI Container
from app.workspace.di_container import di
di.register_singleton("command_registry", CommandRegistry())
