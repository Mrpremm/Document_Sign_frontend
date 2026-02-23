import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { PenSquare } from 'lucide-react';

const SignatureField = ({ id, pageNumber, position, onRemove }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: id,
    data: {
      type: 'signature-field',
      pageNumber,
    },
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    left: position?.x || 0,
    top: position?.y || 0,
  } : {
    left: position?.x || 0,
    top: position?.y || 0,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`absolute cursor-move bg-primary-100 border-2 border-primary-500 rounded-lg p-2 flex items-center gap-2 ${
        isDragging ? 'opacity-50 shadow-lg' : ''
      }`}
    >
      <PenSquare className="h-4 w-4 text-primary-600" />
      <span className="text-xs font-medium text-primary-700">Signature</span>
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(id);
          }}
          className="ml-2 text-red-500 hover:text-red-700"
        >
          ×
        </button>
      )}
    </div>
  );
};

export default SignatureField;