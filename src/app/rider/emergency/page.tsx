'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
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
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="px-6 pt-14 pb-4 safe-area-top flex items-center justify-between">
        <div>
          <button onClick={() => router.back()} className="text-black font-medium">
            ← Back
          </button>
          <h1 className="text-xl font-semibold text-black mt-4">Emergency Contacts</h1>
        </div>
        <button onClick={() => setShowAddModal(true)} className="text-primary font-medium">
          + Add
        </button>
      </div>

      {/* Info */}
      <div className="px-6 mb-4">
        <p className="text-sm text-gray-500">
          These contacts can be notified during your rides with your live location.
        </p>
      </div>

      {/* Content */}
      <div className="px-6 flex-1">
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-4 text-sm">
            {error}
          </div>
        )}

        {contacts.length === 0 ? (
          <div className="bg-gray-100 rounded-xl p-8 text-center">
            <p className="text-gray-500 mb-2">No emergency contacts</p>
            <p className="text-sm text-gray-400">Add trusted contacts who can be notified during rides</p>
          </div>
        ) : (
          <div className="space-y-3">
            {contacts.map((contact) => (
              <div key={contact.id} className="bg-gray-100 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="font-semibold text-gray-600">
                        {contact.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-black">
                        {contact.name}
                        {contact.isPrimary && <span className="ml-2 text-xs text-primary">Primary</span>}
                      </p>
                      <p className="text-sm text-gray-500">{contact.relationship} · {contact.phone}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setEditingContact(contact)} className="text-sm text-gray-500">Edit</button>
                    <button onClick={() => handleDelete(contact.id)} className="text-sm text-red-500">Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="h-8" />

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
      <div className="bg-white w-full rounded-t-2xl p-6 safe-area-bottom">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-black">
            {contact ? 'Edit Contact' : 'Add Contact'}
          </h2>
          <button onClick={onClose} className="text-gray-500">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
            className="w-full px-4 py-4 bg-gray-100 rounded-xl text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
          />

          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone number"
            className="w-full px-4 py-4 bg-gray-100 rounded-xl text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
          />

          <div className="flex flex-wrap gap-2">
            {relationships.map(rel => (
              <button
                key={rel}
                type="button"
                onClick={() => setRelationship(rel)}
                className={`py-2 px-4 rounded-xl text-sm ${
                  relationship === rel 
                    ? 'bg-primary/10 text-primary border border-primary' 
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {rel}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={isPrimary}
              onChange={(e) => setIsPrimary(e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span className="text-sm text-gray-700">Set as primary contact</span>
          </label>

          <button 
            type="submit" 
            disabled={isLoading || !name || !phone || !relationship}
            className="w-full py-4 bg-primary text-white font-semibold rounded-xl disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : contact ? 'Update' : 'Add Contact'}
          </button>
        </form>
      </div>
    </div>
  );
}
