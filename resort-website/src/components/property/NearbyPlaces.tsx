import { MapPin, Car } from 'lucide-react';
import { type Place } from '@/types';

interface NearbyPlacesProps {
  places: Place[];
  className?: string;
}

export const NearbyPlaces: React.FC<NearbyPlacesProps> = ({
  places,
  className = ''
}) => {
  if (!places.length) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <p className="text-gray-500">No nearby places information available</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {places.map((place) => (
          <div
            key={place.id}
            className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
          >
            {/* Place Image */}
            <div className="aspect-video bg-gray-100 overflow-hidden">
              <img
                src={place.photo}
                alt={place.name}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>

            {/* Place Details */}
            <div className="p-5">
              <h3 className="font-semibold text-lg text-gray-900 mb-2">
                {place.name}
              </h3>

              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {place.description}
              </p>

              {/* Distance and Time */}
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{place.distanceKm} km</span>
                </div>
                <div className="flex items-center gap-1 text-gray-600">
                  <Car className="w-4 h-4" />
                  <span>{place.travelTime}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Travel Tips */}
      <div className="mt-8 bg-blue-50 rounded-xl p-6">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-blue-600" />
          Travel Tips
        </h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-1">•</span>
            All distances are approximate and may vary based on the route taken
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-1">•</span>
            Travel time estimates are for private vehicles and may vary based on traffic
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-1">•</span>
            Some attractions may require advance booking or have specific visiting hours
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-1">•</span>
            We recommend checking the latest information before planning your visit
          </li>
        </ul>
      </div>
    </div>
  );
};