export const DOCUMENT_STATUS = {
  DRAFT: 'draft',
  SENT: 'sent',
  SIGNED: 'signed',
  REJECTED: 'rejected',
};

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
  },
  DOCUMENTS: {
    BASE: '/documents',
    UPLOAD: '/documents/upload',
    SIGNATURE_FIELDS: (id) => `/documents/${id}/signature-fields`,
    SEND: (id) => `/documents/${id}/send`,
    AUDIT: (id) => `/documents/${id}/audit`,
  },
  SIGN: {
    BASE: (token) => `/sign/${token}`,
    FILE: (token) => `/sign/${token}/file`,
    REJECT: (token) => `/sign/${token}/reject`,
  },
};

export const COLORS = {
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
};