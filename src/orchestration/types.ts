export interface Capability {
  name: string;
  description: string;
}

export interface Agent {
  id: string;
  name: string;
  capabilities: Capability[];
  status: 'idle' | 'busy' | 'offline' | 'failing';
  processTask(task: Task, context: Context): AsyncIterable<string>;
}

export interface Task {
  id: string;
  intent: string;
  payload: Record<string, any>;
  priority?: number;
}

export interface Context {
  conversationId: string;
  history: Array<{ role: string; content: string }>;
  metadata: Record<string, any>;
}

export interface HandoffEvent {
  fromAgentId: string;
  toAgentId: string;
  taskId: string;
  reason: string;
  timestamp: Date;
}