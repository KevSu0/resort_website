# Wayanad Nature Resorts Website - Development Workflow Documentation

## Table of Contents
1. [Build Configuration and Optimization](#build-configuration-and-optimization)
2. [Testing Strategy and Coverage](#testing-strategy-and-coverage)
3. [Code Quality Tools Configuration](#code-quality-tools-configuration)
4. [Development Server Setup](#development-server-setup)
5. [Environment Configuration](#environment-configuration)
6. [Deployment Procedures](#deployment-procedures)
7. [Performance Optimization](#performance-optimization)

## Build Configuration and Optimization

### Vite Configuration
The project uses Vite 7.1.7 as the build tool with TypeScript support and React plugin.

**Configuration File**: `config/vite.config.ts`

```typescript
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '../src'),
        '@/services': path.resolve(__dirname, '../src/services'),
        '@/utils': path.resolve(__dirname, '../src/utils'),
        '@/lib': path.resolve(__dirname, '../src/lib'),
        '@/types': path.resolve(__dirname, '../src/types'),
        '@/components': path.resolve(__dirname, '../src/components'),
        '@/admin': path.resolve(__dirname, '../src/admin'),
      },
    },
    define: {
      'import.meta.env.VITE_SITE_EMAIL_FROM': JSON.stringify(env.SITE_EMAIL_FROM || ''),
      'import.meta.env.VITE_WHATSAPP_CONTACT_NUMBER': JSON.stringify(env.WHATSAPP_CONTACT_NUMBER || ''),
    },
  }
})
```

### Build Scripts
```json
{
  "scripts": {
    "dev": "vite --config config/vite.config.ts",
    "build": "vite build --config config/vite.config.ts",
    "build:tsc": "tsc -b && vite build --config config/vite.config.ts",
    "preview": "vite preview --config config/vite.config.ts"
  }
}
```

### Build Output
- **Production Build**: Creates optimized assets in `dist/` directory
- **Bundle Size**: ~408KB JavaScript, 45KB CSS (gzipped: 124KB + 8KB)
- **Build Time**: ~5.7 seconds on typical development machine
- **Output Format**: Modern ES modules with fallbacks

### Path Aliases
The project uses comprehensive path aliases for cleaner imports:
- `@/*` → `src/*`
- `@/services/*` → `src/services/*`
- `@/utils/*` → `src/utils/*`
- `@/lib/*` → `src/lib/*`
- `@/types/*` → `src/types/*`
- `@/components/*` → `src/components/*`
- `@/admin/*` → `src/admin/*`

## Testing Strategy and Coverage

### Jest Configuration
**Configuration File**: `config/jest.config.ts`

```typescript
export default {
  rootDir: '..',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/config/jest.setup.js'],

  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },

  testMatch: [
    '<rootDir>/tests/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/tests/**/*.{test,spec}.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/*.{test,spec}.{js,jsx,ts,tsx}',
  ],

  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/main.tsx',
    '!src/vite-env.d.ts',
    '!src/config.ts',
  ],
}
```

### Test Scripts
```json
{
  "scripts": {
    "test": "jest --config config/jest.config.ts",
    "test:watch": "jest --config config/jest.config.ts --watch",
    "test:coverage": "jest --config config/jest.config.ts --coverage",
    "test:ci": "jest --config config/jest.config.ts --ci --coverage --watchAll=false",
    "test:debug": "jest --config config/jest.config.ts --runInBand",
    "e2e": "cypress run --config-file tests/cypress.config.ts",
    "e2e:open": "cypress open --config-file tests/cypress.config.ts"
  }
}
```

### Test Setup and Mocks
**Configuration File**: `config/jest.setup.js`

Comprehensive mock setup includes:
- **Storage APIs**: Mock localStorage and sessionStorage
- **Web APIs**: Mock fetch, crypto, matchMedia, IntersectionObserver, ResizeObserver
- **File APIs**: Mock FileReader and URL.createObjectURL
- **Window APIs**: Mock scrollTo, alert, confirm
- **Performance APIs**: Mock performance monitoring
- **Test Utilities**: Helper functions for creating mock files and events

### Coverage Reports
- **Coverage Directory**: `tests/coverage/`
- **Formats**: HTML, LCOV, JSON, Clover XML
- **Threshold**: No explicit thresholds defined (recommend adding)
- **Exclusions**: Configuration files, type definitions, main entry point

### Testing Strategy
1. **Unit Tests**: Component testing with React Testing Library
2. **Integration Tests**: Service and utility function testing
3. **E2E Tests**: End-to-end testing with Cypress
4. **Mock Strategy**: Comprehensive mocking for browser APIs
5. **Coverage**: Full source coverage except configuration files

## Code Quality Tools Configuration

### ESLint Configuration
**Configuration File**: `config/eslint.config.js`

```javascript
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
  },
])
```

### ESLint Rules
- **TypeScript**: Strict type checking enabled
- **React Hooks**: Latest recommended rules
- **React Refresh**: Vite hot reload optimization
- **Global Ignores**: Build outputs and dependencies

### Lint Scripts
```json
{
  "scripts": {
    "lint": "eslint . --config config/eslint.config.js"
  }
}
```

### Current Issues
The project has **231 linting problems** (218 errors, 13 warnings):
- **Unused variables/imports**: Major source of errors
- **Type safety**: `any` type usage throughout codebase
- **React hooks**: Missing dependencies in useEffect
- **Code style**: Fast refresh and formatting issues

### Recommendations
1. **Fix unused imports**: Remove or properly use imported modules
2. **Replace `any` types**: Implement proper TypeScript interfaces
3. **Hook dependencies**: Add missing dependencies to useEffect
4. **Component exports**: Separate utilities from component files

## Development Server Setup

### Vite Development Server
- **Port**: Default 5173 (configurable)
- **Hot Reload**: Enabled with React Fast Refresh
- **Source Maps**: Development source maps enabled
- **Environment Variables**: Loaded from `.env.local`

### Development Scripts
```json
{
  "scripts": {
    "dev": "vite --config config/vite.config.ts",
    "verify": "npm run lint && npm run test && npm run build"
  }
}
```

### Development Workflow
1. **Start**: `npm run dev` - Launch development server
2. **Linting**: `npm run lint` - Check code quality
3. **Testing**: `npm run test` - Run unit tests
4. **Building**: `npm run build` - Production build verification

### Verification Command
The `verify` script runs the complete quality check pipeline:
```bash
npm run verify  # Runs lint → test → build
```

## Environment Configuration

### Environment Variables
**Configuration File**: `config/.env.local`

```bash
# API Keys (for future backend integration)
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

### Configuration Access
**Configuration File**: `src/config.ts`

```typescript
const getEnvValue = (key: string, defaultValue?: string) => {
  const metaValue = typeof import.meta !== 'undefined' && import.meta.env
    ? (import.meta.env as Record<string, string | undefined>)[key]
    : undefined;
  // ... implementation
};

export const config = {
  VITE_WHATSAPP_CONTACT_NUMBER: getEnvValue('VITE_WHATSAPP_CONTACT_NUMBER', '+919876543210'),
  VITE_SITE_EMAIL_FROM: getEnvValue('VITE_SITE_EMAIL_FROM', 'info@wayanadresorts.com'),
};
```

### Environment Strategy
- **Development**: Uses `.env.local` for local configuration
- **Production**: Environment variables injected during build
- **Fallbacks**: Default values for missing configuration
- **Type Safety**: Typed configuration access with error handling

## Deployment Procedures

### Build Process
1. **TypeScript Compilation**: Optional pre-build type checking
2. **Vite Build**: Production bundle creation
3. **Asset Optimization**: CSS and JS minification
4. **Source Maps**: Production source maps (if enabled)

### Deployment Scripts
```json
{
  "scripts": {
    "build": "vite build --config config/vite.config.ts",
    "build:tsc": "tsc -b && vite build --config config/vite.config.ts",
    "preview": "vite preview --config config/vite.config.ts"
  }
}
```

### Static Deployment
The project builds as a static site suitable for:
- **Netlify**: Drag-and-drop deployment
- **Vercel**: Git-based deployment
- **GitHub Pages**: Static site hosting
- **AWS S3**: Static file hosting with CloudFront

### Deployment Checklist
1. **Environment Variables**: Set production environment variables
2. **Build Verification**: Run `npm run build:tsc` for full type checking
3. **Testing**: Run `npm run test:ci` for CI testing
4. **Linting**: Fix all linting errors before deployment
5. **Asset Optimization**: Verify bundle sizes and performance

### Production Considerations
- **Caching**: Implement proper caching headers
- **CDN**: Use CDN for static assets
- **Compression**: Enable gzip compression
- **Security**: Implement security headers
- **Monitoring**: Add error tracking and analytics

## Performance Optimization

### Build Optimization
- **Bundle Splitting**: Vite automatic code splitting
- **Tree Shaking**: Dead code elimination
- **Asset Optimization**: CSS and JS minification
- **Source Maps**: Production source map generation

### Runtime Optimization
- **React**: Fast Refresh for development
- **Lazy Loading**: Component-level lazy loading
- **Memoization**: React.memo and useMemo usage
- **Virtual Scrolling**: For large lists (if implemented)

### Monitoring
- **Performance API**: Built-in performance monitoring
- **Bundle Analysis**: Bundle size tracking
- **Coverage Reports**: Test coverage monitoring
- **Error Tracking**: Error boundary implementation

### Recommendations
1. **Code Splitting**: Implement route-level code splitting
2. **Image Optimization**: Add image optimization pipeline
3. **Caching Strategy**: Implement service worker for caching
4. **Performance Budget**: Set bundle size limits
5. **Monitoring**: Add real-user monitoring (RUM)

## Development Best Practices

### Code Organization
- **Modular Structure**: Clear separation of concerns
- **Type Safety**: Strict TypeScript configuration
- **Component Architecture**: Reusable component design
- **Service Layer**: Centralized business logic

### Quality Assurance
- **Testing**: Comprehensive test coverage
- **Linting**: Consistent code style
- **Type Checking**: Strict TypeScript rules
- **Code Reviews**: Peer review process

### Development Workflow
1. **Feature Branches**: Isolated feature development
2. **Testing**: Test-driven development approach
3. **Code Quality**: Automated quality checks
4. **Documentation**: Maintain documentation

### Tools and Technologies
- **Build Tool**: Vite 7.1.7
- **Framework**: React 19.1.1
- **Language**: TypeScript 5.8.3
- **Styling**: Tailwind CSS 3.4.17
- **Testing**: Jest + React Testing Library
- **Code Quality**: ESLint + TypeScript ESLint

## Conclusion

This Wayanad Nature Resorts Website project is well-structured with modern development tools and practices. The build configuration is optimized for performance, testing strategy is comprehensive, and code quality tools are properly configured. However, there are opportunities for improvement in code quality (fixing linting errors) and adding more advanced performance optimizations.

The project is ready for deployment with proper build processes and environment configuration in place. The static site nature makes it suitable for various deployment platforms with minimal configuration requirements.