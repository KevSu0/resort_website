import React from 'react';
import { useLoaderData, Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Section, Card, Grid } from '../components/Layout';
import { StayTypeHero } from '../components/StayTypeHero';
import { StayTypeBenefits } from '../components/StayTypeBenefits';
import { CallToAction } from '../components/CallToAction';
import type { StayType, Property, SearchFilters } from '../types';
import { PropertyGrid } from '../components/PropertyGrid';

interface StayTypesData {
  stayTypes: StayType[];
  featuredProperties: Property[];
}

export default function StayTypes() {
  const { stayTypes, featuredProperties } = useLoaderData() as StayTypesData;

  const handleSearch = (filters: SearchFilters) => {
    console.log('Search filters:', filters);
    // Handle search logic here
  };

  return (
    <>
      <StayTypeHero onSearch={handleSearch} />

      {/* Stay Types Grid */}
      <Section>
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Accommodation Types
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose from our diverse range of accommodations, each offering unique experiences and amenities
          </p>
        </div>

        <Grid className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {stayTypes.map((stayType) => (
            <Card key={stayType.id} className="group overflow-hidden hover:shadow-xl transition-all duration-300">
              <div className="relative overflow-hidden">
                <img 
                  src={stayType.details.images[0]}
                  alt={stayType.type_name}
                  className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {stayType.type_name}
                </h3>
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {stayType.details.description}
                </p>
                
                <Link 
                  to={`/stay-types/${stayType.slug}`}
                  className="block w-full text-center bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition-colors font-medium"
                >
                  Explore {stayType.type_name}
                </Link>
              </div>
            </Card>
          ))}
        </Grid>
      </Section>

      {/* Featured Properties by Stay Type */}
      <Section className="bg-gray-50">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Featured Properties
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Handpicked accommodations that showcase the best of each stay type
          </p>
        </div>

        <PropertyGrid properties={featuredProperties.slice(0, 6)} />
        
        <div className="text-center mt-8">
          <Link 
            to="/properties"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
          >
            View All Properties
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>
      </Section>

      <StayTypeBenefits />

      <CallToAction 
        variant="blue"
        title="Ready to Find Your Perfect Stay?"
        subtitle="Browse our collection of carefully selected accommodations and book your next unforgettable experience"
        primaryButton={{
          text: "Browse All Properties",
          href: "/properties"
        }}
        secondaryButton={{
          text: "Get Personalized Recommendations",
          href: "/contact"
        }}
      />
    </>
  );
}