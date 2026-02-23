import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Document, Page } from 'react-pdf';
import SignatureCanvas from 'react-signature-canvas';
import { signApi } from '../../api/sign';
import Card, { CardBody, CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import Alert from '../../components/ui/Alert';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import { FileText, PenSquare, XCircle, CheckCircle } from 'lucide-react';

const PublicSign = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const signatureRef = useRef(null);

  useEffect(() => {
    fetchDocument();
  }, [token]);

  const fetchDocument = async () => {
    try {
      const data = await signApi.getDocumentByToken(token);
      setDocument(data);
    } catch (err) {
      setError('Invalid or expired signing link');
    } finally {
      setLoading(false);
    }
  };

  const handleSign = async () => {
    if (signatureRef.current && !signatureRef.current.isEmpty()) {
      setSubmitting(true);
      try {
        const signatureData = signatureRef.current.toDataURL();
        await signApi.signDocument(token, { signature: signatureData });
        setSuccess(true);
      } catch (err) {
        setError('Failed to submit signature');
      } finally {
        setSubmitting(false);
      }
    } else {
      setError('Please provide your signature');
    }
  };

  const handleReject = async () => {
    setSubmitting(true);
    try {
      await signApi.rejectDocument(token, { reason: rejectReason });
      setSuccess(true);
    } catch (err) {
      setError('Failed to reject document');
    } finally {
      setSubmitting(false);
      setShowRejectModal(false);
    }
  };

  const clearSignature = () => {
    signatureRef.current?.clear();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardBody className="text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Invalid Link</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button variant="primary" onClick={() => window.location.href = '/'}>
              Go to Homepage
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardBody className="text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {document?.status === 'signed' ? 'Document Signed!' : 'Document Rejected'}
            </h2>
            <p className="text-gray-600 mb-4">
              {document?.status === 'signed' 
                ? 'Thank you for signing the document.' 
                : 'The document has been rejected.'}
            </p>
            <Button variant="primary" onClick={() => window.location.href = '/'}>
              Return to Homepage
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <FileText className="h-12 w-12 text-primary-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900">Sign Document</h1>
          <p className="text-gray-600">{document?.title}</p>
        </div>

        <Card className="mb-6">
          <CardBody>
            <Document
              file={`${import.meta.env.VITE_API_BASE_URL}/sign/${token}/file`}
              onLoadSuccess={({ numPages }) => setNumPages(numPages)}
              loading={<Spinner />}
            >
              <Page 
                pageNumber={pageNumber} 
                className="mx-auto shadow-lg"
                renderTextLayer={false}
                renderAnnotationLayer={false}
              />
            </Document>

            {numPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
                  disabled={pageNumber <= 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-600">
                  Page {pageNumber} of {numPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPageNumber(Math.min(numPages, pageNumber + 1))}
                  disabled={pageNumber >= numPages}
                >
                  Next
                </Button>
              </div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Your Signature</h2>
          </CardHeader>
          <CardBody>
            <div className="border-2 border-gray-200 rounded-lg mb-4">
              <SignatureCanvas
                ref={signatureRef}
                canvasProps={{
                  className: 'w-full h-48 cursor-crosshair'
                }}
              />
            </div>

            <div className="flex justify-between items-center mb-4">
              <Button variant="outline" size="sm" onClick={clearSignature}>
                Clear Signature
              </Button>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowRejectModal(true)}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSign}
                  isLoading={submitting}
                >
                  <PenSquare className="h-4 w-4 mr-2" />
                  Sign Document
                </Button>
              </div>
            </div>

            {error && <Alert type="error" message={error} />}
          </CardBody>
        </Card>

        <Modal
          isOpen={showRejectModal}
          onClose={() => setShowRejectModal(false)}
          title="Reject Document"
          footer={
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowRejectModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleReject}
                isLoading={submitting}
              >
                Confirm Rejection
              </Button>
            </div>
          }
        >
          <div className="py-4">
            <Input
              label="Reason for rejection (optional)"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter reason..."
            />
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default PublicSign;