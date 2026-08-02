export type EventCallback = (payload: any) => void;

export class EventBus {
  private subscribers: Map<string, Set<EventCallback>> = new Map();

  subscribe(eventType: string, callback: EventCallback): void {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, new Set());
    }
    this.subscribers.get(eventType)!.add(callback);
  }

  unsubscribe(eventType: string, callback: EventCallback): void {
    const callbacks = this.subscribers.get(eventType);
    if (callbacks) {
      callbacks.delete(callback);
      if (callbacks.size === 0) {
        this.subscribers.delete(eventType);
      }
    }
  }

  publish(eventType: string, payload: any): void {
    const callbacks = this.subscribers.get(eventType);
    if (callbacks) {
      callbacks.forEach((callback) => {
        try {
          callback(payload);
        } catch (error) {
          console.error(`Error in event listener for ${eventType}:`, error);
        }
      });
    }
  }
}