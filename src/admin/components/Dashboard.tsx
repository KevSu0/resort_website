import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Building,
  DoorOpen,
  Image,
  MessageSquare,
  Tag,
  Clock,
  AlertCircle
} from 'lucide-react';
import { propertyService } from '../services/propertyService';
import { roomService } from '../services/roomService';
import { mediaService } from '../services/mediaService';
import { enquiriesService } from '../services/enquiriesService';
import { offersService } from '../services/offersService';
import { publishService } from '../services/publishService';
import { LoadingSpinner } from './shared/LoadingSpinner';

interface DashboardStats {
  properties: number;
  rooms: number;
  mediaFiles: number;
  enquiries: {
    total: number;
    new: number;
    overdue: number;
    dueSoon: number;
  };
  offers: {
    active: number;
    scheduled: number;
    expired: number;
  };
}

interface ActivityItem {
  id: string;
  type: 'enquiry' | 'publish' | 'media' | 'property' | 'offer';
  message: string;
  time: string;
  icon: React.ReactNode;
  entityId?: string;
  status?: string;
}

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    properties: 0,
    rooms: 0,
    mediaFiles: 0,
    enquiries: {
      total: 0,
      new: 0,
      overdue: 0,
      dueSoon: 0,
    },
    offers: {
      active: 0,
      scheduled: 0,
      expired: 0,
    },
  });

  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [publishStatus, setPublishStatus] = useState<{
    hasUnpublishedChanges: boolean;
    lastPublished?: string;
    draftModified?: string;
  }>({ hasUnpublishedChanges: false });
  const [offlineQueueStatus, setOfflineQueueStatus] = useState<{
    pending: number;
    syncing: boolean;
  }>({ pending: 0, syncing: false });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const statsConfig = [
    {
      name: 'Properties',
      value: stats.properties,
      change: '+0%',
      icon: <Building className="w-6 h-6" />,
      color: 'bg-blue-500',
      href: '/admin/content',
    },
    {
      name: 'Room Types',
      value: stats.rooms,
      change: '+0%',
      icon: <DoorOpen className="w-6 h-6" />,
      color: 'bg-green-500',
      href: '/admin/content',
    },
    {
      name: 'Media Files',
      value: stats.mediaFiles,
      change: '+12%',
      icon: <Image className="w-6 h-6" />,
      color: 'bg-purple-500',
      href: '/admin/media',
    },
    {
      name: 'Enquiries',
      value: stats.enquiries.total,
      change: `+${stats.enquiries.new} new`,
      icon: <MessageSquare className="w-6 h-6" />,
      color: 'bg-orange-500',
      href: '/admin/enquiries',
      hasAlert: stats.enquiries.overdue > 0,
    },
  ];

  useEffect(() => {
    loadDashboardData();

    // Set up interval for real-time updates
    const interval = setInterval(() => {
      loadDashboardData(false);
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [loadDashboardData]);

  const loadDashboardData = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);

      // Load all data in parallel
      const [
        propertyStats,
        rooms,
        media,
        enquiryStats,
        offerStats,
        publishStatusData,
        offlineStatus
      ] = await Promise.all([
        propertyService.getPropertyStats(),
        roomService.loadRooms(),
        mediaService.getAllMedia(),
        enquiriesService.getEnquiryStats(),
        offersService.getOfferStats(),
        publishService.getDraftStatus(),
        enquiriesService.getOfflineQueueStatus()
      ]);

      setStats({
        properties: propertyStats.total,
        rooms: rooms.length,
        mediaFiles: media.length,
        enquiries: {
          total: enquiryStats.total,
          new: enquiryStats.byStatus.NEW || 0,
          overdue: 0, // Calculate based on follow-up dates
          dueSoon: 0,
        },
        offers: {
          active: offerStats.active,
          scheduled: offerStats.scheduled,
          expired: offerStats.expired,
        },
      });

      setPublishStatus(publishStatusData);
      setOfflineQueueStatus(offlineStatus);

      // Generate recent activity
      const activities = generateRecentActivity({
        enquiries: await enquiriesService.loadEnquiries(),
        offers: await offersService.loadOffers(),
        media,
        properties: await propertyService.loadProperties(),
      });
      setRecentActivity(activities);

      setError(null);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  const generateRecentActivity = useCallback((data: {
    enquiries: Array<{ id: string; createdAt: string; name?: string }>;
    offers: Array<{ id: string; createdAt: string; title?: string }>;
    media: Array<{ id: string; uploadedAt: string; filename?: string }>;
    properties: Array<{ id: string; updatedAt: string; name?: string }>;
  }): ActivityItem[] => {
    const activities: ActivityItem[] = [];

    // Recent enquiries
    const recentEnquiries = data.enquiries
      .slice(0, 3)
      .map(e => ({
        id: `enquiry-${e.id}`,
        type: 'enquiry' as const,
        message: `New enquiry from ${e.fullName}`,
        time: formatTimeAgo(new Date(e.createdAt)),
        icon: <MessageSquare className="w-4 h-4" />,
        entityId: e.id,
        status: e.status,
      }));
    activities.push(...recentEnquiries);

    // Recent offers
    const recentOffers = data.offers
      .filter(o => o.status === 'ACTIVE')
      .slice(0, 2)
      .map(o => ({
        id: `offer-${o.id}`,
        type: 'offer' as const,
        message: `Offer "${o.name}" is now active`,
        time: formatTimeAgo(new Date(o.updatedAt)),
        icon: <Tag className="w-4 h-4" />,
        entityId: o.id,
      }));
    activities.push(...recentOffers);

    // Recent media uploads
    const recentMedia = data.media
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 2)
      .map(m => ({
        id: `media-${m.id}`,
        type: 'media' as const,
        message: `New ${m.kind} uploaded: ${m.filename}`,
        time: formatTimeAgo(new Date(m.createdAt)),
        icon: <Image className="w-4 h-4" />,
        entityId: m.id,
      }));
    activities.push(...recentMedia);

    // Sort by time (newest first)
    return activities
      .sort((a, b) => parseTimeAgo(b.time) - parseTimeAgo(a.time))
      .slice(0, 6);
  }, []);

  const formatTimeAgo = (date: Date): string => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

    if (seconds < 60) return `${seconds} seconds ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  const parseTimeAgo = (timeStr: string): number => {
    const match = timeStr.match(/(\d+)\s+(second|minute|hour|day)s?\s+ago/);
    if (!match) return 0;

    const value = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
      case 'second': return value * 1000;
      case 'minute': return value * 60 * 1000;
      case 'hour': return value * 60 * 60 * 1000;
      case 'day': return value * 24 * 60 * 60 * 1000;
      default: return 0;
    }
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 lg:p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <h3 className="text-lg font-medium text-red-800">Error Loading Dashboard</h3>
          </div>
          <p className="mt-2 text-red-700">{error}</p>
          <button
            onClick={() => loadDashboardData()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Welcome back! Here's what's happening with your resort website.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {statsConfig.map((stat) => (
          <Link
            key={stat.name}
            to={stat.href}
            className="bg-white overflow-hidden shadow-lg rounded-xl hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1"
          >
            <div className="p-6">
              <div className="flex items-center">
                <div className={`flex-shrink-0 p-4 rounded-xl ${stat.color}`}>
                  <div className="text-white">{stat.icon}</div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
                    <dd className="flex items-baseline mt-1">
                      <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                      <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                        stat.name === 'Enquiries' && stat.hasAlert ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {stat.change}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* SLA Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Enquiry SLA Status */}
        <div className="bg-white shadow-lg rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Enquiry Response SLA</h3>
            <Clock className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Overdue</span>
              <span className="text-sm font-semibold text-red-600">
                {stats.enquiries.overdue}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Due Today</span>
              <span className="text-sm font-semibold text-yellow-600">
                {stats.enquiries.dueSoon}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">New Today</span>
              <span className="text-sm font-semibold text-green-600">
                {stats.enquiries.new}
              </span>
            </div>
          </div>
        </div>

        {/* Offer Status */}
        <div className="bg-white shadow-lg rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Offer Status</h3>
            <Tag className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Active</span>
              <span className="text-sm font-semibold text-green-600">
                {stats.offers.active}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Scheduled</span>
              <span className="text-sm font-semibold text-blue-600">
                {stats.offers.scheduled}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Expired</span>
              <span className="text-sm font-semibold text-gray-600">
                {stats.offers.expired}
              </span>
            </div>
          </div>
        </div>

        {/* Offline Queue Status */}
        <div className="bg-white shadow-lg rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Sync Status</h3>
            {offlineQueueStatus.syncing ? (
              <div className="flex items-center text-blue-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-1"></div>
                <span className="text-xs">Syncing</span>
              </div>
            ) : (
              <div className="flex items-center">
                <div className={`h-2 w-2 rounded-full mr-1 ${
                  offlineQueueStatus.pending > 0 ? 'bg-yellow-500' : 'bg-green-500'
                }`}></div>
                <span className="text-xs text-gray-500">Online</span>
              </div>
            )}
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Pending Actions</span>
              <span className="text-sm font-semibold text-yellow-600">
                {offlineQueueStatus.pending}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Last Sync</span>
              <span className="text-sm font-medium text-gray-900">
                Just now
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white shadow-lg rounded-xl">
          <div className="px-6 py-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
              <div className="flex space-x-2">
                <select className="text-sm border border-gray-300 rounded-lg px-3 py-1">
                  <option>All</option>
                  <option>Enquiries</option>
                  <option>Media</option>
                  <option>Content</option>
                  <option>Offers</option>
                </select>
              </div>
            </div>

            {recentActivity.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No recent activity</h3>
                <p className="mt-1 text-sm text-gray-500">
                  New activities will appear here as they happen.
                </p>
              </div>
            ) : (
              <div className="flow-root">
                <ul className="-mb-8">
                  {recentActivity.map((activity, index) => (
                    <li key={activity.id}>
                      <div className="relative pb-8">
                        {index !== recentActivity.length - 1 && (
                          <span
                            className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                            aria-hidden="true"
                          ></span>
                        )}
                        <div className="relative flex space-x-3">
                          <div>
                            <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                              activity.type === 'enquiry' ? 'bg-orange-100' :
                              activity.type === 'publish' ? 'bg-green-100' :
                              activity.type === 'media' ? 'bg-purple-100' :
                              activity.type === 'offer' ? 'bg-blue-100' :
                              'bg-gray-100'
                            }`}>
                              <span className={`${
                                activity.type === 'enquiry' ? 'text-orange-600' :
                                activity.type === 'publish' ? 'text-green-600' :
                                activity.type === 'media' ? 'text-purple-600' :
                                activity.type === 'offer' ? 'text-blue-600' :
                                'text-gray-500'
                              }`}>
                                {activity.icon}
                              </span>
                            </span>
                          </div>
                          <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                            <div>
                              <p className="text-sm text-gray-900 font-medium">
                                {activity.message}
                              </p>
                              {activity.status && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 mt-1">
                                  {activity.status}
                                </span>
                              )}
                            </div>
                            <div className="text-right text-sm whitespace-nowrap text-gray-500">
                              {activity.time}
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white shadow-lg rounded-xl">
          <div className="px-6 py-5">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <Link
                to="/admin/content"
                className="inline-flex items-center justify-center px-4 py-3 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <Building className="w-4 h-4 mr-2" />
                Edit Content
              </Link>
              <Link
                to="/admin/media"
                className="inline-flex items-center justify-center px-4 py-3 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <Image className="w-4 h-4 mr-2" />
                Upload Media
              </Link>
              <Link
                to="/admin/offers"
                className="inline-flex items-center justify-center px-4 py-3 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <Tag className="w-4 h-4 mr-2" />
                Create Offer
              </Link>
              <Link
                to="/admin/enquiries"
                className="inline-flex items-center justify-center px-4 py-3 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                View Enquiries
              </Link>
            </div>

            {/* Performance Metrics */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Performance</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Page Load Time</span>
                  <span className="text-gray-900 font-medium">1.2s</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Database Queries</span>
                  <span className="text-gray-900 font-medium">24</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Cache Hit Rate</span>
                  <span className="text-gray-900 font-medium">92%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Draft/Publish Status */}
      {publishStatus.hasUnpublishedChanges && (
        <div className="mt-6 bg-white shadow-lg rounded-xl">
          <div className="px-6 py-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Publishing Status
              </h3>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                Draft
              </span>
            </div>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <Clock className="h-5 w-5 text-yellow-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    You have unpublished changes. Review and publish when ready.
                  </p>
                  <div className="mt-4">
                    <div className="flex space-x-3">
                      <button
                        onClick={() => window.location.href = '/admin/content'}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                      >
                        Review Changes
                      </button>
                      <button
                        onClick={() => {
                          // Preview draft functionality
                          alert('Preview functionality would open a new tab with draft content');
                        }}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                      >
                        View Draft
                      </button>
                    </div>
                    {publishStatus.lastPublished && (
                      <p className="mt-3 text-xs text-yellow-600">
                        Last published: {new Date(publishStatus.lastPublished).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};