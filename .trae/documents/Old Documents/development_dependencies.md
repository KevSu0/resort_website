# Development Dependencies and External Applications

## 🔧 Core Development Environment

### Node.js & Package Manager
- **Node.js**: v18+ (LTS recommended)
- **Package Manager**: npm (comes with Node.js) or yarn
- **Version Manager**: nvm (Node Version Manager) for managing Node.js versions

### Frontend Development Stack
- **React**: v18+ with TypeScript support
- **TypeScript**: v5+ for type safety
- **Vite**: v4+ as build tool and dev server
- **Tailwind CSS**: v3+ for styling
- **React Router**: v6+ for client-side routing

### Backend Services (BaaS)
- **Firebase**: v10+ (Firestore, Auth, Storage)
- **Web3Forms**: Contact form API service (no installation required)

### Required Software and Tools

#### 1. Node.js and Package Manager
```bash
# Required versions
Node.js: v18.17.0 or higher
npm: v9.6.7 or higher (or yarn v1.22.19+)

# Installation verification
node --version
npm --version
```

#### 2. Git Version Control
```bash
# Required version
Git: v2.40.0 or higher

# Installation verification
git --version
```

#### 3. Code Editor (Recommended)
```bash
# Primary recommendation
Visual Studio Code: v1.80.0 or higher

# Required VS Code Extensions:
- ES7+ React/Redux/React-Native snippets
- TypeScript Importer
- Prettier - Code formatter
- ESLint
- Tailwind CSS IntelliSense
- Firebase Explorer
- Jest Runner
- Cypress Snippets
- Auto Rename Tag
- Bracket Pair Colorizer
```

## Frontend Dependencies

### Core Framework and Build Tools
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "typescript": "^5.0.2",
    "vite": "^4.4.5"
  }
}
```

### UI and Styling Dependencies
```json
{
  "dependencies": {
    "tailwindcss": "^3.3.0",
    "@headlessui/react": "^1.7.15",
    "@heroicons/react": "^2.0.18",
    "framer-motion": "^10.12.16",
    "react-spring": "^9.7.1",
    "swiper": "^10.0.4",
    "react-intersection-observer": "^9.5.2"
  }
}
```

### Routing and Navigation
```json
{
  "dependencies": {
    "react-router-dom": "^6.14.1"
  }
}
```

### Form Handling and Validation
```json
{
  "dependencies": {
    "react-hook-form": "^7.45.1",
    "yup": "^1.2.0",
    "@hookform/resolvers": "^3.1.1",
    "react-datepicker": "^4.16.0",
    "react-select": "^5.7.4"
  }
}
```

### State Management
```json
{
  "dependencies": {
    "zustand": "^4.3.9",
    "@tanstack/react-query": "^4.29.19"
  }
}
```

### Utility Libraries
```json
{
  "dependencies": {
    "date-fns": "^2.30.0",
    "lodash": "^4.17.21",
    "clsx": "^2.0.0",
    "react-hot-toast": "^2.4.1",
    "react-helmet-async": "^1.3.0",
    "uuid": "^9.0.0"
  }
}
```

## Firebase and Backend Dependencies

### Firebase SDK
```json
{
  "dependencies": {
    "firebase": "^10.1.0",
    "@firebase/app": "^0.9.13",
    "@firebase/firestore": "^4.1.3",
    "@firebase/auth": "^1.2.0",
    "@firebase/storage": "^0.12.3",
    "@firebase/analytics": "^0.10.2",
    "@firebase/performance": "^0.6.3"
  }
}
```

### Firebase Development Tools
```json
{
  "devDependencies": {
    "firebase-tools": "^12.4.7",
    "@firebase/rules-unit-testing": "^2.0.7",
    "firebase-functions-test": "^3.1.0"
  }
}
```

## Analytics and SEO Dependencies

### Analytics Integration
```json
{
  "dependencies": {
    "@google-analytics/gtag": "^1.0.0",
    "react-ga4": "^2.1.0",
    "web-vitals": "^3.3.2",
    "@vercel/analytics": "^1.0.1"
  }
}
```

### SEO and Meta Management
```json
{
  "dependencies": {
    "react-helmet-async": "^1.3.0",
    "schema-dts": "^1.1.2",
    "@types/schema-org": "^1.0.0"
  }
}
```

## Development Dependencies

### TypeScript and Type Definitions
```json
{
  "devDependencies": {
    "@types/react": "^18.2.15",
    "@types/react-dom": "^18.2.7",
    "@types/node": "^20.4.5",
    "@types/lodash": "^4.14.195",
    "@types/uuid": "^9.0.2",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0"
  }
}
```

### Code Quality and Formatting
```json
{
  "devDependencies": {
    "eslint": "^8.45.0",
    "eslint-plugin-react": "^7.32.2",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.3",
    "prettier": "^3.0.0",
    "prettier-plugin-tailwindcss": "^0.4.1",
    "husky": "^8.0.3",
    "lint-staged": "^13.2.3"
  }
}
```

### Testing Framework
```json
{
  "devDependencies": {
    "jest": "^29.6.1",
    "@testing-library/react": "^13.4.0",
    "@testing-library/jest-dom": "^5.17.0",
    "@testing-library/user-event": "^14.4.3",
    "jest-environment-jsdom": "^29.6.1",
    "cypress": "^12.17.2",
    "@cypress/react": "^7.0.3",
    "msw": "^1.2.2",
    "@types/jest": "^29.5.3"
  }
}
```

### Build and Optimization Tools
```json
{
  "devDependencies": {
    "@vitejs/plugin-react": "^4.0.3",
    "vite-plugin-pwa": "^0.16.4",
    "vite-plugin-windicss": "^1.9.1",
    "rollup-plugin-visualizer": "^5.9.2",
    "vite-bundle-analyzer": "^0.7.0"
  }
}
```

## External Services and APIs

### Required External Services

#### 1. Firebase Project Setup
```bash
# Firebase Console Configuration
1. Create Firebase project at https://console.firebase.google.com
2. Enable Authentication (Email/Password for admin)
3. Create Firestore database
4. Set up Firebase Storage
5. Configure Firebase Analytics
6. Set up Firebase Performance Monitoring

# Required Firebase Configuration
Project ID: wayanad-resort-website
Region: asia-south1 (Mumbai)
Storage Bucket: wayanad-resort-website.appspot.com
```

#### 2. Google Services Integration
```bash
# Google Analytics 4
Property ID: G-XXXXXXXXXX
Measurement ID: Required for tracking

# Google Search Console
Website verification required
Sitemap submission: /sitemap.xml

# Google My Business
Business listing verification
Review management integration
```

#### 3. Domain and Hosting
```bash
# Domain Requirements
Primary Domain: wayanadtreehouses.com (example)
SSL Certificate: Required (Let's Encrypt or commercial)

# Hosting Options
Recommended: Vercel, Netlify, or Firebase Hosting
CDN: Cloudflare (recommended for performance)
```

### Optional External Services

#### 1. Email Service: Web3Forms (PRIMARY)
```bash
# Web3Forms ⭐ SELECTED
# Features: 250 submissions/month, simple HTML form integration
# Setup: Access key only - no registration required
# Website: https://web3forms.com/
# Pricing: 100% FREE (250 submissions/month)

# Key Benefits:
# - Built-in spam protection (honeypot + hCaptcha)
# - Custom redirect pages
# - No backend code required
# - Amazon Cloud powered
# - GDPR compliant
# - Perfect for resort booking enquiries

# Integration Example:
# <form action="https://api.web3forms.com/submit" method="POST">
#   <input type="hidden" name="access_key" value="YOUR_ACCESS_KEY">
#   <!-- Form fields -->
# </form>

# Configuration:
# Access Key: Get from https://web3forms.com/
# Redirect URL: Custom thank you page
# Email Template: Customizable via form fields
```

#### 2. SMS Services
```bash
# SMS Providers (optional)
Twilio: For SMS notifications
Textlocal: India-specific SMS service

# Use Cases
Booking confirmations
Admin notifications
Customer updates
```

#### 3. Payment Integration (Future)
```bash
# Payment Gateways (for future implementation)
Razorpay: Primary for Indian market
Stripe: International payments
PayU: Alternative payment gateway
```

## Development Tools and Browser Extensions

### Required Browser Extensions

#### Chrome Extensions
```bash
# Development Extensions
React Developer Tools
Redux DevTools (if using Redux)
Firebase DevTools
Lighthouse
Web Vitals
ColorZilla
WhatFont
JSON Viewer
```

#### Firefox Extensions
```bash
# Development Extensions
React Developer Tools
Firefox Developer Edition (recommended)
Web Developer Toolbar
```

### Desktop Applications

#### Design and Asset Tools
```bash
# Image Optimization
ImageOptim (macOS) / TinyPNG (web)
Squoosh (web-based)

# Design Tools (optional)
Figma (web-based)
Adobe Photoshop (for image editing)
Canva (for quick graphics)
```

#### Database Management
```bash
# Firebase Management
Firebase Console (web-based)
Firestore Rules Playground

# Alternative Database Tools
NoSQL Booster (MongoDB GUI)
Robo 3T (MongoDB GUI)
```

## Environment Configuration

### Environment Variables
```bash
# .env.local file structure
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# Analytics
VITE_GA_TRACKING_ID=G-XXXXXXXXXX
VITE_GTM_ID=GTM-XXXXXXX

# API Keys (optional)
VITE_WEB3FORMS_ACCESS_KEY=your_access_key_from_web3forms

# Development
VITE_APP_ENV=development
VITE_API_BASE_URL=http://localhost:5173
```

### Configuration Files

#### Package.json Scripts
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:e2e": "cypress open",
    "test:e2e:headless": "cypress run",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "lint:fix": "eslint . --ext ts,tsx --fix",
    "format": "prettier --write \"src/**/*.{ts,tsx,js,jsx,json,css,md}\"",
    "type-check": "tsc --noEmit",
    "firebase:emulators": "firebase emulators:start",
    "firebase:deploy": "firebase deploy",
    "analyze": "npm run build && npx vite-bundle-analyzer dist/stats.html"
  }
}
```

#### Vite Configuration
```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,webp}']
      }
    })
  ],
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          firebase: ['firebase/app', 'firebase/firestore', 'firebase/auth']
        }
      }
    }
  }
});
```

#### Tailwind Configuration
```javascript
// tailwind.config.js
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'forest-green': '#2d5016',
        'sunset-orange': '#ff8c00',
        'natural-beige': '#f5f5dc',
        'charcoal': '#333333',
        'leaf-green': '#90ee90'
      },
      fontFamily: {
        'montserrat': ['Montserrat', 'sans-serif'],
        'open-sans': ['Open Sans', 'sans-serif']
      }
    }
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio')
  ]
};
```

## Installation and Setup Guide

### Step-by-Step Installation

#### 1. Initial Setup
```bash
# Clone repository
git clone <repository-url>
cd resort-website

# Install Node.js dependencies
npm install

# Install global tools
npm install -g firebase-tools
npm install -g @cypress/cli
```

#### 2. Firebase Setup
```bash
# Login to Firebase
firebase login

# Initialize Firebase project
firebase init

# Select features:
# - Firestore
# - Authentication
# - Storage
# - Hosting
# - Analytics
```

#### 3. Environment Configuration
```bash
# Copy environment template
cp .env.example .env.local

# Edit .env.local with your Firebase configuration
# Get config from Firebase Console > Project Settings
```

#### 4. Development Server
```bash
# Start development server
npm run dev

# Start Firebase emulators (optional)
npm run firebase:emulators

# Run tests
npm run test
```

### Verification Checklist

#### Development Environment
- [ ] Node.js v18+ installed
- [ ] npm/yarn package manager working
- [ ] Git version control configured
- [ ] VS Code with required extensions
- [ ] Firebase CLI installed and authenticated

#### Project Setup
- [ ] All npm dependencies installed
- [ ] Environment variables configured
- [ ] Firebase project connected
- [ ] Development server starts successfully
- [ ] Hot reload working

#### Testing Environment
- [ ] Jest tests run successfully
- [ ] Cypress E2E tests configured
- [ ] Test coverage reports generated
- [ ] Firebase emulators working

#### Build and Deployment
- [ ] Production build completes
- [ ] Bundle analysis shows optimized chunks
- [ ] Firebase deployment successful
- [ ] Domain and SSL configured

## Performance Optimization Tools

### Build Analysis
```bash
# Bundle analysis tools
npm install --save-dev webpack-bundle-analyzer
npm install --save-dev rollup-plugin-visualizer

# Performance monitoring
npm install web-vitals
npm install @vercel/analytics
```

### Image Optimization
```bash
# Image optimization tools
npm install --save-dev imagemin
npm install --save-dev imagemin-webp
npm install --save-dev vite-plugin-imagemin
```

### SEO Tools
```bash
# SEO analysis tools
npm install --save-dev lighthouse
npm install --save-dev @lhci/cli

# Schema markup
npm install schema-dts
npm install react-schemaorg
```

## Monitoring and Analytics Setup

### Required Monitoring Tools
```bash
# Error tracking (choose one)
Sentry: Error monitoring and performance
Bugsnag: Alternative error tracking
Rollbar: Error tracking service

# Performance monitoring
Google Analytics 4: User behavior tracking
Google Search Console: SEO monitoring
Firebase Performance: App performance
Web Vitals: Core web vitals tracking
```

### Analytics Configuration
```typescript
// Analytics setup example
import { getAnalytics, logEvent } from 'firebase/analytics';
import { initializeApp } from 'firebase/app';

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Track custom events
logEvent(analytics, 'booking_enquiry_submitted', {
  accommodation_type: 'tree_house',
  duration: 3,
  guests: 2
});
```

This comprehensive setup ensures all necessary dependencies and tools are available for developing, testing, and deploying the Wayanad Tree House Resort website with 85-90% test coverage and optimal performance.