import { useRef } from 'react';
import { useInView } from 'framer-motion';
import {
  TreePine,
  Waves,
  Mountain,
  Home,
  Shield,
  MapPin,
} from 'lucide-react';

interface HighlightItem {
  icon: React.ReactNode;
  title: string;
  description: string;
  stat?: string;
  statLabel?: string;
}

export const Highlights: React.FC = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const highlights: HighlightItem[] = [
    {
      icon: <TreePine className="w-8 h-8" />,
      title: 'Eco-Friendly Stays',
      description: 'Sustainable luxury accommodations harmoniously integrated with nature',
    },
    {
      icon: <Waves className="w-8 h-8" />,
      title: 'Unique Experiences',
      description: 'Treehouses, lakefront views, and mountain retreats like nowhere else',
    },
    {
      icon: <Mountain className="w-8 h-8" />,
      title: 'Adventure Activities',
      description: 'Trekking, water sports, and nature trails for the adventurous soul',
      stat: '15+',
      statLabel: 'Activities',
    },
    {
      icon: <Home className="w-8 h-8" />,
      title: 'Luxury Amenities',
      description: 'Modern comforts and premium services in serene natural settings',
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Safe & Secure',
      description: '24/7 security and professional staff ensuring your peace of mind',
      stat: '100%',
      statLabel: 'Guest Satisfaction',
    },
    {
      icon: <MapPin className="w-8 h-8" />,
      title: 'Prime Locations',
      description: 'Strategically located near major attractions in Wayanad',
      stat: '3',
      statLabel: 'Unique Properties',
    },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Why Choose Our Resorts
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience the perfect blend of luxury, nature, and authentic Kerala hospitality
          </p>
          <div className="w-20 h-1 bg-primary-600 mx-auto mt-4"></div>
        </div>

        <div
          ref={ref}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {highlights.map((highlight, index) => (
            <div
              key={index}
              className={`group bg-gradient-to-br from-white to-gray-50 rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-500 border border-gray-100 hover:border-primary-200 transform hover:-translate-y-1 ${
                isInView ? 'animate-slide-up' : 'opacity-0'
              }`}
              style={{
                transitionDelay: `${index * 100}ms`,
              }}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="flex-shrink-0 w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-all duration-300">
                  {highlight.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                    {highlight.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {highlight.description}
                  </p>
                </div>
              </div>

              {highlight.stat && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-primary-600">
                      {highlight.stat}
                    </span>
                    <span className="text-sm text-gray-500">
                      {highlight.statLabel}
                    </span>
                  </div>
                </div>
              )}

              {/* Decorative element */}
              <div className="absolute bottom-4 right-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <div className="w-24 h-24 bg-primary-600 rounded-full -mr-12 -mb-12"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Stats */}
        <div className="mt-16 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-2xl p-8 md:p-12 text-white">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">5000+</div>
              <div className="text-primary-100">Happy Guests</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">4.9</div>
              <div className="text-primary-100">Average Rating</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">10+</div>
              <div className="text-primary-100">Years Experience</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">24/7</div>
              <div className="text-primary-100">Support</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};