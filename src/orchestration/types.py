from typing import Any, Dict, Optional

from pydantic import BaseModel, Field


class AgentConfig(BaseModel):
    """Configuration for an agent."""

    name: str
    description: Optional[str] = None
    settings: Dict[str, Any] = Field(default_factory=dict)


class TaskPayload(BaseModel):
    """Payload for a task to be routed to an agent."""

    task_id: str
    agent_type: str
    priority: int = 0
    data: Dict[str, Any] = Field(default_factory=dict)


class ExecutionResult(BaseModel):
    """Result of a task execution."""

    task_id: str
    status: str
    result_data: Optional[Dict[str, Any]] = None
    error: Optional[str] = None