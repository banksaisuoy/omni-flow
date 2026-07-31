import React from 'react';
import { useDrag } from 'react-dnd';

export interface DraggableNodeProps {
  id: string;
  type: string;
  label: string;
}

export const DraggableNode: React.FC<DraggableNodeProps> = ({ id, type, label }) => {
  const [{ isDragging }, dragRef] = useDrag(() => ({
    type: 'WORKFLOW_NODE',
    item: { id, type, label },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }), [id, type, label]);

  return (
    <div
      ref={dragRef}
      style={{
        opacity: isDragging ? 0.5 : 1,
        padding: '8px 16px',
        margin: '8px',
        border: '1px solid #ccc',
        backgroundColor: '#fff',
        cursor: 'grab',
        borderRadius: '4px',
        display: 'inline-block',
      }}
    >
      {label}
    </div>
  );
};