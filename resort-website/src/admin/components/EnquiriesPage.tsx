import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Plus,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  MessageSquare,
  Wifi,
  WifiOff,
  Filter
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { enquiriesService } from '../services/enquiriesService';
import { type Enquiry, type EnquiryStatus } from '../types/entities';
import { useAuth } from '../../hooks/admin/useAuth';

const statusColors = {
  NEW: 'bg-blue-100 text-blue-800',
  CONTACTED: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-green-100 text-green-800',
  DECLINED: 'bg-red-100 text-red-800',
  CANCELLED: 'bg-red-100 text-red-800'
};

const statusIcons = {
  NEW: AlertCircle,
  CONTACTED: Clock,
  CONFIRMED: CheckCircle,
  DECLINED: XCircle,
  CANCELLED: XCircle
};

export const EnquiriesPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{
    total: number;
    byStatus: Record<EnquiryStatus, number>;
  } | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<EnquiryStatus | 'All'>('All');
  const [filteredEnquiries, setFilteredEnquiries] = useState<Enquiry[]>([]);
  const [offlineQueueStatus, setOfflineQueueStatus] = useState<{
    pending: number;
    processing: boolean;
    isOnline: boolean;
  }>({ pending: 0, processing: false, isOnline: navigator.onLine });

  useEffect(() => {
    loadEnquiries();
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
  }, []);

  useEffect(() => {
    filterEnquiries();
  }, [enquiries, search, statusFilter, filterEnquiries]);

  const loadEnquiries = async () => {
    setLoading(true);
    try {
      const [enquiriesData, statsData] = await Promise.all([
        enquiriesService.loadEnquiries(),
        enquiriesService.getEnquiryStats()
      ]);
      setEnquiries(enquiriesData);
      setStats(statsData);
    } catch (err) {
      console.error('Failed to load enquiries:', err);
    } finally {
      setLoading(false);
    }
  };

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

  const filterEnquiries = useCallback(() => {
    let filtered = enquiries;

    if (statusFilter !== 'All') {
      filtered = filtered.filter(e => e.status === statusFilter);
    }

    if (search) {
      filtered = filtered.filter(e =>
        (e.refCode || '').toLowerCase().includes(search.toLowerCase()) ||
        (e.name || e.fullName || '').toLowerCase().includes(search.toLowerCase()) ||
        (e.email || '').toLowerCase().includes(search.toLowerCase()) ||
        e.phone.includes(search) ||
        (e.propertyName || '').toLowerCase().includes(search.toLowerCase())
      );
    }

    setFilteredEnquiries(filtered);
  }, [enquiries, search, statusFilter]);

  const handleStatusUpdate = async (id: string, status: EnquiryStatus) => {
    try {
      await enquiriesService.updateEnquiry(id, {
        status,
        updatedBy: user?.email || 'Admin'
      });
      await loadEnquiries();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleWhatsApp = async (enquiry: Enquiry) => {
    try {
      await enquiriesService.logWhatsAppAction(enquiry.id, enquiry.phone);
      const text = `Hi ${enquiry.name}, regarding your enquiry ${enquiry.refCode}...`;
      window.open(`https://wa.me/${enquiry.phone.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`, '_blank');
      loadOfflineQueueStatus();
    } catch (err) {
      console.error('Failed to log WhatsApp action:', err);
    }
  };

  const handleEmail = async (enquiry: Enquiry) => {
    try {
      await enquiriesService.logEmailAction(enquiry.id, enquiry.email);
      window.open(`mailto:${enquiry.email}`, '_blank');
      loadOfflineQueueStatus();
    } catch (err) {
      console.error('Failed to log email action:', err);
    }
  };

  const handleCall = async (enquiry: Enquiry) => {
    try {
      await enquiriesService.logCallAction(enquiry.id, enquiry.phone);
      window.open(`tel:${enquiry.phone}`, '_blank');
      loadOfflineQueueStatus();
    } catch (err) {
      console.error('Failed to log call action:', err);
    }
  };

  const handleSearch = async () => {
    if (search) {
      try {
        const results = await enquiriesService.searchEnquiries(search);
        setFilteredEnquiries(results);
      } catch (err) {
        console.error('Search failed:', err);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Enquiries</h1>
            <p className="text-gray-600 mt-2">Manage guest enquiries and booking requests</p>
          </div>

          {/* Offline Queue Status */}
          <div className="flex items-center gap-2">
            {offlineQueueStatus.isOnline ? (
              <Wifi className="w-5 h-5 text-green-500" />
            ) : (
              <WifiOff className="w-5 h-5 text-red-500" />
            )}
            {offlineQueueStatus.pending > 0 && (
              <div className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                {offlineQueueStatus.pending} pending sync
              </div>
            )}
          </div>
        </div>
        <Button onClick={() => navigate('/admin/enquiries/new')} className="px-4 py-3">
          <Plus className="w-4 h-4 mr-2" />
          New Enquiry
        </Button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-600 mt-1">Total Enquiries</div>
          </div>
          {Object.entries(stats.byStatus).map(([status, count]) => {
            const Icon = statusIcons[status as EnquiryStatus];
            return (
              <div key={status} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2">
                  <Icon className="w-5 h-5 text-gray-400" />
                  <div className="text-2xl font-bold text-gray-900">{count as number}</div>
                </div>
                <div className="text-sm text-gray-600 mt-1">{status}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search by name, email, phone, or ref code..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <Button variant="outline" onClick={handleSearch}>
              Search
            </Button>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as EnquiryStatus | 'All')}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="All">All Status</option>
            {Object.keys(statusColors).map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Enquiries List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {filteredEnquiries.length === 0 ? (
          <div className="text-center py-16">
            <Mail className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No enquiries found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredEnquiries.map((enquiry) => (
              <div key={enquiry.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <span className="font-mono text-sm font-medium text-gray-900 bg-gray-100 px-2 py-1 rounded">{enquiry.refCode}</span>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusColors[enquiry.status]}`}>
                        {enquiry.status}
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(enquiry.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 text-sm">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span className="font-medium text-gray-900">{enquiry.name}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <Mail className="w-4 h-4 text-gray-400" />
                          {enquiry.email}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <Phone className="w-4 h-4 text-gray-400" />
                          {enquiry.phone}
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 text-sm">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-900">{enquiry.propertyName}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span>{enquiry.checkIn} - {enquiry.checkOut}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span>{enquiry.adults} adults, {enquiry.children} children</span>
                        </div>
                      </div>
                    </div>

                    {enquiry.notes && (
                      <div className="bg-gray-50 rounded-lg p-3 mt-3">
                        <p className="text-sm text-gray-700">{enquiry.notes}</p>
                      </div>
                    )}

                    {/* Timeline */}
                    {enquiry.timeline.length > 1 && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span>Last updated: {new Date(enquiry.updatedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 lg:ml-4">
                    <div className="flex gap-2">
                      {/* Quick Actions */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleWhatsApp(enquiry)}
                        className="p-2 text-green-600 hover:text-green-700"
                        title="WhatsApp"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEmail(enquiry)}
                        className="p-2 text-blue-600 hover:text-blue-700"
                        title="Send Email"
                      >
                        <Mail className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCall(enquiry)}
                        className="p-2 text-purple-600 hover:text-purple-700"
                        title="Call"
                      >
                        <Phone className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/admin/enquiries/${enquiry.id}`)}
                        className="px-3 py-2"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                      <select
                        value={enquiry.status}
                        onChange={(e) => handleStatusUpdate(enquiry.id, e.target.value as EnquiryStatus)}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        {Object.keys(statusColors).map(status => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};