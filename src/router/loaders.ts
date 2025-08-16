import { LoaderFunctionArgs, redirect } from 'react-router-dom';
import { MockDataService } from '../lib/mockData';

// Property loader - loads property data by slug
export async function propertyLoader({ params }: LoaderFunctionArgs) {
  const { propertySlug } = params;
  
  if (!propertySlug) {
    throw new Response('Property slug is required', { status: 400 });
  }
  
  try {
    const property = await MockDataService.getProperty(propertySlug);
    
    if (!property) {
      throw new Response('Property not found', { status: 404 });
    }
    
    // Load related data
    const [city, stayTypes] = await Promise.all([
      MockDataService.getCityBySlug(property.city_slug),
      MockDataService.getStayTypesByProperty(property.id)
    ]);
    
    return {
      property,
      city,
      stayTypes,
      breadcrumbs: [
        { label: 'Home', path: '/' },
        { label: city?.name || 'Location', path: `/locations/${property.city_slug}` },
        { label: property.name, path: `/properties/${property.slug}` }
      ]
    };
  } catch (error) {
    console.error('Error loading property:', error);
    throw new Response('Failed to load property', { status: 500 });
  }
}

// City loader - loads city data and properties
export async function cityLoader({ params }: LoaderFunctionArgs) {
  const { citySlug } = params;
  
  if (!citySlug) {
    throw new Response('City slug is required', { status: 400 });
  }
  
  try {
    const [city, properties] = await Promise.all([
      MockDataService.getCityBySlug(citySlug),
      MockDataService.getPropertiesByCity(citySlug)
    ]);
    
    if (!city) {
      throw new Response('City not found', { status: 404 });
    }
    
    return {
      city,
      properties,
      breadcrumbs: [
        { label: 'Home', path: '/' },
        { label: city.name, path: `/locations/${city.slug}` }
      ]
    };
  } catch (error) {
    console.error('Error loading city:', error);
    throw new Response('Failed to load city', { status: 500 });
  }
}

// Stay type loader - loads specific stay type for a property
export async function stayTypeLoader({ params }: LoaderFunctionArgs) {
  const { propertySlug, stayType } = params;
  
  if (!propertySlug || !stayType) {
    throw new Response('Property slug and stay type are required', { status: 400 });
  }
  
  try {
    // First get the property
    const property = await MockDataService.getProperty(propertySlug);
    
    if (!property) {
      throw new Response('Property not found', { status: 404 });
    }
    
    // Then get the specific stay type
    const [stayTypeData, city, allStayTypes] = await Promise.all([
      MockDataService.getStayTypeByPropertyAndType(property.id, stayType),
      MockDataService.getCityBySlug(property.city_slug),
      MockDataService.getStayTypesByProperty(property.id)
    ]);
    
    if (!stayTypeData) {
      throw new Response('Stay type not found', { status: 404 });
    }
    
    return {
      property,
      stayType: stayTypeData,
      city,
      allStayTypes,
      breadcrumbs: [
        { label: 'Home', path: '/' },
        { label: city?.name || 'Location', path: `/locations/${property.city_slug}` },
        { label: property.name, path: `/properties/${property.slug}` },
        { label: stayTypeData.type_name, path: `/properties/${property.slug}/${stayType}` }
      ]
    };
  } catch (error) {
    console.error('Error loading stay type:', error);
    throw new Response('Failed to load stay type', { status: 500 });
  }
}

// Search loader - handles search queries
export async function searchLoader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const priceRangeString = url.searchParams.get('price') || '';
  const priceRange = priceRangeString.split('-').map(Number) as [number, number] | undefined;

  const searchParams = {
    query: url.searchParams.get('q') || '',
    city: url.searchParams.get('city') || '',
    capacity: url.searchParams.get('capacity') ? parseInt(url.searchParams.get('capacity')!, 10) : undefined,
    priceRange: priceRangeString ? priceRange : undefined,
    amenities: url.searchParams.getAll('amenities')
  };
  
  try {
    // If no search parameters, redirect to home
    if (!searchParams.query && !searchParams.city && !searchParams.capacity) {
      return redirect('/');
    }
    
    const results = await MockDataService.searchProperties(searchParams.query);

    return {
      searchParams,
      results: { properties: results, total: results.length, cities: [], stayTypes: [] },
      breadcrumbs: [
        { label: 'Home', path: '/' },
        { label: 'Search Results', path: '/search' }
      ]
    };
  } catch (error) {
    console.error('Error performing search:', error);
    throw new Response('Search failed', { status: 500 });
  }
}

import { getAuthState } from '../hooks/useAuth';

// Admin loader - checks authentication and authorization
export async function adminLoader() {
  try {
    const { user } = getAuthState();
    if (!user) {
      return redirect('/login');
    }

    // For now, allow any authenticated user.
    // In a real app, you'd check for a specific role.
    if (user.role !== 'group_admin') {
      return redirect('/');
    }
    
    return {
      user,
      breadcrumbs: [
        { label: 'Home', path: '/' },
        { label: 'Admin Dashboard', path: '/admin' }
      ]
    };
  } catch (error) {
    console.error('Error in admin loader:', error);
    return redirect('/login');
  }
}

export async function propertyAdminLoader({ params }: LoaderFunctionArgs) {
  const { propertyId } = params;
  if (!propertyId) {
    return null;
  }
  try {
    const property = await MockDataService.getPropertyById(propertyId);
    if (!property) {
      throw new Response('Property not found', { status: 404 });
    }
    return property;
  } catch (error) {
    console.error('Error loading property for admin:', error);
    throw new Response('Failed to load property', { status: 500 });
  }
}

// Enhanced Search filters type for faceted discovery
export interface SearchFilters {
  query?: string;
  city?: string;
  capacity?: number;
  priceRange?: [number, number];
  amenities?: string[];
  propertyTypes?: string[]; // resort, hotel, villa, apartment
  rating?: number; // minimum rating filter
  distance?: number; // distance from city center in km
  checkIn?: string; // ISO date string
  checkOut?: string; // ISO date string
  sortBy?: 'relevance' | 'price-low' | 'price-high' | 'rating' | 'distance' | 'newest';
  location?: {
    lat?: number;
    lng?: number;
    radius?: number; // search radius in km
  };
  features?: string[]; // spa, pool, gym, restaurant, etc.
  accessibility?: boolean;
  petFriendly?: boolean;
  businessFriendly?: boolean;
  familyFriendly?: boolean;
}

// Export loader types for TypeScript
export type PropertyLoaderData = Awaited<ReturnType<typeof propertyLoader>>;
export type CityLoaderData = Awaited<ReturnType<typeof cityLoader>>;
export type StayTypeLoaderData = Awaited<ReturnType<typeof stayTypeLoader>>;
export type SearchLoaderData = Awaited<ReturnType<typeof searchLoader>>;
export type AdminLoaderData = Awaited<ReturnType<typeof adminLoader>>;