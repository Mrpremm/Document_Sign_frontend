import axiosInstance from './axios';

export const signApi = {
  // GET /api/sign/:token — returns { document: {...}, signer: {...}, status }
  getDocumentByToken: async (token) => {
    const response = await axiosInstance.get(`/sign/${token}`);
    // Backend returns formatSuccess({ document: {...}, signer: {...} })
    // response.data.data has both document and signer at the top level
    return response.data.data;
  },

  // Fetch PDF for a signing token as a Blob URL (no auth needed for public route)
  getPdfBlob: async (token) => {
    const response = await axiosInstance.get(`/sign/${token}/file`, {
      responseType: 'blob',
    });
    return URL.createObjectURL(response.data); // Returns a stable blob: URL string
  },

  // POST /api/sign/:token — submit signature
  // payload: { signatureData (base64), position: { pageNumber, x, y }, signatureType, name }
  signDocument: async (token, signatureData) => {
    const response = await axiosInstance.post(`/sign/${token}`, signatureData);
    return response.data.data;
  },

  // POST /api/sign/:token/reject — reject document
  rejectDocument: async (token, reason) => {
    const response = await axiosInstance.post(`/sign/${token}/reject`, { reason });
    return response.data.data;
  },
};
