import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  Plus,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  Eye,
  Edit
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
  const [stats, setStats] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<EnquiryStatus | 'All'>('All');
  const [filteredEnquiries, setFilteredEnquiries] = useState<Enquiry[]>([]);

  useEffect(() => {
    loadEnquiries();
  }, []);

  useEffect(() => {
    filterEnquiries();
  }, [enquiries, search, statusFilter]);

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

  const filterEnquiries = () => {
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
  };

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Enquiries</h1>
          <p className="text-gray-600 mt-2">Manage guest enquiries and booking requests</p>
        </div>
        <Button onClick={() => navigate('/admin/enquiries/new')}>
          <Plus className="w-4 h-4 mr-2" />
          New Enquiry
        </Button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <div className="bg-white rounded-lg border p-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Enquiries</div>
          </div>
          {Object.entries(stats.byStatus).map(([status, count]) => {
            const Icon = statusIcons[status as EnquiryStatus];
            return (
              <div key={status} className="bg-white rounded-lg border p-4">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  <div className="text-2xl font-bold">{count as number}</div>
                </div>
                <div className="text-sm text-gray-600">{status}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* Search and Filter */}
      <div className="bg-white rounded-lg border p-4">
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
                className="w-full pl-10 pr-4 py-2 border rounded-lg"
              />
            </div>
            <Button variant="outline" onClick={handleSearch}>
              Search
            </Button>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="All">All Status</option>
            {Object.keys(statusColors).map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Enquiries List */}
      <div className="bg-white rounded-lg border">
        {filteredEnquiries.length === 0 ? (
          <div className="text-center py-12">
            <Mail className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">No enquiries found</p>
          </div>
        ) : (
          <div className="divide-y">
            {filteredEnquiries.map((enquiry) => (
              <div key={enquiry.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-mono text-sm font-medium">{enquiry.refCode}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[enquiry.status]}`}>
                        {enquiry.status}
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(enquiry.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span className="font-medium">{enquiry.name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="w-4 h-4 text-gray-400" />
                          {enquiry.email}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="w-4 h-4 text-gray-400" />
                          {enquiry.phone}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span>{enquiry.propertyName}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {enquiry.checkIn} - {enquiry.checkOut}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Users className="w-4 h-4 text-gray-400" />
                          {enquiry.adults} adults, {enquiry.children} children
                        </div>
                      </div>
                    </div>

                    {enquiry.notes && (
                      <p className="text-sm text-gray-600 mt-2">{enquiry.notes}</p>
                    )}

                    {/* Timeline */}
                    {enquiry.timeline.length > 1 && (
                      <div className="mt-3 pt-3 border-t">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span>Last updated: {new Date(enquiry.updatedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/admin/enquiries/${enquiry.id}`)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <select
                      value={enquiry.status}
                      onChange={(e) => handleStatusUpdate(enquiry.id, e.target.value as EnquiryStatus)}
                      className="px-3 py-1 border rounded text-sm"
                    >
                      {Object.keys(statusColors).map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
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