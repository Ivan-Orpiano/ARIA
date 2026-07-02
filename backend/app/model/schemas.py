from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, EmailStr, Field, field_validator

from app.core.workflows import Workflow


class TaskItem(BaseModel):
    title: str = Field(..., min_length=1, max_length=300)
    due: Optional[str] = Field(default=None, max_length=100)
    done: bool = False


class EmailTriggerRequest(BaseModel):
    """What the React frontend POSTs to /api/email/trigger."""

    # EmailStr enforces RFC-valid addresses. This is the user-entered recipient.
    recipient: EmailStr = Field(..., description="Recipient email entered in the chatbox.")
    subject: Optional[str] = Field(default=None, max_length=200)
    message: Optional[str] = Field(default=None, max_length=10_000)

    # Lets the agent/UI pick the workflow; defaults to daily tasks.
    workflow: Workflow = Field(default=Workflow.DAILY_TASKS)

    tasks: List[TaskItem] = Field(default_factory=list)
    session_id: Optional[str] = Field(default=None, max_length=128)

    @field_validator("tasks")
    @classmethod
    def _limit_tasks(cls, v: List[TaskItem]) -> List[TaskItem]:
        if len(v) > 100:
            raise ValueError("Too many tasks (max 100).")
        return v

    def to_n8n_payload(self) -> Dict[str, Any]:
        """Shape the JSON body the n8n Webhook node will receive."""
        return {
            "recipient": str(self.recipient),
            "subject": self.subject or "Your daily tasks",
            "message": self.message or "",
            "workflow": self.workflow.value,
            "tasks": [t.model_dump() for t in self.tasks],
            "sessionId": self.session_id,
            "source": "ai-secretary-backend",
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }


class EmailTriggerResponse(BaseModel):
    status: str
    workflow: Workflow
    detail: Optional[str] = None
    n8n_response: Optional[Any] = None