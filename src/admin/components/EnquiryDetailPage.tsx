import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Users,
  Edit,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  MessageSquare,
  Plus,
  Wifi,
  WifiOff
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { enquiriesService } from '../services/enquiriesService';
import { type Enquiry, type EnquiryStatus } from '../types/entities';
import { useAuth } from '../../hooks/admin/useAuth';

export const EnquiryDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [enquiry, setEnquiry] = useState<Enquiry | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<EnquiryStatus>('NEW');
  const [newNote, setNewNote] = useState('');
  const [offlineQueueStatus, setOfflineQueueStatus] = useState<{
    pending: number;
    processing: boolean;
    isOnline: boolean;
  }>({ pending: 0, processing: false, isOnline: navigator.onLine });

  useEffect(() => {
    loadEnquiry();
    loadOfflineQueueStatus();

    // Setup online/offline listeners
    const handleOnline = () => {
      setOfflineQueueStatus(prev => ({ ...prev, isOnline: true }));
      loadOfflineQueueStatus();
    };

    const handleOffline = () => {
      setOfflineQueueStatus(prev => ({ ...prev, isOnline: false }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [id, loadEnquiry]);

  const loadEnquiry = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const enquiries = await enquiriesService.loadEnquiries();
      const eq = enquiries.find(e => e.id === id);
      if (eq) {
        setEnquiry(eq);
        setNotes(eq.notes || '');
        setStatus(eq.status);
      } else {
        navigate('/admin/enquiries');
      }
    } catch (err) {
      console.error('Failed to load enquiry:', err);
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  const loadOfflineQueueStatus = async () => {
    try {
      const status = await enquiriesService.getOfflineQueueStatus();
      setOfflineQueueStatus(prev => ({
        ...prev,
        pending: status.pending,
        processing: status.processing
      }));
    } catch (err) {
      console.error('Failed to load offline queue status:', err);
    }
  };

  const handleSave = async () => {
    if (!enquiry || !user) return;

    setSaving(true);
    try {
      await enquiriesService.updateEnquiry(enquiry.id, {
        notes,
        status,
        updatedBy: user.email
      });
      await loadEnquiry();
      setEditing(false);
    } catch (err) {
      console.error('Failed to save enquiry:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleAddNote = async () => {
    if (!enquiry || !user || !newNote.trim()) return;

    try {
      await enquiriesService.updateEnquiry(enquiry.id, {
        notes: `${enquiry.notes}\n\n${new Date().toLocaleDateString()} - ${user.email}:\n${newNote}`,
        updatedBy: user.email
      });
      setNewNote('');
      await loadEnquiry();
      loadOfflineQueueStatus();
    } catch (err) {
      console.error('Failed to add note:', err);
    }
  };

  const handleDelete = async () => {
    if (!enquiry) return;
    if (!confirm('Are you sure you want to delete this enquiry?')) return;

    try {
      await enquiriesService.deleteEnquiry(enquiry.id);
      navigate('/admin/enquiries');
    } catch (err) {
      console.error('Failed to delete enquiry:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!enquiry) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/admin/enquiries')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{enquiry.refCode}</h1>
              {/* Offline Status */}
              <div className="flex items-center gap-1">
                {offlineQueueStatus.isOnline ? (
                  <Wifi className="w-4 h-4 text-green-500" />
                ) : (
                  <WifiOff className="w-4 h-4 text-red-500" />
                )}
                {offlineQueueStatus.pending > 0 && (
                  <div className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full">
                    {offlineQueueStatus.pending} pending
                  </div>
                )}
              </div>
            </div>
            <p className="text-gray-600">
              Enquiry from {enquiry.name} - {new Date(enquiry.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {editing ? (
            <>
              <Button variant="outline" onClick={() => setEditing(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save'}
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setEditing(true)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Guest Information */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-4">Guest Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Name</label>
                <div className="mt-1">{enquiry.name}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Email</label>
                <div className="mt-1 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <a href={`mailto:${enquiry.email}`} className="text-primary-600 hover:underline">
                    {enquiry.email}
                  </a>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Phone</label>
                <div className="mt-1 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <a href={`tel:${enquiry.phone}`} className="text-primary-600 hover:underline">
                    {enquiry.phone}
                  </a>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Location</label>
                <div className="mt-1 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  {enquiry.location}
                </div>
              </div>
            </div>
          </div>

          {/* Booking Details */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-4">Booking Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Property</label>
                <div className="mt-1">{enquiry.propertyName}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Room Type</label>
                <div className="mt-1">{enquiry.roomType}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Check-in</label>
                <div className="mt-1 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  {enquiry.checkIn}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Check-out</label>
                <div className="mt-1 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  {enquiry.checkOut}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Guests</label>
                <div className="mt-1 flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  {enquiry.adults} adults, {enquiry.children} children
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Budget</label>
                <div className="mt-1">₹{(enquiry.budget || 0).toLocaleString()}</div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Notes</h2>
            </div>
            {editing ? (
              <div className="space-y-4">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  rows={8}
                  placeholder="Add notes about this enquiry..."
                />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="prose prose-sm max-w-none">
                  {enquiry.notes ? (
                    enquiry.notes.split('\n\n').map((paragraph, index) => (
                      <p key={index} className="text-gray-700">{paragraph}</p>
                    ))
                  ) : (
                    <p className="text-gray-500">No notes added</p>
                  )}
                </div>

                {/* Add Note */}
                <div className="border-t pt-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder="Add a new note..."
                      className="flex-1 border rounded px-3 py-2"
                      onKeyPress={(e) => e.key === 'Enter' && handleAddNote()}
                    />
                    <Button onClick={handleAddNote} disabled={!newNote.trim()}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-4">Status</h2>
            {editing ? (
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as EnquiryStatus)}
                className="w-full border rounded px-3 py-2"
              >
                <option value="NEW">New</option>
                <option value="CONTACTED">Contacted</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="DECLINED">Declined</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            ) : (
              <div className="text-center">
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                  enquiry.status === 'NEW' ? 'bg-blue-100 text-blue-800' :
                  enquiry.status === 'CONTACTED' ? 'bg-yellow-100 text-yellow-800' :
                  enquiry.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                  enquiry.status === 'DECLINED' || enquiry.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {enquiry.status === 'NEW' && <Clock className="w-4 h-4" />}
                  {enquiry.status === 'CONTACTED' && <MessageSquare className="w-4 h-4" />}
                  {enquiry.status === 'CONFIRMED' && <CheckCircle className="w-4 h-4" />}
                  {(enquiry.status === 'DECLINED' || enquiry.status === 'CANCELLED') && <XCircle className="w-4 h-4" />}
                  {enquiry.status}
                </div>
              </div>
            )}
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Timeline</h2>
              {offlineQueueStatus.pending > 0 && (
                <div className="text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
                  {offlineQueueStatus.pending} events pending sync
                </div>
              )}
            </div>
            <div className="space-y-3">
              {enquiry.timeline.map((entry, index) => (
                <div key={entry.id} className="flex gap-3 group">
                  <div className="flex-shrink-0 w-2 h-2 bg-primary-600 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{entry.status}</span>
                      {entry.by.includes('Local Admin') && !offlineQueueStatus.isOnline && (
                        <div className="text-xs text-orange-600 bg-orange-50 px-2 py-0.5 rounded">
                          Pending sync
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(entry.timestamp).toLocaleString()} • {entry.by}
                    </div>
                    {entry.notes && (
                      <div className="text-sm text-gray-700 mt-1 bg-gray-50 p-2 rounded">
                        {entry.notes}
                      </div>
                    )}
                    {/* Show action buttons for timeline events */}
                    {index > 0 && (
                      <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs h-6"
                          onClick={() => {
                            // Copy timeline entry to clipboard or show details
                            navigator.clipboard.writeText(`${entry.status}: ${entry.notes}`);
                          }}
                        >
                          Copy
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {enquiry.timeline.length === 1 && (
                <div className="text-center py-4 text-gray-500">
                  No additional timeline events
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={async () => {
                  try {
                    await enquiriesService.logEmailAction(enquiry.id, enquiry.email);
                    window.open(`mailto:${enquiry.email}`, '_blank');
                    loadOfflineQueueStatus();
                  } catch (err) {
                    console.error('Failed to log email action:', err);
                  }
                }}
              >
                <Mail className="w-4 h-4 mr-2" />
                Send Email
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={async () => {
                  try {
                    await enquiriesService.logCallAction(enquiry.id, enquiry.phone);
                    window.open(`tel:${enquiry.phone}`, '_blank');
                    loadOfflineQueueStatus();
                  } catch (err) {
                    console.error('Failed to log call action:', err);
                  }
                }}
              >
                <Phone className="w-4 h-4 mr-2" />
                Call Guest
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={async () => {
                  try {
                    await enquiriesService.logWhatsAppAction(enquiry.id, enquiry.phone);
                    const text = `Hi ${enquiry.name}, regarding your enquiry ${enquiry.refCode}...`;
                    window.open(`https://wa.me/${enquiry.phone.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`, '_blank');
                    loadOfflineQueueStatus();
                  } catch (err) {
                    console.error('Failed to log WhatsApp action:', err);
                  }
                }}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                WhatsApp
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};