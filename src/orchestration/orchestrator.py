import heapq
import logging
from collections import defaultdict
from typing import Any, Callable, Dict, List, Optional

from .types import ExecutionResult, TaskPayload

logger = logging.getLogger(__name__)


class AgentOrchestrator:
    """Main orchestration engine for routing tasks to agents."""

    def __init__(self):
        # Priority queue for tasks. Entries are (negative_priority, insertion_order, TaskPayload)
        self.task_queue: List[Any] = []
        self._task_counter = 0  # Tie-breaker for tasks with same priority

        # Agent registry: agent_type -> agent_instance
        self.agents: Dict[str, Any] = {}

        # Pub/Sub subscriptions: topic -> list of callbacks
        self.subscriptions: Dict[str, List[Callable]] = defaultdict(list)

    def register_agent(self, agent_type: str, agent: Any) -> None:
        """Registers an agent by its type."""
        self.agents[agent_type] = agent
        logger.info(f"Registered agent of type: {agent_type}")

    def submit_task(self, task: TaskPayload) -> None:
        """Submits a task to the priority queue."""
        # heapq is a min-heap, so we use negative priority to simulate max-heap behavior
        # (higher priority value = higher actual priority)
        # We also include a counter to maintain insertion order for tasks with same priority
        heapq.heappush(self.task_queue, (-task.priority, self._task_counter, task))
        self._task_counter += 1
        logger.info(f"Submitted task {task.task_id} with priority {task.priority}")

    def process_next_task(self) -> Optional[ExecutionResult]:
        """Pops the highest priority task and routes it to the appropriate agent."""
        if not self.task_queue:
            logger.debug("No tasks in the queue.")
            return None

        _, _, task = heapq.heappop(self.task_queue)
        logger.info(f"Processing task {task.task_id} of type {task.agent_type}")

        agent = self.agents.get(task.agent_type)
        if not agent:
            error_msg = f"No agent registered for type: {task.agent_type}"
            logger.error(error_msg)
            return ExecutionResult(
                task_id=task.task_id, status="failed", error=error_msg
            )

        try:
            # We assume the agent has an execute or process method.
            # For this simple implementation, we assume `__call__` or `execute`
            if hasattr(agent, "execute"):
                result_data = agent.execute(task)
            elif callable(agent):
                result_data = agent(task)
            else:
                raise ValueError(
                    "Agent is neither callable nor has an 'execute' method"
                )

            logger.info(f"Task {task.task_id} completed successfully.")
            return ExecutionResult(
                task_id=task.task_id, status="success", result_data=result_data
            )
        except Exception as e:
            logger.error(
                f"Error executing task {task.task_id}: {str(e)}", exc_info=True
            )
            return ExecutionResult(task_id=task.task_id, status="failed", error=str(e))

    def subscribe(self, topic: str, callback: Callable) -> None:
        """Subscribes a callback to a given topic."""
        self.subscriptions[topic].append(callback)
        logger.info(f"Subscribed callback to topic: {topic}")

    def publish(self, topic: str, message: Any) -> None:
        """Publishes a message to all callbacks subscribed to the topic."""
        callbacks = self.subscriptions.get(topic, [])
        logger.info(
            f"Publishing message to topic '{topic}' ({len(callbacks)} subscribers)"
        )
        for callback in callbacks:
            try:
                callback(message)
            except Exception as e:
                logger.error(f"Error in pub/sub callback for topic '{topic}': {str(e)}")

    def on_start(self) -> None:
        """Lifecycle hook executed when the orchestrator starts."""
        logger.info("AgentOrchestrator starting up...")
        # Initialization logic can go here

    def on_complete(self) -> None:
        """Lifecycle hook executed when the orchestrator completes/shuts down."""
        logger.info("AgentOrchestrator shutting down...")
        # Cleanup logic can go here