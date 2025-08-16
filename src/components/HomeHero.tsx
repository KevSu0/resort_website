import React from 'react';
import SearchBar from './SearchBar';
import { Section } from './Layout';
import { ResortGroup } from '../types';

interface HomeHeroProps {
  resortGroup?: ResortGroup | null;
  title?: string;
  subtitle?: string;
  backgroundImage?: string;
  showSearchBar?: boolean;
  className?: string;
}

export function HomeHero({
  resortGroup,
  title,
  subtitle,
  backgroundImage,
  showSearchBar = true,
  className = ""
}: HomeHeroProps) {
  // Dynamic content based on resort group
  const heroTitle = title || 
    (resortGroup ? 
      `Welcome to ${resortGroup.name}` : 
      "Discover Your Perfect Resort Experience");
  
  const heroSubtitle = subtitle || 
    (resortGroup ? 
      resortGroup.description || `Experience luxury at ${resortGroup.name}'s premium destinations worldwide` :
      "Explore our collection of luxury resorts, from mountain retreats to beachfront paradises");
  
  const heroBackground = backgroundImage || 
    resortGroup?.branding?.hero_image || 
    "https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2080&q=80";
  return (
    <div 
      className={`relative z-10 text-center text-white py-32 ${className}`}
      style={{
        backgroundImage: `url('${heroBackground}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      <Section className="relative z-10">
        <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          {heroTitle}
        </h1>
        <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-blue-100">
          {heroSubtitle}
        </p>
        
        {/* Resort Group Stats */}
        {resortGroup && (
          <div className="flex justify-center space-x-8 mb-8 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold">{resortGroup.total_properties || 0}</div>
              <div className="text-blue-200">Properties</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{resortGroup.total_destinations || 0}</div>
              <div className="text-blue-200">Destinations</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{resortGroup.total_rooms || 0}+</div>
              <div className="text-blue-200">Rooms</div>
            </div>
          </div>
        )}
        
        {showSearchBar && (
          <div className="max-w-2xl mx-auto">
            <SearchBar />
          </div>
        )}
        </div>
      </Section>
    </div>
  );
}