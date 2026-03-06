import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Document, Page } from 'react-pdf';
import '../../utils/pdfWorker';
import SignatureCanvas from 'react-signature-canvas';
import { signApi } from '../../api/sign';
import Spinner from '../../components/ui/Spinner';
import {
  PenLine, XCircle, CheckCircle, FileCheck, GripVertical,
  ChevronLeft, ChevronRight, AlertCircle, Type, PenSquare, Upload, RotateCcw, X,
} from 'lucide-react';

/* ─── Constants ───────────────────────────────────────────────────────────── */
const FONTS = [
  { name: 'Pacifico', style: { fontFamily: "'Pacifico', cursive", fontSize: '26px' } },
  { name: 'Dancing Script', style: { fontFamily: "'Dancing Script', cursive", fontSize: '26px' } },
  { name: 'Great Vibes', style: { fontFamily: "'Great Vibes', cursive", fontSize: '30px' } },
  { name: 'Satisfy', style: { fontFamily: "'Satisfy', cursive", fontSize: '26px' } },
];
const COLORS = [
  { hex: '#1a1a1a', label: 'Black' },
  { hex: '#dc2626', label: 'Red' },
  { hex: '#2563eb', label: 'Blue' },
  { hex: '#16a34a', label: 'Green' },
];

let fontsLoaded = false;
const loadFonts = () => {
  if (fontsLoaded) return;
  fontsLoaded = true;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Pacifico&family=Dancing+Script:wght@700&family=Great+Vibes&family=Satisfy&display=swap';
  document.head.appendChild(link);
};

/* ─── Success Screen ──────────────────────────────────────────────────────── */
const SuccessScreen = ({ message, isRejected }) => (
  <div style={{
    minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: isRejected ? 'linear-gradient(135deg,#fef2f2,#fee2e2)' : 'linear-gradient(135deg,#eef2ff,#ede9fe)',
    fontFamily: "'Inter',sans-serif",
  }}>
    <div style={{
      background: '#fff', borderRadius: '24px', padding: '3rem 2.5rem',
      boxShadow: '0 8px 48px rgba(0,0,0,0.1)', textAlign: 'center', maxWidth: '460px', width: '90%',
    }}>
      <div style={{
        width: '80px', height: '80px', borderRadius: '50%', margin: '0 auto 1.5rem',
        background: isRejected ? '#fef2f2' : 'linear-gradient(135deg,#6366f1,#8b5cf6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: isRejected ? 'none' : '0 8px 24px rgba(99,102,241,0.35)',
      }}>
        {isRejected ? <XCircle size={38} color="#ef4444" /> : <CheckCircle size={38} color="#fff" />}
      </div>
      {!isRejected && <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '1.5px', margin: '0 0 0.5rem' }}>DigiSign</p>}
      <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.6rem' }}>
        {isRejected ? 'Document Rejected' : 'Document Signature Completed'}
      </h2>
      <p style={{ color: '#64748b', lineHeight: 1.7, margin: 0, fontSize: '0.92rem' }}>{message}</p>
      {!isRejected && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1.75rem 0' }}>
            <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500 }}>✓ Legally Binding</span>
            <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
          </div>
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <CheckCircle size={16} color="#22c55e" />
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#15803d' }}>Signed &amp; recorded successfully</span>
          </div>
        </>
      )}
    </div>
  </div>
);

/* ─── Error Screen ────────────────────────────────────────────────────────── */
const ErrorScreen = ({ message }) => (
  <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', fontFamily: "'Inter',sans-serif" }}>
    <div style={{ background: '#fff', borderRadius: '20px', padding: '2.5rem', boxShadow: '0 4px 32px rgba(0,0,0,0.08)', textAlign: 'center', maxWidth: '400px', width: '90%' }}>
      <XCircle size={48} color="#ef4444" style={{ margin: '0 auto 1rem' }} />
      <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem' }}>Invalid Link</h2>
      <p style={{ color: '#64748b', margin: '0 0 1.5rem', fontSize: '0.9rem' }}>{message}</p>
      <button onClick={() => window.location.href = '/'} style={{ padding: '0.7rem 1.75rem', borderRadius: '10px', border: 'none', background: '#6366f1', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Go to Homepage</button>
    </div>
  </div>
);

/* ─── Reject Modal ────────────────────────────────────────────────────────── */
const RejectModal = ({ onConfirm, onCancel, submitting }) => {
  const [reason, setReason] = useState('');
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter',sans-serif" }}>
      <div style={{ background: '#fff', borderRadius: '20px', padding: '2rem', width: '90%', maxWidth: '420px', boxShadow: '0 8px 40px rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div style={{ background: '#fef2f2', borderRadius: '10px', padding: '8px' }}><AlertCircle size={20} color="#ef4444" /></div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Reject Document</h3>
        </div>
        <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1rem' }}>Are you sure? The sender will be notified.</p>
        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '0.4rem' }}>Reason (optional)</label>
        <textarea value={reason} onChange={e => setReason(e.target.value)} placeholder="Enter reason…" rows={3}
          style={{ width: '100%', padding: '0.7rem 0.9rem', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '0.875rem', resize: 'vertical', outline: 'none', boxSizing: 'border-box', color: '#1e293b', background: '#f8fafc' }} />
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', justifyContent: 'flex-end' }}>
          <button onClick={onCancel} disabled={submitting} style={{ padding: '0.65rem 1.25rem', borderRadius: '9px', border: '1.5px solid #e2e8f0', background: '#fff', color: '#374151', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}>Cancel</button>
          <button onClick={() => onConfirm(reason)} disabled={submitting} style={{ padding: '0.65rem 1.25rem', borderRadius: '9px', border: 'none', background: '#ef4444', color: '#fff', fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer', fontSize: '0.875rem', opacity: submitting ? 0.7 : 1 }}>
            {submitting ? 'Rejecting…' : 'Confirm Rejection'}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── Draggable Placed Signature Field ───────────────────────────────────── */
const PlacedField = ({ field, sigDataUrl, onMove, onRemove, containerRef }) => {
  const ref = useRef(null);
  const dragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMouseDown = (e) => {
      if (e.target.tagName === 'BUTTON') return;
      e.preventDefault();
      dragging.current = true;
      const r = el.getBoundingClientRect();
      offset.current = { x: e.clientX - r.left, y: e.clientY - r.top };
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    };
    const onMouseMove = (e) => {
      if (!dragging.current) return;
      const container = containerRef?.current;
      if (!container) return;
      const pr = container.getBoundingClientRect();
      const newX = Math.max(0, Math.min(e.clientX - pr.left - offset.current.x, pr.width - el.offsetWidth));
      const newY = Math.max(0, Math.min(e.clientY - pr.top - offset.current.y, pr.height - el.offsetHeight));
      onMove(newX, newY);
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
  }, [onMove, containerRef]);

  return (
    <div ref={ref} style={{
      position: 'absolute', left: field.x, top: field.y, zIndex: 10,
      userSelect: 'none', cursor: 'move', minWidth: '160px',
      border: '2px solid #6366f1', borderRadius: '8px', background: '#fff',
      boxShadow: '0 2px 12px rgba(99,102,241,0.25)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 8px', borderBottom: sigDataUrl ? '1px solid #e2e8f0' : 'none' }}>
        <GripVertical size={12} color="#94a3b8" />
        <PenSquare size={11} color="#6366f1" />
        <span style={{ fontSize: '11px', fontWeight: 700, color: '#4338ca', flex: 1 }}>Signature</span>
        <button onMouseDown={e => e.stopPropagation()} onClick={e => { e.stopPropagation(); onRemove(); }}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '1px', display: 'flex' }}>
          <X size={11} color="#ef4444" />
        </button>
      </div>
      {sigDataUrl
        ? <div style={{ padding: '4px 8px 6px' }}><img src={sigDataUrl} alt="sig" style={{ height: '32px', objectFit: 'contain', display: 'block' }} /></div>
        : <div style={{ padding: '6px 10px', fontSize: '10px', color: '#a5b4fc', fontStyle: 'italic' }}>Draw/type your signature →</div>
      }
    </div>
  );
};

/* ─── Signature Creation Panel ────────────────────────────────────────────── */
const SignaturePanel = ({ signerName, onChange }) => {
  const [sideMode, setSideMode] = useState('type');
  const [selectedFont, setSelectedFont] = useState(0);
  const [selectedColor, setSelectedColor] = useState(0);
  const [displayName, setDisplayName] = useState(signerName || '');
  const [uploadedImage, setUploadedImage] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const drawRef = useRef(null);
  const fileRef = useRef(null);

  // Notify parent with latest data URL
  const notify = useCallback(() => {
    setTimeout(() => {
      let url = null;
      if (sideMode === 'type') {
        const canvas = document.createElement('canvas');
        canvas.width = 480; canvas.height = 120;
        const ctx = canvas.getContext('2d');
        const font = FONTS[selectedFont];
        ctx.font = `${font.style.fontSize} ${font.style.fontFamily}`;
        ctx.fillStyle = COLORS[selectedColor].hex;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(displayName || signerName || 'Signature', 240, 60);
        url = canvas.toDataURL('image/png');
      } else if (sideMode === 'draw') {
        if (drawRef.current && !drawRef.current.isEmpty()) url = drawRef.current.toDataURL('image/png');
      } else if (sideMode === 'upload') {
        url = uploadedImage;
      }
      onChange(url);
    }, 50);
  }, [sideMode, selectedFont, selectedColor, displayName, uploadedImage, signerName, onChange]);

  useEffect(() => { notify(); }, [sideMode, selectedFont, selectedColor, displayName, uploadedImage]);

  const handleFileChange = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => { setUploadedImage(e.target.result); };
    reader.readAsDataURL(file);
  };

  const handleDrop = useCallback(e => {
    e.preventDefault(); setDragOver(false);
    handleFileChange(e.dataTransfer.files[0]);
  }, []);

  const clearDraw = () => { drawRef.current?.clear(); onChange(null); };

  const modeBtn = (mode, Icon, title) => (
    <button onClick={() => setSideMode(mode)} title={title}
      style={{ width: '30px', height: '30px', borderRadius: '7px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', background: sideMode === mode ? '#ede9fe' : 'transparent', color: sideMode === mode ? '#7c3aed' : '#94a3b8', transition: 'all 0.15s' }}>
      <Icon size={14} />
    </button>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
      {sideMode === 'type' && (
        <div>
          <label style={{ fontSize: '0.68rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '0.25rem' }}>Name</label>
          <input value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder={signerName || 'Your name'}
            style={{ width: '100%', padding: '0.5rem 0.7rem', boxSizing: 'border-box', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '0.83rem', color: '#1e293b', background: '#f8fafc', outline: 'none' }}
            onFocus={e => e.target.style.borderColor = '#6366f1'} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
        </div>
      )}
      <div style={{ display: 'flex', gap: '7px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '9px', padding: '3px', alignItems: 'center' }}>
          {modeBtn('type', Type, 'Type')}
          {modeBtn('draw', PenSquare, 'Draw')}
          {modeBtn('upload', Upload, 'Upload')}
        </div>
        <div style={{ flex: 1, border: '1.5px solid #e2e8f0', borderRadius: '9px', overflow: 'hidden', minHeight: '150px', background: '#fff' }}>
          {/* TYPE */}
          {sideMode === 'type' && (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{ flex: 1, overflowY: 'auto' }}>
                {FONTS.map((font, idx) => (
                  <label key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '7px 10px', cursor: 'pointer', background: selectedFont === idx ? '#ede9fe' : 'transparent', borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s' }}>
                    <input type="radio" name="pubSigFont" checked={selectedFont === idx} onChange={() => setSelectedFont(idx)} style={{ accentColor: '#7c3aed', flexShrink: 0 }} />
                    <span style={{ fontFamily: font.style.fontFamily, fontSize: font.style.fontSize, color: COLORS[selectedColor].hex, lineHeight: 1.2 }}>
                      {displayName || signerName || 'Your Signature'}
                    </span>
                  </label>
                ))}
              </div>
              <div style={{ padding: '6px 10px', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Color:</span>
                {COLORS.map((c, idx) => (
                  <button key={idx} onClick={() => setSelectedColor(idx)} title={c.label}
                    style={{ width: '18px', height: '18px', borderRadius: '50%', border: 'none', background: c.hex, cursor: 'pointer', outline: selectedColor === idx ? `3px solid ${c.hex}` : 'none', outlineOffset: '2px' }} />
                ))}
              </div>
            </div>
          )}
          {/* DRAW */}
          {sideMode === 'draw' && (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ position: 'relative' }}>
                <SignatureCanvas ref={drawRef} penColor={COLORS[selectedColor].hex}
                  onEnd={notify}
                  canvasProps={{ width: 216, height: 130, style: { touchAction: 'none', cursor: 'crosshair', display: 'block' } }} />
                <div style={{ position: 'absolute', bottom: '18px', left: '14px', right: '14px', borderBottom: '1px dashed #e2e8f0', pointerEvents: 'none' }} />
              </div>
              <div style={{ padding: '5px 8px', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>Color:</span>
                  {COLORS.map((c, idx) => (
                    <button key={idx} onClick={() => setSelectedColor(idx)} title={c.label}
                      style={{ width: '16px', height: '16px', borderRadius: '50%', border: 'none', background: c.hex, cursor: 'pointer', outline: selectedColor === idx ? `3px solid ${c.hex}` : 'none', outlineOffset: '2px' }} />
                  ))}
                </div>
                <button onClick={clearDraw} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.7rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '2px' }}>
                  <RotateCcw size={10} /> Clear
                </button>
              </div>
            </div>
          )}
          {/* UPLOAD */}
          {sideMode === 'upload' && (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px', background: dragOver ? '#f5f3ff' : '#fafbff', transition: 'background 0.2s' }}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={handleDrop}>
              {uploadedImage
                ? <div style={{ textAlign: 'center' }}>
                  <img src={uploadedImage} alt="Sig" style={{ maxHeight: '70px', maxWidth: '100%', objectFit: 'contain', borderRadius: '6px', border: '1px solid #e2e8f0', padding: '4px' }} />
                  <button onClick={() => { setUploadedImage(null); onChange(null); }} style={{ display: 'block', margin: '5px auto 0', background: 'none', border: 'none', color: '#ef4444', fontSize: '0.72rem', cursor: 'pointer' }}>Remove</button>
                </div>
                : <>
                  <button onClick={() => fileRef.current?.click()} style={{ border: '2px solid #7c3aed', borderRadius: '18px', padding: '5px 14px', background: 'none', color: '#7c3aed', fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer' }}>Upload</button>
                  <p style={{ color: '#94a3b8', fontSize: '0.72rem', margin: 0 }}>or drop PNG/JPG/SVG</p>
                </>
              }
              <input ref={fileRef} type="file" accept=".png,.jpg,.jpeg,.svg" style={{ display: 'none' }} onChange={e => handleFileChange(e.target.files[0])} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ─── Main PublicSign ─────────────────────────────────────────────────────── */
const PublicSign = () => {
  const { token } = useParams();

  const [docInfo, setDocInfo] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isRejected, setIsRejected] = useState(false);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [showRejectModal, setShowRejectModal] = useState(false);

  // Placed field state
  const [placedField, setPlacedField] = useState(null);   // { x, y } in px relative to pdfOverlay
  const [sigDataUrl, setSigDataUrl] = useState(null);

  // Refs for drag-to-place
  const pdfOverlayRef = useRef(null);  // the absolute overlay on top of the PDF
  const dragOffsetRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    loadFonts();
    let blobUrl = null;
    const fetch = async () => {
      try {
        const [data, url] = await Promise.all([
          signApi.getDocumentByToken(token),
          signApi.getPdfBlob(token),
        ]);
        setDocInfo(data);
        setPdfUrl(url);
        blobUrl = url;
      } catch {
        setError('Invalid or expired signing link. Please contact the document owner.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
    return () => { if (blobUrl) URL.revokeObjectURL(blobUrl); };
  }, [token]);

  // ── Drag from sidebar ──────────────────────────────────────────────────────
  const handleSidebarDragStart = (e) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', 'signature-field');
    dragOffsetRef.current = { x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY };
  };

  const handlePdfDragOver = (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; };

  const handlePdfDrop = (e) => {
    e.preventDefault();
    const overlay = pdfOverlayRef.current;
    if (!overlay) return;
    const or = overlay.getBoundingClientRect();
    const x = e.clientX - or.left - dragOffsetRef.current.x;
    const y = e.clientY - or.top - dragOffsetRef.current.y;
    setPlacedField({ x: Math.max(0, x), y: Math.max(0, y) });
  };

  const handleFieldMove = (newX, newY) => {
    setPlacedField({ x: newX, y: newY });
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSign = async () => {
    if (!sigDataUrl) {
      setError('Please create your signature (type, draw, or upload) in the sidebar.');
      return;
    }
    if (!placedField) {
      setError('Please drag the "Signature" item from the sidebar onto the document to place it.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const overlay = pdfOverlayRef.current;
      const containerW = overlay?.clientWidth || 580;
      const containerH = overlay?.clientHeight || 800;

      const position = {
        pageNumber,
        x: Math.round((placedField.x / containerW) * 595),   // normalise to PDF pts
        y: Math.round((placedField.y / containerH) * 842),
        width: 180,
        height: 60,
      };

      await signApi.signDocument(token, {
        signatureData: sigDataUrl,
        position,
        signatureType: 'draw',
        name: docInfo?.signer?.name || docInfo?.signer?.email || '',
      });
      setSuccessMessage('Your signature has been submitted successfully. The document owner has been notified.');
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit signature. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async (reason) => {
    setSubmitting(true);
    setError('');
    try {
      await signApi.rejectDocument(token, reason);
      setIsRejected(true);
      setSuccessMessage('You have rejected this document. The sender has been notified.');
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject document.');
    } finally {
      setSubmitting(false);
      setShowRejectModal(false);
    }
  };

  /* ── Loading / Error / Success states ──────────────────────────────────── */
  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9' }}>
      <div style={{ textAlign: 'center', fontFamily: "'Inter',sans-serif" }}>
        <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', animation: 'spin 1s linear infinite' }}>
          <PenLine size={24} color="#fff" />
        </div>
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Loading document…</p>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
    </div>
  );
  if (error && !docInfo) return <ErrorScreen message={error} />;
  if (success) return <SuccessScreen message={successMessage} isRejected={isRejected} />;

  const doc = docInfo?.document;
  const signer = docInfo?.signer;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', fontFamily: "'Inter',sans-serif", background: '#f1f5f9' }}>

      {/* ── Top bar ─────────────────────────────────────────────────────────── */}
      <div style={{ height: '56px', flexShrink: 0, background: '#fff', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', borderRadius: '8px', padding: '6px' }}><PenLine size={16} color="#fff" /></div>
          <span style={{ fontWeight: 800, fontSize: '1rem', color: '#1e1b4b' }}>Digi<span style={{ color: '#6366f1' }}>Sign</span></span>
        </div>
        <div style={{ textAlign: 'center' }}>
          <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem', color: '#1e293b' }}>{doc?.title || 'Document'}</p>
          {signer?.name && <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8' }}>Signing as <strong style={{ color: '#6366f1' }}>{signer.name}</strong>{signer.email ? ` · ${signer.email}` : ''}</p>}
        </div>
        <div style={{ padding: '0.3rem 0.8rem', borderRadius: '20px', background: signer?.signed ? '#dcfce7' : '#ede9fe', color: signer?.signed ? '#16a34a' : '#7c3aed', fontSize: '0.75rem', fontWeight: 700 }}>
          {signer?.signed ? '✓ Already Signed' : '⏳ Pending Signature'}
        </div>
      </div>

      {/* ── Body ────────────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* Thumbnail strip */}
        <div style={{ width: '72px', flexShrink: 0, background: '#fff', borderRight: '1px solid #e2e8f0', overflowY: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px 0', gap: '7px' }}>
          {pdfUrl && Array.from({ length: numPages || 1 }, (_, i) => i + 1).map(pg => (
            <button key={pg} onClick={() => setPageNumber(pg)}
              style={{ border: pageNumber === pg ? '2px solid #6366f1' : '2px solid #e2e8f0', borderRadius: '5px', overflow: 'hidden', cursor: 'pointer', background: 'none', padding: 0, boxShadow: pageNumber === pg ? '0 0 0 3px rgba(99,102,241,0.2)' : 'none', transition: 'all 0.15s' }}>
              <Document file={pdfUrl} loading={null} error={null}>
                <Page pageNumber={pg} width={48} renderTextLayer={false} renderAnnotationLayer={false}
                  loading={<div style={{ width: 48, height: 64, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#94a3b8' }}>{pg}</div>} />
              </Document>
              <div style={{ textAlign: 'center', fontSize: '10px', color: pageNumber === pg ? '#6366f1' : '#94a3b8', fontWeight: 600, padding: '2px 0' }}>{pg}</div>
            </button>
          ))}
        </div>

        {/* PDF viewer (drop zone) */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 16px', gap: '14px' }}>
          {signer?.signed && (
            <div style={{ width: '100%', maxWidth: '600px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '12px', padding: '0.7rem 1rem', display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', color: '#92400e', fontWeight: 500 }}>
              <AlertCircle size={15} color="#d97706" /> You have already signed this document.
            </div>
          )}
          {error && (
            <div style={{ width: '100%', maxWidth: '600px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '0.7rem 1rem', display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', color: '#dc2626', fontWeight: 500 }}>
              <AlertCircle size={15} color="#ef4444" /> {error}
            </div>
          )}

          {pdfUrl ? (
            <div
              onDragOver={handlePdfDragOver}
              onDrop={handlePdfDrop}
              style={{ position: 'relative', boxShadow: '0 4px 24px rgba(0,0,0,0.12)', borderRadius: '4px', overflow: 'hidden' }}
            >
              <Document file={pdfUrl} onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                loading={<div style={{ padding: '4rem', color: '#94a3b8' }}>Loading PDF…</div>}
                error={<p style={{ color: '#ef4444', padding: '2rem', textAlign: 'center' }}>Failed to load PDF.</p>}>
                <Page pageNumber={pageNumber} width={580} renderTextLayer={false} renderAnnotationLayer={false} />
              </Document>

              {/* Overlay for drop + placed field */}
              <div ref={pdfOverlayRef} style={{ position: 'absolute', inset: 0, zIndex: 5 }}>
                {placedField && (
                  <PlacedField
                    field={placedField}
                    sigDataUrl={sigDataUrl}
                    onMove={handleFieldMove}
                    onRemove={() => setPlacedField(null)}
                    containerRef={pdfOverlayRef}
                  />
                )}
              </div>
            </div>
          ) : <Spinner size="lg" />}

          {numPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.4rem 0.75rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <button onClick={() => setPageNumber(p => Math.max(1, p - 1))} disabled={pageNumber <= 1}
                style={{ border: 'none', background: 'none', cursor: pageNumber <= 1 ? 'not-allowed' : 'pointer', color: pageNumber <= 1 ? '#cbd5e1' : '#6366f1', display: 'flex' }}>
                <ChevronLeft size={18} />
              </button>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Page {pageNumber} / {numPages}</span>
              <button onClick={() => setPageNumber(p => Math.min(numPages, p + 1))} disabled={pageNumber >= numPages}
                style={{ border: 'none', background: 'none', cursor: pageNumber >= numPages ? 'not-allowed' : 'pointer', color: pageNumber >= numPages ? '#cbd5e1' : '#6366f1', display: 'flex' }}>
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>

        {/* ── Right sidebar ────────────────────────────────────────────────── */}
        <div style={{ width: '300px', flexShrink: 0, background: '#fff', borderLeft: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>

            {/* Signer info */}
            <div style={{ background: 'linear-gradient(135deg,#eef2ff,#ede9fe)', borderRadius: '12px', padding: '0.75rem 0.9rem', marginBottom: '0.9rem' }}>
              <p style={{ margin: '0 0 0.1rem', fontSize: '0.65rem', fontWeight: 700, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Signing as</p>
              <p style={{ margin: 0, fontWeight: 700, color: '#1e1b4b', fontSize: '0.85rem' }}>{signer?.name || 'Guest'}</p>
              {signer?.email && <p style={{ margin: 0, fontSize: '0.7rem', color: '#7c3aed' }}>{signer.email}</p>}
            </div>

            {/* Document */}
            <div style={{ marginBottom: '0.9rem' }}>
              <p style={{ margin: '0 0 0.35rem', fontSize: '0.65rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Document</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', background: '#f8fafc', borderRadius: '9px', padding: '0.6rem 0.7rem', border: '1px solid #e2e8f0' }}>
                <FileCheck size={14} color="#6366f1" style={{ flexShrink: 0 }} />
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#1e293b' }}>{doc?.title || 'Untitled'}</span>
              </div>
            </div>

            {!signer?.signed ? (
              <>
                {/* ── SIGNATURE section (draggable item) ── */}
                <p style={{ margin: '0 0 0.35rem', fontSize: '0.65rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Signature</p>
                <div
                  draggable
                  onDragStart={handleSidebarDragStart}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    border: '1.5px solid #c7d2fe', borderRadius: '10px', padding: '0.6rem 0.8rem',
                    background: placedField ? '#f0fdf4' : '#eef2ff',
                    cursor: 'grab', marginBottom: '1rem',
                    transition: 'border-color 0.2s',
                  }}
                  onMouseOver={e => e.currentTarget.style.borderColor = '#6366f1'}
                  onMouseOut={e => e.currentTarget.style.borderColor = '#c7d2fe'}
                >
                  <GripVertical size={14} color="#94a3b8" />
                  <PenSquare size={14} color="#6366f1" />
                  {sigDataUrl
                    ? <img src={sigDataUrl} alt="sig preview" style={{ height: '24px', flex: 1, objectFit: 'contain' }} />
                    : <span style={{ fontSize: '0.83rem', fontWeight: 600, color: '#4338ca', flex: 1 }}>Signature</span>
                  }
                  {placedField
                    ? <span style={{ fontSize: '10px', color: '#16a34a', fontWeight: 700 }}>✓ Placed</span>
                    : <span style={{ fontSize: '10px', color: '#a5b4fc' }}>drag →</span>
                  }
                </div>

                {/* ── YOUR SIGNATURE creation ── */}
                <p style={{ margin: '0 0 0.35rem', fontSize: '0.65rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Your Signature</p>
                <SignaturePanel signerName={signer?.name || ''} onChange={setSigDataUrl} />
              </>
            ) : (
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '1rem', textAlign: 'center' }}>
                <CheckCircle size={26} color="#22c55e" style={{ margin: '0 auto 0.5rem' }} />
                <p style={{ margin: 0, fontWeight: 700, color: '#15803d', fontSize: '0.88rem' }}>Already Signed</p>
              </div>
            )}
          </div>

          {/* Buttons */}
          {!signer?.signed && (
            <div style={{ padding: '0.85rem', borderTop: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button onClick={handleSign} disabled={submitting} style={{
                width: '100%', padding: '0.8rem', borderRadius: '12px', border: 'none',
                background: submitting ? '#a5b4fc' : 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                color: '#fff', fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer',
                fontSize: '0.88rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                boxShadow: submitting ? 'none' : '0 4px 14px rgba(99,102,241,0.4)', transition: 'all 0.2s',
              }}>
                <PenLine size={15} /> {submitting ? 'Submitting…' : 'Sign Document'}
              </button>
              <button onClick={() => setShowRejectModal(true)} disabled={submitting}
                style={{ width: '100%', padding: '0.6rem', borderRadius: '10px', border: '1.5px solid #fecaca', background: '#fff', color: '#ef4444', fontWeight: 600, cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                onMouseOver={e => e.currentTarget.style.background = '#fef2f2'}
                onMouseOut={e => e.currentTarget.style.background = '#fff'}>
                <XCircle size={13} /> Reject Document
              </button>
            </div>
          )}
        </div>
      </div>

      {showRejectModal && <RejectModal onConfirm={handleReject} onCancel={() => setShowRejectModal(false)} submitting={submitting} />}
    </div>
  );
};

export default PublicSign;