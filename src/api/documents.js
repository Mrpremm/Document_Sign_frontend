import axiosInstance from './axios';

export const documentsApi = {
  getAllDocuments: async (status = '') => {
    const params = status ? { status } : {};
    const response = await axiosInstance.get('/documents', { params });
    // Backend uses formatPaginated: { status, data: [...], pagination: {...} }
    return {
      documents: response.data.data || [],
      pagination: response.data.pagination || {},
    };
  },

  // Fetch PDF file as Blob via authenticated Axios, then create an object URL for react-pdf
  getPdfBlob: async (id) => {
    const response = await axiosInstance.get(`/documents/${id}/download`, {
      responseType: 'blob',
    });
    return URL.createObjectURL(response.data); // Returns a stable blob: URL string
  },

  getDocument: async (id) => {
    const response = await axiosInstance.get(`/documents/${id}`);
    // Backend: formatSuccess({ document }) → response.data.data.document
    return response.data.data?.document || response.data.data;
  },

  uploadDocument: async (formData, onUploadProgress) => {
    const response = await axiosInstance.post('/documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    });
    return response.data.data?.document || response.data.data;
  },

  updateDocument: async (id, data) => {
    const response = await axiosInstance.patch(`/documents/${id}`, data);
    return response.data.data?.document || response.data.data;
  },

  deleteDocument: async (id) => {
    const response = await axiosInstance.delete(`/documents/${id}`);
    return response.data;
  },

  // Send document for signing — backend reads signers from the document record
  // Optionally pass signerEmail for backwards compatibility (backend ignores it)
  sendForSignature: async (id) => {
    const response = await axiosInstance.post(`/documents/${id}/send`);
    return response.data.data?.document || response.data.data;
  },

  // Save drag-and-drop signature field positions from DocumentViewer
  saveSignatureFields: async (id, fields) => {
    const response = await axiosInstance.post(`/documents/${id}/signature-fields`, { fields });
    return response.data.data;
  },

  // Get audit trail for a document
  getAuditLogs: async (id) => {
    const response = await axiosInstance.get(`/documents/${id}/audit`);
    // Backend: formatSuccess({ logs }) → response.data.data.logs
    return response.data.data?.logs || response.data.data || [];
  },
};