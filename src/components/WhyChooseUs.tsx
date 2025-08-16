import React from 'react';
import { Star, MapPin, Users, Award, Shield, Heart } from 'lucide-react';
import { Section, Card, Grid } from './Layout';
import { ResortGroup } from '../types';

interface WhyChooseUsProps {
  resortGroup?: ResortGroup | null;
}

export function WhyChooseUs({ resortGroup }: WhyChooseUsProps) {
  // Dynamic features based on resort group or default
  const defaultFeatures = [
    {
      icon: Star,
      title: 'Premium Quality',
      description: 'Every property is carefully selected and maintained to ensure the highest standards of comfort and luxury.',
      color: 'blue'
    },
    {
      icon: MapPin,
      title: 'Prime Locations',
      description: 'Our resorts are strategically located in the world\'s most beautiful and sought-after destinations.',
      color: 'green'
    },
    {
      icon: Users,
      title: 'Exceptional Service',
      description: 'Our dedicated team is committed to making your stay memorable with personalized attention and care.',
      color: 'purple'
    }
  ];

  const resortGroupFeatures = [
    {
      icon: Award,
      title: `${resortGroup?.name || 'Our'} Excellence`,
      description: resortGroup?.unique_selling_points?.[0] || 'Award-winning hospitality and world-class amenities at every destination.',
      color: 'blue'
    },
    {
      icon: MapPin,
      title: 'Global Presence',
      description: `Experience luxury across ${resortGroup?.total_destinations || 'multiple'} destinations worldwide with consistent quality and service.`,
      color: 'green'
    },
    {
      icon: Shield,
      title: 'Trusted Brand',
      description: resortGroup?.unique_selling_points?.[1] || 'Decades of experience in luxury hospitality with millions of satisfied guests.',
      color: 'purple'
    }
  ];

  const features = resortGroup ? resortGroupFeatures : defaultFeatures;

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return 'bg-blue-100 text-blue-600';
      case 'green':
        return 'bg-green-100 text-green-600';
      case 'purple':
        return 'bg-purple-100 text-purple-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <Section>
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          {resortGroup ? `Why Choose ${resortGroup.name}?` : 'Why Choose Our Resorts?'}
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          {resortGroup?.tagline || "We're committed to providing exceptional experiences at every property"}
        </p>
        
        {/* Resort Group Stats */}
        {resortGroup && (
          <div className="flex justify-center space-x-8 mt-8 text-sm">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{resortGroup.years_established || '25'}+</div>
              <div className="text-gray-500">Years of Excellence</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{resortGroup.total_guests_served || '1M'}+</div>
              <div className="text-gray-500">Happy Guests</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{resortGroup.awards_count || '50'}+</div>
              <div className="text-gray-500">Awards Won</div>
            </div>
          </div>
        )}
      </div>
      
      <Grid className="grid-cols-1 md:grid-cols-3 gap-8">
        {features.map((feature, index) => {
          const IconComponent = feature.icon;
          return (
            <Card key={index} className="text-center p-8 hover:shadow-lg transition-shadow">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${getColorClasses(feature.color)}`}>
                <IconComponent className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </Card>
          );
        })}
      </Grid>
    </Section>
  );
}