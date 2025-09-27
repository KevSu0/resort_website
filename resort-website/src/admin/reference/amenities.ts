/**
 * Amenities Catalog and Normalizer
 *
 * This is the single source of truth for all amenities in the admin system.
 * All services must import and use this catalog to ensure consistency.
 */

export interface Amenity {
  id: string;
  name: string;
  category: string;
  description?: string;
  icon?: string;
}

// Standardized amenities catalog
export const AMENITY_CATALOG: Record<string, Amenity> = {
  // Room Amenities
  'air-conditioning': {
    id: 'air-conditioning',
    name: 'Air Conditioning',
    category: 'room',
    icon: '❄️'
  },
  'wifi': {
    id: 'wifi',
    name: 'Free WiFi',
    category: 'room',
    icon: '📶'
  },
  'tv': {
    id: 'tv',
    name: 'Television',
    category: 'room',
    icon: '📺'
  },
  'minibar': {
    id: 'minibar',
    name: 'Mini Bar',
    category: 'room',
    icon: '🍷'
  },
  'tea-coffee': {
    id: 'tea-coffee',
    name: 'Tea/Coffee Maker',
    category: 'room',
    icon: '☕'
  },
  'safe': {
    id: 'safe',
    name: 'Safe Deposit Box',
    category: 'room',
    icon: '🔒'
  },
  'balcony': {
    id: 'balcony',
    name: 'Balcony',
    category: 'room',
    icon: '🏠'
  },
  'bathtub': {
    id: 'bathtub',
    name: 'Bathtub',
    category: 'bathroom',
    icon: '🛁'
  },
  'shower': {
    id: 'shower',
    name: 'Hot Shower',
    category: 'bathroom',
    icon: '🚿'
  },
  'hairdryer': {
    id: 'hairdryer',
    name: 'Hair Dryer',
    category: 'bathroom',
    icon: '💨'
  },
  'toiletries': {
    id: 'toiletries',
    name: 'Free Toiletries',
    category: 'bathroom',
    icon: '🧴'
  },

  // Property Amenities
  'swimming-pool': {
    id: 'swimming-pool',
    name: 'Swimming Pool',
    category: 'property',
    icon: '🏊'
  },
  'restaurant': {
    id: 'restaurant',
    name: 'Restaurant',
    category: 'property',
    icon: '🍽️'
  },
  'bar': {
    id: 'bar',
    name: 'Bar/Lounge',
    category: 'property',
    icon: '🍹'
  },
  'spa': {
    id: 'spa',
    name: 'Spa',
    category: 'property',
    icon: '💆'
  },
  'fitness': {
    id: 'fitness',
    name: 'Fitness Center',
    category: 'property',
    icon: '💪'
  },
  'parking': {
    id: 'parking',
    name: 'Free Parking',
    category: 'property',
    icon: '🚗'
  },
  'garden': {
    id: 'garden',
    name: 'Garden',
    category: 'property',
    icon: '🌳'
  },
  'terrace': {
    id: 'terrace',
    name: 'Terrace',
    category: 'property',
    icon: '🏛️'
  },
  'reception': {
    id: 'reception',
    name: '24/7 Reception',
    category: 'service',
    icon: '👋'
  },
  'room-service': {
    id: 'room-service',
    name: 'Room Service',
    category: 'service',
    icon: '🛎️'
  },
  'laundry': {
    id: 'laundry',
    name: 'Laundry Service',
    category: 'service',
    icon: '👕'
  },
  'concierge': {
    id: 'concierge',
    name: 'Concierge',
    category: 'service',
    icon: '🎩'
  },
  'airport-transfer': {
    id: 'airport-transfer',
    name: 'Airport Transfer',
    category: 'service',
    icon: '✈️'
  },

  // Eco & Wellness
  'eco-friendly': {
    id: 'eco-friendly',
    name: 'Eco-Friendly',
    category: 'eco',
    icon: '🌿'
  },
  'solar': {
    id: 'solar',
    name: 'Solar Power',
    category: 'eco',
    icon: '☀️'
  },
  'rainwater': {
    id: 'rainwater',
    name: 'Rainwater Harvesting',
    category: 'eco',
    icon: '💧'
  },
  'organic-garden': {
    id: 'organic-garden',
    name: 'Organic Garden',
    category: 'eco',
    icon: '🥬'
  },
  'yoga': {
    id: 'yoga',
    name: 'Yoga Deck',
    category: 'wellness',
    icon: '🧘'
  },
  'meditation': {
    id: 'meditation',
    name: 'Meditation Center',
    category: 'wellness',
    icon: '🧎'
  },

  // Activities
  'trekking': {
    id: 'trekking',
    name: 'Trekking',
    category: 'activity',
    icon: '🥾'
  },
  'bird-watching': {
    id: 'bird-watching',
    name: 'Bird Watching',
    category: 'activity',
    icon: '🦅'
  },
  'campfire': {
    id: 'campfire',
    name: 'Campfire',
    category: 'activity',
    icon: '🔥'
  },
  'cycling': {
    id: 'cycling',
    name: 'Cycling',
    category: 'activity',
    icon: '🚴'
  }
};

// Categories for grouping
export const AMENITY_CATEGORIES = {
  room: 'Room Amenities',
  bathroom: 'Bathroom',
  property: 'Property Facilities',
  service: 'Services',
  eco: 'Eco Features',
  wellness: 'Wellness',
  activity: 'Activities'
} as const;

/**
 * Normalize amenity name to a standardized key
 * - Convert to lowercase
 * - Replace spaces and special characters with hyphens
 * - Remove extra spaces and hyphens
 * - Remove common words like "free", "complimentary"
 */
export function normalizeAmenityKey(name: string): string {
  return name
    .toLowerCase()
    .replace(/free|complimentary/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .trim();
}

/**
 * Find an amenity by its key (normalized name)
 * Returns undefined if not found
 */
export function findAmenityByKey(key: string): Amenity | undefined {
  const normalized = normalizeAmenityKey(key);
  return AMENITY_CATALOG[normalized];
}

/**
 * Find amenity by name (fuzzy matching)
 * Returns the best match or undefined
 */
export function findAmenityByName(name: string): Amenity | undefined {
  const normalizedKey = normalizeAmenityKey(name);

  // Try exact match first
  const exactMatch = AMENITY_CATALOG[normalizedKey];
  if (exactMatch) return exactMatch;

  // Try fuzzy matching
  const nameWords = normalizedKey.split('-');
  let bestMatch: Amenity | undefined;
  let bestScore = 0;

  for (const [key, amenity] of Object.entries(AMENITY_CATALOG)) {
    const keyWords = key.split('-');
    const score = calculateWordMatchScore(nameWords, keyWords);

    if (score > bestScore && score >= 0.5) {
      bestScore = score;
      bestMatch = amenity;
    }
  }

  return bestMatch;
}

/**
 * Calculate word match score between two word arrays
 * Returns score between 0 and 1
 */
function calculateWordMatchScore(words1: string[], words2: string[]): number {
  let matches = 0;
  const total = Math.max(words1.length, words2.length);

  for (const word1 of words1) {
    for (const word2 of words2) {
      if (word1 === word2 || word1.includes(word2) || word2.includes(word1)) {
        matches++;
        break;
      }
    }
  }

  return matches / total;
}

/**
 * Get all amenities grouped by category
 */
export function getAmenitiesByCategory(): Record<string, Amenity[]> {
  const grouped: Record<string, Amenity[]> = {};

  // Initialize categories
  for (const categoryKey of Object.keys(AMENITY_CATEGORIES)) {
    grouped[categoryKey] = [];
  }

  // Group amenities
  for (const amenity of Object.values(AMENITY_CATALOG)) {
    if (grouped[amenity.category]) {
      grouped[amenity.category].push(amenity);
    }
  }

  return grouped;
}

/**
 * Validate and normalize an array of amenity strings
 * Returns an array of standardized amenity keys
 */
export function normalizeAmenities(amenities: string[]): string[] {
  const normalized: string[] = [];
  const seen = new Set<string>();

  for (const amenity of amenities) {
    const key = normalizeAmenityKey(amenity);
    const found = findAmenityByKey(key) || findAmenityByName(amenity);

    if (found && !seen.has(found.id)) {
      normalized.push(found.id);
      seen.add(found.id);
    }
  }

  return normalized.sort();
}

/**
 * Convert amenity keys to display names
 */
export function getAmenityNames(keys: string[]): string[] {
  return keys
    .map(key => AMENITY_CATALOG[key]?.name || key)
    .sort();
}