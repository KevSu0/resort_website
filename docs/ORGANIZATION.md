# Project Organization Structure

This document outlines the reorganized file structure of the resort website project.

## Directory Structure

```
resort-website/
├── config/                     # Configuration files
│   ├── typescript/            # TypeScript configuration
│   │   ├── tsconfig.json
│   │   ├── tsconfig.app.json
│   │   ├── tsconfig.node.json
│   │   └── tsconfig.test.json
│   ├── eslint.config.js       # ESLint configuration
│   ├── jest.config.ts         # Jest testing configuration
│   ├── jest.polyfills.js      # Jest polyfills
│   ├── jest.setup.js          # Jest setup
│   ├── postcss.config.js      # PostCSS configuration
│   ├── tailwind.config.js     # Tailwind CSS configuration
│   ├── vite.config.ts         # Vite build configuration
│   └── babel.config.cjs       # Babel configuration
├── docs/                      # Documentation
│   ├── getting-started/       # Getting started guides
│   │   ├── DEVELOPMENT.md
│   │   └── TROUBLESHOOTING.md
│   ├── project/              # Project documentation
│   │   ├── PROJECT_DOCUMENTATION.md
│   │   ├── FEATURE_IMPLEMENTATION.md
│   │   ├── SPRINT_COMPLETION_SUMMARY.md
│   │   ├── user-stories.json
│   │   └── PROGRESS.md
│   ├── admin/                # Admin documentation
│   │   ├── ADMIN_DOCUMENTATION.md
│   │   ├── ADMIN_GUIDE.md
│   │   ├── ADMIN_IMPLEMENTATION_STATUS.md
│   │   └── ADMIN_STABILITY_PLAN.md
│   └── api/                  # API documentation (empty)
├── assets/                    # Static assets
│   ├── images/               # Image files
│   ├── videos/               # Video files
│   ├── icons/                # Icon files
│   └── media/                # General media files
├── tests/                     # Test files
│   ├── unit/                 # Unit tests (empty)
│   ├── integration/          # Integration tests (empty)
│   ├── cypress/              # E2E tests
│   └── coverage/             # Test coverage reports
├── build/                     # Build output
│   ├── dist/                 # Production build
│   └── reports/              # Build reports (empty)
├── tools/                     # Development tools
│   ├── scripts/              # Build and utility scripts
│   └── setup/                # Setup scripts (empty)
├── src/                       # Source code
├── public/                    # Public static files
├── data/                      # Data files
├── .claude/                   # Claude AI configuration
├── .github/                   # GitHub configuration
├── .githubworkflows/          # GitHub workflows
├── resort-website/            # Additional source files
├── package.json               # Project dependencies and scripts
├── package-lock.json          # Lock file
├── tsconfig.json              # Root TypeScript configuration
└── README.md                  # Project README
```

## Configuration Updates

### Package.json Scripts
All package.json scripts have been updated to use the new configuration file locations:

- `npm run dev`: Uses `config/vite.config.ts`
- `npm run build`: Uses `config/vite.config.ts`
- `npm run lint`: Uses `config/eslint.config.js`
- `npm run test`: Uses `config/jest.config.ts`
- `npm run e2e`: Uses `tests/cypress.config.ts`

### TypeScript Configuration
The root `tsconfig.json` now extends from `config/typescript/tsconfig.json` and includes path mappings for the new structure.

### Vite Configuration
Updated to resolve paths correctly from the new config/ directory location.

## Benefits of This Organization

1. **Clear Separation**: Configuration, documentation, assets, and source code are properly separated
2. **Scalability**: Easy to add new files to appropriate categories
3. **Maintainability**: Logical grouping makes it easier to find and update files
4. **Professional Structure**: Follows common project organization patterns
5. **Build Compatibility**: All build processes work correctly with the new structure

## Migration Notes

- All original functionality is preserved
- Build process works correctly with `npm run build`
- Some linting issues exist but are unrelated to the reorganization
- TypeScript compilation has some dependency issues but build process works via Vite

This organization provides a solid foundation for future development and maintenance of the resort website project.