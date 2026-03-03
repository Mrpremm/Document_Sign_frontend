import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Document, Page } from 'react-pdf';
import '../../utils/pdfWorker';
import { v4 as uuidv4 } from 'uuid';
import { documentsApi } from '../../api/documents';
import Spinner from '../../components/ui/Spinner';
import Alert from '../../components/ui/Alert';
import SignatureDetailsModal from '../../components/documents/SignatureDetailsModal';
import { PenSquare, GripVertical, X, Calendar, ChevronRight, ArrowRight } from 'lucide-react';

// ─── Helper: today's date as YYYY-MM-DD ──────────────────────────────────────
const todayStr = () => new Date().toISOString().slice(0, 10);

// ─── Draggable field on the PDF canvas ────────────────────────────────────────
/**
 * containerRef — ref to the overlay div (absolute inset-0) that acts as bounds.
 * The field is positioned absolutely inside that overlay.
 */
const DraggableField = ({ field, onMove, onRemove, onDateChange, canEdit, containerRef }) => {
  const ref = useRef(null);
  const dragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el || !canEdit) return;

    const onMouseDown = (e) => {
      // Don't start drag from interactive elements
      if (
        e.target.tagName === 'BUTTON' ||
        e.target.tagName === 'INPUT' ||
        e.target.tagName === 'SELECT'
      ) return;
      e.preventDefault();
      dragging.current = true;
      const rect = el.getBoundingClientRect();
      offset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    };

    const onMouseMove = (e) => {
      if (!dragging.current) return;
      // Use the overlay container as the bounding box
      const container = containerRef?.current;
      if (!container) return;
      const pr = container.getBoundingClientRect();
      const newX = Math.max(0, Math.min(e.clientX - pr.left - offset.current.x, pr.width - el.offsetWidth));
      const newY = Math.max(0, Math.min(e.clientY - pr.top - offset.current.y, pr.height - el.offsetHeight));
      onMove(field.id, newX, newY);
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
  }, [field.id, onMove, canEdit, containerRef]);

  const isDate = field.type === 'date';
  const isSignature = field.type === 'signature';
  const borderColor = isSignature ? 'border-blue-400' : 'border-green-400';
  const iconColor = isSignature ? 'text-blue-600' : 'text-green-600';
  const label = isSignature ? 'Signature' : 'Date';

  return (
    <div
      ref={ref}
      style={{
        position: 'absolute',
        left: field.position?.x ?? 50,
        top: field.position?.y ?? 50,
        zIndex: 10,
        userSelect: 'none',
        cursor: canEdit ? 'move' : 'default',
        minWidth: isDate ? 180 : 140,
      }}
      className={`border-2 ${borderColor} rounded-lg shadow-md bg-white`}
    >
      {/* Header row */}
      <div className="flex items-center gap-1 px-2 py-1.5">
        <GripVertical className="h-3 w-3 text-gray-400 flex-shrink-0" />
        {isSignature
          ? <PenSquare className={`h-3 w-3 ${iconColor} flex-shrink-0`} />
          : <Calendar className={`h-3 w-3 ${iconColor} flex-shrink-0`} />
        }
        <span className="text-xs font-semibold text-gray-700 flex-1">{label}</span>
        {canEdit && onRemove && (
          <button
            type="button"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); onRemove(field.id); }}
            className="text-red-400 hover:text-red-600 ml-1"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      {/* Signature preview */}
      {isSignature && field.signatureDataUrl && (
        <div className="px-2 pb-2">
          <img src={field.signatureDataUrl} alt="signature" className="h-8 object-contain" />
        </div>
      )}

      {/* Date picker — only shown, and only pre-filled, when the user has picked a value */}
      {isDate && (
        <div className="px-2 pb-2" onMouseDown={(e) => e.stopPropagation()}>
          <input
            type="date"
            value={field.dateValue || ''}
            onChange={(e) => onDateChange && onDateChange(field.id, e.target.value)}
            placeholder="Pick a date"
            className="w-full text-xs border border-green-300 rounded px-1.5 py-1 focus:outline-none focus:ring-1 focus:ring-green-400 bg-white cursor-pointer"
          />
        </div>
      )}
    </div>
  );
};

// ─── Sidebar field item ───────────────────────────────────────────────────────
const SidebarField = ({ icon, label, previewUrl, onAdd, onEdit }) => (
  <div className="flex items-center gap-2 border border-blue-200 rounded-xl px-3 py-2.5 bg-white shadow-sm">
    <GripVertical className="h-4 w-4 text-gray-300 flex-shrink-0" />
    <div className="flex items-center gap-2 flex-1 min-w-0">
      <span className="flex-shrink-0">{icon}</span>
      {previewUrl ? (
        <img src={previewUrl} alt={label} className="h-6 object-contain flex-1 min-w-0" />
      ) : (
        <span className="text-sm font-medium text-gray-700 truncate">{label}</span>
      )}
    </div>
    {onEdit && (
      <button
        onClick={onEdit}
        className="text-blue-400 hover:text-blue-600 flex-shrink-0"
        title="Edit signature"
      >
        <PenSquare className="h-3.5 w-3.5" />
      </button>
    )}
    {onAdd && (
      <button
        onClick={onAdd}
        className="text-blue-400 hover:text-blue-600 flex-shrink-0 ml-1"
        title={`Add ${label}`}
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    )}
  </div>
);

// ─── Main DocumentViewer ──────────────────────────────────────────────────────
const DocumentViewer = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [doc, setDoc] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Signature details modal
  const [showSigModal, setShowSigModal] = useState(false);
  const [editingFieldId, setEditingFieldId] = useState(null);
  const [signatureData, setSignatureData] = useState(null);

  // Ref to the overlay div that acts as the drag bounding container
  const overlayRef = useRef(null);

  const authUser = (() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; }
  })();

  useEffect(() => {
    let blobUrl = null;
    const fetchDoc = async () => {
      try {
        const [data, url] = await Promise.all([
          documentsApi.getDocument(id),
          documentsApi.getPdfBlob(id),
        ]);
        setDoc(data);
        blobUrl = url;
        setPdfUrl(url);
        if (data?.signatureFields?.length) {
          // Only restore signature fields from the DB — date fields must be
          // explicitly added by the user in the current session.
          setFields(data.signatureFields.filter((f) => f.type === 'signature'));
        }
      } catch {
        setError('Failed to load document.');
      } finally {
        setLoading(false);
      }
    };
    fetchDoc();
    return () => { if (blobUrl) URL.revokeObjectURL(blobUrl); };
  }, [id]);

  const canEdit = doc?.status === 'draft';

  // ── Field mutations ──────────────────────────────────────────────────────────

  const addField = useCallback((type, sigData) => {
    setFields((prev) => [
      ...prev,
      {
        id: uuidv4(),
        pageNumber,
        type,
        position: {
          x: 60,
          y: 60 + prev.filter((f) => f.pageNumber === pageNumber).length * 90,
        },
        width: 180,
        height: 60,
        signatureDataUrl: sigData?.signatureDataUrl || null,
        dateValue: null, // user must pick a date explicitly
      },
    ]);
  }, [pageNumber]);

  const removeField = useCallback((fieldId) => {
    setFields((prev) => prev.filter((f) => f.id !== fieldId));
  }, []);

  const handleFieldMove = useCallback((fieldId, newX, newY) => {
    setFields((prev) =>
      prev.map((f) =>
        f.id === fieldId
          ? { ...f, position: { x: Math.round(newX), y: Math.round(newY) } }
          : f
      )
    );
  }, []);

  const handleDateChange = useCallback((fieldId, newDate) => {
    setFields((prev) =>
      prev.map((f) => (f.id === fieldId ? { ...f, dateValue: newDate } : f))
    );
  }, []);

  // ── Signature modal ──────────────────────────────────────────────────────────

  const openSigModal = (fieldId = '__new__') => {
    setEditingFieldId(fieldId);
    setShowSigModal(true);
  };

  const handleSigApply = (sigData) => {
    setSignatureData(sigData);
    setShowSigModal(false);

    if (editingFieldId === '__new__') {
      addField('signature', sigData);
    } else if (editingFieldId) {
      setFields((prev) =>
        prev.map((f) =>
          f.id === editingFieldId ? { ...f, signatureDataUrl: sigData.signatureDataUrl } : f
        )
      );
    }
    setEditingFieldId(null);
  };

  // ── Sign & save ──────────────────────────────────────────────────────────────

  const handleSign = async () => {
    if (!signatureData && !fields.some((f) => f.signatureDataUrl)) {
      openSigModal('__new__');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await documentsApi.saveSignatureFields(id, fields);
      navigate('/documents');
    } catch {
      setError('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error && !doc) return <Alert type="error" message={error} />;

  const currentPageFields = fields.filter((f) => f.pageNumber === pageNumber);
  const sigField = fields.find((f) => f.type === 'signature');

  return (
    <div className="flex h-[calc(100vh-80px)] overflow-hidden bg-gray-100">

      {/* ── Left thumbnail strip ─────────────────────────────────────────────── */}
      <div className="w-20 bg-white border-r border-gray-200 overflow-y-auto flex flex-col items-center py-3 gap-2 flex-shrink-0">
        {pdfUrl &&
          Array.from({ length: numPages || 1 }, (_, i) => i + 1).map((pg) => (
            <button
              key={pg}
              onClick={() => setPageNumber(pg)}
              className={`w-14 rounded border transition-all duration-150 overflow-hidden ${pageNumber === pg
                ? 'border-red-500 ring-2 ring-red-300'
                : 'border-gray-200 hover:border-gray-400'
                }`}
            >
              <Document file={pdfUrl} loading={null} error={null}>
                <Page
                  pageNumber={pg}
                  width={56}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                  loading={
                    <div
                      className="w-14 bg-gray-100 flex items-center justify-center text-xs text-gray-400"
                      style={{ height: 72 }}
                    >
                      {pg}
                    </div>
                  }
                />
              </Document>
              <div className="text-center text-xs text-gray-500 py-0.5">{pg}</div>
            </button>
          ))}
      </div>

      {/* ── Center PDF viewer ────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-auto flex flex-col items-center py-6 px-4">
        {error && <Alert type="error" message={error} className="mb-3 w-full max-w-2xl" />}

        {doc?.status !== 'draft' && (
          <Alert
            type="info"
            message={`This document has status "${doc?.status}" and cannot be edited.`}
            className="mb-3 w-full max-w-2xl"
          />
        )}

        {pdfUrl ? (
          /* Outer wrapper – position:relative so the overlay can be inset-0 */
          <div className="relative inline-block shadow-lg">
            <Document
              file={pdfUrl}
              onLoadSuccess={({ numPages }) => setNumPages(numPages)}
              loading={<div className="flex justify-center py-16"><Spinner /></div>}
              error={<p className="text-red-500 text-center py-8">Could not load PDF.</p>}
            >
              <Page
                pageNumber={pageNumber}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                className="block"
              />
            </Document>

            {/*
              Overlay div — ref passed to DraggableField as the bounding rectangle.
              pointer-events:none on the overlay so PDF scrolling isn't blocked;
              each field re-enables pointer events individually.
            */}
            <div
              ref={overlayRef}
              className="absolute inset-0"
              style={{ pointerEvents: 'none' }}
            >
              {currentPageFields.map((field) => (
                <div key={field.id} style={{ pointerEvents: 'auto' }}>
                  <DraggableField
                    field={field}
                    containerRef={overlayRef}
                    onMove={canEdit ? handleFieldMove : null}
                    onRemove={canEdit ? removeField : null}
                    onDateChange={canEdit ? handleDateChange : null}
                    canEdit={canEdit}
                  />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex justify-center py-16"><Spinner /></div>
        )}
      </div>

      {/* ── Right sidebar ────────────────────────────────────────────────────── */}
      <div className="w-60 bg-white border-l border-gray-200 flex flex-col flex-shrink-0">
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-3">

          {/* Signature */}
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Signature
          </p>
          <SidebarField
            icon={<PenSquare className="h-4 w-4 text-blue-600" />}
            label="Signature"
            previewUrl={sigField?.signatureDataUrl || signatureData?.signatureDataUrl}
            onAdd={canEdit ? () => openSigModal('__new__') : undefined}
            onEdit={canEdit ? () => openSigModal('__new__') : undefined}
          />

          {/* Optional fields — Date only */}
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mt-4">
            Optional fields
          </p>
          <SidebarField
            icon={<Calendar className="h-4 w-4 text-green-500" />}
            label="Date"
            onAdd={canEdit ? () => addField('date') : undefined}
          />
        </div>

        {/* Sign button */}
        <div className="px-3 pb-4">
          <button
            onClick={handleSign}
            disabled={saving || !canEdit}
            className={`w-full py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all duration-200 shadow-sm ${saving || !canEdit
              ? 'bg-red-300 cursor-not-allowed'
              : 'bg-red-400 hover:bg-red-500'
              }`}
          >
            {saving ? (
              <Spinner size="sm" />
            ) : (
              <>
                Sign <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Signature Details Modal ───────────────────────────────────────────── */}
      <SignatureDetailsModal
        isOpen={showSigModal}
        onClose={() => { setShowSigModal(false); setEditingFieldId(null); }}
        onApply={handleSigApply}
        initialFullName={signatureData?.fullName || authUser?.name || ''}
        initialInitials={
          signatureData?.initials ||
          (authUser?.name || '').split(' ').map((n) => n[0]).join('').toUpperCase()
        }
      />
    </div>
  );
};

export default DocumentViewer;