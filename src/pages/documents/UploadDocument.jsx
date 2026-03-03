import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDocuments } from '../../hooks/useDocuments';
import Card, { CardBody } from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import WhoSignsModal from '../../components/documents/WhoSignsModal';
import InviteSignersModal from '../../components/documents/InviteSignersModal';
import { Upload, File, X } from 'lucide-react';
import { documentsApi } from '../../api/documents';

const uploadSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
});

const UploadDocument = () => {
  const navigate = useNavigate();
  const { uploadDocument } = useDocuments();
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');

  // Modal state — after successful upload
  const [uploadedDoc, setUploadedDoc] = useState(null);
  const [showWhoSigns, setShowWhoSigns] = useState(false);
  const [showInviteSigners, setShowInviteSigners] = useState(false);
  const [savingSigners, setSavingSigners] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(uploadSchema),
  });

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === 'application/pdf') {
      setFile(droppedFile);
      setError('');
    } else {
      setError('Please upload a PDF file');
    }
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError('');
    } else {
      setError('Please upload a PDF file');
    }
  };

  const onUploadProgress = (progressEvent) => {
    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
    setUploadProgress(percentCompleted);
  };

  const onSubmit = async (data) => {
    if (!file) {
      setError('Please select a file to upload');
      return;
    }
    try {
      const response = await uploadDocument(file, data.title, onUploadProgress);
      // After upload, show the "Who signs?" modal
      setUploadedDoc(response);
      setShowWhoSigns(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    }
  };

  // "Only me" flow → go straight to the document viewer to place fields & sign
  const handleOnlyMe = () => {
    setShowWhoSigns(false);
    navigate(`/documents/${uploadedDoc._id}`);
  };

  // "Several people" → open invite modal
  const handleSeveralPeople = () => {
    setShowWhoSigns(false);
    setShowInviteSigners(true);
  };

  // After signers are configured → save them, send the document, and email all signers
  const handleSignersProceed = async (signers) => {
    setSavingSigners(true);
    try {
      // 1 — Persist signers on the document
      await documentsApi.updateDocument(uploadedDoc._id, {
        signers: signers.map((s) => ({
          name: s.name,
          email: s.email,
          permission: s.permission,
        })),
      });

      // 2 — Send the document for signing (generates tokens + sends emails to each signer)
      await documentsApi.sendForSignature(uploadedDoc._id);

      setShowInviteSigners(false);
      // Navigate to dashboard — the document is now 'sent', signers will be emailed
      navigate('/documents');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send document. Please try again.');
      setShowInviteSigners(false);
      setShowWhoSigns(true);
    } finally {
      setSavingSigners(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Upload Document</h1>

      <Card>
        <CardBody>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input
              label="Document Title"
              {...register('title')}
              error={errors.title?.message}
              placeholder="Enter document title"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                PDF File
              </label>

              <div
                className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragActive ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />

                {file ? (
                  <div className="flex items-center justify-center gap-3">
                    <File className="h-8 w-8 text-red-500" />
                    <div className="text-left">
                      <p className="font-medium text-gray-900">{file.name}</p>
                      <p className="text-sm text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFile(null)}
                      className="p-1 hover:bg-gray-100 rounded-full"
                    >
                      <X className="h-5 w-5 text-gray-500" />
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">
                      Drag and drop your PDF here, or click to browse
                    </p>
                    <p className="text-sm text-gray-500">PDF files only</p>
                  </>
                )}
              </div>
            </div>

            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-red-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            )}

            {error && <Alert type="error" message={error} />}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isSubmitting}
              disabled={!file}
              className="w-full"
            >
              Upload Document
            </Button>
          </form>
        </CardBody>
      </Card>

      {/* Who Signs Modal */}
      <WhoSignsModal
        isOpen={showWhoSigns}
        onClose={() => setShowWhoSigns(false)}
        fileName={file?.name}
        onOnlyMe={handleOnlyMe}
        onSeveralPeople={handleSeveralPeople}
      />

      {/* Invite Signers Modal */}
      <InviteSignersModal
        isOpen={showInviteSigners}
        onClose={() => { setShowInviteSigners(false); setShowWhoSigns(true); }}
        onProceed={handleSignersProceed}
      />
    </div>
  );
};

export default UploadDocument;