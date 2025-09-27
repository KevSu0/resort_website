import React, { useState } from 'react';
import { MapPin, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card/Card';
import { Button } from '../ui/button/Button';
import { ADMIN_CONFIG } from '../../config/adminConfig';

interface CoordinatePreviewProps {
  latitude: number;
  longitude: number;
  onCoordinatesChange?: (lat: number, lng: number) => void;
  disabled?: boolean;
}

export const CoordinatePreview: React.FC<CoordinatePreviewProps> = ({
  latitude,
  longitude,
  onCoordinatesChange,
  disabled = false
}) => {
  const [showPrecise, setShowPrecise] = useState(false);

  // Round coordinates for display (4 decimals ≈ 11m precision)
  const displayLat = showPrecise ? latitude : Math.round(latitude * 10000) / 10000;
  const displayLng = showPrecise ? longitude : Math.round(longitude * 10000) / 10000;

  // Generate static map preview URL (only if feature is enabled)
  const getStaticMapUrl = () => {
    if (!ADMIN_CONFIG.FEATURE_FLAGS.ALLOW_MAP_EMBED) {
      return null;
    }

    // This would normally use a tile service URL
    // For now, returns null to prevent network calls
    return null;
  };

  const mapUrl = getStaticMapUrl();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Location
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Coordinate Display */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Latitude</label>
            <div className="mt-1">
              <code className="bg-muted px-2 py-1 rounded text-sm">
                {displayLat}
              </code>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Longitude</label>
            <div className="mt-1">
              <code className="bg-muted px-2 py-1 rounded text-sm">
                {displayLng}
              </code>
            </div>
          </div>
        </div>

        {/* Precision Toggle */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {showPrecise ? 'Showing precise coordinates' : 'Showing rounded coordinates (11m precision)'}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPrecise(!showPrecise)}
            className="gap-2"
          >
            {showPrecise ? (
              <>
                <EyeOff className="h-4 w-4" />
                Hide Precise
              </>
            ) : (
              <>
                <Eye className="h-4 w-4" />
                Show Precise
              </>
            )}
          </Button>
        </div>

        {/* Map Preview (feature-gated) */}
        {ADMIN_CONFIG.FEATURE_FLAGS.ALLOW_MAP_EMBED && mapUrl && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Map Preview</label>
            <div className="border rounded-md overflow-hidden bg-muted aspect-video flex items-center justify-center">
              <img
                src={mapUrl}
                alt="Location preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback to static preview if image fails to load
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement!.innerHTML = `
                    <div class="text-center text-muted-foreground">
                      <MapPin class="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Map preview unavailable</p>
                      <p class="text-xs">Coordinates: ${displayLat}, ${displayLng}</p>
                    </div>
                  `;
                }}
              />
            </div>
          </div>
        )}

        {/* Static Coordinate Display (when maps are disabled) */}
        {!ADMIN_CONFIG.FEATURE_FLAGS.ALLOW_MAP_EMBED && (
          <div className="border rounded-md bg-muted aspect-video flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Map embedding disabled</p>
              <p className="text-xs mt-1">
                Coordinates: {displayLat}, {displayLng}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Enable ALLOW_MAP_EMBED to show interactive maps
              </p>
            </div>
          </div>
        )}

        {/* Coordinate Input (if editable) */}
        {!disabled && onCoordinatesChange && (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <input
                type="number"
                step="any"
                value={latitude}
                onChange={(e) => onCoordinatesChange(parseFloat(e.target.value) || 0, longitude)}
                className="w-full px-3 py-2 border rounded-md text-sm"
                placeholder="Latitude"
                min="-90"
                max="90"
              />
            </div>
            <div>
              <input
                type="number"
                step="any"
                value={longitude}
                onChange={(e) => onCoordinatesChange(latitude, parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border rounded-md text-sm"
                placeholder="Longitude"
                min="-180"
                max="180"
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};