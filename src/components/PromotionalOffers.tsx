import React from 'react';
import { PromotionalOffer } from '../types';
import { Calendar, Clock, Tag, ArrowRight } from 'lucide-react';

interface PromotionalOffersProps {
  offers: PromotionalOffer[];
}

export function PromotionalOffers({ offers }: PromotionalOffersProps) {
  if (!offers.length) return null;

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(dateObj);
  };

  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Exclusive Offers
          </h2>
          <p className="text-gray-600">
            Limited-time deals on luxury accommodations
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {offers.slice(0, 3).map((offer) => (
            <div
              key={offer.id}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                    <Tag className="w-4 h-4 mr-1" />
                    {offer.discount_percentage}% OFF
                  </span>
                  {offer.is_featured && (
                    <span className="text-xs font-semibold text-amber-600 bg-amber-100 px-2 py-1 rounded">
                      FEATURED
                    </span>
                  )}
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {offer.title}
                </h3>
                <p className="text-gray-600 mb-4 line-clamp-2">
                  {offer.description}
                </p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="w-4 h-4 mr-2" />
                    Valid until {formatDate(offer.valid_until)}
                  </div>
                  {offer.minimum_nights && (
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="w-4 h-4 mr-2" />
                      Minimum {offer.minimum_nights} nights
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Code: <span className="font-mono font-semibold text-gray-900">{offer.promo_code}</span>
                  </div>
                  <button className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium">
                    Book Now
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {offers.length > 3 && (
          <div className="text-center mt-8">
            <button className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200">
              View All Offers
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}