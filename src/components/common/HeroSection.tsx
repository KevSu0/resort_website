import { useState, useEffect } from 'react';
import { ChevronDown, MapPin } from 'lucide-react';
import { fallbackImageHandler } from '@/utils';
import { IMAGE_PLACEHOLDER } from '@/constants/images';

interface HeroSectionProps {
  onBrowseProperties?: () => void;
}

export function HeroSection({ onBrowseProperties }: HeroSectionProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Hero background images - using landscape URLs from mock data
  const heroImages = [
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1920&h=1080&fit=crop',
    'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1920&h=1080&fit=crop',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop',
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [heroImages.length]);

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background slideshow */}
      <div className="absolute inset-0 z-0">
        {heroImages.map((image, index) => (
          <div
            key={image}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={image}
              alt={`Wayanad nature resort ${index + 1}`}
              className="w-full h-full object-cover"
              onError={(event) => fallbackImageHandler(event, IMAGE_PLACEHOLDER)}
            />
            <div className="absolute inset-0 bg-black bg-opacity-40" />
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 text-center text-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto animate-fade-in">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            Discover
            <br />
            <span className="text-primary-400">Wayanad's</span>
            <br />
            Natural Paradise
          </h1>

          <p className="text-xl md:text-2xl mb-4 text-gray-200 max-w-2xl mx-auto">
            Experience luxury treehouses, serene lakefront views, and misty mountain retreats
          </p>

          <div className="flex items-center justify-center gap-2 mb-8 text-lg">
            <MapPin className="w-5 h-5 text-primary-400" />
            <span>Pozhuthana, Wayanad, Kerala</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={onBrowseProperties}
              className="btn-primary text-lg px-8 py-4 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              Explore Properties
            </button>
            <button
              onClick={() => scrollToSection('contact')}
              className="btn-outline text-lg px-8 py-4 bg-white bg-opacity-10 backdrop-blur-sm hover:bg-opacity-20"
            >
              Contact Us
            </button>
          </div>

          <div className="mt-12 flex justify-center animate-bounce-gentle">
            <button
              onClick={() => scrollToSection('featured')}
              className="text-white hover:text-primary-400 transition-colors"
              aria-label="Scroll down"
            >
              <ChevronDown className="w-8 h-8" />
            </button>
          </div>
        </div>
      </div>

      {/* Slide indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 flex gap-2">
        {heroImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide ? 'bg-white w-8' : 'bg-white bg-opacity-50'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}

// Helper function for scrolling
const scrollToSection = (sectionId: string) => {
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
  }
};