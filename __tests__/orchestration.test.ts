import { createOrchestrator } from '../src/orchestration/orchestrator';
import { Agent, Task, Context } from '../src/orchestration/types';

describe('AI Orchestration Engine', () => {
  let orchestrator: ReturnType<typeof createOrchestrator>;
  
  beforeEach(() => {
    orchestrator = createOrchestrator();
    // Suppress console logs during tests
    jest.spyOn(console, 'info').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  
  afterEach(() => {
    jest.restoreAllMocks();
  });

  const createMockAgent = (id: string, intent: string, shouldFail = false): Agent => ({
    id,
    name: `TestAgent-${id}`,
    capabilities: [{ name: intent, description: 'Test capability' }],
    status: 'idle',
    async *processTask(task: Task, context: Context) {
      if (shouldFail) {
        throw new Error('Agent execution failed');
      }
      yield `Chunk 1 for ${task.id}`;
      yield `Chunk 2 for ${task.id}`;
    }
  });

  describe('AgentRegistry', () => {
    it('should register and retrieve an agent', () => {
      const agent = createMockAgent('agent-1', 'chat');
      orchestrator.registry.registerAgent(agent);
      expect(orchestrator.registry.getAgent('agent-1')).toBeDefined();
    });

    it('should throw when registering duplicate agent', () => {
      const agent = createMockAgent('agent-1', 'chat');
      orchestrator.registry.registerAgent(agent);
      expect(() => orchestrator.registry.registerAgent(agent)).toThrow();
    });
    
    it('should remove an agent', () => {
        const agent = createMockAgent('agent-1', 'chat');
        orchestrator.registry.registerAgent(agent);
        expect(orchestrator.registry.removeAgent('agent-1')).toBe(true);
        expect(orchestrator.registry.getAgent('agent-1')).toBeUndefined();
    });
    
    it('should throw when updating status of non-existent agent', () => {
        expect(() => orchestrator.registry.updateAgentStatus('non-existent', 'busy')).toThrow();
    });
  });

  describe('ContextManager', () => {
    it('should create new context if not exists', () => {
      const context = orchestrator.contextManager.getContext('conv-1');
      expect(context.conversationId).toBe('conv-1');
      expect(context.history).toEqual([]);
    });

    it('should update context preserving previous state', () => {
      orchestrator.contextManager.getContext('conv-1');
      orchestrator.contextManager.updateContext('conv-1', {
        history: [{ role: 'user', content: 'hello' }],
        metadata: { userId: '123' }
      });
      const context = orchestrator.contextManager.getContext('conv-1');
      expect(context.history).toHaveLength(1);
      expect(context.metadata.userId).toBe('123');
    });
    
    it('should clear context', () => {
        orchestrator.contextManager.getContext('conv-1');
        orchestrator.contextManager.clearContext('conv-1');
        const context = orchestrator.contextManager.getContext('conv-1');
        expect(context.history).toEqual([]);
    });
  });

  describe('EventBus', () => {
    it('should subscribe and publish events', () => {
      const callback = jest.fn();
      orchestrator.eventBus.subscribe('test:event', callback);
      orchestrator.eventBus.publish('test:event', { foo: 'bar' });
      expect(callback).toHaveBeenCalledWith({ foo: 'bar' });
    });

    it('should unsubscribe from events', () => {
      const callback = jest.fn();
      orchestrator.eventBus.subscribe('test:event', callback);
      orchestrator.eventBus.unsubscribe('test:event', callback);
      orchestrator.eventBus.publish('test:event', { foo: 'bar' });
      expect(callback).not.toHaveBeenCalled();
    });
    
    it('should gracefully handle errors in subscribers', () => {
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        const faultyCallback = () => { throw new Error('Subscriber error'); };
        orchestrator.eventBus.subscribe('test:event', faultyCallback);
        orchestrator.eventBus.publish('test:event', { foo: 'bar' });
        expect(consoleErrorSpy).toHaveBeenCalled();
        consoleErrorSpy.mockRestore();
    });
  });

  describe('TaskRouter & Circuit Breaker', () => {
    it('should route task to available agent matching intent', () => {
      const agent = createMockAgent('agent-1', 'chat');
      orchestrator.registry.registerAgent(agent);
      const routedAgent = orchestrator.router.routeTask({ id: '1', intent: 'chat', payload: {} });
      expect(routedAgent?.id).toBe('agent-1');
    });

    it('should sort idle agents before busy ones', () => {
      const busyAgent = createMockAgent('agent-busy', 'chat');
      busyAgent.status = 'busy';
      const idleAgent = createMockAgent('agent-idle', 'chat');
      
      orchestrator.registry.registerAgent(busyAgent);
      orchestrator.registry.registerAgent(idleAgent);
      
      const routedAgent = orchestrator.router.routeTask({ id: '1', intent: 'chat', payload: {} });
      expect(routedAgent?.id).toBe('agent-idle');
    });
    
    it('should maintain order when status are similar', () => {
      const idleAgent1 = createMockAgent('agent-idle-1', 'chat');
      const idleAgent2 = createMockAgent('agent-idle-2', 'chat');
      
      orchestrator.registry.registerAgent(idleAgent1);
      orchestrator.registry.registerAgent(idleAgent2);
      
      const routedAgent = orchestrator.router.routeTask({ id: '1', intent: 'chat', payload: {} });
      expect(routedAgent?.id).toBe('agent-idle-1');
    });

    it('should return undefined if no agent matches', () => {
      const agent = createMockAgent('agent-1', 'code');
      orchestrator.registry.registerAgent(agent);
      const routedAgent = orchestrator.router.routeTask({ id: '1', intent: 'chat', payload: {} });
      expect(routedAgent).toBeUndefined();
    });
    
    it('should circuit break after max failures and reset after timeout', () => {
        // We test this indirectly through Orchestrator execution in next block or directly here
        const agentId = 'agent-1';
        orchestrator.registry.registerAgent(createMockAgent(agentId, 'chat'));
        
        // Mock config of router for faster test
        orchestrator.router = new (require('../src/orchestration/task-router').TaskRouter)(orchestrator.registry, { maxFailures: 2, resetTimeoutMs: 100 });
        
        orchestrator.router.recordFailure(agentId);
        orchestrator.router.recordFailure(agentId); // Reaches max failures (2)
        
        // Circuit should be open
        let routedAgent = orchestrator.router.routeTask({ id: '1', intent: 'chat', payload: {} });
        expect(routedAgent).toBeUndefined();
        
        // Wait for timeout
        jest.useFakeTimers();
        setTimeout(() => {
            routedAgent = orchestrator.router.routeTask({ id: '2', intent: 'chat', payload: {} });
            expect(routedAgent).toBeDefined();
        }, 150);
        jest.runAllTimers();
        jest.useRealTimers();
    });
  });

  describe('Orchestrator Execution', () => {
    it('should stream chunks from agent successfully', async () => {
      const agent = createMockAgent('agent-1', 'chat');
      orchestrator.registry.registerAgent(agent);
      
      const task = { id: 'task-1', intent: 'chat', payload: { message: 'hi' } };
      const stream = orchestrator.executeTask(task, 'conv-1');
      
      const chunks = [];
      for await (const chunk of stream) {
        chunks.push(chunk);
      }
      
      expect(chunks).toEqual(['Chunk 1 for task-1', 'Chunk 2 for task-1']);
      expect(orchestrator.registry.getAgent('agent-1')?.status).toBe('idle');
    });

    it('should throw if no agent found', async () => {
      const task = { id: 'task-1', intent: 'unknown', payload: {} };
      const stream = orchestrator.executeTask(task, 'conv-1');
      
      await expect(async () => {
        for await (const _ of stream) {}
      }).rejects.toThrow('No suitable agent found');
    });

    it('should handle agent failure, record failure, and emit error event', async () => {
      const agent = createMockAgent('agent-1', 'chat', true); // will fail
      orchestrator.registry.registerAgent(agent);
      
      const errorListener = jest.fn();
      orchestrator.eventBus.subscribe('agent:error', errorListener);
      
      const task = { id: 'task-1', intent: 'chat', payload: {} };
      const stream = orchestrator.executeTask(task, 'conv-1');
      
      await expect(async () => {
        for await (const _ of stream) {}
      }).rejects.toThrow('Agent execution failed');
      
      expect(errorListener).toHaveBeenCalled();
    });
  });
});