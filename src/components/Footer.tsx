import React from 'react';
import { Link } from 'react-router-dom';
import { Building, MapPin, Phone, Mail, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

interface FooterProps {
  resortGroup?: {
    name: string;
    logo?: string;
    description?: string;
    contact?: {
      phone?: string;
      email?: string;
      address?: string;
    };
    socialMedia?: {
      facebook?: string;
      twitter?: string;
      instagram?: string;
      linkedin?: string;
    };
  };
}

export default function Footer({ resortGroup }: FooterProps) {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { label: 'Properties', href: '/properties' },
    { label: 'Cities', href: '/cities' },
    { label: 'Stay Types', href: '/stay-types' },
    { label: 'Search', href: '/search' }
  ];

  const supportLinks = [
    { label: 'Help Center', href: '/help' },
    { label: 'Contact Us', href: '/contact' },
    { label: 'Booking Support', href: '/support' },
    { label: 'Cancellation Policy', href: '/cancellation' }
  ];

  const companyLinks = [
    { label: 'About Us', href: '/about' },
    { label: 'Careers', href: '/careers' },
    { label: 'Press', href: '/press' },
    { label: 'Partnerships', href: '/partnerships' }
  ];

  const legalLinks = [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Cookie Policy', href: '/cookies' },
    { label: 'Accessibility', href: '/accessibility' }
  ];

  const socialIcons = {
    facebook: Facebook,
    twitter: Twitter,
    instagram: Instagram,
    linkedin: Linkedin
  };

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              {resortGroup?.logo ? (
                <img 
                  src={resortGroup.logo} 
                  alt={resortGroup.name}
                  className="h-8 w-auto"
                />
              ) : (
                <Building className="h-8 w-8 text-blue-400" />
              )}
              <span className="text-xl font-bold">
                {resortGroup?.name || 'Resort Group'}
              </span>
            </Link>
            
            <p className="text-gray-300 mb-6 max-w-md">
              {resortGroup?.description || 
                'Discover exceptional accommodations and unforgettable experiences at our premium resort properties worldwide.'}
            </p>
            
            {/* Contact Info */}
            {resortGroup?.contact && (
              <div className="space-y-2">
                {resortGroup.contact.phone && (
                  <div className="flex items-center space-x-2 text-gray-300">
                    <Phone className="w-4 h-4" />
                    <a 
                      href={`tel:${resortGroup.contact.phone}`}
                      className="hover:text-blue-400 transition-colors"
                    >
                      {resortGroup.contact.phone}
                    </a>
                  </div>
                )}
                
                {resortGroup.contact.email && (
                  <div className="flex items-center space-x-2 text-gray-300">
                    <Mail className="w-4 h-4" />
                    <a 
                      href={`mailto:${resortGroup.contact.email}`}
                      className="hover:text-blue-400 transition-colors"
                    >
                      {resortGroup.contact.email}
                    </a>
                  </div>
                )}
                
                {resortGroup.contact.address && (
                  <div className="flex items-start space-x-2 text-gray-300">
                    <MapPin className="w-4 h-4 mt-0.5" />
                    <span>{resortGroup.contact.address}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-gray-300 hover:text-blue-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              {supportLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-gray-300 hover:text-blue-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-gray-300 hover:text-blue-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="max-w-md">
            <h3 className="text-lg font-semibold mb-2">Stay Updated</h3>
            <p className="text-gray-300 mb-4">
              Subscribe to our newsletter for exclusive offers and travel inspiration.
            </p>
            <form className="flex space-x-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Copyright */}
            <div className="text-gray-400 text-sm">
              © {currentYear} {resortGroup?.name || 'Resort Group'}. All rights reserved.
            </div>

            {/* Legal Links */}
            <div className="flex flex-wrap justify-center md:justify-end space-x-6">
              {legalLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="text-gray-400 hover:text-blue-400 transition-colors text-sm"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Social Media */}
            {resortGroup?.socialMedia && (
              <div className="flex space-x-4">
                {Object.entries(resortGroup.socialMedia).map(([platform, url]) => {
                  if (!url) return null;
                  const Icon = socialIcons[platform as keyof typeof socialIcons];
                  if (!Icon) return null;
                  
                  return (
                    <a
                      key={platform}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-blue-400 transition-colors"
                      aria-label={`Follow us on ${platform}`}
                    >
                      <Icon className="w-5 h-5" />
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}

// Simple footer variant for minimal pages
export function SimpleFooter() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-100 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
          <div className="text-gray-600 text-sm">
            © {currentYear} Resort Group. All rights reserved.
          </div>
          
          <div className="flex space-x-6">
            <Link to="/privacy" className="text-gray-600 hover:text-blue-600 text-sm transition-colors">
              Privacy
            </Link>
            <Link to="/terms" className="text-gray-600 hover:text-blue-600 text-sm transition-colors">
              Terms
            </Link>
            <Link to="/contact" className="text-gray-600 hover:text-blue-600 text-sm transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}