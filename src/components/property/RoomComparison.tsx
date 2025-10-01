import { useState } from 'react';
import { Users, Check, X } from 'lucide-react';
import { type RoomType } from '@/types';
import { formatCurrency } from '@/utils';

interface RoomComparisonProps {
  rooms: RoomType[];
}

export function RoomComparison({ rooms }: RoomComparisonProps) {
  const [selectedRooms, setSelectedRooms] = useState<RoomType[]>([]);

  const toggleRoomSelection = (room: RoomType) => {
    if (selectedRooms.find(r => r.id === room.id)) {
      setSelectedRooms(selectedRooms.filter(r => r.id !== room.id));
    } else if (selectedRooms.length < 3) {
      setSelectedRooms([...selectedRooms, room]);
    }
  };

  if (rooms.length < 2) {
    return null;
  }

  // Get all unique amenities across all rooms
  const allAmenities = Array.from(
    new Set(rooms.flatMap(room => room.amenities))
  );

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mt-8">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">Compare Rooms</h3>

      {/* Room Selection */}
      <div className="mb-6">
        <p className="text-gray-600 mb-4">Select up to 3 rooms to compare:</p>
        <div className="flex flex-wrap gap-3">
          {rooms.map((room) => (
            <button
              key={room.id}
              onClick={() => toggleRoomSelection(room)}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                selectedRooms.find(r => r.id === room.id)
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100'
              }`}
            >
              {room.name}
            </button>
          ))}
        </div>
      </div>

      {/* Comparison Table */}
      {selectedRooms.length >= 2 && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Features</th>
                {selectedRooms.map((room) => (
                  <th key={room.id} className="text-center py-3 px-4 font-semibold text-gray-900">
                    {room.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Price */}
              <tr className="border-b">
                <td className="py-3 px-4 font-medium text-gray-700">Price per night</td>
                {selectedRooms.map((room) => (
                  <td key={room.id} className="py-3 px-4 text-center">
                    <div className="text-2xl font-bold text-primary-600">
                      {formatCurrency(room.baseRate || 0)}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Capacity */}
              <tr className="border-b bg-gray-50">
                <td className="py-3 px-4 font-medium text-gray-700">Guest Capacity</td>
                {selectedRooms.map((room) => (
                  <td key={room.id} className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{room.capacity} Guests</span>
                    </div>
                  </td>
                ))}
              </tr>

              {/* Amenities */}
              {allAmenities.map((amenity) => (
                <tr key={amenity} className="border-b">
                  <td className="py-3 px-4 font-medium text-gray-700">{amenity}</td>
                  {selectedRooms.map((room) => (
                    <td key={room.id} className="py-3 px-4 text-center">
                      {room.amenities.includes(amenity) ? (
                        <Check className="w-5 h-5 text-green-500 mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-gray-300 mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>
              ))}

              {/* Book Button */}
              <tr>
                <td className="py-4 px-4"></td>
                {selectedRooms.map((room) => (
                  <td key={room.id} className="py-4 px-4 text-center">
                    <button className="btn-primary w-full">
                      Book {room.name}
                    </button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {selectedRooms.length === 1 && (
        <div className="text-center py-8 text-gray-500">
          Select at least 2 rooms to compare
        </div>
      )}
    </div>
  );
}