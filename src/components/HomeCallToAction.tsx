import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import { Section } from './Layout';

export function HomeCallToAction() {
  return (
    <Section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
      <div className="text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Ready to Book Your Dream Getaway?
        </h2>
        <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
          Join thousands of satisfied guests who have experienced luxury redefined
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/properties"
            className="inline-flex items-center px-8 py-3 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-colors font-medium"
          >
            <Calendar className="mr-2 w-4 h-4" />
            Book Now
          </Link>
          <Link
            to="/contact"
            className="inline-flex items-center px-8 py-3 border-2 border-white text-white rounded-lg hover:bg-white hover:text-blue-600 transition-colors font-medium"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </Section>
  );
}
