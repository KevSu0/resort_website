import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, ZoomIn, ZoomOut, Layers } from 'lucide-react';
import type { Property } from '../types';

interface MapViewProps {
  properties: Property[];
  selectedProperty?: Property;
  onPropertySelect?: (property: Property) => void;
  className?: string;
}

interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  property: Property;
}

export default function MapView({
  properties,
  selectedProperty,
  onPropertySelect,
  className = ''
}: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapCenter, setMapCenter] = useState({ lat: 40.7128, lng: -74.0060 }); // Default to NYC
  const [, setZoomLevel] = useState(10);
  const [mapStyle, setMapStyle] = useState<'standard' | 'satellite' | 'terrain'>('standard');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Generate markers from properties with mock coordinates
  const markers: MapMarker[] = properties.map((property, index) => ({
    id: property.id,
    // Mock coordinates - in real app, these would come from property data
    lat: mapCenter.lat + (Math.random() - 0.5) * 0.1 + (index * 0.01),
    lng: mapCenter.lng + (Math.random() - 0.5) * 0.1 + (index * 0.01),
    property
  }));

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          setMapCenter({ lat: latitude, lng: longitude });
        },
        (error) => {
          console.log('Geolocation error:', error);
          // Fallback to default location
        }
      );
    }
  }, []);

  const handleMarkerClick = (marker: MapMarker) => {
    onPropertySelect?.(marker.property);
    setMapCenter({ lat: marker.lat, lng: marker.lng });
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 1, 18));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 1, 1));
  };

  const centerOnUser = () => {
    if (userLocation) {
      setMapCenter(userLocation);
    }
  };

  const getMarkerSize = (property: Property) => {
    if (selectedProperty?.id === property.id) return 'large';
    return 'normal';
  };

  const getMarkerColor = (property: Property) => {
    if (selectedProperty?.id === property.id) return 'bg-red-500';
    if ((property.rating || 0) >= 4.5) return 'bg-green-500';
    if ((property.rating || 0) >= 4.0) return 'bg-blue-500';
    return 'bg-gray-500';
  };

  return (
    <div className={`relative bg-gray-100 rounded-lg overflow-hidden ${className}`}>
      {/* Map Container */}
      <div ref={mapRef} className="w-full h-full min-h-[400px] relative">
        {/* Mock Map Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-green-100">
          {/* Grid pattern to simulate map */}
          <div className="absolute inset-0 opacity-20">
            <svg width="100%" height="100%">
              <defs>
                <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                  <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#94a3b8" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          {/* Mock roads */}
          <svg className="absolute inset-0 w-full h-full">
            <path
              d="M 0 200 Q 200 150 400 200 T 800 180"
              stroke="#64748b"
              strokeWidth="3"
              fill="none"
              opacity="0.6"
            />
            <path
              d="M 100 0 Q 150 200 200 400 T 180 800"
              stroke="#64748b"
              strokeWidth="2"
              fill="none"
              opacity="0.4"
            />
          </svg>
        </div>

        {/* Property Markers */}
        {markers.map((marker) => {
          const markerSize = getMarkerSize(marker.property);
          const markerColor = getMarkerColor(marker.property);
          const size = markerSize === 'large' ? 'w-8 h-8' : 'w-6 h-6';
          
          return (
            <div
              key={marker.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200 hover:scale-110"
              style={{
                left: `${((marker.lng - mapCenter.lng) * 1000 + 50)}%`,
                top: `${(-(marker.lat - mapCenter.lat) * 1000 + 50)}%`
              }}
              onClick={() => handleMarkerClick(marker)}
            >
              <div className={`${size} ${markerColor} rounded-full border-2 border-white shadow-lg flex items-center justify-center`}>
                <MapPin className="w-3 h-3 text-white" />
              </div>
              
              {/* Property Info Popup */}
              {selectedProperty?.id === marker.property.id && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 p-3 z-10">
                  <div className="flex gap-3">
                    <img
                      src={marker.property.branding.hero_image || ''}
                      alt={marker.property.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm text-gray-900 truncate">
                        {marker.property.name}
                      </h3>
                      <p className="text-xs text-gray-600 mb-1">
                        {marker.property.location.address} • {marker.property.stay_types.join(', ')}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-yellow-500">★</span>
                          <span className="text-xs text-gray-600">{marker.property.rating || 0}</span>
                        </div>
                        <div className="text-xs font-semibold text-gray-900">
                          ${marker.property.priceRange?.min}-${marker.property.priceRange?.max}
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Arrow */}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white"></div>
                </div>
              )}
            </div>
          );
        })}

        {/* User Location Marker */}
        {userLocation && (
          <div
            className="absolute transform -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${((userLocation.lng - mapCenter.lng) * 1000 + 50)}%`,
              top: `${(-(userLocation.lat - mapCenter.lat) * 1000 + 50)}%`
            }}
          >
            <div className="w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
          </div>
        )}
      </div>

      {/* Map Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        {/* Zoom Controls */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          <button
            onClick={handleZoomIn}
            className="block w-10 h-10 flex items-center justify-center hover:bg-gray-50 transition-colors border-b border-gray-200"
          >
            <ZoomIn className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={handleZoomOut}
            className="block w-10 h-10 flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <ZoomOut className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* Location Control */}
        {userLocation && (
          <button
            onClick={centerOnUser}
            className="w-10 h-10 bg-white rounded-lg shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
            title="Center on my location"
          >
            <Navigation className="w-4 h-4 text-gray-600" />
          </button>
        )}

        {/* Map Style Control */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          <button
            onClick={() => setMapStyle(mapStyle === 'standard' ? 'satellite' : mapStyle === 'satellite' ? 'terrain' : 'standard')}
            className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 transition-colors"
            title="Change map style"
          >
            <Layers className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg border border-gray-200 p-3">
        <h4 className="text-xs font-semibold text-gray-900 mb-2">Legend</h4>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-xs text-gray-600">4.5+ Rating</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-xs text-gray-600">4.0+ Rating</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
            <span className="text-xs text-gray-600">Other</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-xs text-gray-600">Selected</span>
          </div>
        </div>
      </div>

      {/* Properties Count */}
      <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg border border-gray-200 px-3 py-2">
        <span className="text-sm font-medium text-gray-900">
          {properties.length} {properties.length === 1 ? 'Property' : 'Properties'}
        </span>
      </div>
    </div>
  );
}