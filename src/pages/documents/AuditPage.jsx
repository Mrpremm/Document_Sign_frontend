import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { documentsApi } from '../../api/documents';
import AuditLogTable from '../../components/documents/AuditLogTable';
import Card, { CardBody, CardHeader } from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import Alert from '../../components/ui/Alert';
import { FileText } from 'lucide-react';

const AuditPage = () => {
  const { id } = useParams();
  const [logs, setLogs] = useState([]);
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAuditLogs();
  }, [id]);

  const fetchAuditLogs = async () => {
    try {
      const [docData, logsData] = await Promise.all([
        documentsApi.getDocument(id),
        documentsApi.getAuditLogs(id)
      ]);
      setDocument(docData);
      setLogs(logsData);
    } catch (err) {
      setError('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return <Alert type="error" message={error} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <FileText className="h-8 w-8 text-primary-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Audit Trail</h1>
          <p className="text-gray-600">{document?.title}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Document Activity Log</h2>
        </CardHeader>
        <CardBody>
          <AuditLogTable logs={logs} />
        </CardBody>
      </Card>
    </div>
  );
};

export default AuditPage;