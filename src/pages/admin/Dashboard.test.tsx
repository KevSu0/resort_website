import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Dashboard from './Dashboard';
import { MockDataService } from '../../lib/mockData';

// Mock the data service
vi.mock('../../lib/mockData');

describe('Admin Dashboard Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', async () => {
    (MockDataService.getProperties as vi.Mock).mockReturnValue(new Promise(() => {})); // Never resolves
    (MockDataService.getEnquiries as vi.Mock).mockReturnValue(new Promise(() => {})); // Never resolves

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    const skeleton = await screen.findByTestId('loading-skeleton');
    expect(skeleton.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('renders stats and data after fetching', async () => {
    const mockProperties = [
      { id: 'p1', name: 'Property 1', rating: 4.5, price: 100 },
      { id: 'p2', name: 'Property 2', rating: 4.0, price: 200 },
    ];
    const mockEnquiries = [
      { id: 'e1', customer: { name: 'Customer A' }, property_name: 'Property 1', status: 'new' },
      { id: 'e2', customer: { name: 'Customer B' }, property_name: 'Property 2', status: 'booked', property_id: 'p2' },
    ];

    (MockDataService.getProperties as vi.Mock).mockResolvedValue(mockProperties);
    (MockDataService.getEnquiries as vi.Mock).mockResolvedValue(mockEnquiries);

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    // Wait for the loading to be false and data to be rendered
    await waitFor(async () => {
      // Check stats
      const enquiriesCard = await screen.findByTestId('stat-card-Total Enquiries');
      expect(within(enquiriesCard).getByText('2')).toBeInTheDocument();

      const propertiesCard = await screen.findByTestId('stat-card-Active Properties');
      expect(within(propertiesCard).getByText('2')).toBeInTheDocument();

      const satisfactionCard = await screen.findByTestId('stat-card-Avg. Satisfaction');
      expect(within(satisfactionCard).getByText('4.3')).toBeInTheDocument();

      const revenueCard = await screen.findByTestId('stat-card-Estimated Revenue');
      expect(within(revenueCard).getByText('$0.2k')).toBeInTheDocument();

      // Check recent enquiries
      const recentEnquiriesCard = screen.getByText('Recent Enquiries').closest('div.p-6');
      expect(within(recentEnquiriesCard!).getByText('Customer A')).toBeInTheDocument();

      // Check top properties
      const topPropertiesCard = screen.getByText('Top Performing Properties').closest('div.p-6');
      expect(within(topPropertiesCard!).getByText('Property 1')).toBeInTheDocument();
    });
  });
});
