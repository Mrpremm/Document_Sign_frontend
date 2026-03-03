import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Type, PenSquare, Upload, RotateCcw } from 'lucide-react';
import SignatureCanvas from 'react-signature-canvas';

/**
 * Signature Details Modal
 * Tabs: Signature | Initials | Company Stamp
 * Left sidebar: Type (T), Draw (pen), Upload (arrow-up)
 *
 * Props:
 *  - isOpen: boolean
 *  - onClose: () => void
 *  - onApply: (signatureData) => void
 *    signatureData = { fullName, initials, signatureDataUrl, color, mode }
 *  - initialFullName: string
 *  - initialInitials: string
 */

const FONTS = [
  { name: 'Pacifico', style: { fontFamily: "'Pacifico', cursive", fontSize: '28px' } },
  { name: 'Dancing Script', style: { fontFamily: "'Dancing Script', cursive", fontSize: '28px' } },
  { name: 'Great Vibes', style: { fontFamily: "'Great Vibes', cursive", fontSize: '32px' } },
  { name: 'Satisfy', style: { fontFamily: "'Satisfy', cursive", fontSize: '28px' } },
];

const COLORS = [
  { hex: '#1a1a1a', label: 'Black' },
  { hex: '#dc2626', label: 'Red' },
  { hex: '#2563eb', label: 'Blue' },
  { hex: '#16a34a', label: 'Green' },
];

// Load Google Fonts once
let fontsLoaded = false;
const loadFonts = () => {
  if (fontsLoaded) return;
  fontsLoaded = true;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href =
    'https://fonts.googleapis.com/css2?family=Pacifico&family=Dancing+Script:wght@700&family=Great+Vibes&family=Satisfy&display=swap';
  document.head.appendChild(link);
};

const SignatureDetailsModal = ({
  isOpen,
  onClose,
  onApply,
  initialFullName = '',
  initialInitials = '',
}) => {
  const [fullName, setFullName] = useState(initialFullName);
  const [initials, setInitials] = useState(initialInitials);
  const [activeTab, setActiveTab] = useState('signature'); // 'signature' | 'initials' | 'stamp'
  const [sideMode, setSideMode] = useState('type'); // 'type' | 'draw' | 'upload'
  const [selectedFont, setSelectedFont] = useState(0);
  const [selectedColor, setSelectedColor] = useState(0);
  const [uploadedImageUrl, setUploadedImageUrl] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  const drawRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      loadFonts();
      setFullName(initialFullName);
      setInitials(initialInitials);
    }
  }, [isOpen, initialFullName, initialInitials]);

  const clearDraw = () => drawRef.current?.clear();

  const handleFileChange = (file) => {
    if (!file) return;
    if (!['image/png', 'image/jpeg', 'image/svg+xml'].includes(file.type)) return;
    const reader = new FileReader();
    reader.onload = (e) => setUploadedImageUrl(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFileChange(file);
  }, []);

  const handleApply = () => {
    let signatureDataUrl = null;

    if (sideMode === 'type') {
      // Render selected font signature to a canvas
      const displayName = activeTab === 'initials' ? initials : fullName;
      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 100;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = 'transparent';
      const font = FONTS[selectedFont];
      ctx.font = `${font.style.fontSize} ${font.style.fontFamily}`;
      ctx.fillStyle = COLORS[selectedColor].hex;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(displayName, 200, 50);
      signatureDataUrl = canvas.toDataURL('image/png');
    } else if (sideMode === 'draw') {
      if (!drawRef.current || drawRef.current.isEmpty()) return;
      signatureDataUrl = drawRef.current.toDataURL('image/png');
    } else if (sideMode === 'upload') {
      signatureDataUrl = uploadedImageUrl;
    }

    onApply({
      fullName,
      initials,
      signatureDataUrl,
      color: COLORS[selectedColor].hex,
      font: FONTS[selectedFont].name,
      mode: sideMode,
      tab: activeTab,
    });
  };

  if (!isOpen) return null;

  const displayText = activeTab === 'initials' ? initials : fullName;

  const tabs = [
    { key: 'signature', icon: '✒️', label: 'Signature' },
    { key: 'initials', icon: 'AC', label: 'Initials' },
    { key: 'stamp', icon: '🏢', label: 'Company Stamp' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 overflow-y-auto">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-gray-700 bg-opacity-60" onClick={onClose} />

      {/* Panel */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl z-10 my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-8 pt-7 pb-5 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900">Set your signature details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-8 py-5">
          {/* Name fields row */}
          <div className="flex gap-6 mb-6 items-start">
            {/* Avatar placeholder */}
            <div className="mt-6 w-10 h-10 rounded-full border-2 border-red-400 flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
              </svg>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Full name:</label>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-red-400 text-gray-800 text-sm transition-colors"
                placeholder="Your full name"
              />
            </div>
            <div className="w-40">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Initials:</label>
              <input
                value={initials}
                onChange={(e) => setInitials(e.target.value)}
                className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-red-400 text-gray-800 text-sm transition-colors"
                placeholder="e.g. PP"
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 mb-5">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-5 py-2.5 text-sm font-medium border-b-2 transition-colors duration-150 ${activeTab === tab.key
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
              >
                <span className="text-base">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Body: sidebar + content */}
          <div className="flex gap-4 min-h-[260px]">
            {/* Left sidebar mode switcher */}
            <div className="flex flex-col gap-1 bg-gray-50 border border-gray-200 rounded-xl p-2 w-12 flex-shrink-0">
              {/* Type mode */}
              <button
                onClick={() => setSideMode('type')}
                title="Type signature"
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${sideMode === 'type'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:bg-gray-200'
                  }`}
              >
                <Type className="h-4 w-4" />
              </button>

              {/* Draw mode */}
              <button
                onClick={() => setSideMode('draw')}
                title="Draw signature"
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${sideMode === 'draw'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:bg-gray-200'
                  }`}
              >
                <PenSquare className="h-4 w-4" />
              </button>

              {/* Upload mode */}
              <button
                onClick={() => setSideMode('upload')}
                title="Upload signature"
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${sideMode === 'upload'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:bg-gray-200'
                  }`}
              >
                <Upload className="h-4 w-4" />
              </button>
            </div>

            {/* Content area */}
            <div className="flex-1 border-2 border-gray-200 rounded-xl overflow-hidden">
              {/* ---- TYPE MODE ---- */}
              {sideMode === 'type' && (
                <div className="h-full flex flex-col">
                  {/* Font options */}
                  <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
                    {FONTS.map((font, idx) => (
                      <label
                        key={idx}
                        className={`flex items-center gap-4 px-4 py-3 cursor-pointer transition-colors ${selectedFont === idx ? 'bg-blue-50' : 'hover:bg-gray-50'
                          }`}
                      >
                        <input
                          type="radio"
                          name="sigFont"
                          checked={selectedFont === idx}
                          onChange={() => setSelectedFont(idx)}
                          className="accent-red-500"
                        />
                        <span
                          style={{
                            fontFamily: font.style.fontFamily,
                            fontSize: font.style.fontSize,
                            color: COLORS[selectedColor].hex,
                            lineHeight: 1.3,
                          }}
                        >
                          {displayText || 'Your Signature'}
                        </span>
                      </label>
                    ))}
                  </div>
                  {/* Color picker */}
                  <div className="px-4 py-3 border-t border-gray-100 flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-600">Color:</span>
                    {COLORS.map((c, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedColor(idx)}
                        title={c.label}
                        className={`w-6 h-6 rounded-full transition-all duration-150 ${selectedColor === idx ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : 'hover:scale-105'
                          }`}
                        style={{ backgroundColor: c.hex }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* ---- DRAW MODE ---- */}
              {sideMode === 'draw' && (
                <div className="h-full flex flex-col">
                  <div className="flex-1 relative bg-white">
                    <SignatureCanvas
                      ref={drawRef}
                      penColor={COLORS[selectedColor].hex}
                      canvasProps={{
                        className: 'w-full h-full cursor-crosshair',
                        style: { minHeight: '200px' },
                      }}
                    />
                    {/* Baseline */}
                    <div
                      className="absolute bottom-10 left-8 right-8 border-b border-dashed border-gray-300 pointer-events-none"
                    />
                  </div>
                  <div className="px-4 py-2 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-600">Color:</span>
                      {COLORS.map((c, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedColor(idx)}
                          title={c.label}
                          className={`w-5 h-5 rounded-full transition-all ${selectedColor === idx ? 'ring-2 ring-offset-1 ring-gray-400 scale-110' : 'hover:scale-105'
                            }`}
                          style={{ backgroundColor: c.hex }}
                        />
                      ))}
                    </div>
                    <button
                      onClick={clearDraw}
                      className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-500 transition-colors"
                    >
                      <RotateCcw className="h-3 w-3" /> Clear
                    </button>
                  </div>
                </div>
              )}

              {/* ---- UPLOAD MODE ---- */}
              {sideMode === 'upload' && (
                <div
                  className={`h-full flex flex-col items-center justify-center gap-4 p-8 transition-colors ${dragOver ? 'bg-red-50 border-red-300' : 'bg-gray-50'
                    }`}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                >
                  {uploadedImageUrl ? (
                    <div className="flex flex-col items-center gap-3">
                      <img
                        src={uploadedImageUrl}
                        alt="Uploaded signature"
                        className="max-h-24 max-w-full object-contain border border-gray-200 rounded-lg p-2"
                      />
                      <button
                        onClick={() => setUploadedImageUrl(null)}
                        className="text-xs text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-red-500 text-red-600 rounded-full px-6 py-2 text-sm font-semibold hover:bg-red-50 transition-colors"
                      >
                        Upload signature
                      </button>
                      <p className="text-sm text-gray-500">or drop file here</p>
                      <p className="text-xs text-gray-400">
                        Accepted formats: <strong>PNG, JPG</strong> and <strong>SVG</strong>
                      </p>
                    </>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".png,.jpg,.jpeg,.svg"
                    className="hidden"
                    onChange={(e) => handleFileChange(e.target.files[0])}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-4 px-8 py-5 border-t border-gray-100">
          <button
            onClick={onClose}
            className="text-red-500 font-semibold hover:text-red-700 underline underline-offset-2 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold px-8 py-2.5 rounded-xl transition-colors shadow-sm"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignatureDetailsModal;
