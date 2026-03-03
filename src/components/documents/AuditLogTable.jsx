import React from 'react';
import { format } from 'date-fns';
import { Activity, User, Globe, Clock, Shield, FileText, LogIn, LogOut } from 'lucide-react';

const ACTION_LABELS = {
  document_created: 'Document Created',
  document_updated: 'Document Updated',
  document_viewed: 'Document Viewed',
  document_sent: 'Document Sent',
  document_signed: 'Document Signed',
  document_rejected: 'Document Rejected',
  document_deleted: 'Document Deleted',
  document_downloaded: 'Document Downloaded',
  signature_added: 'Signature Added',
  signature_removed: 'Signature Removed',
  email_sent: 'Email Sent',
  token_generated: 'Token Generated',
  token_verified: 'Token Verified',
  user_registered: 'User Registered',
  login_success: 'Login',
  login_failed: 'Login Failed',
  logout: 'Logout',
  token_refreshed: 'Token Refreshed',
  password_changed: 'Password Changed',
  password_reset_requested: 'Password Reset Requested',
  password_reset_completed: 'Password Reset',
};

const getActionIcon = (action) => {
  if (action?.includes('sign')) return <Activity className="h-4 w-4 text-green-500" />;
  if (action?.includes('reject')) return <Activity className="h-4 w-4 text-red-500" />;
  if (action?.includes('sent')) return <Globe className="h-4 w-4 text-yellow-500" />;
  if (action?.includes('login') || action?.includes('logout')) return <LogIn className="h-4 w-4 text-blue-500" />;
  if (action?.includes('password')) return <Shield className="h-4 w-4 text-purple-500" />;
  if (action?.includes('document')) return <FileText className="h-4 w-4 text-primary-500" />;
  return <Clock className="h-4 w-4 text-gray-500" />;
};

const AuditLogTable = ({ logs }) => {
  if (!logs || logs.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No audit logs found for this document.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Action
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              User
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              IP Address
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Timestamp
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {logs.map((log, index) => (
            <tr key={log._id || index} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-2">
                  {getActionIcon(log.action)}
                  <span className="text-sm text-gray-900">
                    {ACTION_LABELS[log.action] || log.action}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {log.userId?.email || log.metadata?.signerEmail || 'External Signer'}
                </div>
                {log.userId?.name && (
                  <div className="text-xs text-gray-500">{log.userId.name}</div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-mono text-gray-700">
                  {log.ipAddress || '—'}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {log.timestamp
                  ? format(new Date(log.timestamp), 'MMM dd, yyyy HH:mm:ss')
                  : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AuditLogTable;