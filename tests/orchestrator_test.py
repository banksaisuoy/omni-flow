import pytest
from src.orchestration.orchestrator import AgentOrchestrator
from src.orchestration.types import TaskPayload

class MockAgent:
    def __init__(self, should_fail=False, result_data=None):
        self.should_fail = should_fail
        self.result_data = result_data or {"status": "ok"}
        
    def execute(self, task):
        if self.should_fail:
            raise RuntimeError("Agent failure")
        return self.result_data

def test_session_initialization():
    orchestrator = AgentOrchestrator()
    orchestrator.on_start()
    
    # Test workflow states
    orchestrator.start_workflow("wf-1")
    assert orchestrator.workflow_states.get("wf-1") == "running"
    
    orchestrator.complete_workflow("wf-1")
    assert orchestrator.workflow_states.get("wf-1") == "completed"

def test_workflow_coordination_success():
    orchestrator = AgentOrchestrator()
    agent = MockAgent(result_data={"output": "success"})
    orchestrator.register_agent("test-agent", agent, capacity=2)
    
    task = TaskPayload(task_id="t-1", agent_type="test-agent", priority=1)
    orchestrator.submit_task(task)
    
    result = orchestrator.process_next_task()
    
    assert result is not None
    assert result.status == "success"
    assert result.result_data == {"output": "success"}
    assert orchestrator.agent_running_tasks["test-agent"] == 0

def test_fault_tolerance_agent_failure():
    orchestrator = AgentOrchestrator()
    failing_agent = MockAgent(should_fail=True)
    orchestrator.register_agent("test-agent", failing_agent)
    
    task = TaskPayload(task_id="t-1", agent_type="test-agent")
    orchestrator.submit_task(task)
    
    result = orchestrator.process_next_task()
    
    assert result is not None
    assert result.status == "failed"
    assert "Agent failure" in result.error
    assert orchestrator.agent_running_tasks["test-agent"] == 0

def test_resource_allocation_limits():
    orchestrator = AgentOrchestrator()
    
    # We want to test that a task doesn't get processed if the agent is at capacity
    # For a real test, we would need the process_next_task to block or run asynchronously,
    # but since it executes synchronously in the current implementation, we can simulate
    # an agent being at capacity by manually incrementing the count.
    
    agent = MockAgent()
    orchestrator.register_agent("test-agent", agent, capacity=1)
    
    task1 = TaskPayload(task_id="t-1", agent_type="test-agent", priority=2)
    task2 = TaskPayload(task_id="t-2", agent_type="test-agent", priority=1)
    
    orchestrator.submit_task(task1)
    orchestrator.submit_task(task2)
    
    # Manually set the agent to be at capacity
    orchestrator.agent_running_tasks["test-agent"] = 1
    
    # Process next task should return None because the agent is at capacity
    result = orchestrator.process_next_task()
    assert result is None
    
    # Free up capacity
    orchestrator.agent_running_tasks["test-agent"] = 0
    
    # Now it should process task1
    result = orchestrator.process_next_task()
    assert result is not None
    assert result.task_id == "t-1"
    
    # Now it should process task2
    result = orchestrator.process_next_task()
    assert result is not None
    assert result.task_id == "t-2"
