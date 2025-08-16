import type { SortOption } from '../components/SortDropdown';

// Common sort options for properties
export const propertySortOptions: SortOption[] = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'name', label: 'Name A-Z' },
  { value: 'newest', label: 'Newest First' }
];