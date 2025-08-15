import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Search, ArrowLeft } from 'lucide-react';
import Layout from '../components/Layout';
import { Section } from '../components/Layout';

export default function NotFoundPage() {
  return (
    <Layout>
      <Section className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="mb-8">
            <div className="text-6xl font-bold text-gray-300 mb-4">404</div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Page Not Found
            </h1>
            <p className="text-gray-600 mb-8">
              Sorry, we couldn't find the page you're looking for. It might have been moved, deleted, or you entered the wrong URL.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Link>
            
            <Link
              to="/properties"
              className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              <Search className="w-4 h-4 mr-2" />
              Browse Properties
            </Link>
          </div>
          
          <div className="mt-8">
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Go Back
            </button>
          </div>
        </div>
      </Section>
    </Layout>
  );
}