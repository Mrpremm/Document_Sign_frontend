import React from 'react';
import { Filter } from 'lucide-react';
import Select from '../ui/Select';

const DocumentFilters = ({ currentStatus, onStatusChange }) => {
  const statusOptions = [
    { value: '', label: 'All Documents' },
    { value: 'draft', label: 'Draft' },
    { value: 'sent', label: 'Sent' },
    { value: 'signed', label: 'Signed' },
    { value: 'rejected', label: 'Rejected' },
  ];

  return (
    <div className="flex items-center gap-2 mb-6">
      <Filter className="h-5 w-5 text-gray-400" />
      <Select
        value={currentStatus}
        onChange={(e) => onStatusChange(e.target.value)}
        options={statusOptions}
        className="w-48"
      />
    </div>
  );
};

export default DocumentFilters;