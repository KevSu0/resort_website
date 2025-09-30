import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  Plus,
  Tag,
  Percent,
  DollarSign,
  Gift,
  Package,
  Calendar,
  Users,
  TrendingUp,
  Copy,
  Download,
  Trash2,
  Edit,
  Eye,
  MoreVertical
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { offersService, type OfferFilters, type OfferStats } from '../../admin/services/offersService';
import { type Offer, type OfferType, type OfferStatus } from '../../admin/types/entities';
import { useAuth } from '../../hooks/admin/useAuth';

const offerTypeIcons = {
  PERCENTAGE: Percent,
  FIXED_AMOUNT: DollarSign,
  FREE_NIGHTS: Gift,
  PACKAGE_DEAL: Package
};

const offerTypeLabels = {
  PERCENTAGE: 'Percentage Discount',
  FIXED_AMOUNT: 'Fixed Amount',
  FREE_NIGHTS: 'Free Nights',
  PACKAGE_DEAL: 'Package Deal'
};

const statusColors = {
  DRAFT: 'bg-gray-100 text-gray-800',
  ACTIVE: 'bg-green-100 text-green-800',
  EXPIRED: 'bg-red-100 text-red-800',
  DELETED: 'bg-gray-100 text-gray-800'
};

export const OffersPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<OfferStats | null>(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<OfferType | 'All'>('All');
  const [statusFilter, setStatusFilter] = useState<OfferStatus | 'All'>('All');
  const [filteredOffers, setFilteredOffers] = useState<Offer[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadOffers();
  }, []);

  useEffect(() => {
    filterOffers();
  }, [offers, search, typeFilter, statusFilter]);

  const loadOffers = async () => {
    setLoading(true);
    try {
      const [offersData, statsData] = await Promise.all([
        offersService.loadOffers(),
        offersService.getOfferStats()
      ]);
      setOffers(offersData);
      setStats(statsData);
    } catch (err) {
      console.error('Failed to load offers:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterOffers = () => {
    let filtered = offers;

    if (typeFilter !== 'All') {
      filtered = filtered.filter(o => o.type === typeFilter);
    }

    if (statusFilter !== 'All') {
      filtered = filtered.filter(o => o.status === statusFilter);
    }

    if (search) {
      filtered = filtered.filter(o =>
        o.name.toLowerCase().includes(search.toLowerCase()) ||
        o.description.toLowerCase().includes(search.toLowerCase()) ||
        o.code?.toLowerCase().includes(search.toLowerCase())
      );
    }

    setFilteredOffers(filtered);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this offer?')) {
      return;
    }

    try {
      await offersService.deleteOffer(id);
      await loadOffers();
    } catch (err) {
      console.error('Failed to delete offer:', err);
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      await offersService.duplicateOffer(id);
      await loadOffers();
    } catch (err) {
      console.error('Failed to duplicate offer:', err);
    }
  };

  const handleExport = async (format: 'json' | 'csv' = 'json') => {
    try {
      const data = await offersService.exportOffers(format);
      const blob = new Blob([data], {
        type: format === 'json' ? 'application/json' : 'text/csv'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `offers.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export offers:', err);
    }
  };

  const formatValue = (offer: Offer): string => {
    switch (offer.type) {
      case 'PERCENTAGE':
        return `${offer.value}%`;
      case 'FIXED_AMOUNT':
        return `₹${offer.value}`;
      case 'FREE_NIGHTS':
        return `${offer.value} nights`;
      case 'PACKAGE_DEAL':
        return offer.value;
      default:
        return String(offer.value);
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
          <h1 className="text-3xl font-bold">Offers & Promotions</h1>
          <p className="text-gray-600 mt-2">Manage discounts, promotions, and special offers</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => handleExport('json')}
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => navigate('/admin/offers/new')}>
            <Plus className="w-4 h-4 mr-2" />
            New Offer
          </Button>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg border p-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Offers</div>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <div className="text-sm text-gray-600">Active</div>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <div className="text-2xl font-bold text-red-600">{stats.expired}</div>
            <div className="text-sm text-gray-600">Expired</div>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <div className="text-2xl font-bold text-gray-600">{stats.draft}</div>
            <div className="text-sm text-gray-600">Draft</div>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-gray-400" />
              <div className="text-2xl font-bold">
                {Math.round((stats.active / stats.total) * 100) || 0}%
              </div>
            </div>
            <div className="text-sm text-gray-600">Active Rate</div>
          </div>
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
                placeholder="Search offers..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="All">All Types</option>
              {Object.entries(offerTypeLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="All">All Status</option>
              <option value="DRAFT">Draft</option>
              <option value="ACTIVE">Active</option>
              <option value="EXPIRED">Expired</option>
            </select>
          </div>
        )}
      </div>

      {/* Offers List */}
      <div className="bg-white rounded-lg border">
        {filteredOffers.length === 0 ? (
          <div className="text-center py-12">
            <Tag className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">No offers found</p>
          </div>
        ) : (
          <div className="divide-y">
            {filteredOffers.map((offer) => {
              const Icon = offerTypeIcons[offer.type];
              const isActive = offer.status === 'ACTIVE' && new Date(offer.validTo) > new Date();

              return (
                <div key={offer.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Icon className="w-5 h-5 text-gray-400" />
                        <h3 className="font-semibold">{offer.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[offer.status]}`}>
                          {offer.status}
                        </span>
                        {!isActive && offer.status === 'ACTIVE' && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Expired
                          </span>
                        )}
                      </div>

                      <p className="text-gray-600 mb-3">{offer.description}</p>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="text-gray-500">Value</div>
                          <div className="font-medium">{formatValue(offer)}</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Validity</div>
                          <div className="font-medium">
                            {new Date(offer.validFrom).toLocaleDateString()} - {new Date(offer.validTo).toLocaleDateString()}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-500">Usage</div>
                          <div className="font-medium">
                            {offer.usageCount} of {offer.maxUsage || '∞'} used
                          </div>
                        </div>
                      </div>

                      {offer.code && (
                        <div className="mt-3">
                          <div className="text-gray-500 text-sm">Code</div>
                          <div className="font-mono bg-gray-100 px-2 py-1 rounded inline-block">
                            {offer.code}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/admin/offers/${offer.id}`)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/admin/offers/${offer.id}/edit`)}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDuplicate(offer.id)}
                      >
                        <Copy className="w-4 h-4 mr-1" />
                        Duplicate
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(offer.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};