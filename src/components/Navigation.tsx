import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Phone, Mail, MapPin, ArrowLeft } from 'lucide-react';
import { config } from '../config';
import { Button } from '@/components/ui/button';

export const Navigation: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Check if we're on a property detail page
  const isPropertyPage = location.pathname.startsWith('/properties/') && location.pathname.length > '/properties/'.length;

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  const navigationLinks = [
    { name: 'Home', href: '/' },
    { name: 'Properties', href: '/#featured' },
    { name: 'About', href: '/#about' },
    { name: 'Contact', href: '/#contact' },
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href.split('#')[0]);
  };

  return (
    <>
      {/* Top Bar */}
      <div className="bg-gray-900 text-white py-2">
        <div className="container">
          <div className="flex items-center justify-between text-sm">
            <div className="hidden md:flex items-center gap-4">
              <a
                href={`tel:${config.VITE_WHATSAPP_CONTACT_NUMBER}`}
                className="flex items-center gap-1 hover:text-primary-400 transition-all duration-fast ease-out hover:scale-105"
              >
                <Phone className="w-4 h-4" />
                <span>{config.VITE_WHATSAPP_CONTACT_NUMBER}</span>
              </a>
              <a
                href={`mailto:${config.VITE_SITE_EMAIL_FROM}`}
                className="flex items-center gap-1 hover:text-primary-400 transition-all duration-fast ease-out hover:scale-105"
              >
                <Mail className="w-4 h-4" />
                <span>{config.VITE_SITE_EMAIL_FROM}</span>
              </a>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>Wayanad, Kerala</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav
        className={`sticky top-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-white shadow-lg py-2'
            : 'bg-white/95 backdrop-blur-sm py-4'
        }`}
      >
        <div className="container">
          <div className="flex items-center justify-between">
            {/* Logo or Back Button */}
            <div className="flex items-center gap-2">
              {/* Mobile Back Button */}
              {isPropertyPage && (
                <Button
                  onClick={() => navigate('/#featured')}
                  variant="ghost"
                  size="icon"
                  className="lg:hidden mr-2"
                >
                  <ArrowLeft className="w-6 h-6 text-gray-900" />
                </Button>
              )}

              {/* Logo */}
              <Link
                to="/"
                className="flex items-center gap-2"
              >
                <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">W</span>
                </div>
                <span className="text-xl font-bold text-gray-900 hidden sm:block">
                  Wayanad Nature Resorts
                </span>
                <span className="text-xl font-bold text-gray-900 sm:hidden">
                  WNR
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              {navigationLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className={`relative font-medium transition-all duration-fast ease-out hover:text-primary-600 hover:-translate-y-0.5 ${
                    isActive(link.href)
                      ? 'text-primary-600'
                      : 'text-gray-700'
                  }`}
                >
                  {link.name}
                  <span className={`absolute -bottom-1 left-0 right-0 h-0.5 bg-primary-600 rounded-full transition-all duration-normal ease-out ${
                    isActive(link.href) ? 'w-full' : 'w-0 hover:w-full'
                  }`} />
                </Link>
              ))}
            </div>

            {/* CTA Button */}
            <div className="hidden lg:flex items-center gap-4">
              <Button
                asChild
                variant="gradient"
                size="default"
                className="animate-button-pulse"
              >
                <Link to="/#featured">
                  Book Now
                </Link>
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <Button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              variant="ghost"
              size="icon"
              className="lg:hidden"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6 text-gray-900" />
              ) : (
                <Menu className="w-6 h-6 text-gray-900" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 bg-white">
            <div className="container py-4">
              <div className="flex flex-col gap-4">
                {navigationLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.href}
                    className={`font-medium transition-all duration-fast ease-out hover:text-primary-600 hover:translate-x-1 py-2 ${
                      isActive(link.href)
                        ? 'text-primary-600'
                        : 'text-gray-700'
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
                <Button
                  asChild
                  variant="gradient"
                  fullWidth
                  className="mt-4"
                >
                  <Link to="/#featured">
                    Book Now
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};