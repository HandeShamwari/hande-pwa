'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { 
  ArrowLeft, 
  Users,
  Phone,
  Plus,
  Trash2,
  Edit2,
  X,
  AlertCircle,
  Star
} from 'lucide-react';
import type { RootState } from '@/store';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingScreen } from '@/components/ui/loading';
import { riderService, EmergencyContact } from '@/lib/services';

export default function RiderEmergencyPage() {
  const router = useRouter();
  const { isAuthenticated, userType } = useSelector((state: RootState) => state.auth);
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }
    if (userType === 'driver') {
      router.replace('/driver');
      return;
    }
    loadContacts();
  }, [isAuthenticated, userType, router]);

  const loadContacts = async () => {
    try {
      setIsLoading(true);
      const data = await riderService.getEmergencyContacts();
      setContacts(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load emergency contacts');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this emergency contact?')) return;
    try {
      await riderService.deleteEmergencyContact(id);
      setContacts(contacts.filter(c => c.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-bg">
      {/* Header */}
      <div className="bg-white px-4 pt-12 pb-4 safe-area-top shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center"
            >
              <ArrowLeft size={20} className="text-dark" />
            </button>
            <h1 className="text-xl font-semibold text-dark">Emergency Contacts</h1>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="w-10 h-10 bg-primary rounded-full flex items-center justify-center"
          >
            <Plus size={20} className="text-white" />
          </button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="px-4 pt-4">
        <Card className="p-4 bg-blue-50 border-blue-100">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="text-blue-500 mt-0.5" />
            <div>
              <p className="text-sm text-blue-800 font-medium">Share your trip status</p>
              <p className="text-sm text-blue-600">
                During a ride, you can share your live location and trip details with your emergency contacts.
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

        {contacts.length === 0 ? (
          <Card className="p-8 text-center">
            <Users size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-dark mb-2">No emergency contacts</h3>
            <p className="text-gray-500 text-sm mb-4">
              Add trusted contacts who can be notified during rides
            </p>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus size={18} className="mr-2" /> Add Contact
            </Button>
          </Card>
        ) : (
          <div className="space-y-3">
            {contacts.map((contact) => (
              <ContactCard
                key={contact.id}
                contact={contact}
                onEdit={() => setEditingContact(contact)}
                onDelete={() => handleDelete(contact.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || editingContact) && (
        <ContactModal
          contact={editingContact}
          onClose={() => {
            setShowAddModal(false);
            setEditingContact(null);
          }}
          onSave={async (data) => {
            try {
              if (editingContact) {
                const updated = await riderService.updateEmergencyContact(editingContact.id, data);
                setContacts(contacts.map(c => c.id === editingContact.id ? updated : c));
              } else {
                const newContact = await riderService.createEmergencyContact(data);
                setContacts([...contacts, newContact]);
              }
              setShowAddModal(false);
              setEditingContact(null);
            } catch (err: any) {
              alert(err.response?.data?.message || 'Failed to save');
            }
          }}
        />
      )}
    </div>
  );
}

function ContactCard({
  contact,
  onEdit,
  onDelete,
}: {
  contact: EmergencyContact;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
          <span className="text-primary font-semibold text-lg">
            {contact.name.charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="font-medium text-dark">{contact.name}</p>
            {contact.isPrimary && (
              <Star size={14} className="text-accent fill-accent" />
            )}
          </div>
          <p className="text-sm text-gray-500">{contact.relationship}</p>
          <div className="flex items-center gap-1 mt-1">
            <Phone size={12} className="text-gray-400" />
            <p className="text-sm text-gray-600">{contact.phone}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={onEdit} className="p-2 hover:bg-gray-100 rounded-full">
            <Edit2 size={16} className="text-gray-400" />
          </button>
          <button onClick={onDelete} className="p-2 hover:bg-gray-100 rounded-full">
            <Trash2 size={16} className="text-danger" />
          </button>
        </div>
      </div>
    </Card>
  );
}

function ContactModal({
  contact,
  onClose,
  onSave,
}: {
  contact: EmergencyContact | null;
  onClose: () => void;
  onSave: (data: Omit<EmergencyContact, 'id'>) => void;
}) {
  const [name, setName] = useState(contact?.name || '');
  const [phone, setPhone] = useState(contact?.phone || '');
  const [relationship, setRelationship] = useState(contact?.relationship || '');
  const [isPrimary, setIsPrimary] = useState(contact?.isPrimary || false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !relationship) return;
    
    setIsLoading(true);
    await onSave({ name, phone, relationship, isPrimary });
    setIsLoading(false);
  };

  const relationships = ['Parent', 'Spouse', 'Sibling', 'Friend', 'Other'];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
      <div className="bg-white w-full rounded-t-2xl p-6 safe-area-bottom animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-dark">
            {contact ? 'Edit Contact' : 'Add Emergency Contact'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contact name"
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+263 7X XXX XXXX"
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Relationship</label>
            <div className="flex flex-wrap gap-2">
              {relationships.map(rel => (
                <button
                  key={rel}
                  type="button"
                  onClick={() => setRelationship(rel)}
                  className={`py-2 px-4 rounded-full border text-sm ${
                    relationship === rel 
                      ? 'border-primary bg-primary/10 text-primary' 
                      : 'border-gray-200 text-gray-600'
                  }`}
                >
                  {rel}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsPrimary(!isPrimary)}
              className={`w-5 h-5 rounded border flex items-center justify-center ${
                isPrimary ? 'bg-primary border-primary' : 'border-gray-300'
              }`}
            >
              {isPrimary && <span className="text-white text-xs">✓</span>}
            </button>
            <span className="text-sm text-gray-700">Set as primary contact</span>
          </div>

          <Button 
            type="submit" 
            fullWidth 
            disabled={isLoading || !name || !phone || !relationship}
          >
            {isLoading ? 'Saving...' : contact ? 'Update Contact' : 'Add Contact'}
          </Button>
        </form>
      </div>
    </div>
  );
}
