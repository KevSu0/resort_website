import React from 'react';
import { Star, Users, MapPin } from 'lucide-react';
import { Section, Grid, Card } from './Layout';

export function WhyChooseUs() {
  return (
    <Section>
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Why Choose Our Resorts?
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Experience the difference with our premium amenities and exceptional service
        </p>
      </div>

      <Grid className="grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="text-center p-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Star className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Luxury Amenities</h3>
          <p className="text-gray-600">
            World-class facilities including spas, fine dining, and exclusive experiences
          </p>
        </Card>

        <Card className="text-center p-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Users className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Personalized Service</h3>
          <p className="text-gray-600">
            Dedicated concierge and staff to ensure your stay exceeds expectations
          </p>
        </Card>

        <Card className="text-center p-8">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <MapPin className="w-8 h-8 text-purple-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Prime Locations</h3>
          <p className="text-gray-600">
            Carefully selected destinations offering the best of nature and luxury
          </p>
        </Card>
      </Grid>
    </Section>
  );
}
