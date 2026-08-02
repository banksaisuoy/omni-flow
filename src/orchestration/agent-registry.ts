import { Agent } from './types';

export class AgentRegistry {
  private agents: Map<string, Agent> = new Map();

  registerAgent(agent: Agent): void {
    if (this.agents.has(agent.id)) {
      throw new Error(`Agent with ID ${agent.id} is already registered.`);
    }
    this.agents.set(agent.id, agent);
  }

  getAgent(id: string): Agent | undefined {
    return this.agents.get(id);
  }

  getAllAgents(): Agent[] {
    return Array.from(this.agents.values());
  }

  removeAgent(id: string): boolean {
    return this.agents.delete(id);
  }
  
  updateAgentStatus(id: string, status: Agent['status']): void {
    const agent = this.agents.get(id);
    if (agent) {
        agent.status = status;
    } else {
        throw new Error(`Agent with ID ${id} not found.`);
    }
  }
}