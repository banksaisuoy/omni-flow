export interface WorkflowNode {
  id: string;
  type: string;
  data: any;
  position?: { x: number; y: number };
}

export interface WorkflowConnection {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  sourceHandle?: string;
  targetHandle?: string;
}

export class WorkflowManager {
  private nodes: Map<string, WorkflowNode>;
  private connections: Map<string, WorkflowConnection>;

  constructor() {
    this.nodes = new Map();
    this.connections = new Map();
  }

  addNode(node: WorkflowNode): void {
    if (!this.nodes.has(node.id)) {
      this.nodes.set(node.id, node);
    }
  }

  removeNode(nodeId: string): void {
    this.nodes.delete(nodeId);
    // Also remove any connections associated with this node
    const connectionsToRemove = Array.from(this.connections.values()).filter(
      (conn) => conn.sourceNodeId === nodeId || conn.targetNodeId === nodeId
    );
    for (const conn of connectionsToRemove) {
      this.connections.delete(conn.id);
    }
  }

  getNode(nodeId: string): WorkflowNode | undefined {
    return this.nodes.get(nodeId);
  }

  getAllNodes(): WorkflowNode[] {
    return Array.from(this.nodes.values());
  }

  addConnection(connection: WorkflowConnection): void {
    if (!this.connections.has(connection.id)) {
      this.connections.set(connection.id, connection);
    }
  }

  removeConnection(connectionId: string): void {
    this.connections.delete(connectionId);
  }

  getAllConnections(): WorkflowConnection[] {
    return Array.from(this.connections.values());
  }
}