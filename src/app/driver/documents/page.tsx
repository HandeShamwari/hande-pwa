'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { Check, Clock, AlertCircle, ChevronRight } from 'lucide-react';
import type { RootState } from '@/store';
import { LoadingScreen } from '@/components/ui/loading';
import { driverService, Document } from '@/lib/services';

export default function DriverDocumentsPage() {
  const router = useRouter();
  const { isAuthenticated, userType } = useSelector((state: RootState) => state.auth);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) { router.replace('/login'); return; }
    if (userType === 'rider') { router.replace('/rider'); return; }
    loadDocuments();
  }, [isAuthenticated, userType, router]);

  const loadDocuments = async () => {
    try {
      setIsLoading(true);
      const data = await driverService.getDocuments();
      setDocuments(data);
    } catch (err) {
      console.error('Failed to load documents:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'approved': return { icon: <Check size={16} className="text-white" />, bg: 'bg-primary', text: 'Approved', color: 'text-primary' };
      case 'pending': return { icon: <Clock size={16} className="text-white" />, bg: 'bg-amber-500', text: 'Pending', color: 'text-amber-500' };
      case 'rejected': return { icon: <AlertCircle size={16} className="text-white" />, bg: 'bg-red-500', text: 'Rejected', color: 'text-red-500' };
      default: return { icon: <AlertCircle size={16} className="text-white" />, bg: 'bg-gray-400', text: 'Required', color: 'text-gray-500' };
    }
  };

  const getDocIcon = (type: string) => {
    switch (type) {
      case 'drivers_license': return '🪪';
      case 'vehicle_registration': return '📋';
      case 'insurance': return '🛡️';
      case 'profile_photo': return '📸';
      case 'vehicle_photo': return '🚗';
      default: return '📄';
    }
  };

  const getDocName = (type: string) => {
    switch (type) {
      case 'drivers_license': return "Driver's License";
      case 'vehicle_registration': return 'Vehicle Registration';
      case 'insurance': return 'Insurance Certificate';
      case 'profile_photo': return 'Profile Photo';
      case 'vehicle_photo': return 'Vehicle Photo';
      default: return type.replace(/_/g, ' ');
    }
  };

  const requiredDocs = ['drivers_license', 'vehicle_registration', 'insurance', 'profile_photo', 'vehicle_photo'];
  const allDocs = requiredDocs.map(type => {
    const existing = documents.find(d => d.type === type);
    return existing || { id: '', type, status: 'missing', uploadedAt: '' };
  });

  const approvedCount = documents.filter(d => d.status === 'approved').length;
  const progress = (approvedCount / requiredDocs.length) * 100;

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="px-6 pt-14 pb-4 safe-area-top">
        <button onClick={() => router.back()} className="text-black font-medium">← Back</button>
        <h1 className="text-xl font-semibold text-black mt-4">Documents</h1>
        <p className="text-gray-500 mt-1">Upload and manage your documents</p>
      </div>

      <div className="px-6 mb-4">
        <div className="bg-gray-100 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-black">Verification Progress</span>
            <span className="text-sm text-primary font-semibold">{approvedCount}/{requiredDocs.length}</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-sm text-gray-500 mt-2">
            {progress === 100 ? '✓ All documents verified!' : 'Complete all documents to start driving'}
          </p>
        </div>
      </div>

      <div className="px-6 flex-1">
        <p className="text-sm text-gray-500 mb-3">Required Documents</p>
        <div className="bg-gray-100 rounded-xl overflow-hidden">
          {allDocs.map((doc, index) => {
            const status = getStatusInfo(doc.status);
            return (
              <button
                key={doc.type}
                onClick={() => router.push(`/driver/documents/upload?type=${doc.type}`)}
                className={`w-full flex items-center gap-4 p-4 ${index > 0 ? 'border-t border-gray-200' : ''}`}
              >
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
                  <span className="text-2xl">{getDocIcon(doc.type)}</span>
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium text-black">{getDocName(doc.type)}</p>
                  <p className={`text-sm ${status.color}`}>{status.text}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full ${status.bg} flex items-center justify-center`}>
                    {status.icon}
                  </div>
                  <ChevronRight size={20} className="text-gray-400" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-6 py-8">
        <div className="bg-primary/10 rounded-xl p-4">
          <h4 className="font-medium text-black mb-2">Tips for Approval</h4>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2"><span className="text-primary">•</span> Ensure documents are clearly visible and not expired</li>
            <li className="flex items-start gap-2"><span className="text-primary">•</span> Photos should be well-lit without glare</li>
            <li className="flex items-start gap-2"><span className="text-primary">•</span> All text must be legible</li>
            <li className="flex items-start gap-2"><span className="text-primary">•</span> Documents are reviewed within 24-48 hours</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
