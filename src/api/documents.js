import axiosInstance from './axios';

export const documentsApi = {
  getAllDocuments: async (status = '') => {
    const params = status ? { status } : {};
    const response = await axiosInstance.get('/documents', { params });
    return response.data;
  },

  getDocument: async (id) => {
    const response = await axiosInstance.get(`/documents/${id}`);
    return response.data;
  },

  uploadDocument: async (formData, onUploadProgress) => {
    const response = await axiosInstance.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    });
    return response.data;
  },

  updateDocument: async (id, data) => {
    const response = await axiosInstance.put(`/documents/${id}`, data);
    return response.data;
  },

  deleteDocument: async (id) => {
    const response = await axiosInstance.delete(`/documents/${id}`);
    return response.data;
  },

  sendForSignature: async (id, signerEmail) => {
    const response = await axiosInstance.post(`/documents/${id}/send`, { signerEmail });
    return response.data;
  },

  saveSignatureFields: async (id, fields) => {
    const response = await axiosInstance.post(`/documents/${id}/signature-fields`, { fields });
    return response.data;
  },

  getAuditLogs: async (id) => {
    const response = await axiosInstance.get(`/documents/${id}/audit`);
    return response.data;
  }
};