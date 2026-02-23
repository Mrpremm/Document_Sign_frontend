import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Send, Trash2, Eye, Clock, CheckCircle, XCircle } from 'lucide-react';
import Card, { CardBody, CardFooter } from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { formatDistanceToNow } from 'date-fns';

const DocumentCard = ({ document, onDelete, onSend }) => {
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

        {document.signerEmail && (
          <div className="mt-2 text-sm text-gray-600">
            <span className="font-medium">Signer:</span> {document.signerEmail}
          </div>
        )}

        {document.signatureFields?.length > 0 && (
          <div className="mt-2 text-sm text-gray-600">
            <span className="font-medium">Signature fields:</span> {document.signatureFields.length}
          </div>
        )}
      </CardBody>

      <CardFooter className="flex justify-end gap-2">
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