import React from 'react';
import { HomeHero } from '../components/HomeHero';
import { FeaturedProperties } from '../components/FeaturedProperties';
import { FeaturedCities } from '../components/FeaturedCities';
import { WhyChooseUs } from '../components/WhyChooseUs';
import { HomeCallToAction } from '../components/HomeCallToAction';

export default function Home() {
  // Mock cities data - in a real app this would come from an API or loader
  const mockCities = [
    {
      id: '1',
      name: 'Bali',
      country: 'Indonesia',
      state: 'Bali Province',
      slug: 'bali',
      image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=beautiful%20tropical%20Bali%20resort%20destination%20with%20palm%20trees%20and%20ocean%20view&image_size=landscape_4_3',
      propertyCount: 12,
      property_ids: ['prop1', 'prop2', 'prop3'],
      seo_data: { meta_title: 'Bali Resorts', meta_description: 'Luxury resorts in Bali', keywords: ['bali', 'resort', 'luxury'] },
      created_at: new Date('2024-01-01'),
      updated_at: new Date('2024-01-01')
    },
    {
      id: '2',
      name: 'Maldives',
      country: 'Maldives',
      state: 'Maldives',
      slug: 'maldives',
      image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=luxury%20overwater%20bungalows%20in%20Maldives%20crystal%20clear%20turquoise%20water&image_size=landscape_4_3',
      propertyCount: 8,
      property_ids: ['prop4', 'prop5'],
      seo_data: { meta_title: 'Maldives Resorts', meta_description: 'Overwater villas in Maldives', keywords: ['maldives', 'overwater', 'villa'] },
      created_at: new Date('2024-01-01'),
      updated_at: new Date('2024-01-01')
    },
    {
      id: '3',
      name: 'Santorini',
      country: 'Greece',
      state: 'South Aegean',
      slug: 'santorini',
      image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=white%20buildings%20blue%20domes%20Santorini%20Greece%20sunset%20Mediterranean&image_size=landscape_4_3',
      propertyCount: 6,
      property_ids: ['prop6', 'prop7'],
      seo_data: { meta_title: 'Santorini Hotels', meta_description: 'Luxury hotels in Santorini', keywords: ['santorini', 'hotel', 'greece'] },
      created_at: new Date('2024-01-01'),
      updated_at: new Date('2024-01-01')
    }
  ];

  return (
    <div className="min-h-screen">
      <HomeHero 
        title="Discover Your Perfect Resort Experience"
        subtitle="Explore our collection of luxury resorts, from mountain retreats to beachfront paradises"
      />
      
      <FeaturedProperties />
      
      <FeaturedCities cities={mockCities} />
      
      <WhyChooseUs />
      
      <HomeCallToAction />
    </div>
  );
}