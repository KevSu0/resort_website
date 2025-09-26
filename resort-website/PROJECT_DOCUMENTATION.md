# Wayanad Nature Resorts Website - Project Documentation

## Overview

A modern, mobile-first hotel booking website for three luxury nature resorts in Wayanad, Kerala. Built with React, TypeScript, and Tailwind CSS, featuring comprehensive property management, room booking interface, responsive design, and a local admin CMS with full content control.

## Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v3
- **Routing**: React Router v6
- **Icons**: Lucide React
- **Data Storage**: LocalStorage (public), File-backed storage (admin)
- **Admin Server**: Node.js Express (local-only)
- **Type Checking**: TypeScript in strict mode
- **Package Manager**: npm/pnpm

## Features Implemented

### 1. Core Architecture
- ✅ Component-based architecture with proper separation of concerns
- ✅ TypeScript strict mode with type-only imports
- ✅ Responsive mobile-first design
- ✅ LocalStorage service for data persistence
- ✅ Mock data initialization system

### 2. Navigation System
- ✅ Professional sticky navigation bar with scroll effects
- ✅ Top bar with contact information
- ✅ Mobile-responsive hamburger menu
- ✅ Active page indicators with underline animations
- ✅ Smooth scrolling between sections
- ✅ Breadcrumb navigation for property pages
- ✅ Comprehensive footer with quick links

### 3. Property Showcase
- ✅ Three unique properties with distinct themes:
  - **Chelotte Estate**: Luxury treehouses in coffee plantations
  - **Bayfront Retreat**: Waterfront serenity by Pozhuthana reservoir
  - **Hillcrest View**: Mountain resort with valley views
- ✅ Property summary cards with hover effects
- ✅ Quick comparison table on landing page
- ✅ Featured properties section

### 4. Property Detail Pages
Each property has a comprehensive detail page featuring:

#### Image Gallery
- ✅ Full-featured gallery with thumbnail navigation
- ✅ Lightbox view with zoom functionality
- ✅ Keyboard navigation support
- ✅ Image counter and navigation arrows
- ✅ Smooth transitions and hover effects

#### Amenities Display
- ✅ Organized into categories:
  - Essential Amenities
  - Dining & Refreshments
  - Recreation & Activities
  - Views & Experiences
  - Family & Business
- ✅ Icon-based amenity representation
- ✅ Responsive grid layout

#### Nearby Attractions
- ✅ Attraction cards with images and descriptions
- ✅ Distance and travel time information
- ✅ Travel tips section
- ✅ Responsive grid layout

#### Room Types (3-4 per property)
**Chelotte Estate**:
- Treehouse Deluxe - ₹8,500/night (2 guests)
- Family Cottage - ₹12,000/night (4 guests)
- Honeymoon Suite - ₹15,000/night (2 guests)
- Premium Treehouse Villa - ₹18,000/night (4 guests)

**Bayfront Retreat**:
- Lakeview Suite - ₹9,500/night (2 guests)
- Waterfront Cottage - ₹11,000/night (3 guests)
- Family Lake Villa - ₹16,000/night (6 guests)
- Presidential Suite - ₹25,000/night (4 guests)

**Hillcrest View**:
- Valley View Room - ₹7,800/night (2 guests)
- Deluxe Valley Suite - ₹10,500/night (3 guests)
- Mountain View Cottage - ₹13,500/night (4 guests)
- Premium Hilltop Villa - ₹22,000/night (6 guests)

#### Room Comparison Tool
- ✅ Interactive comparison of up to 3 rooms
- ✅ Side-by-side feature comparison
- ✅ Checkmarks for included amenities
- ✅ Direct booking from comparison view

### 5. Data Management
- ✅ Comprehensive LocalStorage service
- ✅ CRUD operations for all entities
- ✅ Error handling for storage quotas
- ✅ Mock data with realistic property information
- ✅ Type-safe data structures

### 6. UI/UX Enhancements
- ✅ Fade-in animations for page transitions
- ✅ Hover effects and micro-interactions
- ✅ Loading states and error handling
- ✅ Consistent color scheme and branding
- ✅ Accessible design patterns
- ✅ Mobile-optimized layouts

### 7. Admin CMS System (Local)
- ✅ Admin authentication with bcrypt-hashed passwords
- ✅ Draft → Preview → Publish workflow
- ✅ Snapshot system with labeled versions and rollback
- ✅ File-backed storage architecture
- ✅ Media library with upload validation and thumbnails
- ✅ Full content editors for all entities:
  - Landing page content
  - Properties, rooms, and places
  - Offers, promo codes, and referrers
  - Site settings and SEO
- ✅ Local enquiries system with reference codes
- ✅ Export/import functionality for backup and migration
- ✅ Role-based access control (ADMIN/EDITOR ready)

## Project Structure

```
src/
├── components/
│   ├── Navigation.tsx          # Main navigation component
│   ├── Layout.tsx             # Layout wrapper with nav/footer
│   ├── Breadcrumbs.tsx        # Breadcrumb navigation
│   ├── PageTransition.tsx     # Page transition wrapper
│   ├── Footer.tsx             # Footer component
│   ├── property/
│   │   ├── PropertyShowcase.tsx    # Property grid with comparison
│   │   ├── PropertySummary.tsx     # Property cards
│   │   ├── FeaturedProperties.tsx  # Featured properties section
│   │   ├── ImageGallery.tsx        # Image gallery with lightbox
│   │   ├── AmenitiesDisplay.tsx    # Organized amenities display
│   │   ├── NearbyPlaces.tsx        # Nearby attractions
│   │   ├── RoomTypes.tsx          # Room types with pricing
│   │   └── RoomComparison.tsx     # Room comparison tool
│   └── common/
│       ├── HeroSection.tsx     # Landing page hero
│       └── Highlights.tsx      # USP highlights
├── admin/
│   ├── components/
│   │   ├── AdminLayout.tsx        # Admin layout wrapper
│   │   ├── AuthLayout.tsx         # Authentication layout
│   │   ├── Login.tsx              # Login form
│   │   ├── Dashboard.tsx          # Admin dashboard
│   │   ├── editors/
│   │   │   ├── LandingEditor.tsx   # Landing page content editor
│   │   │   ├── PropertyEditor.tsx  # Property management editor
│   │   │   ├── RoomEditor.tsx      # Room type editor
│   │   │   ├── PlaceEditor.tsx     # Nearby places editor
│   │   │   ├── MediaEditor.tsx     # Media library manager
│   │   │   ├── OffersEditor.tsx    # Offers and promotions editor
│   │   │   ├── EnquiriesEditor.tsx # Enquiries management
│   │   │   └── SettingsEditor.tsx  # Site settings editor
│   │   ├── shared/
│   │   │   ├── SnapshotManager.tsx # Snapshot and rollback UI
│   │   │   ├── PublishControls.tsx # Draft/Publish workflow
│   │   │   └── ExportImport.tsx    # Export/Import functionality
│   ├── services/
│   │   ├── adminApi.ts            # Admin API service
│   │   ├── fileStorage.ts         # File-backed storage service
│   │   ├── authService.ts         # Authentication service
│   │   └── mediaService.ts        # Media handling service
│   ├── types/
│   │   ├── admin.ts               # Admin-specific types
│   │   └── entities.ts            # All entity types
│   └── utils/
│       ├── validation.ts          # Validation utilities
│       └── exportImport.ts         # Export/Import utilities
├── pages/
│   ├── HomePage.tsx           # Main landing page
│   ├── PropertyDetailPage.tsx # Individual property pages
│   └── admin/
│       ├── LoginPage.tsx      # Admin login page
│       └── DashboardPage.tsx  # Admin dashboard
├── hooks/
│   ├── useSmoothScroll.ts     # Smooth scrolling hook
│   └── admin/
│       ├── useAuth.ts         # Admin authentication hook
│       ├── useDraft.ts        # Draft data management
│       └── useMedia.ts        # Media library hook
├── services/
│   ├── storage.ts            # LocalStorage service
│   └── contentApi.ts         # Public content API service
├── data/
│   ├── mockData.ts           # Mock data initialization
│   └── schemas/
│       ├── content.ts        # Content schemas
│       └── admin.ts          # Admin data schemas
├── types/
│   ├── index.ts              # Public-facing types
│   └── admin.ts              # Admin types (shared)
├── utils/
│   ├── index.ts              # Utility functions
│   └── admin.ts              # Admin utilities
└── App.tsx                  # Main app with routing
```

### Admin Storage Structure
```
data/
├── draft.json                # Draft content
├── published.json            # Published content
├── snapshots/                # Version history
│   ├── 20240926T123000.json  # Labeled snapshot
│   └── ...
├── settings.json             # Site settings
├── enquiries.json            # Local enquiries
└── media-manifest.json       # Media metadata

media/
├── {mediaId}.jpg             # Original media files
├── .thumbs/
│   └── {mediaId}.jpg         # Generated thumbnails
└── uploads/                  # Temporary upload directory
```

## Key Components

### Navigation System
- Sticky header with contact bar
- Mobile-responsive design
- Active state indicators
- Smooth anchor link scrolling

### Property Data Structure
```typescript
interface Property {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  latitude: number;
  longitude: number;
  address: string;
  checkIn: string;
  checkOut: string;
  heroImage: string;
  gallery: string[];
  amenities: string[];
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

interface RoomType {
  id: string;
  propertyId: string;
  name: string;
  slug: string;
  description: string;
  capacity: number;
  baseRate: number;
  amenities: string[];
  photos: string[];
}
```

### Room Comparison Feature
- Select up to 3 rooms for comparison
- Side-by-side feature matrix
- Clear visual indicators for included/excluded features
- Easy booking from comparison view

## Development Workflow

### Setup Commands
```bash
# Install dependencies
npm install

# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npx tsc --noEmit

# Linting
npm run lint
```

### Key Development Decisions

1. **TypeScript Strict Mode**: Enabled for maximum type safety
2. **Component Architecture**: Modular components with clear responsibilities
3. **Data Persistence**: LocalStorage for development, easily replaceable with API
4. **Responsive Design**: Mobile-first approach with Tailwind CSS
5. **Accessibility**: Semantic HTML and ARIA labels
6. **Performance**: Optimized images and lazy loading ready
7. **SEO**: Proper meta tags and structured data ready

## Future Enhancements

### Phase 1 - Core Features (Completed)
- ✅ Property showcase pages
- ✅ Individual property detail pages
- ✅ Image galleries
- ✅ Room types and pricing
- ✅ Navigation system
- ✅ Responsive design

### Phase 2 - Admin CMS (In Progress)
- ✅ Local admin authentication system
- ✅ Draft → Preview → Publish workflow
- ✅ File-backed storage architecture
- ✅ Media library with validation
- ✅ Full content editors for all entities
- ✅ Snapshot system with rollback
- ✅ Export/import functionality
- ✅ Local enquiries system

### Phase 3 - Real Backend Integration (Future)
- Migrate from local file storage to cloud database
- Implement real-time availability checking
- Add booking form with date picker
- Payment gateway integration
- Email/SMS notifications
- CAPTCHA verification

### Phase 4 - Advanced Features (Future)
- User accounts and profiles
- Reviews and ratings system
- Loyalty program integration
- Multi-language support (Malayalam)
- Analytics and reporting dashboard
- Mobile app companion

## Environment Variables

Create `.env` file in the root directory:

```env
# Public Site Configuration
VITE_WHATSAPP_CONTACT_NUMBER=+919876543210
VITE_SITE_EMAIL_FROM=info@wayanadresorts.com

# Admin Configuration (Local)
VITE_ADMIN_API_URL=http://localhost:3001
VITE_ENABLE_ADMIN=true
VITE_ENABLE_DRAFT_PREVIEW=true
```

## Deployment

The project is ready for deployment on any static hosting service:

1. Build the project: `npm run build`
2. Deploy the `dist` folder to your hosting service
3. Configure environment variables on the hosting platform

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance Considerations

- Images optimized through Unsplash
- Lazy loading ready for implementation
- Code splitting through React Router
- Minimal bundle size with tree shaking
- CSS optimized through PurgeCSS

## Security Considerations

- XSS protection through React
- CSRF protection ready for API integration
- Secure environment variable handling
- Input validation forms ready

## Contributing

1. Follow TypeScript strict mode
2. Use semantic HTML5 elements
3. Maintain responsive design principles
4. Write component documentation
5. Test across different screen sizes

---

## Acknowledgments

- Images provided by Unsplash
- Icons from Lucide React
- Built with modern web technologies
- Inspired by luxury hotel booking experiences

Last Updated: September 2024