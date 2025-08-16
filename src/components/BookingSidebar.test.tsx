import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BookingSidebar } from './BookingSidebar';

describe('BookingSidebar', () => {
  const defaultProps = {
    pricePerNight: 200,
    maxGuests: 4,
    onBookingSubmit: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly with given props', () => {
    render(<BookingSidebar {...defaultProps} />);
    expect(screen.getByText('$200')).toBeInTheDocument();
    expect(screen.getByText('/ night')).toBeInTheDocument();
    expect(screen.getByLabelText('Check-in')).toBeInTheDocument();
    expect(screen.getByLabelText('Check-out')).toBeInTheDocument();
    expect(screen.getByLabelText('Guests')).toBeInTheDocument();
  });

  it('calculates and displays total price based on selected dates', async () => {
    render(<BookingSidebar {...defaultProps} />);

    const checkInInput = screen.getByLabelText('Check-in');
    const checkOutInput = screen.getByLabelText('Check-out');

    // Simulate selecting dates
    await fireEvent.change(checkInInput, { target: { value: '2024-10-10' } });
    await fireEvent.change(checkOutInput, { target: { value: '2024-10-12' } });

    // 2 nights * $200/night = $400
    const totalPrice = await screen.findByText('$400 total for 2 nights');
    expect(totalPrice).toBeInTheDocument();
  });

  it('calls onBookingSubmit with form data on submission', async () => {
    render(<BookingSidebar {...defaultProps} />);

    const checkInInput = screen.getByLabelText('Check-in');
    const checkOutInput = screen.getByLabelText('Check-out');
    const guestsInput = screen.getByLabelText('Guests');
    const form = screen.getByTestId('booking-form');

    // Fill out the form
    await fireEvent.change(checkInInput, { target: { value: '2024-10-10' } });
    await fireEvent.change(checkOutInput, { target: { value: '2024-10-12' } });
    await fireEvent.change(guestsInput, { target: { value: '3' } });

    // Submit the form
    await fireEvent.submit(form);

    expect(defaultProps.onBookingSubmit).toHaveBeenCalledWith({
      checkIn: '2024-10-10',
      checkOut: '2024-10-12',
      guests: 3,
    });
  });

  it('shows an alert if dates are not selected on submission', async () => {
    // Mock window.alert
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});

    render(<BookingSidebar {...defaultProps} />);
    const form = screen.getByTestId('booking-form');

    await fireEvent.submit(form);

    expect(alertMock).toHaveBeenCalledWith('Please select check-in and check-out dates');
    expect(defaultProps.onBookingSubmit).not.toHaveBeenCalled();

    alertMock.mockRestore();
  });
});
