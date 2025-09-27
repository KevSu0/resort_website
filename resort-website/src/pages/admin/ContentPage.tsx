import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Building,
  Home,
  MapPin,
  Tag,
  Plus,
  Search,
  Filter,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Edit,
  Trash2,
  MoreVertical
} from 'lucide-react';
import { contentService } from '../../admin/services/contentService';
import { databaseService } from '../../admin/services/databaseService';
import { AdminLayout } from '../../admin/components/AdminLayout';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

interface ContentStats {
  properties: {
    total: number;
    published: number;
    draft: number;
  };
  rooms: {
    total: number;
    byProperty: Record<string, number>;
  };
  places: {
    total: number;
    byCategory: Record<string, number>;
  };
  offers: {
    total: number;
    active: number;
    expired: number;
  };
}

interface RecentActivity {
  id: string;
  type: 'property' | 'room' | 'place' | 'offer';
  action: 'created' | 'updated' | 'deleted';
  entityName: string;
  timestamp: string;
  user?: string;
}

export const ContentPage: React.FC = () => {
  const [stats, setStats] = useState<ContentStats>({
    properties: { total: 0, published: 0, draft: 0 },
    rooms: { total: 0, byProperty: {} },
    places: { total: 0, byCategory: {} },
    offers: { total: 0, active: 0, expired: 0 }
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadStats();
    loadRecentActivity();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);

      // Load properties
      const properties = await databaseService.getProperties();
      const publishedProperties = properties.filter(p => p.status === 'published').length;

      // Load rooms
      const allRooms: any[] = [];
      for (const property of properties) {
        const rooms = await databaseService.getRoomsByProperty(property.id);
        allRooms.push(...rooms);
      }

      // Load places
      const places = await databaseService.getAll('places');
      const placesByCategory = places.reduce((acc: Record<string, number>, place: any) => {
        acc[place.category] = (acc[place.category] || 0) + 1;
        return acc;
      }, {});

      // Load offers
      const offers = await databaseService.getAll('offers');
      const now = new Date();
      const activeOffers = offers.filter((offer: any) =>
        new Date(offer.validFrom) <= now && new Date(offer.validTo) >= now
      ).length;

      setStats({
        properties: {
          total: properties.length,
          published: publishedProperties,
          draft: properties.length - publishedProperties
        },
        rooms: {
          total: allRooms.length,
          byProperty: allRooms.reduce((acc: Record<string, number>, room: any) => {
            acc[room.propertyId] = (acc[room.propertyId] || 0) + 1;
            return acc;
          }, {})
        },
        places: {
          total: places.length,
          byCategory: placesByCategory
        },
        offers: {
          total: offers.length,
          active: activeOffers,
          expired: offers.length - activeOffers
        }
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRecentActivity = async () => {
    // This would be implemented with a proper activity tracking system
    // For now, using mock data
    setRecentActivity([
      {
        id: '1',
        type: 'property',
        action: 'created',
        entityName: 'Treehouse Villa',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString()
      },
      {
        id: '2',
        type: 'room',
        action: 'updated',
        entityName: 'Deluxe Suite',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
      },
      {
        id: '3',
        type: 'place',
        action: 'created',
        entityName: 'Edakkal Caves',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString()
      }
    ]);
  };

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  };

  const StatCard: React.FC<{
    title: string;
    value: number;
    icon: React.ReactNode;
    color: string;
    subtitle?: string;
  }> = ({ title, value, icon, color, subtitle }) => (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-3xl font-bold ${color}`}>{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-full ${color.replace('text-', 'bg-').replace('600', '100')}`}>
          {icon}
        </div>
      </div>
    </Card>
  );

  const QuickActionCard: React.FC<{
    title: string;
    description: string;
    icon: React.ReactNode;
    to: string;
    color: string;
  }> = ({ title, description, icon, to, color }) => (
    <Link to={to} className="block">
      <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
        <div className="flex items-center space-x-4">
          <div className={`p-3 rounded-lg ${color.replace('text-', 'bg-').replace('600', '100')}`}>
            {icon}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          </div>
          <div className="text-gray-400">
            <Plus className="w-5 h-5" />
          </div>
        </div>
      </Card>
    </Link>
  );

  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Content Management</h1>
            <p className="text-gray-600 mt-2">Manage properties, rooms, places, and more</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search content..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline">
              <Filter className="w-5 h-5 mr-2" />
              Filter
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Properties"
            value={stats.properties.total}
            icon={<Building className="w-6 h-6 text-blue-600" />}
            color="text-blue-600"
            subtitle={`${stats.properties.published} published`}
          />
          <StatCard
            title="Total Rooms"
            value={stats.rooms.total}
            icon={<Home className="w-6 h-6 text-green-600" />}
            color="text-green-600"
          />
          <StatCard
            title="Places & Attractions"
            value={stats.places.total}
            icon={<MapPin className="w-6 h-6 text-purple-600" />}
            color="text-purple-600"
          />
          <StatCard
            title="Active Offers"
            value={stats.offers.active}
            icon={<Tag className="w-6 h-6 text-orange-600" />}
            color="text-orange-600"
            subtitle={`${stats.offers.expired} expired`}
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <QuickActionCard
            title="Properties"
            description="Manage resort properties and locations"
            icon={<Building className="w-6 h-6 text-blue-600" />}
            to="/admin/content/properties"
            color="text-blue-600"
          />
          <QuickActionCard
            title="Room Types"
            description="Configure rooms and accommodations"
            icon={<Home className="w-6 h-6 text-green-600" />}
            to="/admin/content/rooms"
            color="text-green-600"
          />
          <QuickActionCard
            title="Places & Attractions"
            description="Manage nearby attractions and activities"
            icon={<MapPin className="w-6 h-6 text-purple-600" />}
            to="/admin/content/places"
            color="text-purple-600"
          />
        </div>

        {/* Recent Activity */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </div>
          <div className="space-y-4">
            {recentActivity.map((activity) => {
              const Icon = activity.type === 'property' ? Building :
                         activity.type === 'room' ? Home :
                         activity.type === 'place' ? MapPin : Tag;

              const ActionIcon = activity.action === 'created' ? Plus :
                              activity.action === 'updated' ? Edit :
                              activity.action === 'deleted' ? Trash2 : Clock;

              return (
                <div key={activity.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Icon className="w-5 h-5 text-gray-400" />
                      <ActionIcon className="w-4 h-4 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {activity.action === 'created' && 'Created '}
                        {activity.action === 'updated' && 'Updated '}
                        {activity.action === 'deleted' && 'Deleted '}
                        {activity.entityName}
                      </p>
                      <p className="text-xs text-gray-500">{formatTimeAgo(activity.timestamp)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      activity.action === 'created' ? 'bg-green-100 text-green-800' :
                      activity.action === 'updated' ? 'bg-blue-100 text-blue-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {activity.action}
                    </span>
                    <button className="text-gray-400 hover:text-gray-600">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Content Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Properties by Type */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Properties Overview</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Published</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${(stats.properties.published / stats.properties.total) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {stats.properties.published}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Draft</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-600 h-2 rounded-full"
                      style={{ width: `${(stats.properties.draft / stats.properties.total) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {stats.properties.draft}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Places by Category */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Places by Category</h3>
            <div className="space-y-3">
              {Object.entries(stats.places.byCategory).map(([category, count]) => (
                <div key={category} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 capitalize">{category}</span>
                  <span className="text-sm font-medium text-gray-900">{count}</span>
                </div>
              ))}
              {Object.keys(stats.places.byCategory).length === 0 && (
                <p className="text-sm text-gray-500 italic">No places added yet</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};