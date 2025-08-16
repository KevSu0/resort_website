import React from 'react';
import { Card, Grid, Section } from './Layout';

interface Benefit {
  title: string;
  description: string;
  icon: string;
  benefits: string[];
}

interface StayTypeBenefitsProps {
  title?: string;
  subtitle?: string;
  benefits?: Benefit[];
  className?: string;
}

const defaultBenefits: Benefit[] = [
  {
    title: 'Luxury Resorts',
    description: 'All-inclusive experiences with premium amenities and services',
    icon: '🏖️',
    benefits: ['Spa & Wellness', 'Fine Dining', 'Concierge Service']
  },
  {
    title: 'Boutique Hotels',
    description: 'Unique character and personalized service in intimate settings',
    icon: '🏨',
    benefits: ['Local Character', 'Personal Touch', 'Unique Design']
  },
  {
    title: 'Beach Resorts',
    description: 'Direct beach access with water sports and coastal activities',
    icon: '🌊',
    benefits: ['Beach Access', 'Water Sports', 'Ocean Views']
  },
  {
    title: 'City Hotels',
    description: 'Central locations with easy access to urban attractions',
    icon: '🏙️',
    benefits: ['City Center', 'Business Facilities', 'Transport Links']
  }
];

export function StayTypeBenefits({
  title = "Why Choose Different Stay Types?",
  subtitle = "Each accommodation type offers unique advantages for different travel experiences",
  benefits = defaultBenefits,
  className = ""
}: StayTypeBenefitsProps) {
  return (
    <Section className={className}>
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          {title}
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          {subtitle}
        </p>
      </div>

      <Grid className="grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {benefits.map((benefit, index) => (
          <Card key={index} className="p-6 text-center">
            <div className="text-4xl mb-4">{benefit.icon}</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {benefit.title}
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              {benefit.description}
            </p>
            <ul className="space-y-1">
              {benefit.benefits.map((item, idx) => (
                <li key={idx} className="text-xs text-gray-500">
                  ✓ {item}
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </Grid>
    </Section>
  );
}

export default StayTypeBenefits;