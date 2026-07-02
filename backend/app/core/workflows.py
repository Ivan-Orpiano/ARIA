from enum import Enum
from app.core.config import Settings

class Workflow(str, Enum):
    DAILY_TASKS = "daily_tasks"
    REMINDER="reminder"
    DEFAULT="default"
    
    
def resolve_webhook_path(workflow: Workflow, settings: Settings) -> str:
    mapping = {
        Workflow.DAILY_TASKS: settings.n8n_path_daily_tasks,
        Workflow.REMINDER: settings.n8n_path_reminder,
        Workflow.DEFAULT: settings.n8n_path_default,
    }
    return mapping.get(workflow, settings.n8n_path_default)


def resolve_webhook_url(workflow: Workflow, settings: Settings) -> str:
    return settings.webhook_base() + resolve_webhook_path(workflow, settings).lstrip("/")