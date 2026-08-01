import re
import os
import logging
from typing import Dict, Any, List
from app.workspace.di_container import di

logger = logging.getLogger(__name__)

class FileIndexer:
    """
    Parses SystemVerilog files to index modules, ports, and dependencies.
    Caches results to avoid redundant disk I/O and parser runs.
    """
    def __init__(self):
        self._index: Dict[str, Dict[str, Any]] = {}

    def index_file(self, filepath: str, content: str) -> Dict[str, Any]:
        """
        Parses SystemVerilog content to extract ports, signals, and parameters.
        Caches and returns the parsed outline.
        """
        # Quick regex parsing for SystemVerilog module definitions
        module_match = re.search(r'module\s+(\w+)', content)
        module_name = module_match.group(1) if module_match else "unknown"

        # Regex for parameter lists
        parameters = []
        param_section = re.findall(r'parameter\s+(\w+)\s*=\s*([^,;\n\)]+)', content)
        for param_name, param_val in param_section:
            parameters.append({"name": param_name, "value": param_val.strip()})

        # Regex for input/output ports
        ports = []
        port_lines = re.findall(r'(input|output|inout)\s+(logic|wire|reg)?\s*(\[[^\]]+\])?\s*(\w+)', content)
        for direction, data_type, size, name in port_lines:
            ports.append({
                "direction": direction,
                "type": data_type or "logic",
                "width": size or "",
                "name": name
            })

        # Regex for internal wire/logic signals
        signals = []
        signal_lines = re.findall(r'(?:logic|wire)\s+(\[[^\]]+\])?\s*(\w+)\s*;', content)
        for size, name in signal_lines:
            signals.append({
                "name": name,
                "width": size or ""
            })

        indexed_data = {
            "module": module_name,
            "ports": ports,
            "parameters": parameters,
            "signals": signals
        }
        
        self._index[filepath] = indexed_data
        logger.debug(f"[FileIndexer] Indexed SystemVerilog file {filepath}: module {module_name}")
        return indexed_data

    def get_indexed_outline(self, filepath: str) -> Optional[Dict[str, Any]]:
        """Returns cached indexed outline if available."""
        return self._index.get(filepath)

    def invalidate(self, filepath: str) -> None:
        """Invalidates cache for a specific file path."""
        if filepath in self._index:
            del self._index[filepath]
            logger.info(f"[FileIndexer] Invalidated cache index for {filepath}")

# Register in DI Container
di.register_singleton("file_indexer", FileIndexer())
