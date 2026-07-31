import React from 'react';

export interface NodeTypeDefinition {
  type: string;
  label: string;
  description?: string;
  component: React.ComponentType<any>;
  defaultData?: any;
}

export class NodeRegistry {
  private nodeTypes: Map<string, NodeTypeDefinition>;

  constructor() {
    this.nodeTypes = new Map();
  }

  registerNodeType(definition: NodeTypeDefinition): void {
    if (this.nodeTypes.has(definition.type)) {
      console.warn(`Node type ${definition.type} is already registered. Overwriting.`);
    }
    this.nodeTypes.set(definition.type, definition);
  }

  getNodeType(type: string): NodeTypeDefinition | undefined {
    return this.nodeTypes.get(type);
  }

  getAllNodeTypes(): NodeTypeDefinition[] {
    return Array.from(this.nodeTypes.values());
  }
}