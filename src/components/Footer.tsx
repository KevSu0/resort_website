import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Facebook, Instagram, Twitter } from 'lucide-react';
import { config } from '../config';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer Content */}
      <div className="py-16">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-2xl">W</span>
                </div>
                <span className="text-2xl font-bold">Wayanad Nature Resorts</span>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                Experience luxury in the lap of nature. Our three unique resorts offer
                unforgettable experiences amidst the pristine beauty of Wayanad.
              </p>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary-600 hover:scale-110 transition-all duration-fast ease-out">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary-600 hover:scale-110 transition-all duration-fast ease-out">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary-600 hover:scale-110 transition-all duration-fast ease-out">
                  <Twitter className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
              <ul className="space-y-3">
                <li>
                  <Link to="/" className="text-gray-400 hover:text-white hover:translate-x-1 transition-all duration-fast ease-out">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/#featured" className="text-gray-400 hover:text-white hover:translate-x-1 transition-all duration-fast ease-out">
                    Our Properties
                  </Link>
                </li>
                <li>
                  <Link to="/#about" className="text-gray-400 hover:text-white hover:translate-x-1 transition-all duration-fast ease-out">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link to="/#contact" className="text-gray-400 hover:text-white hover:translate-x-1 transition-all duration-fast ease-out">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="font-semibold text-lg mb-4">Get in Touch</h3>
              <div className="space-y-3">
                <a
                  href={`tel:${config.VITE_WHATSAPP_CONTACT_NUMBER}`}
                  className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors"
                >
                  <Phone className="w-5 h-5" />
                  <span>{config.VITE_WHATSAPP_CONTACT_NUMBER}</span>
                </a>
                <a
                  href={`mailto:${config.VITE_SITE_EMAIL_FROM}`}
                  className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors"
                >
                  <Mail className="w-5 h-5" />
                  <span>{config.VITE_SITE_EMAIL_FROM}</span>
                </a>
                <div className="flex items-start gap-3 text-gray-400">
                  <MapPin className="w-5 h-5 mt-0.5" />
                  <span>
                    Wayanad, Kerala<br />
                    India
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800 py-6">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-400 text-sm">
              © 2024 Wayanad Nature Resorts. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm">
              <Link to="#" className="text-gray-400 hover:text-white hover:translate-x-1 transition-all duration-fast ease-out">
                Privacy Policy
              </Link>
              <Link to="#" className="text-gray-400 hover:text-white hover:translate-x-1 transition-all duration-fast ease-out">
                Terms of Service
              </Link>
              <Link to="#" className="text-gray-400 hover:text-white hover:translate-x-1 transition-all duration-fast ease-out">
                Cancellation Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};