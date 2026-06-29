import logging
from app.config import settings
from app.providers.base import ModelProvider
from app.providers.implementations import (
    MockProvider,
    OpenAIProvider,
    ClaudeProvider,
    GeminiProvider,
    DeepSeekProvider
)

logger = logging.getLogger(__name__)

class ModelRouter:
    def __init__(self):
        self._providers = {
            "mock": MockProvider(),
            "openai": OpenAIProvider(),
            "claude": ClaudeProvider(),
            "gemini": GeminiProvider(),
            "deepseek": DeepSeekProvider()
        }

    def get_provider(self) -> ModelProvider:
        provider_name = settings.MODEL_PROVIDER.lower()
        
        # Check API key configuration and fallback to mock if key is missing
        if provider_name == "openai" and not settings.OPENAI_API_KEY:
            logger.warning("OpenAI API key missing. Falling back to MockProvider.")
            return self._providers["mock"]
        elif provider_name == "claude" and not settings.CLAUDE_API_KEY:
            logger.warning("Claude API key missing. Falling back to MockProvider.")
            return self._providers["mock"]
        elif provider_name == "gemini" and not settings.GEMINI_API_KEY:
            logger.warning("Gemini API key missing. Falling back to MockProvider.")
            return self._providers["mock"]
        elif provider_name == "deepseek" and not settings.DEEPSEEK_API_KEY:
            logger.warning("DeepSeek API key missing. Falling back to MockProvider.")
            return self._providers["mock"]
            
        provider = self._providers.get(provider_name, self._providers["mock"])
        return provider

model_router = ModelRouter()
