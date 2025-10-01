import { type Property, type RoomType, type Place, type Offer, type PromoCode, type Referrer } from '@/types';
import { storageService } from '@/services/storage';
import { logger } from '../lib/logger';

// Mock Properties
export const mockProperties: (Property & { rooms: RoomType[]; places: Place[] })[] = [
  {
    id: '1',
    name: 'Chelotte Estate',
    slug: 'chelotte-estate',
    tagline: 'Treehouse stays in lush plantations',
    description: 'Experience luxury treehouses nestled in the heart of Wayanad\'s lush coffee plantations. Our unique treehouses offer panoramic views of the Western Ghats, combining luxury with nature. Each treehouse is carefully crafted to minimize environmental impact while providing maximum comfort.',
    latitude: 11.6854,
    longitude: 76.1308,
    address: 'Chelotte Estate, Pozhuthana, Wayanad, Kerala 673576',
    checkIn: '2:00 PM',
    checkOut: '11:00 AM',
    heroImage: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&h=800&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&h=600&fit=crop',
    ],
    amenities: [
      'Free WiFi',
      'Treehouse Accommodation',
      'Nature Walks',
      'Campfire',
      'Complimentary Breakfast',
      'Mountain View',
      'Coffee Plantation Tour',
      'Bird Watching'
    ],
    featured: true,
    rooms: [
      {
        id: 'room-1',
        propertyId: '1',
        name: 'Treehouse Deluxe',
        slug: 'treehouse-deluxe',
        description: 'Luxurious treehouse with private balcony offering stunning views of the coffee plantations. Features modern amenities while maintaining the rustic charm.',
        capacity: 2,
        baseRate: 8500,
        amenities: [
          'King Size Bed',
          'Private Balcony',
          'AC',
          'Coffee Maker',
          'Mini Fridge',
          'Private Bathroom',
          'Sitting Area'
        ],
        photos: [
          'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=600&h=400&fit=crop',
          'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&h=400&fit=crop',
        ]
      },
      {
        id: 'room-2',
        propertyId: '1',
        name: 'Family Cottage',
        slug: 'family-cottage',
        description: 'Spacious family cottage perfect for 4 guests. Located at ground level with easy access and a private garden area.',
        capacity: 4,
        baseRate: 12000,
        amenities: [
          '2 Bedrooms',
          'Living Room',
          'Private Garden',
          'Kitchenette',
          'AC',
          'Private Bathroom',
          'Dining Area'
        ],
        photos: [
          'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&h=400&fit=crop',
          'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=600&h=400&fit=crop',
        ]
      },
      {
        id: 'room-2a',
        propertyId: '1',
        name: 'Honeymoon Suite',
        slug: 'honeymoon-suite',
        description: 'Romantic treehouse suite with glass walls offering 360-degree views. Features a four-poster bed, private jacuzzi, and champagne on arrival.',
        capacity: 2,
        baseRate: 15000,
        amenities: [
          'Four Poster Bed',
          'Glass Walls',
          'Private Jacuzzi',
          'AC',
          'Champagne on Arrival',
          'Private Bathroom',
          'Sitting Area',
          'Privacy Guaranteed'
        ],
        photos: [
          'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&h=400&fit=crop',
          'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600&h=400&fit=crop',
        ]
      },
      {
        id: 'room-2b',
        propertyId: '1',
        name: 'Premium Treehouse Villa',
        slug: 'premium-treehouse-villa',
        description: 'Exclusive two-level treehouse villa with separate living area, kitchenette, and a large viewing deck. Ideal for extended stays.',
        capacity: 4,
        baseRate: 18000,
        amenities: [
          '2 Levels',
          'Master Bedroom',
          'Living Room',
          'Kitchenette',
          'Large Viewing Deck',
          'AC',
          '2 Bathrooms',
          'Dining Area',
          'Private Butler Service'
        ],
        photos: [
          'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=400&fit=crop',
          'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop',
        ]
      }
    ],
    places: [
      {
        id: 'place-1',
        propertyId: '1',
        name: 'Banasura Sagar Dam',
        description: 'Second largest earth dam in India. Beautiful reservoir with boating facilities and stunning views of the surrounding hills.',
        distanceKm: 18.0,
        travelTime: '35 min',
        photo: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=600&h=400&fit=crop'
      },
      {
        id: 'place-2',
        propertyId: '1',
        name: 'Meenmutty Falls',
        description: 'Spectacular three-tiered waterfall cascading down from a height of 300m. A must-visit for nature lovers.',
        distanceKm: 28.0,
        travelTime: '50 min',
        photo: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop'
      }
    ],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'Bayfront Retreat',
    slug: 'bayfront-retreat',
    tagline: 'Waterfront serenity',
    description: 'Nestled beside the tranquil waters of Pozhuthana reservoir, Bayfront Retreat offers a peaceful escape from the bustling city life. Wake up to misty mornings and enjoy water activities right at your doorstep.',
    latitude: 11.6724,
    longitude: 76.1425,
    address: 'Bayfront Retreat, Pozhuthana, Wayanad, Kerala 673576',
    checkIn: '2:00 PM',
    checkOut: '11:00 AM',
    heroImage: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200&h=800&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1546548970-71785318a17b?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&h=600&fit=crop',
    ],
    amenities: [
      'Lake View',
      'Kayaking',
      'Fishing',
      'BBQ Facilities',
      'Complimentary Breakfast',
      'Bonfire',
      'Indoor Games',
      'Wi-Fi'
    ],
    featured: true,
    rooms: [
      {
        id: 'room-3',
        propertyId: '2',
        name: 'Lakeview Suite',
        slug: 'lakeview-suite',
        description: 'Elegant suite with floor-to-ceiling windows offering breathtaking views of the reservoir. Perfect for couples seeking a romantic getaway.',
        capacity: 2,
        baseRate: 9500,
        amenities: [
          'King Size Bed',
          'Lake View Balcony',
          'AC',
          'Coffee Maker',
          'Mini Bar',
          'Jacuzzi',
          'Sitting Area'
        ],
        photos: [
          'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=400&fit=crop',
          'https://images.unsplash.com/photo-1618773928123-c3230b9300c4?w=600&h=400&fit=crop',
        ]
      },
      {
        id: 'room-3a',
        propertyId: '2',
        name: 'Waterfront Cottage',
        slug: 'waterfront-cottage',
        description: 'Cozy cottage right on the water\'s edge with private access to the reservoir. Features a small deck perfect for morning coffee while watching the sunrise.',
        capacity: 3,
        baseRate: 11000,
        amenities: [
          'Queen Size Bed',
          'Single Bed',
          'Private Deck',
          'Direct Lake Access',
          'Kitchenette',
          'AC',
          'Private Bathroom',
          'BBQ Grill'
        ],
        photos: [
          'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop',
          'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=600&h=400&fit=crop',
        ]
      },
      {
        id: 'room-3b',
        propertyId: '2',
        name: 'Family Lake Villa',
        slug: 'family-lake-villa',
        description: 'Spacious two-bedroom villa with separate living area and kitchen. Perfect for families with children, offering safe access to the lake.',
        capacity: 6,
        baseRate: 16000,
        amenities: [
          '2 Bedrooms',
          'Living Room',
          'Full Kitchen',
          'Dining Area',
          'Private Garden',
          'Lake View Deck',
          '2 Bathrooms',
          'Children\'s Play Area'
        ],
        photos: [
          'https://images.unsplash.com/photo-1546548970-71785318a17b?w=600&h=400&fit=crop',
          'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&h=400&fit=crop',
        ]
      },
      {
        id: 'room-3c',
        propertyId: '2',
        name: 'Presidential Suite',
        slug: 'presidential-suite',
        description: 'Ultimate luxury suite spanning the entire top floor. Features panoramic lake views, private infinity pool, and personal concierge service.',
        capacity: 4,
        baseRate: 25000,
        amenities: [
          'Master Bedroom',
          'Living Room',
          'Private Infinity Pool',
          'Personal Concierge',
          'Wine Cellar',
          'Home Theater',
          '2 Bathrooms',
          'Panoramic Lake View',
          'Private Elevator'
        ],
        photos: [
          'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=400&fit=crop',
          'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600&h=400&fit=crop',
        ]
      }
    ],
    places: [
      {
        id: 'place-3',
        propertyId: '2',
        name: 'Pookode Lake',
        description: 'Natural freshwater lake surrounded by forests. Offers boating and aquarium visits. A popular picnic spot.',
        distanceKm: 12.5,
        travelTime: '25 min',
        photo: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=600&h=400&fit=crop'
      },
      {
        id: 'place-4',
        propertyId: '2',
        name: 'Lakkidi Viewpoint',
        description: 'Gateway to Wayanad with panoramic views of the mountains and valleys. Perfect spot for sunrise and sunset views.',
        distanceKm: 15.0,
        travelTime: '30 min',
        photo: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop'
      }
    ],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '3',
    name: 'Hillcrest View',
    slug: 'hillcrest-view',
    tagline: 'Misty mornings and valley views',
    description: 'Perched atop the hills of Wayanad, Hillcrest View offers spectacular valley views and misty mornings. Our resort is designed to blend with nature while providing all modern comforts.',
    latitude: 11.6954,
    longitude: 76.1587,
    address: 'Hillcrest View, Meppadi, Wayanad, Kerala 673577',
    checkIn: '2:00 PM',
    checkOut: '11:00 AM',
    heroImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=800&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1546548970-71785318a17b?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1464822759844-d150baec0494?w=800&h=600&fit=crop',
    ],
    amenities: [
      'Valley View',
      'Trekking',
      'Yoga Deck',
      'Spa Services',
      'Restaurant',
      'Conference Hall',
      'Children\'s Play Area',
      'Wi-Fi'
    ],
    featured: true,
    rooms: [
      {
        id: 'room-4',
        propertyId: '3',
        name: 'Valley View Room',
        slug: 'valley-view-room',
        description: 'Comfortable room with private balcony offering panoramic views of the valley. Ideal for nature lovers and photographers.',
        capacity: 2,
        baseRate: 7800,
        amenities: [
          'Double Bed',
          'Valley View Balcony',
          'AC',
          'Tea/Coffee Maker',
          'Mini Fridge',
          'Private Bathroom',
          'Work Desk'
        ],
        photos: [
          'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=600&h=400&fit=crop',
          'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400&fit=crop',
        ]
      },
      {
        id: 'room-4a',
        propertyId: '3',
        name: 'Deluxe Valley Suite',
        slug: 'deluxe-valley-suite',
        description: 'Spacious suite with separate living area and floor-to-ceiling windows. Features a private balcony perfect for watching the sunset over the valley.',
        capacity: 3,
        baseRate: 10500,
        amenities: [
          'King Size Bed',
          'Living Room',
          'Floor-to-Ceiling Windows',
          'Private Balcony',
          'Coffee Maker',
          'Mini Bar',
          'AC',
          'Work Desk',
          'Sitting Area'
        ],
        photos: [
          'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600&h=400&fit=crop',
          'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=400&fit=crop',
        ]
      },
      {
        id: 'room-4b',
        propertyId: '3',
        name: 'Mountain View Cottage',
        slug: 'mountain-view-cottage',
        description: 'Rustic-chic cottage with mountain views, featuring a fireplace and a small kitchenette. Perfect for cozy winter getaways.',
        capacity: 4,
        baseRate: 13500,
        amenities: [
          '2 Bedrooms',
          'Living Room with Fireplace',
          'Kitchenette',
          'Mountain View Deck',
          'Dining Area',
          'AC',
          'Private Bathroom',
          'BBQ Facilities'
        ],
        photos: [
          'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&h=400&fit=crop',
          'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=600&h=400&fit=crop',
        ]
      },
      {
        id: 'room-4c',
        propertyId: '3',
        name: 'Premium Hilltop Villa',
        slug: 'premium-hilltop-villa',
        description: 'Exclusive villa perched on the highest point of the resort. Offers 360-degree views of the Western Ghats, private infinity pool, and personal butler service.',
        capacity: 6,
        baseRate: 22000,
        amenities: [
          '3 Bedrooms',
          'Living Room',
          'Private Infinity Pool',
          '360-Degree View Deck',
          'Full Kitchen',
          'Dining Room',
          'Personal Butler',
          'Home Theater',
          '3 Bathrooms',
          'Private Garden'
        ],
        photos: [
          'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop',
          'https://images.unsplash.com/photo-1546548970-71785318a17b?w=600&h=400&fit=crop',
        ]
      }
    ],
    places: [
      {
        id: 'place-5',
        propertyId: '3',
        name: 'Edakkal Caves',
        description: 'Ancient natural caves with Neolithic age carvings. A historical treasure offering insights into early human civilization.',
        distanceKm: 22.0,
        travelTime: '40 min',
        photo: 'https://images.unsplash.com/photo-1546548970-71785318a17b?w=600&h=400&fit=crop'
      },
      {
        id: 'place-6',
        propertyId: '3',
        name: 'Chembra Peak',
        description: 'Highest peak in Wayanad. Popular trekking destination with a heart-shaped lake at the top. Requires forest permission.',
        distanceKm: 18.0,
        travelTime: '35 min',
        photo: 'https://images.unsplash.com/photo-1464822759844-d150baec0494?w=600&h=400&fit=crop'
      }
    ],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
];


// Mock Offers
export const mockOffers: Offer[] = [
  {
    id: 'offer-1',
    title: 'Early Bird 10% Off',
    description: 'Book 21 days in advance and get 10% off on your stay',
    scope: 'GLOBAL',
    discountType: 'PERCENT',
    discountValue: 10,
    validFrom: '2024-01-01T00:00:00Z',
    validTo: '2024-12-31T23:59:59Z',
    blackoutDates: [],
    daysOfWeek: [],
    minAdvanceDays: 21,
    usageLimit: 100,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'offer-2',
    title: 'Long Stay ₹1000 Off',
    description: 'Stay 3 or more nights and get ₹1000 off',
    scope: 'GLOBAL',
    discountType: 'FIXED',
    discountValue: 1000,
    validFrom: '2024-01-01T00:00:00Z',
    validTo: '2024-12-31T23:59:59Z',
    blackoutDates: [],
    daysOfWeek: [],
    longStayNights: 3,
    usageLimit: 200,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
];

// Mock Promo Codes
export const mockPromoCodes: PromoCode[] = [
  {
    id: 'promo-1',
    code: 'WELCOME500',
    description: 'First time booking discount',
    discountType: 'FIXED',
    discountValue: 500,
    validFrom: '2024-01-01T00:00:00Z',
    validTo: '2024-12-31T23:59:59Z',
    usageLimit: 50,
    perPhoneLimit: 1,
    scope: 'GLOBAL',
    isReferral: false,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
];

// Mock Referrers
export const mockReferrers: Referrer[] = [
  {
    id: 'referrer-1',
    name: 'Arun',
    phone: '+919876543210',
    email: 'arun@example.com',
    code: 'WYN-ARUN-7H3K',
    rewardType: 'FLAT_CREDIT',
    rewardValue: 500,
    maxRewards: 50,
    totalAttributions: 0,
    totalConfirmed: 0,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
];

// Initialize mock data in localStorage
export const initializeMockData = (): void => {
  // Clear existing data (optional - comment out to preserve data)
  // storageService.clearAllData();

  // Initialize properties
  const existingProperties = storageService.getProperties();
  if (existingProperties.length === 0) {
    // Flatten properties, rooms, and places
    const properties: Property[] = mockProperties.map(p => ({
      ...p,
      rooms: [],
      places: []
    }));

    const rooms: RoomType[] = [];
    const places: Place[] = [];

    mockProperties.forEach(property => {
      property.rooms.forEach(room => {
        rooms.push(room);
      });
      property.places.forEach(place => {
        places.push(place);
      });
    });

    storageService.saveProperties(properties);
    storageService.saveRooms(rooms);
    storageService.savePlaces(places);
  }

  
  // Initialize offers
  const existingOffers = storageService.getOffers();
  if (existingOffers.length === 0) {
    storageService.saveOffers(mockOffers);
  }

  // Initialize promo codes
  const existingPromoCodes = storageService.getPromoCodes();
  if (existingPromoCodes.length === 0) {
    storageService.savePromoCodes(mockPromoCodes);
  }

  // Initialize referrers
  const existingReferrers = storageService.getReferrers();
  if (existingReferrers.length === 0) {
    storageService.saveReferrers(mockReferrers);
  }

  logger.info('Mock data initialized successfully', {
    module: 'MockData',
    function: 'initializeMockData',
    category: 'initialization'
  });
};

// Generate unique reference code for enquiries
export const generateEnquiryRefCode = (): string => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  // Get existing enquiries count for today
  const enquiries = storageService.getEnquiries();
  const todayEnquiries = enquiries.filter(e =>
    e.createdAt.startsWith(`${year}-${month}-${day}`)
  ).length;

  const sequence = String(todayEnquiries + 1).padStart(4, '0');

  return `ENQ-${year}${month}${day}-${sequence}`;
};