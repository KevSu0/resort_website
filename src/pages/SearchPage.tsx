import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Filter, MapPin, Star, Grid3X3, List } from 'lucide-react';
import Layout from '../components/Layout';
import { Section, Card, Grid } from '../components/Layout';
import PropertyCard from '../components/PropertyCard';
import { AdvancedSearchBar } from '../components/SearchBar';
import type { Property, SearchFilters } from '../types';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('relevance');

  // Get search parameters from URL
  const location = searchParams.get('location') || '';
  const checkIn = searchParams.get('checkIn') || '';
  const checkOut = searchParams.get('checkOut') || '';
  const guests = parseInt(searchParams.get('guests') || '2');
  const query = searchParams.get('q') || '';

  // Mock search results
  const mockProperties: Property[] = [
    {
      id: '1',
      name: 'Ocean View Resort',
      slug: 'ocean-view-resort',
      description: 'Luxury beachfront resort with stunning ocean views',
      shortDescription: 'Beachfront luxury resort',
      images: ['https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=luxury%20beachfront%20resort%20ocean%20view%20sunset&image_size=landscape_16_9'],
      price: 299,
      rating: 4.8,
      reviewCount: 124,
      location: {
        city: 'Miami Beach',
        state: 'Florida',
        country: 'USA',
        coordinates: { lat: 25.7617, lng: -80.1918 }
      },
      amenities: ['Pool', 'Spa', 'Restaurant', 'WiFi', 'Parking'],
      stayType: 'Resort',
      propertyType: 'Resort',
      maxGuests: 4,
      bedrooms: 2,
      bathrooms: 2,
      featured: true,
      available: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '2',
      name: 'Mountain Lodge Retreat',
      slug: 'mountain-lodge-retreat',
      description: 'Cozy mountain lodge perfect for nature lovers',
      shortDescription: 'Mountain lodge retreat',
      images: ['https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=mountain%20lodge%20cabin%20forest%20retreat%20cozy&image_size=landscape_16_9'],
      price: 189,
      rating: 4.6,
      reviewCount: 89,
      location: {
        city: 'Aspen',
        state: 'Colorado',
        country: 'USA',
        coordinates: { lat: 39.1911, lng: -106.8175 }
      },
      amenities: ['Fireplace', 'Kitchen', 'WiFi', 'Parking', 'Hot Tub'],
      stayType: 'Lodge',
      propertyType: 'Lodge',
      maxGuests: 6,
      bedrooms: 3,
      bathrooms: 2,
      featured: false,
      available: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  useEffect(() => {
    // Simulate search API call
    setLoading(true);
    setTimeout(() => {
      setProperties(mockProperties);
      setLoading(false);
    }, 1000);
  }, [searchParams]);

  const handleSearch = (filters: SearchFilters) => {
    const newParams = new URLSearchParams();
    if (filters.location) newParams.set('location', filters.location);
    if (filters.checkIn) newParams.set('checkIn', filters.checkIn);
    if (filters.checkOut) newParams.set('checkOut', filters.checkOut);
    if (filters.guests) newParams.set('guests', filters.guests.toString());
    setSearchParams(newParams);
  };

  const handleSort = (value: string) => {
    setSortBy(value);
    // Implement sorting logic here
  };

  return (
    <Layout>
      {/* Search Header */}
      <Section className="bg-gray-50 border-b">
        <div className="max-w-4xl mx-auto">
          <AdvancedSearchBar 
            onSearch={handleSearch}
            defaultValues={{
              location,
              checkIn,
              checkOut,
              guests
            }}
          />
        </div>
      </Section>

      {/* Search Results */}
      <Section>
        {/* Results Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              {query ? `Search Results for "${query}"` : 'Search Results'}
            </h1>
            <p className="text-gray-600">
              {loading ? 'Searching...' : `${properties.length} properties found`}
              {location && ` in ${location}`}
            </p>
          </div>
          
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            {/* View Mode Toggle */}
            <div className="flex items-center border border-gray-300 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
            
            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => handleSort(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="relevance">Sort by Relevance</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="newest">Newest First</option>
            </select>
            
            {/* Filter Button */}
            <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Searching for properties...</p>
          </div>
        )}

        {/* Search Results */}
        {!loading && properties.length > 0 && (
          <Grid className={viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'grid-cols-1 gap-4'}>
            {properties.map((property) => (
              <PropertyCard 
                key={property.id} 
                property={property} 
                variant={viewMode === 'list' ? 'compact' : 'default'}
              />
            ))}
          </Grid>
        )}

        {/* No Results */}
        {!loading && properties.length === 0 && (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No properties found
            </h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search criteria or browse our featured properties
            </p>
            <Link
              to="/"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse Featured Properties
            </Link>
          </div>
        )}

        {/* Pagination */}
        {!loading && properties.length > 0 && (
          <div className="flex justify-center mt-12">
            <nav className="flex items-center space-x-2">
              <button className="px-3 py-2 text-gray-500 hover:text-gray-700 disabled:opacity-50" disabled>
                Previous
              </button>
              <button className="px-3 py-2 bg-blue-600 text-white rounded">
                1
              </button>
              <button className="px-3 py-2 text-gray-700 hover:text-gray-900">
                2
              </button>
              <button className="px-3 py-2 text-gray-700 hover:text-gray-900">
                3
              </button>
              <button className="px-3 py-2 text-gray-700 hover:text-gray-900">
                Next
              </button>
            </nav>
          </div>
        )}
      </Section>

      {/* Search Tips */}
      <Section className="bg-gray-50">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Search Tips
          </h2>
          <p className="text-gray-600">
            Get better results with these helpful search tips
          </p>
        </div>
        
        <Grid className="grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="text-center p-6">
            <MapPin className="w-8 h-8 text-blue-600 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">Be Specific with Location</h3>
            <p className="text-sm text-gray-600">
              Include city names, neighborhoods, or landmarks for more accurate results
            </p>
          </Card>
          
          <Card className="text-center p-6">
            <Star className="w-8 h-8 text-yellow-500 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">Use Filters</h3>
            <p className="text-sm text-gray-600">
              Narrow down results by price, rating, amenities, and property type
            </p>
          </Card>
          
          <Card className="text-center p-6">
            <Search className="w-8 h-8 text-green-600 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">Try Different Keywords</h3>
            <p className="text-sm text-gray-600">
              Use synonyms or related terms if you don't find what you're looking for
            </p>
          </Card>
        </Grid>
      </Section>
    </Layout>
  );
}