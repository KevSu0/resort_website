import React from 'react';
import { MapPin } from 'lucide-react';
import { HeroSection } from './Layout';
import type { City } from '../types';

interface CityHeroProps {
  city: City;
}

export function CityHero({ city }: CityHeroProps) {
  const propertyCount = city.property_ids.length;
  const mainImage = `https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(`${city.name} ${city.country} cityscape beautiful destination travel`)}&image_size=landscape_16_9`;

  return (
    <HeroSection
      className="bg-cover bg-center bg-gray-900 text-white relative"
      backgroundImage={mainImage}
    >
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      <div className="relative z-10 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">
          {city.name}
        </h1>
        <p className="text-xl md:text-2xl text-gray-200 mb-2">
          {city.state}, {city.country}
        </p>
        <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-8">
          {city.seo_data.meta_description}
        </p>
        <div className="flex items-center justify-center space-x-6 text-sm">
          <div className="flex items-center">
            <MapPin className="w-4 h-4 mr-1" />
            <span>{propertyCount} Properties</span>
          </div>
        </div>
      </div>
    </HeroSection>
  );
}
