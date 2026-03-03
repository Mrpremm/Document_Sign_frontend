import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { documentsApi } from '../../api/documents';
import Card, { CardBody, CardHeader } from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import Spinner from '../../components/ui/Spinner';
import Badge from '../../components/ui/Badge';
import { Send, Users, CheckCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const signerSchema = z.object({
  signerName: z.string().min(1, 'Name is required'),
  signerEmail: z.string().email('Invalid email address'),
});

const sendSchema = z.object({
  signers: z.array(signerSchema).min(1, 'Add at least one signer'),
});

const SendDocument = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const { register, handleSubmit, control, formState: { errors } } = useForm({
    resolver: zodResolver(sendSchema),
    defaultValues: {
      signers: [{ signerName: '', signerEmail: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'signers',
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
    setError('');

    try {
      // First update the document with the signers list
      await documentsApi.updateDocument(id, { signers: data.signers.map(s => ({ name: s.signerName, email: s.signerEmail })) });

      // Then send the document for signing — this generates tokens and sends emails
      const doc = await documentsApi.sendForSignature(id);
      setDocument(doc);
      setSent(true);
      toast.success('Document sent for signing!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send document');
    } finally {
      setSending(false);
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
      <div className="max-w-2xl mx-auto">
        <Alert
          type="warning"
          message={`This document has status "${document?.status}" and cannot be sent again.`}
          className="mb-4"
        />
        <Button variant="outline" onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  if (sent) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardBody className="text-center py-10">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Document Sent!</h2>
            <p className="text-gray-600 mb-6">
              An email with the signing link has been sent to each signer. You'll be
              notified when they sign.
            </p>

            {/* Show signers list */}
            {document?.signers && document.signers.length > 0 && (
              <div className="text-left mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Signers notified:</h3>
                <ul className="space-y-2">
                  {document.signers.map((signer, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">{signer.name}</span>
                      <span className="text-gray-500">({signer.email})</span>
                      <Badge variant={signer.signed ? 'success' : 'warning'}>
                        {signer.signed ? 'Signed' : 'Pending'}
                      </Badge>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-center gap-3">
              <Button variant="outline" onClick={() => navigate('/dashboard')}>
                Back to Dashboard
              </Button>
              <Button variant="primary" onClick={() => navigate(`/documents/${id}/audit`)}>
                View Audit Trail
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
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
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Signers
              </label>

              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex gap-3 items-start">
                    <div className="flex-1 grid grid-cols-2 gap-3">
                      <Input
                        label="Name"
                        {...register(`signers.${index}.signerName`)}
                        error={errors.signers?.[index]?.signerName?.message}
                        placeholder="Full name"
                      />
                      <Input
                        label="Email"
                        type="email"
                        {...register(`signers.${index}.signerEmail`)}
                        error={errors.signers?.[index]?.signerEmail?.message}
                        placeholder="email@example.com"
                      />
                    </div>
                    {fields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="mt-7 p-2 text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => append({ signerName: '', signerEmail: '' })}
              >
                + Add Another Signer
              </Button>
            </div>

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
        </CardBody>
      </Card>
    </div>
  );
};

export default SendDocument;