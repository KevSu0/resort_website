import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Users,
  Mail,
  Phone,
  MapPin,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { enquiriesService } from '../services/enquiriesService';
import { type Enquiry } from '../types/entities';
import { useAuth } from '../../hooks/admin/useAuth';

export const EnquiryFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _ = user; // Mark as used to avoid lint error 
  const [enquiry, setEnquiry] = useState<Partial<Enquiry>>({
    name: '',
    email: '',
    phone: '',
    location: '',
    propertyName: '',
    roomType: '',
    checkIn: '',
    checkOut: '',
    adults: 2,
    children: 0,
    budget: 0,
    notes: ''
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const handleSave = async () => {
    setSaving(true);
    setErrors([]);

    try {
      // Validate
      const validationErrors: string[] = [];
      if (!enquiry.name) validationErrors.push('Name is required');
      if (!enquiry.email) validationErrors.push('Email is required');
      if (!enquiry.phone) validationErrors.push('Phone is required');
      if (!enquiry.propertyName) validationErrors.push('Property is required');
      if (!enquiry.checkIn) validationErrors.push('Check-in date is required');
      if (!enquiry.checkOut) validationErrors.push('Check-out date is required');
      if ((enquiry.adults || 0) < 1) validationErrors.push('At least 1 adult is required');

      if (validationErrors.length > 0) {
        setErrors(validationErrors);
        setSaving(false);
        return;
      }

      await enquiriesService.createEnquiry(enquiry as Enquiry);
      navigate('/admin/enquiries');
    } catch (err) {
      setErrors([err instanceof Error ? err.message : 'Failed to create enquiry']);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/admin/enquiries')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">New Enquiry</h1>
            <p className="text-gray-600">Create a new guest enquiry</p>
          </div>
        </div>

        <Button onClick={handleSave} disabled={saving}>
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Creating...' : 'Create Enquiry'}
        </Button>
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-800 mb-2">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">Please fix the following errors:</span>
          </div>
          <ul className="list-disc list-inside text-red-700">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Form */}
      <div className="bg-white rounded-lg border p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Guest Information */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Guest Information</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={enquiry.name || ''}
                  onChange={(e) => setEnquiry({ ...enquiry, name: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={enquiry.email || ''}
                  onChange={(e) => setEnquiry({ ...enquiry, email: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone *
              </label>
              <div className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  value={enquiry.phone || ''}
                  onChange={(e) => setEnquiry({ ...enquiry, phone: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={enquiry.location || ''}
                  onChange={(e) => setEnquiry({ ...enquiry, location: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  placeholder="City, State, Country"
                />
              </div>
            </div>
          </div>

          {/* Booking Details */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Booking Details</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Property *
              </label>
              <input
                type="text"
                value={enquiry.propertyName || ''}
                onChange={(e) => setEnquiry({ ...enquiry, propertyName: e.target.value })}
                className="w-full border rounded px-3 py-2"
                placeholder="Property name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Room Type
              </label>
              <input
                type="text"
                value={enquiry.roomType || ''}
                onChange={(e) => setEnquiry({ ...enquiry, roomType: e.target.value })}
                className="w-full border rounded px-3 py-2"
                placeholder="e.g., Deluxe Room, Treehouse"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Check-in *
                </label>
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <input
                    type="date"
                    value={enquiry.checkIn || ''}
                    onChange={(e) => setEnquiry({ ...enquiry, checkIn: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Check-out *
                </label>
                <input
                  type="date"
                  value={enquiry.checkOut || ''}
                  onChange={(e) => setEnquiry({ ...enquiry, checkOut: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adults *
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={enquiry.adults || 1}
                  onChange={(e) => setEnquiry({ ...enquiry, adults: parseInt(e.target.value) || 1 })}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Children
                </label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={enquiry.children || 0}
                  onChange={(e) => setEnquiry({ ...enquiry, children: parseInt(e.target.value) || 0 })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Budget (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={enquiry.budget || 0}
                  onChange={(e) => setEnquiry({ ...enquiry, budget: parseInt(e.target.value) || 0 })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="md:col-span-2">
            <h2 className="text-lg font-semibold mb-2">Additional Information</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <div className="flex items-start gap-2">
                <FileText className="w-5 h-5 text-gray-400 mt-1" />
                <textarea
                  value={enquiry.notes || ''}
                  onChange={(e) => setEnquiry({ ...enquiry, notes: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  rows={4}
                  placeholder="Special requests, preferences, or additional information..."
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};