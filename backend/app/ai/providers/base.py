from abc import ABC, abstractmethod
from typing import List, Dict, Any, Generator

class ModelProvider(ABC):
    @abstractmethod
    def generate(self, system_prompt: str, user_prompt: str, chat_history: List[Dict[str, str]] = None) -> str:
        """
        Generate a text response based on system prompt, user prompt, and chat history.
        """
        pass

    @abstractmethod
    def generate_stream(self, system_prompt: str, user_prompt: str, chat_history: List[Dict[str, str]] = None) -> Generator[str, None, None]:
        """
        Stream back generated text response tokens.
        """
        pass
