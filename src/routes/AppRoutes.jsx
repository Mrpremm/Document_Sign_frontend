import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import ProtectedLayout from '../components/layout/ProtectedLayout';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import Dashboard from '../pages/dashboard/Dashboard';
import UploadDocument from '../pages/documents/UploadDocument';
import DocumentViewer from '../pages/documents/DocumentViewer';
import SendDocument from '../pages/documents/SendDocument';
import AuditPage from '../pages/documents/AuditPage';
import PublicSign from '../pages/public/PublicSign';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/sign/:token" element={<PublicSign />} />

      {/* Protected routes */}
      <Route path="/" element={<ProtectedRoute />}>
        <Route element={<ProtectedLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="upload" element={<UploadDocument />} />
          <Route path="documents/:id" element={<DocumentViewer />} />
          <Route path="documents/:id/send" element={<SendDocument />} />
          <Route path="documents/:id/audit" element={<AuditPage />} />
          <Route path="audit" element={<div>Global Audit Page</div>} />
        </Route>
      </Route>

      {/* 404 */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;