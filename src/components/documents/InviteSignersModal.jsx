import React from 'react';
import { X, Eye, PenSquare, EyeOff, UserCheck } from 'lucide-react';

/**
 * Modal for inviting multiple signers with permission levels.
 * Props:
 *  - isOpen: boolean
 *  - onClose: () => void
 *  - onProceed: (signers) => void  - signers = [{ name, email, permission }]
 *  - documentId: string
 */

const PERMISSIONS = [
  {
    key: 'sign',
    icon: PenSquare,
    label: 'Can sign',
    description: 'Can view and sign the document',
    color: 'text-green-600',
    bg: 'bg-green-50 border-green-400',
  },
  {
    key: 'view',
    icon: Eye,
    label: 'View only',
    description: 'Can only view the document',
    color: 'text-blue-600',
    bg: 'bg-blue-50 border-blue-400',
  },
];

const InviteSignersModal = ({ isOpen, onClose, onProceed }) => {
  const [signers, setSigners] = React.useState([
    { id: 1, name: '', email: '', permission: 'sign' },
  ]);
  const [error, setError] = React.useState('');

  if (!isOpen) return null;

  const updateSigner = (id, field, value) => {
    setSigners((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
    setError('');
  };

  const addSigner = () => {
    setSigners((prev) => [
      ...prev,
      { id: Date.now(), name: '', email: '', permission: 'sign' },
    ]);
  };

  const removeSigner = (id) => {
    if (signers.length <= 1) return;
    setSigners((prev) => prev.filter((s) => s.id !== id));
  };

  const handleProceed = () => {
    for (const s of signers) {
      if (!s.name.trim()) { setError('All signers must have a name.'); return; }
      if (!s.email.trim() || !/\S+@\S+\.\S+/.test(s.email)) {
        setError('All signers must have a valid email address.');
        return;
      }
    }
    onProceed(
      signers.map((s) => ({ name: s.name.trim(), email: s.email.trim(), permission: s.permission }))
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 overflow-y-auto">
      <div className="absolute inset-0 bg-gray-700 bg-opacity-60" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg z-10 my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-7 pt-6 pb-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Invite others to sign</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-7 py-5 space-y-4">
          <p className="text-sm text-gray-500">
            Add the people who need to sign or review this document and set their access level.
          </p>

          {signers.map((signer, idx) => (
            <div key={signer.id} className="border border-gray-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700">Signer {idx + 1}</span>
                {signers.length > 1 && (
                  <button
                    onClick={() => removeSigner(signer.id)}
                    className="text-red-400 hover:text-red-600 text-xs font-medium"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Full Name</label>
                  <input
                    value={signer.name}
                    onChange={(e) => updateSigner(signer.id, 'name', e.target.value)}
                    placeholder="Full name"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                  <input
                    type="email"
                    value={signer.email}
                    onChange={(e) => updateSigner(signer.id, 'email', e.target.value)}
                    placeholder="email@example.com"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Permission selector */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">Permission</label>
                <div className="flex gap-2">
                  {PERMISSIONS.map((perm) => {
                    const Icon = perm.icon;
                    const active = signer.permission === perm.key;
                    return (
                      <button
                        key={perm.key}
                        type="button"
                        onClick={() => updateSigner(signer.id, 'permission', perm.key)}
                        className={`flex items-center gap-2 flex-1 px-3 py-2 rounded-lg border-2 text-xs font-medium transition-all duration-150 ${active
                            ? `${perm.bg} ${perm.color} shadow-sm`
                            : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        <div className="text-left">
                          <div className="font-semibold">{perm.label}</div>
                          <div className="text-xs opacity-75 hidden sm:block">{perm.description}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addSigner}
            className="w-full border-2 border-dashed border-gray-300 hover:border-red-400 text-gray-500 hover:text-red-500 rounded-xl py-2.5 text-sm font-medium transition-all duration-150"
          >
            + Add another signer
          </button>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-4 px-7 py-5 border-t border-gray-100">
          <button
            onClick={onClose}
            className="text-gray-600 font-medium hover:text-gray-800 transition-colors"
          >
            Back
          </button>
          <button
            onClick={handleProceed}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold px-7 py-2.5 rounded-xl transition-colors shadow-sm flex items-center gap-2"
          >
            <UserCheck className="h-4 w-4" />
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default InviteSignersModal;
