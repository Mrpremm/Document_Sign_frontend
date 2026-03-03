import axiosInstance from './axios';

export const authApi = {
  register: async (userData) => {
    const response = await axiosInstance.post('/auth/register', userData);
    // Backend wraps data in: { status, data: { user, accessToken, refreshToken } }
    const { accessToken, refreshToken, user } = response.data.data;
    if (accessToken) {
      localStorage.setItem('accessToken', accessToken);
    }
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }
    return { user, accessToken };
  },

  login: async (credentials) => {
    const response = await axiosInstance.post('/auth/login', credentials);
    const { accessToken, refreshToken, user } = response.data.data;
    if (accessToken) {
      localStorage.setItem('accessToken', accessToken);
    }
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }
    return { user, accessToken };
  },

  logout: async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      await axiosInstance.post('/auth/logout', { refreshToken });
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  },

  getCurrentUser: async () => {
    const response = await axiosInstance.get('/auth/me');
    return response.data.data?.user || response.data.data;
  },

  refreshToken: async () => {
    const response = await axiosInstance.post('/auth/refresh-token', {
      refreshToken: localStorage.getItem('refreshToken'),
    });
    return response.data.data;
  },
};