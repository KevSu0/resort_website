import React from 'react';
import { BarChart3, Users, MapPin, Calendar, TrendingUp, DollarSign, Star, MessageSquare } from 'lucide-react';
import Layout from '../../components/Layout';
import { Section, Card, Grid } from '../../components/Layout';

export default function Dashboard() {
  const stats = [
    {
      title: 'Total Bookings',
      value: '2,847',
      change: '+12.5%',
      changeType: 'positive' as const,
      icon: Calendar,
      color: 'blue'
    },
    {
      title: 'Revenue',
      value: '$1.2M',
      change: '+8.2%',
      changeType: 'positive' as const,
      icon: DollarSign,
      color: 'green'
    },
    {
      title: 'Active Properties',
      value: '52',
      change: '+2',
      changeType: 'positive' as const,
      icon: MapPin,
      color: 'purple'
    },
    {
      title: 'Guest Satisfaction',
      value: '4.8',
      change: '+0.1',
      changeType: 'positive' as const,
      icon: Star,
      color: 'yellow'
    }
  ];

  const recentBookings = [
    {
      id: 'BK001',
      guest: 'John Smith',
      property: 'Ocean View Resort',
      checkIn: '2024-02-15',
      checkOut: '2024-02-20',
      status: 'confirmed',
      amount: '$2,450'
    },
    {
      id: 'BK002',
      guest: 'Sarah Johnson',
      property: 'Mountain Lodge',
      checkIn: '2024-02-18',
      checkOut: '2024-02-22',
      status: 'pending',
      amount: '$1,890'
    },
    {
      id: 'BK003',
      guest: 'Mike Chen',
      property: 'City Center Hotel',
      checkIn: '2024-02-20',
      checkOut: '2024-02-23',
      status: 'confirmed',
      amount: '$980'
    },
    {
      id: 'BK004',
      guest: 'Emma Wilson',
      property: 'Beach Villa',
      checkIn: '2024-02-25',
      checkOut: '2024-03-01',
      status: 'confirmed',
      amount: '$3,200'
    }
  ];

  const topProperties = [
    { name: 'Ocean View Resort', bookings: 145, revenue: '$285,000', rating: 4.9 },
    { name: 'Mountain Lodge', bookings: 132, revenue: '$198,000', rating: 4.8 },
    { name: 'Beach Villa', bookings: 98, revenue: '$312,000', rating: 4.9 },
    { name: 'City Center Hotel', bookings: 87, revenue: '$156,000', rating: 4.7 }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return 'bg-blue-100 text-blue-600';
      case 'green':
        return 'bg-green-100 text-green-600';
      case 'purple':
        return 'bg-purple-100 text-purple-600';
      case 'yellow':
        return 'bg-yellow-100 text-yellow-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-6">
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Welcome back! Here's what's happening with your properties.</p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Grid */}
          <Grid className="grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <Card key={index} className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      <p className={`text-sm ${
                        stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {stat.change} from last month
                      </p>
                    </div>
                    <div className={`p-3 rounded-full ${getColorClasses(stat.color)}`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                  </div>
                </Card>
              );
            })}
          </Grid>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Recent Bookings */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Recent Bookings</h2>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  View All
                </button>
              </div>
              <div className="space-y-4">
                {recentBookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-gray-900">{booking.guest}</p>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{booking.property}</p>
                      <p className="text-xs text-gray-500">
                        {booking.checkIn} - {booking.checkOut}
                      </p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="font-semibold text-gray-900">{booking.amount}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Top Properties */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Top Performing Properties</h2>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  View All
                </button>
              </div>
              <div className="space-y-4">
                {topProperties.map((property, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{property.name}</p>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-sm text-gray-600">
                          {property.bookings} bookings
                        </span>
                        <span className="flex items-center text-sm text-gray-600">
                          <Star className="w-3 h-3 mr-1 text-yellow-400" />
                          {property.rating}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{property.revenue}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h2>
            <Grid className="grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                <MapPin className="w-5 h-5 text-blue-600 mr-3" />
                <span className="font-medium text-blue-900">Add Property</span>
              </button>
              <button className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                <Calendar className="w-5 h-5 text-green-600 mr-3" />
                <span className="font-medium text-green-900">View Bookings</span>
              </button>
              <button className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                <Users className="w-5 h-5 text-purple-600 mr-3" />
                <span className="font-medium text-purple-900">Manage Users</span>
              </button>
              <button className="flex items-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
                <BarChart3 className="w-5 h-5 text-orange-600 mr-3" />
                <span className="font-medium text-orange-900">View Reports</span>
              </button>
            </Grid>
          </Card>
        </div>
      </div>
    </Layout>
  );
}