import axiosInstance from './axios';

export const signApi = {
  getDocumentByToken: async (token) => {
    const response = await axiosInstance.get(`/sign/${token}`);
    return response.data;
  },

  signDocument: async (token, signatureData) => {
    const response = await axiosInstance.post(`/sign/${token}`, signatureData);
    return response.data;
  },

  rejectDocument: async (token, reason) => {
    const response = await axiosInstance.post(`/sign/${token}/reject`, { reason });
    return response.data;
  }
};