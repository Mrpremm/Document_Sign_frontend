import React from 'react';
import { Link } from 'react-router-dom';
import { useDocuments } from '../../hooks/useDocuments';
import { useAuth } from '../../context/AuthContext';
import DocumentCard from '../../components/documents/DocumentCard';
import DocumentFilters from '../../components/documents/DocumentFilters';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import Alert from '../../components/ui/Alert';
import { Upload, FileText } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const { documents, loading, error, status, setStatus, deleteDocument } = useDocuments();

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      await deleteDocument(id);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name}!</h1>
        <p className="text-gray-600">Manage your documents and signature requests</p>
      </div>

      <div className="flex justify-between items-center mb-6">
        <DocumentFilters currentStatus={status} onStatusChange={setStatus} />
        <Link to="/upload">
          <Button variant="primary">
            <Upload className="h-4 w-4 mr-2" />
            Upload New Document
          </Button>
        </Link>
      </div>

      {error && (
        <Alert type="error" message={error} className="mb-6" />
      )}

      {documents.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
          <p className="text-gray-500 mb-4">Get started by uploading your first document</p>
          <Link to="/upload">
            <Button variant="primary">Upload Document</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map((doc) => (
            <DocumentCard
              key={doc._id}
              document={doc}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;