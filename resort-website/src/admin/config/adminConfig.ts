// Admin configuration
export const ADMIN_CONFIG = {
  // Disable authentication for development/testing
  DISABLE_AUTH: false,

  // Show development mode indicator
  SHOW_DEV_MODE: true,

  // Feature flags
  FEATURE_FLAGS: {
    // Allow map embedding (default: false for v1 to avoid network calls)
    ALLOW_MAP_EMBED: false,

    // Enable internationalization (default: false for v1)
    ENABLE_I18N: false,

    // Enable analytics (default: counts-only for v1)
    ENABLE_ANALYTICS: true,

    // Enable video upload (default: true for v1)
    ENABLE_VIDEO_UPLOAD: true,

    // Show development features
    SHOW_DEV_MODE: true,
  } as const,

  // Default admin user for development
  DEFAULT_ADMIN: {
    id: 'admin-dev-id',
    username: 'admin',
    email: 'admin@wayanad-nature-resort.local',
    name: 'Developer Admin',
    role: 'ADMIN' as const,
  }
} as const;