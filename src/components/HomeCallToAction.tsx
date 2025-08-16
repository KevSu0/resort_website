import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Calendar } from 'lucide-react';
import { Section } from './Layout';
import { ResortGroup } from '../types';

interface HomeCallToActionProps {
  title?: string;
  subtitle?: string;
  primaryButtonText?: string;
  secondaryButtonText?: string;
  primaryButtonLink?: string;
  secondaryButtonLink?: string;
  className?: string;
  resortGroup?: ResortGroup | null;
}

export function HomeCallToAction({
  title,
  subtitle,
  primaryButtonText = "Browse Properties",
  secondaryButtonText = "Plan Your Trip",
  primaryButtonLink = "/properties",
  secondaryButtonLink = "/contact",
  className = "bg-gradient-to-r from-gray-900 to-blue-900 text-white",
  resortGroup
}: HomeCallToActionProps) {
  
  // Dynamic content based on resort group
  const dynamicTitle = title || (resortGroup ? 
    `Ready to Experience ${resortGroup.name}?` : 
    "Ready to Start Your Journey?");
    
  const dynamicSubtitle = subtitle || (resortGroup ? 
    `Join thousands of satisfied guests who have discovered luxury at ${resortGroup.name} properties worldwide.` : 
    "Join thousands of satisfied guests who have discovered their perfect getaway with us.");
  return (
    <Section className={className}>
      <div className="text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          {dynamicTitle}
        </h2>
        <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
          {dynamicSubtitle}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to={primaryButtonLink}
            className="inline-flex items-center px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Search className="mr-2 w-4 h-4" />
            {primaryButtonText}
          </Link>
          
          <Link
            to={secondaryButtonLink}
            className="inline-flex items-center px-8 py-3 border-2 border-white text-white rounded-lg hover:bg-white hover:text-gray-900 transition-colors font-medium"
          >
            <Calendar className="mr-2 w-4 h-4" />
            {secondaryButtonText}
          </Link>
        </div>
      </div>
    </Section>
  );
}