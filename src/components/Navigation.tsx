import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, MapPin, Building, Bed, Search, User } from 'lucide-react';

interface NavigationProps {
  resortGroup?: {
    name: string;
    logo?: string;
  };
}

export default function Navigation({ resortGroup }: NavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const navigationItems = [
    {
      label: 'Properties',
      href: '/properties',
      icon: Building,
      description: 'Browse all properties'
    },
    {
      label: 'Cities',
      href: '/cities',
      icon: MapPin,
      description: 'Explore destinations'
    },
    {
      label: 'Stay Types',
      href: '/stay-types',
      icon: Bed,
      description: 'Find your perfect stay'
    }
  ];

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            {resortGroup?.logo ? (
              <img 
                src={resortGroup.logo} 
                alt={resortGroup.name}
                className="h-8 w-auto"
              />
            ) : (
              <Building className="h-8 w-8 text-blue-600" />
            )}
            <span className="text-xl font-bold text-gray-900">
              {resortGroup?.name || 'Resort Group'}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                  title={item.description}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Search and User Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              to="/search"
              className="p-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors"
              title="Search properties"
            >
              <Search className="h-5 w-5" />
            </Link>
            
            <Link
              to="/account"
              className="p-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors"
              title="Account"
            >
              <User className="h-5 w-5" />
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                      isActive(item.href)
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <div>
                      <div>{item.label}</div>
                      <div className="text-xs text-gray-500">{item.description}</div>
                    </div>
                  </Link>
                );
              })}
              
              {/* Mobile Search and Account */}
              <div className="border-t border-gray-200 pt-2 mt-2">
                <Link
                  to="/search"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
                >
                  <Search className="h-5 w-5" />
                  <span>Search</span>
                </Link>
                
                <Link
                  to="/account"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
                >
                  <User className="h-5 w-5" />
                  <span>Account</span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

// Breadcrumb component for navigation context
export function Breadcrumb({ 
  items 
}: { 
  items: Array<{ label: string; href?: string }> 
}) {
  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <span className="mx-2 text-gray-400">/</span>
            )}
            {item.href ? (
              <Link
                to={item.href}
                className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-sm text-gray-500">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}