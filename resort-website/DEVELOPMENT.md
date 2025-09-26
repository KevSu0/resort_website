# Wayanad Nature Resorts - Development Guide

## Project Setup

### Prerequisites
- Node.js (v18 or higher)
- npm or pnpm package manager

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd resort_website

# Install dependencies
npm install
# or
pnpm install
```

### Development Environment Setup

#### 1. Environment Variables
Create a `.env.local` file in the root directory:

```env
# API Keys (for future backend integration)
# Leave empty for local storage development
RESEND_API_KEY=
HCAPTCHA_SITE_KEY=
HCAPTCHA_SECRET_KEY=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Contact Information
SITE_EMAIL_FROM=kevinjoy0@gmail.com
WHATSAPP_CONTACT_NUMBER=+919567068535

# Admin Credentials (for development)
ADMIN_SEED_EMAIL=admin@treehouse.in
ADMIN_SEED_PASSWORD=Treehouse@1234
```

#### 2. Run Development Server
```bash
npm run dev
# or
pnpm dev
```

## Project Structure

```
src/
├── components/
│   ├── common/           # Reusable components
│   ├── layout/           # Layout components
│   ├── property/         # Property-related components
│   ├── booking/          # Booking/enquiry components
│   └── admin/            # Admin panel components
├── pages/                # Page components
├── hooks/                # Custom React hooks
├── context/             # React contexts
├── utils/               # Utility functions
├── services/            # API and data services
├── types/               # TypeScript type definitions
└── data/                # Mock data and local storage helpers
```

## Development Workflow

### 1. Working with User Stories

The `user-stories.json` file contains all epics, user stories, and detailed tasks. Each task includes:

- **Task ID**: Unique identifier
- **Title**: Brief description
- **Subtasks**: Major components
- **Microtasks**: Specific implementation steps

### 2. Task Implementation Process

1. **Choose a task** from the user-stories.json
2. **Create a feature branch**:
   ```bash
   git checkout -b feature/task-id-task-name
   ```
3. **Implement microtasks** in order
4. **Test locally** with local storage
5. **Update progress** in task tracking system
6. **Submit for review**

### 3. Local Storage Usage

For development, we're using localStorage. Here's how to work with it:

#### Data Models

```typescript
// Property Model
interface Property {
  id: string;
  name: string;
  slug: string;
  description: string;
  heroImage: string;
  gallery: string[];
  amenities: string[];
  // ... other properties
}

// Enquiry Model
interface Enquiry {
  id: string;
  refCode: string;
  propertyId: string;
  roomTypeId?: string;
  startDate: string;
  endDate?: string;
  adults: number;
  children: number;
  fullName: string;
  phone: string;
  email?: string;
  status: 'NEW' | 'CONTACTED' | 'CONFIRMED' | 'DECLINED';
  createdAt: string;
}
```

#### Storage Service

```typescript
// src/services/storage.ts
export class LocalStorageService {
  private readonly STORAGE_KEYS = {
    PROPERTIES: 'resort_properties',
    ENQUIRIES: 'resort_enquiries',
    ADMIN_AUTH: 'resort_admin_auth',
    // ... other keys
  };

  // Get all data
  getProperties(): Property[] {
    const data = localStorage.getItem(this.STORAGE_KEYS.PROPERTIES);
    return data ? JSON.parse(data) : [];
  }

  // Save data
  saveEnquiry(enquiry: Enquiry): void {
    const enquiries = this.getEnquiries();
    enquiries.push(enquiry);
    localStorage.setItem(this.STORAGE_KEYS.ENQUIRIES, JSON.stringify(enquiries));
  }

  // ... other CRUD operations
}
```

### 4. Component Development Guidelines

#### Creating Components

1. **Use functional components** with TypeScript
2. **Follow naming convention**: PascalCase for components
3. **Create component files**: ComponentName.tsx
4. **Add types**: ComponentName.types.ts (if complex)
5. **Export as default**

Example:
```typescript
// src/components/property/PropertyCard.tsx
interface PropertyCardProps {
  property: Property;
  onClick?: () => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property, onClick }) => {
  return (
    <div className="property-card" onClick={onClick}>
      {/* Component content */}
    </div>
  );
};
```

#### State Management

For local state:
- Use `useState` for simple component state
- Use `useReducer` for complex state logic
- Use React Context for global state

Example:
```typescript
// src/context/BookingContext.tsx
interface BookingState {
  selectedProperty?: Property;
  selectedRoom?: RoomType;
  dates: {
    startDate?: Date;
    endDate?: Date;
  };
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within BookingProvider');
  }
  return context;
};
```

### 5. Form Handling

Using react-hook-form + Zod for validation:

```typescript
// src/components/booking/EnquiryForm.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const enquirySchema = z.object({
  fullName: z.string().min(2, 'Name is required'),
  phone: z.string().regex(/^\+91\d{10}$/, 'Invalid phone number'),
  email: z.string().email().optional().or(z.literal('')),
  adults: z.number().min(1),
  children: z.number().min(0),
  notes: z.string().optional(),
});

type EnquiryFormData = z.infer<typeof enquirySchema>;

export const EnquiryForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<EnquiryFormData>({
    resolver: zodResolver(enquirySchema),
  });

  const onSubmit = (data: EnquiryFormData) => {
    // Handle form submission
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Form fields */}
    </form>
  );
};
```

### 6. Mock Data Generation

Create mock data for development:

```typescript
// src/data/mockData.ts
export const mockProperties: Property[] = [
  {
    id: '1',
    name: 'Chelotte Estate',
    slug: 'chelotte-estate',
    tagline: 'Treehouse stays in lush plantations',
    description: 'Experience luxury treehouses...',
    // ... other properties
  },
  // ... more properties
];

// Initialize localStorage with mock data
export const initializeMockData = () => {
  if (!localStorage.getItem('resort_properties')) {
    localStorage.setItem('resort_properties', JSON.stringify(mockProperties));
  }
};
```

### 7. Responsive Design

- Mobile-first approach
- Use Tailwind CSS responsive utilities
- Test on multiple screen sizes

```typescript
// Example responsive component
const ResponsiveComponent = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Content */}
      </div>
    </div>
  );
};
```

### 8. Testing (For Development)

Since we're focusing on development, basic testing:

```typescript
// src/utils/validation.test.ts
// Basic validation tests
describe('Phone Number Validation', () => {
  it('should validate Indian phone numbers', () => {
    const isValid = validateIndianPhone('+919876543210');
    expect(isValid).toBe(true);
  });
});
```

## Deployment Preparation

When ready to move from localStorage to actual backend:

1. **Replace localStorage service** with API calls
2. **Update environment variables** with real API keys
3. **Implement proper authentication** with JWT tokens
4. **Add error handling** for API failures
5. **Implement loading states** for async operations

## Common Issues and Solutions

### 1. Local Storage Quota Exceeded
- Compress data before storing
- Use IndexedDB for larger datasets
- Implement data expiration

### 2. Data Persistence
- Data is lost when browser cache is cleared
- Export/import functionality for backup

### 3. Security (Development Only)
- No real security in localStorage
- Passwords and sensitive data should not be stored
- This is for development purposes only

## Code Style Guidelines

1. **TypeScript**: Strict mode enabled
2. **ESLint**: Follow project rules
3. **Prettier**: Auto-format on save
4. **Component Order**: Imports → Types → Constants → Component → Export
5. **Naming**: camelCase for variables, PascalCase for components

## Getting Help

- Refer to user-stories.json for task details
- Check existing components for patterns
- Review mock data for expected structure
- Use browser DevTools for debugging localStorage