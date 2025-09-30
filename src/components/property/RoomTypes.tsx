import { Users, Square, Coffee, Shield, Heart } from 'lucide-react';
import { type RoomType } from '@/types';
import { formatCurrency } from '@/utils';
import { RoomComparison } from './RoomComparison';

interface RoomTypesProps {
  rooms: RoomType[];
  className?: string;
}

export const RoomTypes: React.FC<RoomTypesProps> = ({
  rooms,
  className = ''
}) => {
  const getAmenityIcon = (amenity: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      'King Size Bed': <Heart className="w-4 h-4" />,
      'Double Bed': <Heart className="w-4 h-4" />,
      'Private Balcony': <Square className="w-4 h-4" />,
      'Lake View Balcony': <Square className="w-4 h-4" />,
      'Valley View Balcony': <Square className="w-4 h-4" />,
      'AC': <Shield className="w-4 h-4" />,
      'Coffee Maker': <Coffee className="w-4 h-4" />,
      'Tea/Coffee Maker': <Coffee className="w-4 h-4" />,
      'Mini Fridge': <Coffee className="w-4 h-4" />,
      'Mini Bar': <Coffee className="w-4 h-4" />,
      'Private Bathroom': <Shield className="w-4 h-4" />,
      'Sitting Area': <Square className="w-4 h-4" />,
      'Living Room': <Square className="w-4 h-4" />,
      'Private Garden': <Square className="w-4 h-4" />,
      'Kitchenette': <Coffee className="w-4 h-4" />,
      'Dining Area': <Square className="w-4 h-4" />,
      'Work Desk': <Square className="w-4 h-4" />,
      'Jacuzzi': <Heart className="w-4 h-4" />,
      '2 Bedrooms': <Heart className="w-4 h-4" />,
    };

    return iconMap[amenity] || <Square className="w-4 h-4" />;
  };

  if (!rooms.length) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <p className="text-gray-500">No room types available</p>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Price Summary */}
      <div className="bg-blue-50 rounded-xl p-6 mb-8">
        <h3 className="font-semibold text-gray-900 mb-4">Room Rates Summary</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {rooms.map((room) => (
            <div key={room.id} className="bg-white rounded-lg p-4 text-center">
              <div className="font-medium text-gray-900 mb-1">{room.name}</div>
              <div className="text-2xl font-bold text-primary-600">
                {formatCurrency(room.baseRate || 0)}
              </div>
              <div className="text-sm text-gray-500">per night</div>
              <div className="text-sm text-gray-600 mt-1">
                {room.capacity} {room.capacity > 1 ? 'Guests' : 'Guest'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Room Cards */}
      <div className="grid grid-cols-1 gap-8">
        {rooms.map((room, index) => (
          <div
            key={room.id}
            className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300"
          >
            <div className="md:flex">
              {/* Room Images */}
              <div className="md:w-2/5 lg:w-1/3">
                <div className="aspect-video md:aspect-square bg-gray-100 overflow-hidden relative">
                  {room.photos && room.photos.length > 0 ? (
                    <img
                      src={room.photos[0]}
                      alt={room.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                      <span className="text-gray-400">No image available</span>
                    </div>
                  )}

                  {/* Room Badge */}
                  <div className="absolute top-4 left-4">
                    <span className="bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Option {index + 1}
                    </span>
                  </div>
                </div>
              </div>

              {/* Room Details */}
              <div className="md:w-3/5 lg:w-2/3 p-6 lg:p-8">
                <div className="flex flex-col h-full">
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4">
                      <div className="mb-4 sm:mb-0">
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                          {room.name}
                        </h3>
                        <p className="text-gray-600 leading-relaxed">
                          {room.description}
                        </p>
                      </div>
                      <div className="text-center sm:text-right sm:ml-6">
                        <div className="text-3xl font-bold text-primary-600 mb-1">
                          {formatCurrency(room.baseRate || 0)}
                        </div>
                        <div className="text-sm text-gray-500">per night</div>
                        <div className="text-xs text-gray-400 mt-1">
                          + taxes & fees
                        </div>
                      </div>
                    </div>

                    {/* Quick Info */}
                    <div className="flex flex-wrap gap-6 mb-6 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Users className="w-4 h-4" />
                        <span>{room.capacity} Guests</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Square className="w-4 h-4" />
                        <span>
                          {room.amenities.includes('2 Bedrooms') ? '2 Bedrooms' :
                           room.amenities.includes('3 Bedrooms') ? '3 Bedrooms' : '1 Room'}
                        </span>
                      </div>
                    </div>

                    {/* Room Amenities */}
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-900 mb-3">Room Features</h4>
                      <div className="flex flex-wrap gap-2">
                        {room.amenities.slice(0, 8).map((amenity, amenityIndex) => (
                          <span
                            key={amenityIndex}
                            className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg text-sm"
                          >
                            {getAmenityIcon(amenity)}
                            {amenity}
                          </span>
                        ))}
                        {room.amenities.length > 8 && (
                          <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg text-sm">
                            +{room.amenities.length - 8} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Booking CTA */}
                  <div className="border-t pt-4 mt-auto">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="text-sm text-gray-600">
                        Check-in: 2:00 PM | Check-out: 11:00 AM
                      </div>
                      <div className="flex gap-3">
                        <button className="btn-outline px-6 py-2.5 text-sm">
                          View Details
                        </button>
                        <button className="btn-primary px-6 py-2.5 text-sm">
                          Select Room
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Booking Information */}
      <div className="mt-8 bg-amber-50 rounded-xl p-6">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Shield className="w-5 h-5 text-amber-600" />
          Booking Information
        </h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-amber-600 mt-1">•</span>
            Rates are subject to change based on season and availability
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-600 mt-1">•</span>
            Additional taxes and charges may apply as per local regulations
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-600 mt-1">•</span>
            Free cancellation up to 48 hours before check-in (terms apply)
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-600 mt-1">•</span>
            For group bookings or extended stays, please contact us directly
          </li>
        </ul>
      </div>

      {/* Room Comparison */}
      <RoomComparison rooms={rooms} />
    </div>
  );
};