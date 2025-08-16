import React from 'react';
import { MapPin, Star, Search } from 'lucide-react';
import { Section, Card, Grid } from './Layout';

interface SearchTipsProps {
  className?: string;
}

export function SearchTips({ className = '' }: SearchTipsProps) {
  const tips = [
    {
      icon: <MapPin className="w-8 h-8 text-blue-600 mx-auto mb-4" />,
      title: 'Be Specific with Location',
      description: 'Include city names, neighborhoods, or landmarks for more accurate results'
    },
    {
      icon: <Star className="w-8 h-8 text-yellow-500 mx-auto mb-4" />,
      title: 'Use Filters',
      description: 'Narrow down results by price, rating, amenities, and property type'
    },
    {
      icon: <Search className="w-8 h-8 text-green-600 mx-auto mb-4" />,
      title: 'Try Different Keywords',
      description: 'Use synonyms or related terms if you don\'t find what you\'re looking for'
    }
  ];

  return (
    <Section className={`bg-gray-50 ${className}`}>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Search Tips
        </h2>
        <p className="text-gray-600">
          Get better results with these helpful search tips
        </p>
      </div>
      
      <Grid className="grid-cols-1 md:grid-cols-3 gap-6">
        {tips.map((tip, index) => (
          <Card key={index} className="text-center p-6">
            {tip.icon}
            <h3 className="font-semibold text-gray-900 mb-2">{tip.title}</h3>
            <p className="text-sm text-gray-600">
              {tip.description}
            </p>
          </Card>
        ))}
      </Grid>
    </Section>
  );
}