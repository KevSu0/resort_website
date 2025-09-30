import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  Plus,
  Building,
  MapPin,
  Star,
  Edit,
  Trash2,
  Copy,
  Download,
  Eye,
  MoreVertical,
  Grid,
  List
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { propertyService, type PropertyFilters, type PropertyStats } from '../../admin/services/propertyService';
import { type Property, type PropertyType } from '../../admin/types/entities';
import { useAuth } from '../../hooks/admin/useAuth';
import { Card } from '../../components/ui/Card';

const propertyTypeLabels = {
  TREEHOUSE: 'Treehouse',
  VILLA: 'Villa',
  SUITE: 'Suite',
  DELUXE_ROOM: 'Deluxe Room',
  STANDARD_ROOM: 'Standard Room'
};

export const PropertiesPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<PropertyStats | null>(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<PropertyType | 'All'>('All');
  const [featuredFilter, setFeaturedFilter] = useState<boolean | 'All'>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);

  useEffect(() => {
    loadProperties();
  }, []);

  useEffect(() => {
    filterProperties();
  }, [properties, search, typeFilter, featuredFilter]);

  const loadProperties = async () => {
    setLoading(true);
    try {
      const [propertiesData, statsData] = await Promise.all([
        propertyService.loadProperties(),
        propertyService.getPropertyStats()
      ]);
      setProperties(propertiesData);
      setStats(statsData);
    } catch (err) {
      console.error('Failed to load properties:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterProperties = () => {
    let filtered = properties;

    if (typeFilter !== 'All') {
      filtered = filtered.filter(p => p.type === typeFilter);
    }

    if (featuredFilter !== 'All') {
      filtered = filtered.filter(p => p.featured === featuredFilter);
    }

    if (search) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase()) ||
        p.location.city.toLowerCase().includes(search.toLowerCase())
      );
    }

    setFilteredProperties(filtered);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this property? This will also delete all associated rooms and places.')) {
      return;
    }

    try {
      await propertyService.deleteProperty(id);
      await loadProperties();
    } catch (err) {
      console.error('Failed to delete property:', err);
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      await propertyService.duplicateProperty(id);
      await loadProperties();
    } catch (err) {
      console.error('Failed to duplicate property:', err);
    }
  };

  const handleExport = async (format: 'json' | 'csv' = 'json') => {
    try {
      const data = await propertyService.exportProperties(format);
      const blob = new Blob([data], {
        type: format === 'json' ? 'application/json' : 'text/csv'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `properties.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export properties:', err);
    }
  };

  const handleToggleFeatured = async (id: string, featured: boolean) => {
    try {
      await propertyService.updateProperty(id, { featured });
      await loadProperties();
    } catch (err) {
      console.error('Failed to update property:', err);
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
          <h1 className="text-3xl font-bold">Properties</h1>
          <p className="text-gray-600 mt-2">Manage resort properties and locations</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => handleExport('json')}
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => navigate('/admin/content/properties/new')}>
            <Plus className="w-4 h-4 mr-2" />
            New Property
          </Button>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <div className="bg-white rounded-lg border p-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Properties</div>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <div className="text-2xl font-bold text-yellow-600">{stats.featured}</div>
            <div className="text-sm text-gray-600">Featured</div>
          </div>
          {Object.entries(stats.byType).map(([type, count]) => (
            <div key={type} className="bg-white rounded-lg border p-4">
              <div className="text-2xl font-bold">{count}</div>
              <div className="text-sm text-gray-600">{propertyTypeLabels[type as PropertyType]}</div>
            </div>
          ))}
        </div>
      )}

      {/* Search and Filter */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search properties..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg"
              />
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="All">All Types</option>
              {Object.entries(propertyTypeLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            <select
              value={featuredFilter}
              onChange={(e) => setFeaturedFilter(e.target.value as any)}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="All">All</option>
              <option value="true">Featured</option>
              <option value="false">Not Featured</option>
            </select>
          </div>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Properties List/Grid */}
      {filteredProperties.length === 0 ? (
        <Card className="p-12 text-center">
          <Building className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600">No properties found</p>
        </Card>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
          {filteredProperties.map((property) => (
            <Card
              key={property.id}
              className={viewMode === 'grid' ? 'overflow-hidden' : 'p-6'}
            >
              {viewMode === 'grid' ? (
                <>
                  {/* Image */}
                  <div className="h-48 bg-gray-200 relative">
                    {property.heroImage && (
                      <img
                        src={property.heroImage}
                        alt={property.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                    <div className="absolute top-2 right-2 flex gap-2">
                      <Button
                        size="sm"
                        variant={property.featured ? 'default' : 'outline'}
                        onClick={() => handleToggleFeatured(property.id, !property.featured)}
                      >
                        <Star className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-gray-500 uppercase">
                        {propertyTypeLabels[property.type]}
                      </span>
                      {property.featured && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                          Featured
                        </span>
                      )}
                    </div>

                    <h3 className="font-semibold text-lg mb-2">{property.name}</h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {property.description}
                    </p>

                    <div className="flex items-center text-sm text-gray-500 mb-4">
                      <MapPin className="w-4 h-4 mr-1" />
                      {property.location.city}, {property.location.state}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/admin/content/properties/${property.id}`)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/admin/content/properties/${property.id}/edit`)}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDuplicate(property.id)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(property.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                /* List View */
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0">
                      {property.heroImage && (
                        <img
                          src={property.heroImage}
                          alt={property.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold">{property.name}</h3>
                        <span className="text-xs font-medium text-gray-500 uppercase">
                          {propertyTypeLabels[property.type]}
                        </span>
                        {property.featured && (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                            Featured
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm mb-1">
                        {property.location.city}, {property.location.state}
                      </p>
                      <p className="text-gray-500 text-sm line-clamp-1">
                        {property.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/admin/content/properties/${property.id}`)}
                    >
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/admin/content/properties/${property.id}/edit`)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDuplicate(property.id)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(property.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};