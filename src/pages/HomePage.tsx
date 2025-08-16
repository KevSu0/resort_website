import React, { useEffect, useState } from 'react';
import { HomeHero } from '../components/HomeHero';
import { FeaturedProperties } from '../components/FeaturedProperties';
import { FeaturedCities } from '../components/FeaturedCities';
import { WhyChooseUs } from '../components/WhyChooseUs';
import { HomeCallToAction } from '../components/HomeCallToAction';
import { PromotionalOffers } from '../components/PromotionalOffers';
import { ReferralBanner } from '../components/ReferralBanner';
import { MultiPropertySelector } from '../components/MultiPropertySelector';
import { resortGroupService, propertyService, offerService, cityService } from '../lib/firestore';
import { Property, ResortGroup, Offer, City } from '../types';
import { Helmet } from 'react-helmet-async';

export default function HomePage() {
  const [resortGroup, setResortGroup] = useState<ResortGroup | null>(null);
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  const [featuredCities, setFeaturedCities] = useState<City[]>([]);
  const [activeOffers, setActiveOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHomePageData = async () => {
      try {
        const [groupData, properties, cities, offers] = await Promise.all([
          resortGroupService.get(),
          propertyService.getFeatured(3),
          cityService.getAll(),
          offerService.getActive()
        ]);

        setResortGroup(groupData);
        setFeaturedProperties(properties);
        setFeaturedCities(cities);
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