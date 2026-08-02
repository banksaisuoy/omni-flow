
        # Agent registry: agent_type -> agent_instance
        self.agents: Dict[str, Any] = {}
        
        # Agent availability limits: agent_type -> max_concurrent_tasks
        self.agent_capacities: Dict[str, int] = {}
        
        # Current running tasks per agent type: agent_type -> count
        self.agent_running_tasks: Dict[str, int] = defaultdict(int)

        # Workflow state management: workflow_id -> state (str)
        self.workflow_states: Dict[str, str] = {}

        # Pub/Sub subscriptions: topic -> list of callbacks
        self.subscriptions: Dict[str, List[Callable]] = defaultdict(list)

    def start_workflow(self, workflow_id: str) -> None:
        """Initializes and starts a workflow."""
        self.workflow_states[workflow_id] = "running"
        logger.info(f"Started workflow {workflow_id}")

    def complete_workflow(self, workflow_id: str) -> None:
        """Marks a workflow as completed."""
        if workflow_id in self.workflow_states:
            self.workflow_states[workflow_id] = "completed"
            logger.info(f"Completed workflow {workflow_id}")

    def fail_workflow(self, workflow_id: str) -> None:
        """Marks a workflow as failed."""
        if workflow_id in self.workflow_states:
            self.workflow_states[workflow_id] = "failed"
            logger.info(f"Failed workflow {workflow_id}")

    def register_agent(self, agent_type: str, agent: Any, capacity: int = 1) -> None:
        """Registers an agent by its type and capacity limit."""
        self.agents[agent_type] = agent
        self.agent_capacities[agent_type] = capacity
        logger.info(f"Registered agent of type: {agent_type} with capacity {capacity}")

    def submit_task(self, task: TaskPayload) -> None:
        """Submits a task to the priority queue."""
            logger.debug("No tasks in the queue.")
            return None

        # Pop tasks until we find one that can be executed based on resource allocation
        temp_queue = []
        selected_task_tuple = None
        
        while self.task_queue:
            task_tuple = heapq.heappop(self.task_queue)
            _, _, task = task_tuple
            capacity = self.agent_capacities.get(task.agent_type, 1)
            running = self.agent_running_tasks.get(task.agent_type, 0)
            
            if running < capacity:
                selected_task_tuple = task_tuple
                break
            else:
                temp_queue.append(task_tuple)
                
        # Re-queue tasks that couldn't be scheduled due to capacity limits
        for t in temp_queue:
            heapq.heappush(self.task_queue, t)
            
        if not selected_task_tuple:
            logger.debug("No tasks in queue can currently run (agents at capacity).")
            return None
            
        _, _, task = selected_task_tuple
            
        logger.info(f"Processing task {task.task_id} of type {task.agent_type}")

        agent = self.agents.get(task.agent_type)
                task_id=task.task_id, status="failed", error=error_msg
            )

        # Increment running tasks for this agent type
        self.agent_running_tasks[task.agent_type] += 1

        try:
            # We assume the agent has an execute or process method.
            # For this simple implementation, we assume `__call__` or `execute`
                f"Error executing task {task.task_id}: {str(e)}", exc_info=True
            )
            return ExecutionResult(task_id=task.task_id, status="failed", error=str(e))
        finally:
            # Decrement running tasks for this agent type
            self.agent_running_tasks[task.agent_type] -= 1

    def subscribe(self, topic: str, callback: Callable) -> None:
        """Subscribes a callback to a given topic."""