import { Agent, Task } from './types';
import { AgentRegistry } from './agent-registry';

interface CircuitBreakerConfig {
  maxFailures: number;
  resetTimeoutMs: number;
}

export class TaskRouter {
  private agentFailures: Map<string, number> = new Map();
  private circuitOpenUntil: Map<string, number> = new Map();

  constructor(
    private registry: AgentRegistry,
    private config: CircuitBreakerConfig = { maxFailures: 3, resetTimeoutMs: 30000 }
  ) {}

  routeTask(task: Task): Agent | undefined {
    const agents = this.registry.getAllAgents();
    
    // Sort agents by a simple load/status logic: idle first
    const availableAgents = agents
      .filter((agent) => this.isAgentAvailable(agent.id))
      .filter((agent) => agent.status === 'idle' || agent.status === 'busy')
      .sort((a, b) => {
        if (a.status === 'idle' && b.status !== 'idle') return -1;
        /* istanbul ignore next */
        if (a.status !== 'idle' && b.status === 'idle') return 1;
        return 0;
      });

    // Routing logic: find an agent whose capabilities match the task intent
    // Simple matching: agent capability name matches task intent
    for (const agent of availableAgents) {
      const canHandle = agent.capabilities.some(
        (cap) => cap.name.toLowerCase() === task.intent.toLowerCase()
      );
      if (canHandle) {
        return agent;
      }
    }

    return undefined;
  }

  recordFailure(agentId: string): void {
    const failures = (this.agentFailures.get(agentId) || 0) + 1;
    this.agentFailures.set(agentId, failures);

    if (failures >= this.config.maxFailures) {
      this.circuitOpenUntil.set(agentId, Date.now() + this.config.resetTimeoutMs);
      this.registry.updateAgentStatus(agentId, 'failing');
    }
  }

  recordSuccess(agentId: string): void {
    this.agentFailures.delete(agentId);
    this.circuitOpenUntil.delete(agentId);
  }

  private isAgentAvailable(agentId: string): boolean {
    const openUntil = this.circuitOpenUntil.get(agentId);
    if (openUntil && Date.now() < openUntil) {
      return false;
    }
    
    if (openUntil && Date.now() >= openUntil) {
      // Circuit breaker half-open / reset
      this.circuitOpenUntil.delete(agentId);
      this.agentFailures.set(agentId, 0); // Reset failures to allow a try
      
      const agent = this.registry.getAgent(agentId);
      if (agent && agent.status === 'failing') {
         this.registry.updateAgentStatus(agentId, 'idle');
      }
    }
    
    const agent = this.registry.getAgent(agentId);
    return agent !== undefined && agent.status !== 'offline' && agent.status !== 'failing';
  }
}