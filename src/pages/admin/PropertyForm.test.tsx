import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import AdminPropertyForm from './PropertyForm';
import { MockDataService } from '../../lib/mockData';
import type { Property } from '../../types';

// Mock the data service and other hooks/modules
vi.mock('../../lib/mockData');
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useLoaderData: vi.fn(),
    useNavigate: () => vi.fn(),
  };
});
vi.mock('../../hooks/useToast', () => ({
  toast: vi.fn(),
}));

const mockProperty: Property = {
  id: 'test-prop',
  slug: 'test-property',
  name: 'Test Property',
  price: 250,
  branding: { description: 'A beautiful test property.', primary_color: '#fff', secondary_color: '#000' },
  // Add other required fields
  city_slug: 'test-city',
  location: { address: '123 Test St', coordinates: { lat: 0, lng: 0 } },
  stay_types: ['villa'],
  managers: {},
  active: true,
  featured: false,
  created_at: new Date(),
  updated_at: new Date(),
};

const renderWithRouter = (ui: React.ReactElement, { route = '/', path = '/' } = {}) => {
  window.history.pushState({}, 'Test page', route);
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path={path} element={ui} />
      </Routes>
    </MemoryRouter>
  );
};

describe('AdminPropertyForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders in create mode with empty fields', async () => {
    const { useLoaderData } = vi.mocked(await import('react-router-dom'));
    useLoaderData.mockReturnValue(null);

    renderWithRouter(<AdminPropertyForm />, { path: '/admin/properties/new', route: '/admin/properties/new' });

    expect(screen.getByText('Create New Property')).toBeInTheDocument();
    expect((screen.getByLabelText('Name') as HTMLInputElement).value).toBe('');
    expect((screen.getByLabelText('Slug') as HTMLInputElement).value).toBe('');
  });

  it('renders in edit mode with populated fields', async () => {
    const { useLoaderData } = vi.mocked(await import('react-router-dom'));
    useLoaderData.mockReturnValue(mockProperty);

    renderWithRouter(<AdminPropertyForm />, { path: '/admin/properties/:propertyId/edit', route: '/admin/properties/test-prop/edit' });

    expect(screen.getByText('Edit Property')).toBeInTheDocument();
    await waitFor(() => {
      expect((screen.getByLabelText('Name') as HTMLInputElement).value).toBe(mockProperty.name);
      expect((screen.getByLabelText('Slug') as HTMLInputElement).value).toBe(mockProperty.slug);
      expect((screen.getByLabelText(/price/i) as HTMLInputElement).value).toBe(mockProperty.price.toString());
    });
  });

  it('calls createProperty on submit in create mode', async () => {
    const { useLoaderData } = vi.mocked(await import('react-router-dom'));
    useLoaderData.mockReturnValue(null);
    (MockDataService.createProperty as vi.Mock).mockResolvedValue('new-id');

    renderWithRouter(<AdminPropertyForm />, { path: '/admin/properties/new', route: '/admin/properties/new' });

    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'New Hotel' } });
    fireEvent.change(screen.getByLabelText('Slug'), { target: { value: 'new-hotel' } });
    fireEvent.change(screen.getByLabelText(/price/i), { target: { value: '300' } });
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'A brand new hotel.' } });

    fireEvent.submit(screen.getByRole('button', { name: /create property/i }));

    await waitFor(() => {
      expect(MockDataService.createProperty).toHaveBeenCalled();
    });
  });

  it('calls updateProperty on submit in edit mode', async () => {
    const { useLoaderData } = vi.mocked(await import('react-router-dom'));
    useLoaderData.mockReturnValue(mockProperty);
    (MockDataService.updateProperty as vi.Mock).mockResolvedValue(true);

    renderWithRouter(<AdminPropertyForm />, { path: '/admin/properties/:propertyId/edit', route: '/admin/properties/test-prop/edit' });

    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Updated Hotel' } });
    fireEvent.submit(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => {
      expect(MockDataService.updateProperty).toHaveBeenCalledWith('test-prop', expect.objectContaining({ name: 'Updated Hotel' }));
    });
  });
});
