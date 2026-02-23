import React from 'react';
import { format } from 'date-fns';
import { Activity, User, Globe, Clock } from 'lucide-react';

const AuditLogTable = ({ logs }) => {
  const getActionIcon = (action) => {
    switch (action) {
      case 'CREATED':
        return <Activity className="h-4 w-4 text-green-500" />;
      case 'VIEWED':
        return <User className="h-4 w-4 text-blue-500" />;
      case 'SENT':
        return <Globe className="h-4 w-4 text-yellow-500" />;
      case 'SIGNED':
        return <Activity className="h-4 w-4 text-green-600" />;
      case 'REJECTED':
        return <Activity className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

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
            <tr key={index} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-2">
                  {getActionIcon(log.action)}
                  <span className="text-sm text-gray-900">{log.action}</span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{log.user?.email || 'System'}</div>
                {log.user?.name && (
                  <div className="text-xs text-gray-500">{log.user.name}</div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{log.ipAddress}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {format(new Date(log.timestamp), 'MMM dd, yyyy HH:mm:ss')}
              </td>
            </tr>
          ))}
          {logs.length === 0 && (
            <tr>
              <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                No audit logs found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AuditLogTable;