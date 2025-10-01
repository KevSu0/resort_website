# Wayanad Nature Resorts

A modern, responsive resort booking website built with React, TypeScript, and Vite.

## Features

- **Property browsing** with detailed information and photo galleries
- **Room type selection** with pricing and availability
- **Booking enquiry system** with instant confirmation
- **Contact forms** with WhatsApp integration
- **Mobile-responsive design** optimized for all devices

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Forms**: React Hook Form + Zod validation
- **State Management**: React Context + localStorage
- **Build Tools**: Vite, ESLint
- **Testing**: Jest + React Testing Library

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
VITE_SITE_EMAIL_FROM=kevinjoy0@gmail.com
VITE_WHATSAPP_CONTACT_NUMBER=+919567068535

# API Keys (leave empty for local storage development)
VITE_RESEND_API_KEY=
VITE_HCAPTCHA_SITE_KEY=
VITE_HCAPTCHA_SECRET_KEY=
VITE_CLOUDINARY_CLOUD_NAME=
VITE_CLOUDINARY_API_KEY=
VITE_CLOUDINARY_API_SECRET=
```

### Development

```bash
# Start development server
npm run dev

# Application will be available at:
# http://localhost:5176
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
│   │   ├── property/    # Property cards, galleries
│   │   ├── ui/          # UI components (buttons, cards, etc.)
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
npm run verify       # Run lint + test + build

# Testing
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
npm run coverage     # Generate coverage report
```


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

```bash
# Run all tests
npm run test

# Run tests with coverage
npm run test:coverage
```

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
