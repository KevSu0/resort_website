import { Link } from 'react-router-dom';
import { Star, MapPin, Users, Wifi, Car, Coffee, Home, Waves, TreePine, Mountain } from 'lucide-react';
import { type Property } from '@/types';
import { formatCurrency } from '@/utils';

interface PropertySummaryProps {
  property: Property;
}

export const PropertySummary: React.FC<PropertySummaryProps> = ({ property }) => {
  // Get the lowest room price
  const lowestPrice = property.rooms.length > 0
    ? Math.min(...property.rooms.map(room => room.baseRate || 0))
    : 0;

  // Get 3 key amenities for display
  const keyAmenities = property.amenities.slice(0, 3);

  // Get property type icon
  const getPropertyIcon = () => {
    if (property.name.toLowerCase().includes('treehouse')) {
      return <TreePine className="w-6 h-6" />;
    } else if (property.name.toLowerCase().includes('bay') || property.name.toLowerCase().includes('lake')) {
      return <Waves className="w-6 h-6" />;
    } else {
      return <Mountain className="w-6 h-6" />;
    }
  };

  return (
    <Link
      to={`/properties/${property.slug}`}
      className="group block bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1"
    >
      <div className="relative h-64 overflow-hidden">
        <img
          src={property.heroImage}
          alt={property.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Property type badge */}
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-full p-2">
          {getPropertyIcon()}
        </div>

        {/* Price tag */}
        <div className="absolute bottom-4 left-4 bg-white rounded-lg px-3 py-2 shadow-lg">
          <div className="text-xs text-gray-500">From</div>
          <div className="text-lg font-bold text-primary-600">{formatCurrency(lowestPrice)}</div>
          <div className="text-xs text-gray-500">per night</div>
        </div>

        {/* Featured badge */}
        {property.featured && (
          <div className="absolute top-4 right-4 bg-secondary-500 text-white px-3 py-1 rounded-full text-sm font-medium">
            Featured
          </div>
        )}
      </div>

      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
              {property.name}
            </h3>
            {property.tagline && (
              <p className="text-gray-600 text-sm mt-1">{property.tagline}</p>
            )}
          </div>
          <div className="flex items-center gap-1 text-sm">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">4.8</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-gray-600 text-sm mb-4">
          <MapPin className="w-4 h-4" />
          <span>Wayanad, Kerala</span>
        </div>

        {/* Quick amenities */}
        <div className="flex flex-wrap gap-2 mb-4">
          {keyAmenities.map((amenity, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-xs"
            >
              {getAmenityIcon(amenity)}
              {amenity}
            </span>
          ))}
        </div>

        {/* Quick info */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4 text-gray-600">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>2-4 Guests</span>
            </div>
            <div className="flex items-center gap-1">
              <Home className="w-4 h-4" />
              <span>{property.rooms.length} Rooms</span>
            </div>
          </div>
          <span className="text-primary-600 font-medium group-hover:translate-x-1 transition-transform">
            View Details →
          </span>
        </div>
      </div>
    </Link>
  );
};

// Helper function to get icon for amenity
const getAmenityIcon = (amenity: string) => {
  const iconMap: Record<string, React.ReactNode> = {
    'Free WiFi': <Wifi className="w-3 h-3" />,
    'WiFi': <Wifi className="w-3 h-3" />,
    'Parking': <Car className="w-3 h-3" />,
    'Breakfast': <Coffee className="w-3 h-3" />,
    'Complimentary Breakfast': <Coffee className="w-3 h-3" />,
    'Treehouse Accommodation': <Home className="w-3 h-3" />,
  };

  return iconMap[amenity] || <div className="w-3 h-3 rounded-full bg-gray-400"></div>;
};