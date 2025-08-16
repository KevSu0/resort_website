import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, DollarSign, Calendar, MapPin, Star, Plus, Settings } from 'lucide-react';
import { LucideIcon } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { Card, Grid } from '../../components/Layout';
import AdminStatsCard from '../../components/AdminStatsCard';
import { MockDataService } from '../../lib/mockData';
import { Enquiry } from '../../types';

interface Stat {
  title: string;
  value: string;
  icon: LucideIcon;
  color: string;
}

interface TopProperty {
  name: string;
  bookings: number;
  revenue: string;
  rating: string | undefined;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stat[]>([]);
  const [recentEnquiries, setRecentEnquiries] = useState<Enquiry[]>([]);
  const [topProperties, setTopProperties] = useState<TopProperty[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [properties, enquiries] = await Promise.all([
          MockDataService.getProperties(),
          MockDataService.getEnquiries()
        ]);

        // Calculate stats
        const totalRevenue = enquiries
          .filter(enquiry => enquiry.status === 'booked')
          .reduce((acc, enquiry) => {
            const property = properties.find(p => p.id === enquiry.property_id);
            return acc + (property?.price || 0);
          }, 0);

        const guestSatisfaction = properties.length > 0
          ? properties.reduce((acc, p) => acc + (p.rating || 0), 0) / properties.length
          : 0;

        const dashboardStats = [
          { title: 'Total Enquiries', value: enquiries.length.toString(), icon: Calendar, color: 'blue' },
          { title: 'Estimated Revenue', value: `$${(totalRevenue / 1000).toFixed(1)}k`, icon: DollarSign, color: 'green' },
          { title: 'Active Properties', value: properties.length.toString(), icon: MapPin, color: 'purple' },
          { title: 'Avg. Satisfaction', value: guestSatisfaction.toFixed(1), icon: Star, color: 'yellow' },
        ];
        setStats(dashboardStats);

        // Set recent enquiries
        setRecentEnquiries(enquiries.slice(0, 5));

        // Set top properties (placeholder logic)
        const top = properties
          .sort((a, b) => (b.rating || 0) - (a.rating || 0))
          .slice(0, 5)
          .map(p => ({
            name: p.name,
            bookings: Math.floor(Math.random() * 50), // Random bookings
            revenue: `$${(Math.random() * 5000).toFixed(0)}`, // Random revenue
            rating: p.rating?.toFixed(1)
          }));
        setTopProperties(top);

      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'booked': return 'bg-green-100 text-green-800';
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-6" data-testid="loading-skeleton">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="h-32 bg-gray-200 rounded-lg"></div>
              <div className="h-32 bg-gray-200 rounded-lg"></div>
              <div className="h-32 bg-gray-200 rounded-lg"></div>
              <div className="h-32 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your properties.</p>
        </div>

        <div className="max-w-7xl mx-auto">
          <Grid className="grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <AdminStatsCard
                key={index}
                title={stat.title}
                value={stat.value}
                icon={stat.icon}
                color={stat.color as 'blue' | 'green' | 'purple' | 'yellow' | 'red' | 'orange'}
              />
            ))}
          </Grid>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Recent Enquiries</h2>
                <Link to="/admin/enquiries" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  View All
                </Link>
              </div>
              <div className="space-y-4">
                {recentEnquiries.map((enquiry) => (
                  <div key={enquiry.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{enquiry.customer.name}</p>
                      <p className="text-sm text-gray-600">{enquiry.property_name}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(enquiry.status)}`}>
                      {enquiry.status}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Top Performing Properties</h2>
                <Link to="/admin/properties" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  View All
                </Link>
              </div>
              <div className="space-y-4">
                {topProperties.map((property, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{property.name}</p>
                    </div>
                    <span className="flex items-center text-sm text-gray-600">
                      <Star className="w-4 h-4 mr-1 text-yellow-400" />
                      {property.rating}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h2>
            <Grid className="grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link to="/admin/properties/new" className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                <Plus className="w-5 h-5 text-blue-600 mr-3" />
                <span className="font-medium text-blue-900">Add Property</span>
              </Link>
              <Link to="/admin/enquiries" className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                <Calendar className="w-5 h-5 text-green-600 mr-3" />
                <span className="font-medium text-green-900">View Enquiries</span>
              </Link>
              <Link to="/admin/users" className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                <Users className="w-5 h-5 text-purple-600 mr-3" />
                <span className="font-medium text-purple-900">Manage Users</span>
              </Link>
              <Link to="/admin/settings" className="flex items-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
                <Settings className="w-5 h-5 text-orange-600 mr-3" />
                <span className="font-medium text-orange-900">Settings</span>
              </Link>
            </Grid>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}