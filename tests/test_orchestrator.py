from unittest.mock import Mock


from src.orchestration.orchestrator import AgentOrchestrator
from src.orchestration.types import TaskPayload


def test_register_agent():
    orchestrator = AgentOrchestrator()
    dummy_agent = Mock()
    orchestrator.register_agent("test_agent", dummy_agent)

    assert "test_agent" in orchestrator.agents
    assert orchestrator.agents["test_agent"] == dummy_agent


def test_task_routing():
    orchestrator = AgentOrchestrator()

    # Create mock agents
    agent1 = Mock()
    agent1.execute.return_value = {"status": "agent1_done"}
    # Mocks have a magic `execute` method created automatically by Mock() which hasattr detects.
    # To test the callable branch, we delete the `execute` attribute.
    agent2 = Mock()
    del agent2.execute
    agent2.return_value = {"status": "agent2_done"}  # callable agent

    orchestrator.register_agent("agent_type_1", agent1)
    orchestrator.register_agent("agent_type_2", agent2)

    # Submit tasks with different priorities
    task_low = TaskPayload(task_id="t1", agent_type="agent_type_1", priority=1)
    task_high = TaskPayload(task_id="t2", agent_type="agent_type_2", priority=10)
    task_med = TaskPayload(task_id="t3", agent_type="agent_type_1", priority=5)

    orchestrator.submit_task(task_low)
    orchestrator.submit_task(task_high)
    orchestrator.submit_task(task_med)

    # Process tasks - should come out in order of priority (highest first)
    result1 = orchestrator.process_next_task()
    assert result1.task_id == "t2"
    assert result1.status == "success"
    assert result1.result_data == {"status": "agent2_done"}

    result2 = orchestrator.process_next_task()
    assert result2.task_id == "t3"
    assert result2.status == "success"
    assert result2.result_data == {"status": "agent1_done"}

    result3 = orchestrator.process_next_task()
    assert result3.task_id == "t1"
    assert result3.status == "success"
    assert result3.result_data == {"status": "agent1_done"}

    # Empty queue
    assert orchestrator.process_next_task() is None


def test_task_routing_no_agent():
    orchestrator = AgentOrchestrator()
    task = TaskPayload(task_id="t1", agent_type="nonexistent_agent")
    orchestrator.submit_task(task)

    result = orchestrator.process_next_task()
    assert result.task_id == "t1"
    assert result.status == "failed"
    assert "No agent registered" in result.error


def test_task_routing_agent_error():
    orchestrator = AgentOrchestrator()

    agent = Mock()
    agent.execute.side_effect = ValueError("Agent failed")
    orchestrator.register_agent("failing_agent", agent)

    task = TaskPayload(task_id="t1", agent_type="failing_agent")
    orchestrator.submit_task(task)

    result = orchestrator.process_next_task()
    assert result.task_id == "t1"
    assert result.status == "failed"
    assert "Agent failed" in result.error


def test_pub_sub():
    orchestrator = AgentOrchestrator()

    callback1 = Mock()
    callback2 = Mock()

    orchestrator.subscribe("test_topic", callback1)
    orchestrator.subscribe("test_topic", callback2)
    orchestrator.subscribe("other_topic", callback1)

    message = {"key": "value"}
    orchestrator.publish("test_topic", message)

    callback1.assert_called_once_with(message)
    callback2.assert_called_once_with(message)

    orchestrator.publish("other_topic", "hello")
    assert callback1.call_count == 2
    callback1.assert_called_with("hello")
    callback2.assert_called_once()  # not called for other_topic


def test_lifecycle_hooks(caplog):
    orchestrator = AgentOrchestrator()

    with caplog.at_level("INFO"):
        orchestrator.on_start()
        assert "AgentOrchestrator starting up" in caplog.text

        orchestrator.on_complete()
        assert "AgentOrchestrator shutting down" in caplog.text
