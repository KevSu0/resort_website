import React, { useState } from 'react';
import { Edit, Trash2, MapPin, Users, Star, Plus, Building } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { Card, Grid } from '../../components/Layout';
import AdminSearchFilter from '../../components/AdminSearchFilter';

export default function AdminCities() {
  const [searchTerm, setSearchTerm] = useState('');

  const cities = [
    {
      id: 1,
      name: 'Miami Beach',
      country: 'United States',
      properties: 8,
      totalRooms: 450,
      averageRating: 4.8,
      image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Miami%20Beach%20skyline%20art%20deco%20buildings%20ocean%20view%20palm%20trees%20sunset%20colorful%20architecture&image_size=landscape_16_9'
    },
    {
      id: 2,
      name: 'Aspen',
      country: 'United States',
      properties: 5,
      totalRooms: 180,
      averageRating: 4.9,
      image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Aspen%20Colorado%20mountain%20town%20ski%20resort%20snow%20covered%20peaks%20winter%20landscape%20cozy%20village&image_size=landscape_16_9'
    },
    {
      id: 3,
      name: 'Cancun',
      country: 'Mexico',
      properties: 12,
      totalRooms: 680,
      averageRating: 4.7,
      image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Cancun%20Mexico%20tropical%20beach%20resort%20turquoise%20water%20white%20sand%20palm%20trees%20luxury%20hotels&image_size=landscape_16_9'
    },
    {
      id: 4,
      name: 'New York',
      country: 'United States',
      properties: 15,
      totalRooms: 920,
      averageRating: 4.6,
      image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=New%20York%20City%20Manhattan%20skyline%20skyscrapers%20urban%20landscape%20modern%20architecture%20business%20district&image_size=landscape_16_9'
    }
  ];

  const filteredCities = cities.filter(city =>
    city.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    city.country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Cities Management</h1>
            <p className="text-gray-600 mt-1">Manage cities and destinations in your resort network</p>
          </div>
          <button 
            onClick={() => console.log('Add city clicked')}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add City
          </button>
        </div>

        <div className="max-w-7xl mx-auto">
          <AdminSearchFilter
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Search cities..."
          />

          {/* Cities Grid */}
          <Grid className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCities.map((city) => (
              <Card key={city.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video relative">
                  <img
                    src={city.image}
                    alt={city.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{city.name}</h3>
                    <div className="flex items-center space-x-1">
                      <button className="p-1 text-gray-400 hover:text-blue-600 transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-red-600 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-gray-600 mb-4">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span className="text-sm">{city.country}</span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <Building className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="text-lg font-semibold text-gray-900">{city.properties}</div>
                      <div className="text-xs text-gray-600">Properties</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <Users className="w-4 h-4 text-green-600" />
                      </div>
                      <div className="text-lg font-semibold text-gray-900">{city.totalRooms}</div>
                      <div className="text-xs text-gray-600">Rooms</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-900">{city.averageRating}</div>
                      <div className="text-xs text-gray-600">Avg Rating</div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </Grid>
        </div>
      </div>
    </AdminLayout>
  );
}