import { Wifi, Car, Coffee, Home, Waves, TreePine, Mountain, Utensils, Dumbbell,
         Shield, Heart, Sparkles, MapPin, Camera, BookOpen, Flame } from 'lucide-react';

interface AmenitiesDisplayProps {
  amenities: string[];
  className?: string;
}

export const AmenitiesDisplay: React.FC<AmenitiesDisplayProps> = ({
  amenities,
  className = ''
}) => {
  const getAmenityIcon = (amenity: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      'Free WiFi': <Wifi className="w-5 h-5" />,
      'WiFi': <Wifi className="w-5 h-5" />,
      'Parking': <Car className="w-5 h-5" />,
      'Breakfast': <Coffee className="w-5 h-5" />,
      'Complimentary Breakfast': <Coffee className="w-5 h-5" />,
      'Restaurant': <Utensils className="w-5 h-5" />,
      'Fitness Center': <Dumbbell className="w-5 h-5" />,
      'Spa': <Heart className="w-5 h-5" />,
      'Swimming Pool': <Waves className="w-5 h-5" />,
      'Lake View': <Waves className="w-5 h-5" />,
      'Valley View': <Mountain className="w-5 h-5" />,
      'Mountain View': <Mountain className="w-5 h-5" />,
      'Garden View': <TreePine className="w-5 h-5" />,
      'Treehouse Accommodation': <Home className="w-5 h-5" />,
      'Room Service': <Coffee className="w-5 h-5" />,
      '24/7 Security': <Shield className="w-5 h-5" />,
      'Concierge': <Sparkles className="w-5 h-5" />,
      'Nature Walks': <MapPin className="w-5 h-5" />,
      'Bird Watching': <Camera className="w-5 h-5" />,
      'Trekking': <MapPin className="w-5 h-5" />,
      'Campfire': <Flame className="w-5 h-5" />,
      'Bonfire': <Flame className="w-5 h-5" />,
      'BBQ Facilities': <Flame className="w-5 h-5" />,
      'Yoga Deck': <Heart className="w-5 h-5" />,
      'Spa Services': <Heart className="w-5 h-5" />,
      'Conference Hall': <BookOpen className="w-5 h-5" />,
      "Children's Play Area": <Sparkles className="w-5 h-5" />,
      'Indoor Games': <Sparkles className="w-5 h-5" />,
      'Kayaking': <Waves className="w-5 h-5" />,
      'Fishing': <Waves className="w-5 h-5" />,
      'Coffee Plantation Tour': <Coffee className="w-5 h-5" />,
    };

    return iconMap[amenity] || <Sparkles className="w-5 h-5" />;
  };

  // Group amenities by category
  const amenityCategories: Record<string, string[]> = {
    'Essential Amenities': [
      'Free WiFi', 'WiFi', 'Parking', '24/7 Security', 'Room Service', 'Concierge'
    ],
    'Dining & Refreshments': [
      'Breakfast', 'Complimentary Breakfast', 'Restaurant', 'BBQ Facilities', 'Coffee Plantation Tour'
    ],
    'Recreation & Activities': [
      'Swimming Pool', 'Fitness Center', 'Spa', 'Spa Services', 'Yoga Deck', 'Indoor Games',
      'Nature Walks', 'Trekking', 'Bird Watching', 'Kayaking', 'Fishing', 'Campfire', 'Bonfire'
    ],
    'Views & Experiences': [
      'Lake View', 'Valley View', 'Mountain View', 'Garden View', 'Treehouse Accommodation'
    ],
    'Family & Business': [
      "Children's Play Area", 'Conference Hall'
    ]
  };

  const categorizedAmenities: Record<string, string[]> = {};

  // Initialize categories
  Object.keys(amenityCategories).forEach(category => {
    categorizedAmenities[category] = [];
  });

  // Categorize amenities
  amenities.forEach(amenity => {
    let categorized = false;
    for (const [category, amenityList] of Object.entries(amenityCategories)) {
      if (amenityList.includes(amenity)) {
        categorizedAmenities[category].push(amenity);
        categorized = true;
        break;
      }
    }
    if (!categorized) {
      if (!categorizedAmenities['Other Features']) {
        categorizedAmenities['Other Features'] = [];
      }
      categorizedAmenities['Other Features'].push(amenity);
    }
  });

  // Remove empty categories
  Object.keys(categorizedAmenities).forEach(category => {
    if (categorizedAmenities[category].length === 0) {
      delete categorizedAmenities[category];
    }
  });

  return (
    <div className={className}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(categorizedAmenities).map(([category, items]) => (
          <div key={category} className="bg-gray-50 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-4">{category}</h3>
            <div className="space-y-3">
              {items.map((amenity, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="flex-shrink-0 text-primary-600">
                    {getAmenityIcon(amenity)}
                  </div>
                  <span className="text-gray-700">{amenity}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Fallback for simple list if no categories match */}
      {Object.keys(categorizedAmenities).length === 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {amenities.map((amenity, index) => (
            <div key={index} className="flex items-center gap-2 text-gray-700">
              <div className="flex-shrink-0 text-primary-600">
                {getAmenityIcon(amenity)}
              </div>
              <span className="text-sm">{amenity}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};