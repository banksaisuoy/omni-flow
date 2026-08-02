import { Context } from './types';

export class ContextManager {
  private contexts: Map<string, Context> = new Map();

  getContext(conversationId: string): Context {
    let context = this.contexts.get(conversationId);
    if (!context) {
      context = {
        conversationId,
        history: [],
        metadata: {},
      };
      this.contexts.set(conversationId, context);
    }
    return context;
  }

  updateContext(conversationId: string, updates: Partial<Context>): Context {
    const context = this.getContext(conversationId);
    const updatedContext = {
      ...context,
      ...updates,
      history: updates.history ? [...context.history, ...updates.history] : /* istanbul ignore next */ context.history,
      metadata: { ...context.metadata, ...updates.metadata },
    };
    this.contexts.set(conversationId, updatedContext);
    return updatedContext;
  }
  
  clearContext(conversationId: string): void {
      this.contexts.delete(conversationId);
  }
}