'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { 
  ArrowLeft, 
  FileText,
  Upload,
  CheckCircle,
  AlertCircle,
  Clock,
  X,
  Camera,
  Image
} from 'lucide-react';
import type { RootState } from '@/store';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingScreen } from '@/components/ui/loading';
import { documentsService, Document } from '@/lib/services';

const documentTypes = [
  { type: 'license', label: "Driver's License", description: 'Valid government-issued license' },
  { type: 'registration', label: 'Vehicle Registration', description: 'Current vehicle registration' },
  { type: 'insurance', label: 'Insurance', description: 'Valid vehicle insurance' },
  { type: 'profile_photo', label: 'Profile Photo', description: 'Clear photo of your face' },
  { type: 'vehicle_photo', label: 'Vehicle Photo', description: 'Photo of your vehicle' },
] as const;

export default function DriverDocumentsPage() {
  const router = useRouter();
  const { isAuthenticated, userType } = useSelector((state: RootState) => state.auth);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadingType, setUploadingType] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }
    if (userType === 'rider') {
      router.replace('/rider');
      return;
    }
    loadDocuments();
  }, [isAuthenticated, userType, router]);

  const loadDocuments = async () => {
    try {
      setIsLoading(true);
      const data = await documentsService.getDocuments();
      setDocuments(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load documents');
    } finally {
      setIsLoading(false);
    }
  };

  const getDocumentByType = (type: string) => {
    return documents.find(d => d.type === type);
  };

  const handleUpload = async (type: string, url: string) => {
    try {
      setUploadingType(type);
      const existingDoc = getDocumentByType(type);
      if (existingDoc) {
        const updated = await documentsService.updateDocument(existingDoc.id, { url });
        setDocuments(documents.map(d => d.id === existingDoc.id ? updated : d));
      } else {
        const newDoc = await documentsService.uploadDocument({ type: type as Document['type'], url });
        setDocuments([...documents, newDoc]);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to upload');
    } finally {
      setUploadingType(null);
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  const approvedCount = documents.filter(d => d.status === 'approved').length;
  const pendingCount = documents.filter(d => d.status === 'pending').length;
  const allApproved = approvedCount === documentTypes.length;

  return (
    <div className="min-h-screen bg-gray-bg">
      {/* Header */}
      <div className="bg-white px-4 pt-12 pb-4 safe-area-top shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center"
          >
            <ArrowLeft size={20} className="text-dark" />
          </button>
          <h1 className="text-xl font-semibold text-dark">Documents</h1>
        </div>
      </div>

      {/* Status Banner */}
      <div className="px-4 pt-4">
        <Card className={`p-4 ${allApproved ? 'bg-primary/10 border-primary/20' : 'bg-accent/10 border-accent/20'}`}>
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${allApproved ? 'bg-primary/20' : 'bg-accent/20'}`}>
              {allApproved ? (
                <CheckCircle size={24} className="text-primary" />
              ) : (
                <AlertCircle size={24} className="text-accent" />
              )}
            </div>
            <div>
              <p className="font-semibold text-dark">
                {allApproved ? 'All documents verified!' : 'Documents pending'}
              </p>
              <p className="text-sm text-gray-600">
                {approvedCount}/{documentTypes.length} approved
                {pendingCount > 0 && `, ${pendingCount} pending review`}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Content */}
      <div className="p-4">
        {error && (
          <Card className="p-4 bg-danger/10 border-danger/20 mb-4">
            <p className="text-danger text-sm">{error}</p>
          </Card>
        )}

        <div className="space-y-3">
          {documentTypes.map((docType) => {
            const document = getDocumentByType(docType.type);
            return (
              <DocumentCard
                key={docType.type}
                type={docType.type}
                label={docType.label}
                description={docType.description}
                document={document}
                isUploading={uploadingType === docType.type}
                onUpload={(url) => handleUpload(docType.type, url)}
              />
            );
          })}
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Documents are reviewed within 24-48 hours
        </p>
      </div>
    </div>
  );
}

function DocumentCard({
  type,
  label,
  description,
  document,
  isUploading,
  onUpload,
}: {
  type: string;
  label: string;
  description: string;
  document?: Document;
  isUploading: boolean;
  onUpload: (url: string) => void;
}) {
  const statusConfig = {
    approved: { icon: CheckCircle, color: 'text-primary', bg: 'bg-primary/10', label: 'Approved' },
    pending: { icon: Clock, color: 'text-accent', bg: 'bg-accent/10', label: 'Pending' },
    rejected: { icon: AlertCircle, color: 'text-danger', bg: 'bg-danger/10', label: 'Rejected' },
  };

  const status = document?.status;
  const config = status ? statusConfig[status] : null;

  const handleFileSelect = () => {
    // In a real app, this would open file picker and upload to cloud storage
    // For demo, we'll use a placeholder URL
    const mockUrl = `https://storage.hande.co.zw/documents/${Date.now()}_${type}.jpg`;
    onUpload(mockUrl);
  };

  return (
    <Card className="p-4">
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${config?.bg || 'bg-gray-100'}`}>
          <FileText size={24} className={config?.color || 'text-gray-400'} />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-dark">{label}</h3>
            {config && (
              <span className={`text-xs px-2 py-1 rounded-full ${config.bg} ${config.color}`}>
                {config.label}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-0.5">{description}</p>
          
          {document?.status === 'rejected' && document.rejectionReason && (
            <p className="text-sm text-danger mt-2 bg-danger/10 p-2 rounded">
              {document.rejectionReason}
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100">
        {!document || document.status === 'rejected' ? (
          <Button
            variant="outline"
            fullWidth
            onClick={handleFileSelect}
            disabled={isUploading}
          >
            {isUploading ? (
              'Uploading...'
            ) : (
              <>
                <Upload size={16} className="mr-2" />
                {document?.status === 'rejected' ? 'Re-upload' : 'Upload'}
              </>
            )}
          </Button>
        ) : (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">
              Uploaded {new Date(document.createdAt).toLocaleDateString()}
            </span>
            <button 
              onClick={handleFileSelect}
              className="text-primary font-medium hover:underline"
            >
              Update
            </button>
          </div>
        )}
      </div>
    </Card>
  );
}
