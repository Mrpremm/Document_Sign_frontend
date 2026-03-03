import { useState, useEffect, useCallback } from 'react';
import { documentsApi } from '../api/documents';
import { toast } from 'react-toastify';

export const useDocuments = (initialStatus = '') => {
  const [documents, setDocuments] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState(initialStatus);

  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
      // documentsApi.getAllDocuments now returns { documents: [], pagination: {} }
      const { documents: docs, pagination: pag } = await documentsApi.getAllDocuments(status);
      setDocuments(Array.isArray(docs) ? docs : []);
      setPagination(pag || {});
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch documents');
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const uploadDocument = async (file, title, onProgress) => {
    try {
      const formData = new FormData();
      formData.append('document', file); // field name must match multer's 'document' field
      formData.append('title', title);

      const response = await documentsApi.uploadDocument(formData, onProgress);
      toast.success('Document uploaded successfully');
      await fetchDocuments();
      return response;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
      throw err;
    }
  };

  const deleteDocument = async (id) => {
    try {
      await documentsApi.deleteDocument(id);
      toast.success('Document deleted successfully');
      await fetchDocuments();
    } catch (err) {
      toast.error('Failed to delete document');
      throw err;
    }
  };

  const sendForSignature = async (id, signerEmail) => {
    try {
      const response = await documentsApi.sendForSignature(id, signerEmail);
      toast.success('Document sent for signature');
      await fetchDocuments();
      return response;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send document');
      throw err;
    }
  };

  return {
    documents,
    pagination,
    loading,
    error,
    status,
    setStatus,
    uploadDocument,
    deleteDocument,
    sendForSignature,
    refresh: fetchDocuments,
  };
};