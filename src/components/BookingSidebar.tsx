import React, { useState } from 'react';
import { Calendar, Users } from 'lucide-react';
import { Card } from './Layout';

interface BookingSidebarProps {
  className?: string;
  onBookingSubmit?: (bookingData: BookingFormData) => void;
  pricePerNight?: number;
  currency?: string;
  minGuests?: number;
  maxGuests?: number;
  unavailableDates?: string[];
}

interface BookingFormData {
  checkIn: string;
  checkOut: string;
  guests: number;
}

export function BookingSidebar({
  className = "",
  onBookingSubmit,
  pricePerNight,
  minGuests = 1,
  maxGuests = 8
}: BookingSidebarProps) {
  const [formData, setFormData] = useState<BookingFormData>({
    checkIn: '',
    checkOut: '',
    guests: 2
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: keyof BookingFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.checkIn || !formData.checkOut) {
      alert('Please select check-in and check-out dates');
      return;
    }

    setIsSubmitting(true);
    try {
      if (onBookingSubmit) {
        await onBookingSubmit(formData);
      } else {
        // Default behavior - could redirect to booking page
        console.log('Booking submitted:', formData);
        alert('Booking request submitted successfully!');
      }
    } catch (error) {
      console.error('Booking submission error:', error);
      alert('There was an error submitting your booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateNights = () => {
    if (!formData.checkIn || !formData.checkOut) return 0;
    const checkIn = new Date(formData.checkIn);
    const checkOut = new Date(formData.checkOut);
    const diffTime = checkOut.getTime() - checkIn.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const totalPrice = pricePerNight ? pricePerNight * calculateNights() : null;
  const nights = calculateNights();

  // Get today's date in YYYY-MM-DD format for min date
  const today = new Date().toISOString().split('T')[0];

  return (
    <Card className={`p-6 sticky top-6 ${className}`}>
      {pricePerNight && (
        <div className="mb-6">
          <div className="text-2xl font-bold text-gray-900">
            ${pricePerNight}
            <span className="text-base font-normal text-gray-600"> / night</span>
          </div>
          {totalPrice && nights > 0 && (
            <div className="text-sm text-gray-600 mt-1">
              ${totalPrice} total for {nights} night{nights !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      )}

      <form data-testid="booking-form" onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="check-in" className="block text-sm font-medium text-gray-700 mb-1">
              Check-in
            </label>
            <input 
              id="check-in"
              type="date" 
              value={formData.checkIn}
              onChange={(e) => handleInputChange('checkIn', e.target.value)}
              min={today}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label htmlFor="check-out" className="block text-sm font-medium text-gray-700 mb-1">
              Check-out
            </label>
            <input 
              id="check-out"
              type="date" 
              value={formData.checkOut}
              onChange={(e) => handleInputChange('checkOut', e.target.value)}
              min={formData.checkIn || today}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="guests" className="block text-sm font-medium text-gray-700 mb-1">
            Guests
          </label>
          <div className="relative">
            <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select 
              id="guests"
              value={formData.guests}
              onChange={(e) => handleInputChange('guests', parseInt(e.target.value))}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
            >
              {Array.from({ length: maxGuests - minGuests + 1 }, (_, i) => {
                const guestCount = minGuests + i;
                return (
                  <option key={guestCount} value={guestCount}>
                    {guestCount} Guest{guestCount !== 1 ? 's' : ''}
                  </option>
                );
              })}
            </select>
          </div>
        </div>
        
        <button 
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center"
        >
          <Calendar className="w-4 h-4 mr-2" />
          {isSubmitting ? 'Processing...' : 'Book Now'}
        </button>
      </form>
      
      <div className="mt-4 text-center text-sm text-gray-500">
        Free cancellation up to 24 hours before check-in
      </div>
    </Card>
  );
}

// Simplified version for quick booking widgets
export function QuickBookingWidget({
  onBookingClick,
  className = ""
}: {
  onBookingClick?: () => void;
  className?: string;
}) {
  return (
    <Card className={`p-4 ${className}`}>
      <button 
        onClick={onBookingClick}
        className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors font-medium flex items-center justify-center"
      >
        <Calendar className="w-4 h-4 mr-2" />
        Check Availability
      </button>
    </Card>
  );
}