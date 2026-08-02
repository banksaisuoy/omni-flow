  taskId: string;
  reason: string;
  timestamp: Date;
}

export interface OrchestratorState {
  status: 'idle' | 'running' | 'paused' | 'stopped';
  activeWorkflows: string[];
  queuedTasks: number;
}

export interface WorkflowEvent {
  workflowId: string;
  eventType: 'started' | 'completed' | 'failed' | 'paused' | 'resumed';
  timestamp: Date;
  details?: Record<string, any>;
}