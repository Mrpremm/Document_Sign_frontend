import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Document, Page } from 'react-pdf';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { v4 as uuidv4 } from 'uuid';
import { documentsApi } from '../../api/documents';
import SignatureField from '../../components/documents/SignatureField';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import Alert from '../../components/ui/Alert';
import Card, { CardBody } from '../../components/ui/Card';
import { Save, Send } from 'lucide-react';

const DocumentViewer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [document, setDocument] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [signatureFields, setSignatureFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [pageDimensions, setPageDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    fetchDocument();
  }, [id]);

  const fetchDocument = async () => {
    try {
      const data = await documentsApi.getDocument(id);
      setDocument(data);
      if (data.signatureFields) {
        setSignatureFields(data.signatureFields);
      }
    } catch (err) {
      setError('Failed to load document');
    } finally {
      setLoading(false);
    }
  };

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const onPageLoadSuccess = (page) => {
    const { width, height } = page.getViewport({ scale: 1 });
    setPageDimensions({ width, height });
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (over && over.id === 'page-dropzone') {
      const { delta } = event;
      const fieldId = active.id;
      
      setSignatureFields((prev) => {
        const existingField = prev.find(f => f.id === fieldId);
        if (existingField) {
          return prev.map(f => 
            f.id === fieldId 
              ? { ...f, position: { x: delta.x, y: delta.y } }
              : f
          );
        }
        
        // Create new field
        return [...prev, {
          id: fieldId,
          pageNumber: pageNumber,
          position: { x: delta.x, y: delta.y }
        }];
      });
    }
  };

  const addSignatureField = () => {
    const newField = {
      id: uuidv4(),
      pageNumber: pageNumber,
      position: { x: 50, y: 50 }
    };
    setSignatureFields([...signatureFields, newField]);
  };

  const removeSignatureField = (fieldId) => {
    setSignatureFields(signatureFields.filter(f => f.id !== fieldId));
  };

  const saveFields = async () => {
    setSaving(true);
    try {
      await documentsApi.saveSignatureFields(id, signatureFields);
      navigate(`/documents/${id}/send`);
    } catch (err) {
      setError('Failed to save signature fields');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return <Alert type="error" message={error} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">{document?.title}</h1>
        <div className="flex gap-3">
          <Button variant="outline" onClick={addSignatureField}>
            Add Signature Field
          </Button>
          <Button variant="primary" onClick={saveFields} isLoading={saving}>
            <Save className="h-4 w-4 mr-2" />
            Save & Continue
          </Button>
        </div>
      </div>

      <Card>
        <CardBody>
          <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <div className="relative">
              <Document
                file={`${import.meta.env.VITE_API_BASE_URL}/documents/${id}/file`}
                onLoadSuccess={onDocumentLoadSuccess}
                loading={<Spinner />}
                error="Failed to load PDF"
              >
                <Page
                  pageNumber={pageNumber}
                  onLoadSuccess={onPageLoadSuccess}
                  className="mx-auto shadow-lg"
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                />
              </Document>

              <div
                id="page-dropzone"
                className="absolute inset-0"
                style={{ width: pageDimensions.width, height: pageDimensions.height }}
              >
                {signatureFields
                  .filter(field => field.pageNumber === pageNumber)
                  .map((field) => (
                    <SignatureField
                      key={field.id}
                      id={field.id}
                      pageNumber={pageNumber}
                      position={field.position}
                      onRemove={removeSignatureField}
                    />
                  ))}
              </div>
            </div>
          </DndContext>

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
    </div>
  );
};

export default DocumentViewer;