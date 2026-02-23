import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { documentsApi } from '../../api/documents';
import Card, { CardBody, CardHeader } from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import Spinner from '../../components/ui/Spinner';
import { Copy, Check, Send } from 'lucide-react';
import { toast } from 'react-toastify';

const sendSchema = z.object({
  signerEmail: z.string().email('Invalid email address'),
});

const SendDocument = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [signingLink, setSigningLink] = useState('');
  const [copied, setCopied] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(sendSchema),
  });

  useEffect(() => {
    fetchDocument();
  }, [id]);

  const fetchDocument = async () => {
    try {
      const data = await documentsApi.getDocument(id);
      setDocument(data);
    } catch (err) {
      setError('Failed to load document');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    setSending(true);
    try {
      const response = await documentsApi.sendForSignature(id, data.signerEmail);
      const link = `${window.location.origin}/sign/${response.token}`;
      setSigningLink(link);
      toast.success('Document sent successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send document');
    } finally {
      setSending(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(signingLink);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (document?.status !== 'draft') {
    return (
      <Alert 
        type="warning" 
        message="This document has already been sent or processed" 
      />
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Send for Signature</h1>

      <Card className="mb-6">
        <CardHeader>
          <h2 className="text-lg font-semibold">Document: {document?.title}</h2>
        </CardHeader>
        <CardBody>
          {!signingLink ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Signer Email"
                type="email"
                {...register('signerEmail')}
                error={errors.signerEmail?.message}
                placeholder="signer@example.com"
              />

              {error && <Alert type="error" message={error} />}

              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={sending}
                className="w-full"
              >
                <Send className="h-4 w-4 mr-2" />
                Send for Signature
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              <Alert type="success" message="Document sent successfully!" />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Public Signing Link
                </label>
                <div className="flex gap-2">
                  <Input
                    value={signingLink}
                    readOnly
                    className="flex-1 bg-gray-50"
                  />
                  <Button
                    variant="outline"
                    onClick={copyToClipboard}
                  >
                    {copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Share this link with the signer to collect their signature
                </p>
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => navigate('/dashboard')}
                >
                  Go to Dashboard
                </Button>
                <Button
                  variant="primary"
                  onClick={() => window.open(signingLink, '_blank')}
                >
                  Preview Signing Page
                </Button>
              </div>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default SendDocument;