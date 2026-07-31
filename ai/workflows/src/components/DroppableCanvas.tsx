import React from 'react';
import { useDrop } from 'react-dnd';
import { WorkflowNode } from '../WorkflowManager';

export interface DroppableCanvasProps {
  nodes: WorkflowNode[];
  onNodeDrop: (item: any, clientOffset: { x: number, y: number } | null) => void;
}

export const DroppableCanvas: React.FC<DroppableCanvasProps> = ({ nodes, onNodeDrop }) => {
  const [{ isOver }, dropRef] = useDrop(() => ({
    accept: 'WORKFLOW_NODE',
    drop: (item, monitor) => {
      onNodeDrop(item, monitor.getClientOffset());
      return { name: 'Canvas' };
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }), [onNodeDrop]);

  return (
    <div
      ref={dropRef}
      style={{
        width: '100%',
        height: '500px',
        border: '2px dashed #aaa',
        backgroundColor: isOver ? '#eef' : '#fafafa',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {nodes.map((node) => (
        <div
          key={node.id}
          style={{
            position: 'absolute',
            left: node.position?.x ?? 0,
            top: node.position?.y ?? 0,
            padding: '8px',
            border: '1px solid #333',
            backgroundColor: '#fff',
            borderRadius: '4px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}
        >
          {node.type} ({node.id})
        </div>
      ))}
    </div>
  );
};