import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { HeroSection } from '../components/common/HeroSection';
import { FeaturedProperties } from '../components/property/FeaturedProperties';
import { Highlights } from '../components/common/Highlights';
import { Layout } from '../components/Layout';
import { PageTransition } from '../components/PageTransition';
import { useSmoothScroll } from '../hooks/useSmoothScroll';
import { type Property } from '../types';
import { initializeMockData } from '../data/mockData';
import { config } from '../config';

export function HomePage() {
  const navigate = useNavigate();

  useEffect(() => {
    initializeMockData();
  }, []);

  useSmoothScroll();

  const handleBrowseProperties = () => {
    const element = document.getElementById('featured');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handlePropertyClick = (property: Property) => {
    navigate(`/properties/${property.slug}`);
  };

  return (
    <Layout>
      <PageTransition>
        {/* Hero Section */}
        <section id="hero">
          <HeroSection onBrowseProperties={handleBrowseProperties} />
        </section>

        {/* Featured Properties */}
        <section id="featured">
          <FeaturedProperties onPropertyClick={handlePropertyClick} />
        </section>

        {/* Highlights/USPs */}
        <section id="about">
          <Highlights />
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-20 bg-gray-50">
          <div className="container">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Ready to Experience Wayanad?
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Get in touch with us to plan your perfect getaway
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href={`tel:${config.VITE_WHATSAPP_CONTACT_NUMBER}`}
                  className="btn-primary"
                >
                  Call Us Now
                </a>
                <Link
                  to="/#featured"
                  className="btn-outline"
                >
                  View Properties
                </Link>
              </div>
            </div>
          </div>
        </section>
      </PageTransition>
    </Layout>
  );
};