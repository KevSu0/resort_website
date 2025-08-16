import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface AuthLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  showBackButton?: boolean;
  backTo?: string;
  backgroundImage?: string;
}

export default function AuthLayout({ 
  children, 
  title, 
  subtitle, 
  showBackButton = true, 
  backTo = '/',
  backgroundImage
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          {/* Back Button */}
          {showBackButton && (
            <div className="mb-8">
              <Link
                to={backTo}
                className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to home
              </Link>
            </div>
          )}

          {/* Logo */}
          <div className="mb-8">
            <Link to="/" className="flex items-center">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">RG</span>
              </div>
              <span className="ml-3 text-2xl font-bold text-gray-900">Resort Group</span>
            </Link>
          </div>

          {/* Header */}
          {(title || subtitle) && (
            <div className="mb-8">
              {title && (
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="text-gray-600">
                  {subtitle}
                </p>
              )}
            </div>
          )}

          {/* Form Content */}
          <div>
            {children}
          </div>

          {/* Footer Links */}
          <div className="mt-8 text-center">
            <div className="text-sm text-gray-500 space-x-4">
              <Link to="/privacy" className="hover:text-gray-700 transition-colors">
                Privacy Policy
              </Link>
              <span>&middot;</span>
              <Link to="/terms" className="hover:text-gray-700 transition-colors">
                Terms of Service
              </Link>
              <span>&middot;</span>
              <Link to="/contact" className="hover:text-gray-700 transition-colors">
                Support
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Image/Background */}
      <div className="hidden lg:block relative w-0 flex-1">
        <div 
          className="absolute inset-0 h-full w-full object-cover bg-gradient-to-br from-blue-600 to-purple-700"
          style={{
            backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          {/* Overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-20" />
          
          {/* Content Overlay */}
          <div className="relative h-full flex items-center justify-center p-12">
            <div className="text-center text-white max-w-md">
              <h3 className="text-3xl font-bold mb-4">
                Discover Your Perfect Resort Experience
              </h3>
              <p className="text-lg opacity-90">
                Explore our collection of luxury resorts, from mountain retreats to beachfront paradises
              </p>
              
              {/* Decorative Elements */}
              <div className="mt-8 flex justify-center space-x-2">
                <div className="w-2 h-2 bg-white rounded-full opacity-60" />
                <div className="w-2 h-2 bg-white rounded-full" />
                <div className="w-2 h-2 bg-white rounded-full opacity-60" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}