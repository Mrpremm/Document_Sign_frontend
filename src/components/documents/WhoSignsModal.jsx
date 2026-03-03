import React from 'react';
import { X } from 'lucide-react';

/**
 * Modal shown after upload asking "Who will sign this document?"
 * Props:
 *  - isOpen: boolean
 *  - onClose: () => void
 *  - fileName: string
 *  - onOnlyMe: () => void
 *  - onSeveralPeople: () => void
 */
const WhoSignsModal = ({ isOpen, onClose, fileName, onOnlyMe, onSeveralPeople }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-gray-700 bg-opacity-60"
        onClick={onClose}
      />

      {/* Modal panel */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl p-8 z-10">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Title */}
        <h2 className="text-xl font-bold text-gray-900 text-center mb-6">
          Who will sign this document?
        </h2>

        {/* Cards */}
        <div className="grid grid-cols-2 gap-4">
          {/* Only Me */}
          <button
            onClick={onOnlyMe}
            className="group flex flex-col items-center gap-4 p-6 rounded-xl border-2 border-gray-100 bg-gray-50 hover:border-red-400 hover:bg-red-50 transition-all duration-200"
          >
            {/* Illustration */}
            <div className="w-28 h-28 flex items-center justify-center">
              <svg viewBox="0 0 120 120" className="w-full h-full" fill="none">
                {/* Background square with rounded corners */}
                <rect x="20" y="10" width="55" height="70" rx="8" fill="#4A6CF7" />
                {/* Document lines */}
                <rect x="28" y="22" width="35" height="3" rx="1.5" fill="white" opacity="0.7" />
                <rect x="28" y="30" width="30" height="3" rx="1.5" fill="white" opacity="0.7" />
                <rect x="28" y="38" width="33" height="3" rx="1.5" fill="white" opacity="0.7" />
                <rect x="28" y="46" width="25" height="3" rx="1.5" fill="white" opacity="0.7" />
                {/* Signature line */}
                <path d="M28 62 Q38 52 48 60 Q55 65 60 58" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.9" />
                {/* Hand holding pen */}
                <ellipse cx="80" cy="78" rx="22" ry="14" fill="#8B6914" />
                <rect x="70" y="68" width="8" height="28" rx="4" fill="#6B5210" transform="rotate(-30 74 82)" />
                {/* Pen tip */}
                <path d="M88 58 L96 50 L98 53 L90 61 Z" fill="#555" />
                <path d="M95 49 L99 47 L98 51 Z" fill="#333" />
              </svg>
            </div>

            {/* CTA button */}
            <span className="bg-red-600 group-hover:bg-red-700 text-white font-semibold px-8 py-2.5 rounded-full text-sm transition-colors duration-200 shadow-sm">
              Only me
            </span>

            <p className="text-xs text-gray-500 mt-1">Sign this document</p>
          </button>

          {/* Several People */}
          <button
            onClick={onSeveralPeople}
            className="group flex flex-col items-center gap-4 p-6 rounded-xl border-2 border-gray-100 bg-gray-50 hover:border-red-400 hover:bg-red-50 transition-all duration-200"
          >
            {/* Illustration */}
            <div className="w-28 h-28 flex items-center justify-center">
              <svg viewBox="0 0 120 120" className="w-full h-full" fill="none">
                {/* Table */}
                <ellipse cx="60" cy="60" rx="45" ry="32" fill="#5B7FE8" />
                {/* Person top */}
                <circle cx="60" cy="22" r="9" fill="#E8845A" />
                <rect x="52" y="30" width="16" height="14" rx="6" fill="#E8845A" />
                {/* Person left */}
                <circle cx="20" cy="58" r="9" fill="#4CAF75" />
                <rect x="12" y="66" width="16" height="14" rx="6" fill="#4CAF75" />
                {/* Person right */}
                <circle cx="100" cy="58" r="9" fill="#F0C040" />
                <rect x="92" y="66" width="16" height="14" rx="6" fill="#F0C040" />
                {/* Person bottom */}
                <circle cx="60" cy="98" r="9" fill="#E05090" />
                {/* Document on table */}
                <rect x="47" y="50" width="26" height="20" rx="3" fill="white" opacity="0.9" />
                <rect x="51" y="54" width="14" height="2" rx="1" fill="#ccc" />
                <rect x="51" y="58" width="12" height="2" rx="1" fill="#ccc" />
                <rect x="51" y="62" width="10" height="2" rx="1" fill="#ccc" />
              </svg>
            </div>

            {/* CTA button */}
            <span className="bg-red-600 group-hover:bg-red-700 text-white font-semibold px-5 py-2.5 rounded-full text-sm transition-colors duration-200 shadow-sm">
              Several people
            </span>

            <p className="text-xs text-gray-500 mt-1">Invite others to sign</p>
          </button>
        </div>

        {/* File name footer */}
        {fileName && (
          <p className="text-center text-sm text-gray-500 mt-6">
            Uploaded documents: <span className="font-semibold text-gray-700">{fileName}</span>
          </p>
        )}
      </div>
    </div>
  );
};

export default WhoSignsModal;
