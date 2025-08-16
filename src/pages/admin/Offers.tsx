import React, { useState } from 'react';
import { Edit, Trash2, Calendar, Plus, ToggleLeft, ToggleRight, DollarSign, TrendingUp, Users } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { Card } from '../../components/Layout';
import AdminStatsCard from '../../components/AdminStatsCard';
import AdminSearchFilter from '../../components/AdminSearchFilter';

export default function AdminOffers() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const offers = [
    {
      id: 1,
      title: 'Early Bird Summer Special',
      description: 'Book 60 days in advance and save 25% on summer stays',
      discount: 25,
      discountType: 'percentage',
      validFrom: '2024-01-01',
      validTo: '2024-06-30',
      status: 'active',
      usageCount: 156,
      maxUsage: 500,
      code: 'SUMMER25',
      properties: ['All Properties'],
      minStay: 3
    },
    {
      id: 2,
      title: 'Weekend Getaway Deal',
      description: 'Special rates for weekend stays at select properties',
      discount: 150,
      discountType: 'fixed',
      validFrom: '2024-01-15',
      validTo: '2024-12-31',
      status: 'active',
      usageCount: 89,
      maxUsage: 200,
      code: 'WEEKEND150',
      properties: ['Miami Beach Resort', 'Aspen Lodge'],
      minStay: 2
    },
    {
      id: 3,
      title: 'Holiday Season Promotion',
      description: 'Festive season special with complimentary amenities',
      discount: 20,
      discountType: 'percentage',
      validFrom: '2023-12-01',
      validTo: '2024-01-15',
      status: 'expired',
      usageCount: 234,
      maxUsage: 300,
      code: 'HOLIDAY20',
      properties: ['All Properties'],
      minStay: 4
    },
    {
      id: 4,
      title: 'Corporate Group Discount',
      description: 'Special rates for corporate bookings of 10+ rooms',
      discount: 30,
      discountType: 'percentage',
      validFrom: '2024-02-01',
      validTo: '2024-12-31',
      status: 'scheduled',
      usageCount: 0,
      maxUsage: 100,
      code: 'CORP30',
      properties: ['Business Hotels'],
      minStay: 1
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'expired': return 'bg-gray-100 text-gray-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredOffers = offers.filter(offer => {
    const matchesSearch = offer.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         offer.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || offer.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const toggleOfferStatus = (offerId: number) => {
    // In a real app, this would make an API call
    console.log(`Toggle offer ${offerId} status`);
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Offers Management</h1>
            <p className="text-gray-600 mt-1">Manage promotional offers and discounts</p>
          </div>
          <button 
            onClick={() => console.log('Create offer clicked')}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Offer
          </button>
        </div>

        <div className="max-w-7xl mx-auto">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <AdminStatsCard
              icon={DollarSign}
              title="Total Offers"
              value="24"
              change="+2 this month"
              changeType="positive"
              color="blue"
            />
            <AdminStatsCard
              icon={TrendingUp}
              title="Active Offers"
              value="18"
              change="75% active"
              changeType="positive"
              color="green"
            />
            <AdminStatsCard
              icon={Users}
              title="Total Redemptions"
              value="1,247"
              change="+15% this month"
              changeType="positive"
              color="purple"
            />
            <AdminStatsCard
              icon={Calendar}
              title="Expiring Soon"
              value="3"
              change="Within 7 days"
              changeType="negative"
              color="orange"
            />
          </div>

          <AdminSearchFilter
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Search offers..."
            filters={[
              {
                label: "Filter by Status",
                value: statusFilter,
                onChange: setStatusFilter,
                options: [
                  { value: 'all', label: 'All Offers' },
                  { value: 'active', label: 'Active' },
                  { value: 'expired', label: 'Expired' },
                  { value: 'draft', label: 'Draft' }
                ]
              }
            ]}
          />

          {/* Offers List */}
          <div className="space-y-4">
            {filteredOffers.map((offer) => (
              <Card key={offer.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{offer.title}</h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(offer.status)}`}>
                        {offer.status.toUpperCase()}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {offer.code}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-3">{offer.description}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Discount</p>
                        <p className="font-semibold text-gray-900">
                          {offer.discountType === 'percentage' ? `${offer.discount}%` : `$${offer.discount}`}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Valid Period</p>
                        <p className="font-semibold text-gray-900">{offer.validFrom} - {offer.validTo}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Usage</p>
                        <p className="font-semibold text-gray-900">{offer.usageCount} / {offer.maxUsage}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Min Stay</p>
                        <p className="font-semibold text-gray-900">{offer.minStay} nights</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">Properties:</span>
                      {offer.properties.map((property, index) => (
                        <span key={index} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                          {property}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <button 
                      onClick={() => toggleOfferStatus(offer.id)}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      {offer.status === 'active' ? 
                        <ToggleRight className="w-5 h-5 text-green-600" /> : 
                        <ToggleLeft className="w-5 h-5" />
                      }
                    </button>
                    <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}