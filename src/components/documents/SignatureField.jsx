import React, { useRef, useEffect } from 'react';
import { PenSquare, GripVertical } from 'lucide-react';

/**
 * A draggable signature field overlay.
 * Uses native mouse events for reliable positioning — no dnd-kit needed.
 *
 * Props:
 *  - id: string
 *  - position: { x, y }
 *  - label: string (signer name)
 *  - pageNumber: number
 *  - onMove(id, newX, newY): called as field is dragged
 *  - onRemove(id): called when × is clicked
 *  - onLabelChange(id, newLabel): called when signer name changes
 */
const SignatureField = ({ id, position, label, onMove, onRemove, onLabelChange }) => {
  const fieldRef = useRef(null);
  const dragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const el = fieldRef.current;
    if (!el) return;

    const onMouseDown = (e) => {
      // Only drag via the grip handle (first element) or the field body — not the input or × button
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON') return;
      e.preventDefault();

      dragging.current = true;
      const rect = el.getBoundingClientRect();
      offset.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    };

    const onMouseMove = (e) => {
      if (!dragging.current) return;
      const parent = el.parentElement;
      if (!parent) return;
      const parentRect = parent.getBoundingClientRect();

      const newX = e.clientX - parentRect.left - offset.current.x;
      const newY = e.clientY - parentRect.top - offset.current.y;

      // Clamp to parent bounds
      const clampedX = Math.max(0, Math.min(newX, parentRect.width - el.offsetWidth));
      const clampedY = Math.max(0, Math.min(newY, parentRect.height - el.offsetHeight));

      if (onMove) onMove(id, clampedX, clampedY);
    };

    const onMouseUp = () => {
      dragging.current = false;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    el.addEventListener('mousedown', onMouseDown);
    return () => {
      el.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, [id, onMove]);

  return (
    <div
      ref={fieldRef}
      style={{
        position: 'absolute',
        left: position?.x ?? 50,
        top: position?.y ?? 50,
        zIndex: 10,
        userSelect: 'none',
        cursor: 'move',
      }}
      className="bg-primary-50 border-2 border-primary-500 rounded-lg shadow-md min-w-[160px]"
    >
      {/* Drag handle + icon row */}
      <div className="flex items-center gap-1 px-2 pt-1 pb-0">
        <GripVertical className="h-3 w-3 text-primary-400 flex-shrink-0" />
        <PenSquare className="h-3 w-3 text-primary-600 flex-shrink-0" />
        <span className="text-xs font-semibold text-primary-700 flex-1">Signature</span>
        {onRemove && (
          <button
            type="button"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onRemove(id);
            }}
            className="text-red-400 hover:text-red-600 text-sm font-bold leading-none"
            title="Remove field"
          >
            ×
          </button>
        )}
      </div>

      {/* Signer name input */}
      <div className="px-2 pb-2 pt-1">
        <input
          type="text"
          value={label || ''}
          onChange={(e) => onLabelChange && onLabelChange(id, e.target.value)}
          onMouseDown={(e) => e.stopPropagation()}
          placeholder="Signer name / email"
          className="w-full text-xs border border-primary-300 rounded px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-primary-500 bg-white"
        />
      </div>
    </div>
  );
};

export default SignatureField;