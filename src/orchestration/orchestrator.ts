import { AgentRegistry } from './agent-registry';
import { TaskRouter } from './task-router';
import { ContextManager } from './context-manager';
import { EventBus } from './event-bus';
import { Task, Context, Agent } from './types';

export interface OrchestratorConfig {
  maxRetries?: number;
}

export class Orchestrator {
  public registry: AgentRegistry;
  public router: TaskRouter;
  public contextManager: ContextManager;
  public eventBus: EventBus;
  private config: OrchestratorConfig;

  constructor(config: OrchestratorConfig = {}) {
    this.config = config;
    this.registry = new AgentRegistry();
    this.router = new TaskRouter(this.registry);
    this.contextManager = new ContextManager();
    this.eventBus = new EventBus();
  }

  async *executeTask(task: Task, conversationId: string): AsyncIterable<string> {
    const correlationId = `${conversationId}-${task.id}-${Date.now()}`;
    this.log(correlationId, 'info', `Task execution started`, { intent: task.intent });

    const context = this.contextManager.getContext(conversationId);
    let currentAgent = this.router.routeTask(task);

    if (!currentAgent) {
      this.log(correlationId, 'error', `No agent found for intent: ${task.intent}`);
      throw new Error(`No suitable agent found for task intent: ${task.intent}`);
    }

    try {
      this.eventBus.publish('agent:started', { agentId: currentAgent.id, taskId: task.id });
      this.registry.updateAgentStatus(currentAgent.id, 'busy');

      const responseStream = currentAgent.processTask(task, context);

      for await (const chunk of responseStream) {
        yield chunk;
      }

      this.router.recordSuccess(currentAgent.id);
      this.registry.updateAgentStatus(currentAgent.id, 'idle');
      this.eventBus.publish('agent:completed', { agentId: currentAgent.id, taskId: task.id });
      
      this.contextManager.updateContext(conversationId, {
        history: [{ role: 'user', content: JSON.stringify(task.payload) }]
      });

      this.log(correlationId, 'info', `Task execution completed successfully`);
    } catch (error: any) {
      this.log(correlationId, 'error', `Task execution failed`, { error: error.message });
      this.router.recordFailure(currentAgent.id);
      this.eventBus.publish('agent:error', { agentId: currentAgent.id, taskId: task.id, error });
      throw error;
    }
  }

  private log(correlationId: string, level: 'info' | 'warn' | 'error', message: string, metadata: Record<string, any> = {}): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      correlationId,
      message,
      ...metadata,
    };
    // In a real system, this might use a proper logger like winston or pino
    console[level](JSON.stringify(logEntry));
  }
}

export function createOrchestrator(config?: OrchestratorConfig): Orchestrator {
  return new Orchestrator(config);
}