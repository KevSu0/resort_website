# Wayanad Nature Resorts

A modern, responsive resort booking website built with React, TypeScript, and Vite. This application features a comprehensive admin CMS for managing properties, bookings, and content.

## Features

### Guest-Facing Features
- **Property browsing** with detailed information and photo galleries
- **Room type selection** with pricing and availability
- **Booking enquiry system** with instant confirmation
- **Contact forms** with WhatsApp integration
- **Mobile-responsive design** optimized for all devices

### Admin CMS Features
- **Property management** - Add, edit, and organize resort properties
- **Room type management** - Configure rooms, pricing, and amenities
- **Enquiry tracking** - Manage guest bookings and communications
- **Media library** - Upload and manage property photos
- **Content management** - Update website content and SEO
- **Security features** - Authentication, validation, and audit logging

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Forms**: React Hook Form + Zod validation
- **State Management**: React Context + localStorage
- **Build Tools**: Vite, ESLint, Prettier
- **Testing**: Jest + React Testing Library
- **Security**: bcryptjs, DOMPurify, rate limiting

## Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm or pnpm package manager

### Installation

```bash
# Clone the repository
git clone <repository-url>

# Install dependencies
npm install
```

### Environment Setup

Create a `.env.local` file in the root directory:

```env
# Contact Information
SITE_EMAIL_FROM=kevinjoy0@gmail.com
WHATSAPP_CONTACT_NUMBER=+919567068535

# Admin Credentials (for development)
ADMIN_SEED_EMAIL=admin@treehouse.in
ADMIN_SEED_PASSWORD=Treehouse@1234

# API Keys (leave empty for local storage development)
RESEND_API_KEY=
HCAPTCHA_SITE_KEY=
HCAPTCHA_SECRET_KEY=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

### Development

```bash
# Start development server
npm run dev

# Application will be available at:
# Guest site: http://localhost:5176
# Admin panel: http://localhost:5176/admin
```

## Project Structure

```
├── assets/               # Static assets (images, fonts, etc.)
│   ├── images/          # Image files
│   └── styles/          # Global styles
├── build/               # Build output and build tools
├── config/              # Configuration files
│   ├── typescript/      # TypeScript configurations
│   ├── vite.config.ts   # Vite build configuration
│   ├── jest.config.ts   # Jest testing configuration
│   └── *.config.js      # Other tool configurations
├── docs/                # Documentation files
├── src/                 # Source code
│   ├── components/
│   │   ├── common/      # Reusable UI components
│   │   ├── layout/      # Header, footer, navigation
│   │   ├── property/    # Property cards, galleries
│   │   ├── booking/     # Booking forms and enquiries
│   │   └── admin/       # Admin panel components
│   ├── pages/           # Route components
│   ├── hooks/           # Custom React hooks
│   ├── context/         # React contexts for state
│   ├── utils/           # Helper functions
│   ├── services/        # API and storage services
│   ├── types/           # TypeScript definitions
│   └── data/            # Mock data and seeds
└── tests/               # Test files
    ├── unit/            # Unit tests
    ├── integration/     # Integration tests
    ├── coverage/        # Test coverage reports
    └── *.config.ts      # Test configurations
```

## Available Scripts

```bash
# Development
npm run dev          # Start dev server

# Building
npm run build        # Build for production
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run ESLint
npm run typecheck    # Run TypeScript checks
npm run format       # Format code with Prettier

# Testing
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
npm run coverage     # Generate coverage report
```

## Admin CMS Setup

### First-Time Access
1. Navigate to `http://localhost:5176/admin/login`
2. Create your admin account using the setup wizard
3. Use the seeded credentials or create new ones

### Daily Operations
- **Dashboard**: Overview of properties, enquiries, and system status
- **Properties**: Add/edit resort properties and room configurations
- **Enquiries**: Manage guest bookings and communications
- **Media**: Upload and organize property photos
- **Settings**: Configure contact info and site details

For detailed admin instructions, see [ADMIN_GUIDE.md](./ADMIN_GUIDE.md).

## Development Guidelines

### Component Development
- Use functional components with TypeScript
- Follow the established file structure and naming conventions
- Implement proper error handling and loading states
- Use React Hook Form + Zod for form validation

### State Management
- Use React Context for global state
- Leverage localStorage for data persistence
- Implement proper TypeScript typing throughout

### Styling
- Use Tailwind CSS utility classes
- Follow mobile-first responsive design
- Maintain consistent spacing and color schemes

## Testing

The project includes comprehensive testing setup:
- Unit tests for components and utilities
- Integration tests for user flows
- Security testing for authentication and validation

```bash
# Run all tests
npm run test

# Run tests with coverage
npm run test:coverage
```

## Security Features

- **Authentication**: Secure login with rate limiting
- **Input Validation**: Zod schemas for all user inputs
- **XSS Protection**: Input sanitization with DOMPurify
- **Security Headers**: CSP and other security headers
- **Audit Logging**: Comprehensive security event tracking

## Deployment

### Production Build
```bash
npm run build
```

The build output will be in the `build/dist/` directory, ready for deployment to any static hosting service.

### Environment Variables for Production
Set all required environment variables in your hosting environment:
- Contact information
- API keys for external services
- Admin credentials

## Contributing

1. Follow the established code style and patterns
2. Add appropriate tests for new features
3. Update documentation as needed
4. Ensure all tests pass before submitting

## Support

For development questions or issues:
- Check [DEVELOPMENT.md](./DEVELOPMENT.md) for detailed guides
- Review [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for common issues
- Check the browser console for technical errors

## License

This project is proprietary and confidential.
