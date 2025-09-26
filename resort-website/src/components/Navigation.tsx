import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Phone, Mail, MapPin, ArrowLeft } from 'lucide-react';

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
                href={`tel:${import.meta.env.VITE_WHATSAPP_CONTACT_NUMBER || '+919876543210'}`}
                className="flex items-center gap-1 hover:text-primary-400 transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span>{import.meta.env.VITE_WHATSAPP_CONTACT_NUMBER || '+91 98765 43210'}</span>
              </a>
              <a
                href={`mailto:${import.meta.env.VITE_SITE_EMAIL_FROM || 'info@wayanadresorts.com'}`}
                className="flex items-center gap-1 hover:text-primary-400 transition-colors"
              >
                <Mail className="w-4 h-4" />
                <span>{import.meta.env.VITE_SITE_EMAIL_FROM || 'info@wayanadresorts.com'}</span>
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
                <button
                  onClick={() => navigate('/#featured')}
                  className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors mr-2"
                >
                  <ArrowLeft className="w-6 h-6 text-gray-900" />
                </button>
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
                  className={`relative font-medium transition-colors hover:text-primary-600 ${
                    isActive(link.href)
                      ? 'text-primary-600'
                      : 'text-gray-700'
                  }`}
                >
                  {link.name}
                  {isActive(link.href) && (
                    <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary-600 rounded-full" />
                  )}
                </Link>
              ))}
            </div>

            {/* CTA Button */}
            <div className="hidden lg:flex items-center gap-4">
              <Link
                to="/admin"
                className="text-gray-600 hover:text-gray-900 text-sm font-medium"
              >
                Admin
              </Link>
              <Link
                to="/#featured"
                className="btn-outline px-6 py-2.5"
              >
                Book Now
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6 text-gray-900" />
              ) : (
                <Menu className="w-6 h-6 text-gray-900" />
              )}
            </button>
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
                    className={`font-medium transition-colors hover:text-primary-600 py-2 ${
                      isActive(link.href)
                        ? 'text-primary-600'
                        : 'text-gray-700'
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
                <Link
                  to="/#featured"
                  className="btn-primary w-full mt-4"
                >
                  Book Now
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};