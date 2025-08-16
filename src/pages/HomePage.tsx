import React, { useEffect, useState } from 'react';
import { HomeHero } from '../components/HomeHero';
import { FeaturedProperties } from '../components/FeaturedProperties';
import { FeaturedCities } from '../components/FeaturedCities';
import { WhyChooseUs } from '../components/WhyChooseUs';
import { HomeCallToAction } from '../components/HomeCallToAction';
import { PromotionalOffers } from '../components/PromotionalOffers';
import { ReferralBanner } from '../components/ReferralBanner';
import { MultiPropertySelector } from '../components/MultiPropertySelector';
import { DataService, Property, ResortGroup, PromotionalOffer } from '../services/dataService';
import { City, Offer } from '../types';
import { Helmet } from 'react-helmet-async';

export default function HomePage() {
  const [resortGroup, setResortGroup] = useState<ResortGroup | null>(null);
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  const [featuredCities, setFeaturedCities] = useState<City[]>([]);
  const [activeOffers, setActiveOffers] = useState<PromotionalOffer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHomePageData = async () => {
      try {
        // Load resort group data
        const groupData = await DataService.getResortGroup();
        setResortGroup(groupData);

        // Load featured properties (first 3)
        const properties = await DataService.getFeaturedProperties(3);
        setFeaturedProperties(properties);

        // Load featured cities (mock data for now)
        const mockCities: City[] = [
          { id: '1', name: 'Bali', slug: 'bali', country: 'Indonesia', image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=beautiful%20bali%20tropical%20paradise%20beach%20resort%20destination&image_size=landscape_4_3' },
          { id: '2', name: 'Maldives', slug: 'maldives', country: 'Maldives', image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=maldives%20overwater%20bungalows%20crystal%20clear%20water&image_size=landscape_4_3' },
          { id: '3', name: 'Santorini', slug: 'santorini', country: 'Greece', image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=santorini%20white%20buildings%20blue%20domes%20sunset&image_size=landscape_4_3' },
          { id: '4', name: 'Dubai', slug: 'dubai', country: 'UAE', image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=dubai%20luxury%20skyline%20burj%20khalifa%20modern%20city&image_size=landscape_4_3' }
        ];
        setFeaturedCities(mockCities);

        // Load active promotional offers
        const offers = await DataService.getPromotionalOffers();
        setActiveOffers(offers);
      } catch (error) {
        console.error('Error loading homepage data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadHomePageData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const seoTitle = resortGroup ? 
    `${resortGroup.name} - Premium Resort Destinations Worldwide` : 
    'Luxury Resorts - Premium Destinations Worldwide';
  
  const seoDescription = resortGroup ? 
    `Discover ${resortGroup.name}'s collection of luxury resorts across ${featuredCities.length} destinations. Book your perfect getaway with exclusive offers and personalized service.` : 
    'Discover luxury resorts across premium destinations worldwide. Book your perfect getaway with exclusive offers and personalized service.';

  return (
    <>
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={window.location.href} />
        {resortGroup?.branding?.logo && (
          <meta property="og:image" content={resortGroup.branding.logo} />
        )}
        <link rel="canonical" href={window.location.href} />
        
        {/* Schema.org structured data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "TravelAgency",
            "name": resortGroup?.name || "Luxury Resorts Group",
            "description": resortGroup?.description || "Premium resort destinations worldwide",
            "url": resortGroup?.website || window.location.origin,
            "logo": resortGroup?.branding?.logo,
            "contactPoint": {
              "@type": "ContactPoint",
              "email": resortGroup?.contact_email,
              "contactType": "customer service"
            },
            "hasOfferCatalog": {
              "@type": "OfferCatalog",
              "name": "Resort Accommodations",
              "itemListElement": featuredProperties.map(property => ({
                "@type": "Offer",
                "itemOffered": {
                  "@type": "LodgingBusiness",
                  "name": property.name,
                  "description": property.branding.description,
                  "address": {
                    "@type": "PostalAddress",
                    "addressLocality": property.city_slug
                  }
                }
              }))
            }
          })}
        </script>
      </Helmet>

      {/* Multi-Property Selector */}
      {resortGroup?.settings?.multi_property_enabled && (
        <MultiPropertySelector 
          resortGroup={resortGroup}
          currentProperty={null}
        />
      )}

      {/* Promotional Offers Banner */}
      {activeOffers.length > 0 && (
        <PromotionalOffers offers={activeOffers} />
      )}

      {/* Main Homepage Content */}
      <HomeHero resortGroup={resortGroup} />
      
      <FeaturedProperties 
        properties={featuredProperties}
        title={`Discover Our ${resortGroup?.name || 'Luxury'} Properties`}
      />
      
      <FeaturedCities 
        cities={featuredCities}
        title="Explore Premium Destinations"
      />
      
      <WhyChooseUs resortGroup={resortGroup} />
      
      {/* Referral System Banner */}
      {resortGroup?.settings?.referral_system_enabled && (
        <ReferralBanner />
      )}
      
      <HomeCallToAction resortGroup={resortGroup} />
    </>
  );
}