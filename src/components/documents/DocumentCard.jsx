import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Send, Trash2, Eye, Clock, CheckCircle, XCircle, Activity, Download } from 'lucide-react';
import Card, { CardBody, CardFooter } from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { formatDistanceToNow } from 'date-fns';
import { documentsApi } from '../../api/documents';

const DocumentCard = ({ document, onDelete }) => {
  const [downloading, setDownloading] = useState(false);

  const getStatusBadge = (status) => {
    const statusMap = {
      draft: { variant: 'draft', icon: Clock, label: 'Draft' },
      sent: { variant: 'sent', icon: Send, label: 'Sent' },
      signed: { variant: 'signed', icon: CheckCircle, label: 'Signed' },
      rejected: { variant: 'rejected', icon: XCircle, label: 'Rejected' },
    };

    const { variant, icon: Icon, label } = statusMap[status] || statusMap.draft;

    return (
      <Badge variant={variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {label}
      </Badge>
    );
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const blobUrl = await documentsApi.getPdfBlob(document._id);
      const a = window.document.createElement('a');
      a.href = blobUrl;
      a.download = `${document.title}.pdf`;
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
      // Revoke after a short delay to allow the download to start
      setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);
    } catch (err) {
      console.error('Download failed:', err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardBody>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-50 rounded-lg">
              <FileText className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{document.title}</h3>
              <p className="text-sm text-gray-500">
                Updated {formatDistanceToNow(new Date(document.updatedAt), { addSuffix: true })}
              </p>
            </div>
          </div>
          {getStatusBadge(document.status)}
        </div>

        {/* Show signers if present */}
        {document.signers && document.signers.length > 0 && (
          <div className="mt-2 text-sm text-gray-600">
            <span className="font-medium">Signers: </span>
            {document.signers.map((s, i) => (
              <span key={i}>
                {s.name || s.email}
                {s.signed && <CheckCircle className="inline h-3 w-3 text-green-500 ml-1" />}
                {i < document.signers.length - 1 ? ', ' : ''}
              </span>
            ))}
          </div>
        )}

        {document.signatureFields?.length > 0 && (
          <div className="mt-1 text-sm text-gray-500">
            {document.signatureFields.length} signature field(s) placed
          </div>
        )}
      </CardBody>

      <CardFooter className="flex justify-end gap-2 flex-wrap">
        {/* Audit trail link — always available */}
        <Link to={`/documents/${document._id}/audit`}>
          <Button variant="ghost" size="sm" title="View Audit Trail">
            <Activity className="h-4 w-4 mr-1" />
            Audit
          </Button>
        </Link>

        {/* Download button — always available */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDownload}
          disabled={downloading}
          title="Download PDF"
        >
          <Download className="h-4 w-4 mr-1" />
          {downloading ? 'Downloading…' : 'Download'}
        </Button>

        <Link to={`/documents/${document._id}`}>
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-1" />
            View
          </Button>
        </Link>

        {document.status === 'draft' && (
          <>
            <Link to={`/documents/${document._id}/send`}>
              <Button variant="primary" size="sm">
                <Send className="h-4 w-4 mr-1" />
                Send
              </Button>
            </Link>
            <Button
              variant="danger"
              size="sm"
              onClick={() => onDelete(document._id)}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
};

export default DocumentCard;
