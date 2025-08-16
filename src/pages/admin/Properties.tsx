import React, { useState } from 'react';
import { Edit, Trash2, Star, MapPin, Plus } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { Card, Grid } from '../../components/Layout';
import AdminSearchFilter from '../../components/AdminSearchFilter';

export default function AdminProperties() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const properties = [
    {
      id: 1,
      name: 'Ocean View Resort',
      location: 'Miami Beach, FL',
      type: 'Resort',
      status: 'active',
      rooms: 120,
      rating: 4.9,
      bookings: 145,
      revenue: '$285,000',
      image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Luxury%20ocean%20view%20resort%20hotel%20exterior%20tropical%20palm%20trees%20blue%20sky%20modern%20architecture&image_size=landscape_16_9'
    },
    {
      id: 2,
      name: 'Mountain Lodge',
      location: 'Aspen, CO',
      type: 'Lodge',
      status: 'active',
      rooms: 45,
      rating: 4.8,
      bookings: 132,
      revenue: '$198,000',
      image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Mountain%20lodge%20hotel%20wooden%20architecture%20snow%20capped%20mountains%20winter%20landscape%20cozy%20rustic&image_size=landscape_16_9'
    },
    {
      id: 3,
      name: 'Beach Villa',
      location: 'Cancun, Mexico',
      type: 'Villa',
      status: 'active',
      rooms: 8,
      rating: 4.9,
      bookings: 98,
      revenue: '$312,000',
      image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Luxury%20beach%20villa%20tropical%20paradise%20white%20sand%20turquoise%20water%20palm%20trees%20modern%20design&image_size=landscape_16_9'
    },
    {
      id: 4,
      name: 'City Center Hotel',
      location: 'New York, NY',
      type: 'Hotel',
      status: 'maintenance',
      rooms: 200,
      rating: 4.7,
      bookings: 87,
      revenue: '$156,000',
      image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Modern%20city%20center%20hotel%20skyscraper%20urban%20architecture%20glass%20facade%20downtown%20business%20district&image_size=landscape_16_9'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || property.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Properties Management</h1>
            <p className="text-gray-600 mt-1">Manage your resort properties and accommodations</p>
          </div>
          <button 
            onClick={() => console.log('Add property clicked')}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Property
          </button>
        </div>

        <div className="max-w-7xl mx-auto">
          <AdminSearchFilter
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Search properties..."
            filters={[
              {
                label: 'Status Filter',
                value: filterStatus,
                onChange: setFilterStatus,
                options: [
                  { value: 'all', label: 'All Status' },
                  { value: 'active', label: 'Active' },
                  { value: 'maintenance', label: 'Maintenance' },
                  { value: 'inactive', label: 'Inactive' }
                ]
              }
            ]}
          />

          {/* Properties Grid */}
          <Grid className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map((property) => (
              <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video relative">
                  <img
                    src={property.image}
                    alt={property.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 right-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(property.status)}`}>
                      {property.status}
                    </span>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{property.name}</h3>
                    <div className="flex items-center space-x-1">
                      <button className="p-1 text-gray-400 hover:text-blue-600 transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-red-600 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-gray-600 mb-3">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span className="text-sm">{property.location}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-900">{property.rooms}</div>
                      <div className="text-xs text-gray-600">Rooms</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center">
                        <Star className="w-4 h-4 text-yellow-400 mr-1" />
                        <span className="text-lg font-semibold text-gray-900">{property.rating}</span>
                      </div>
                      <div className="text-xs text-gray-600">Rating</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{property.bookings}</div>
                      <div className="text-xs text-gray-600">Bookings</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{property.revenue}</div>
                      <div className="text-xs text-gray-600">Revenue</div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </Grid>

          {filteredProperties.length === 0 && (
            <Card className="p-12 text-center">
              <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No properties found</h3>
              <p className="text-gray-600 mb-6">Try adjusting your search or filter criteria</p>
              <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Property
              </button>
            </Card>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}