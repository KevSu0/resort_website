// Color palette definitions for the admin application

export const colorSchemes = {
  blue: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a'
  },
  green: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d'
  },
  purple: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7',
    600: '#9333ea',
    700: '#7c3aed',
    800: '#6b21a8',
    900: '#581c87'
  },
  red: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d'
  }
};

// Semantic colors
export const semanticColors = {
  success: {
    light: '#22c55e',
    dark: '#4ade80'
  },
  warning: {
    light: '#f59e0b',
    dark: '#fbbf24'
  },
  error: {
    light: '#ef4444',
    dark: '#f87171'
  },
  info: {
    light: '#3b82f6',
    dark: '#60a5fa'
  }
};

// Gray scale for neutral colors
export const gray = {
  50: '#f9fafb',
  100: '#f3f4f6',
  200: '#e5e7eb',
  300: '#d1d5db',
  400: '#9ca3af',
  500: '#6b7280',
  600: '#4b5563',
  700: '#374151',
  800: '#1f2937',
  900: '#111827'
};

// CSS variables for dynamic theming
export const generateCSSVariables = (scheme: keyof typeof colorSchemes) => {
  const colors = colorSchemes[scheme];

  return `
    :root {
      --color-primary-50: ${colors[50]};
      --color-primary-100: ${colors[100]};
      --color-primary-200: ${colors[200]};
      --color-primary-300: ${colors[300]};
      --color-primary-400: ${colors[400]};
      --color-primary-500: ${colors[500]};
      --color-primary-600: ${colors[600]};
      --color-primary-700: ${colors[700]};
      --color-primary-800: ${colors[800]};
      --color-primary-900: ${colors[900]};

      --color-success-light: ${semanticColors.success.light};
      --color-success-dark: ${semanticColors.success.dark};
      --color-warning-light: ${semanticColors.warning.light};
      --color-warning-dark: ${semanticColors.warning.dark};
      --color-error-light: ${semanticColors.error.light};
      --color-error-dark: ${semanticColors.error.dark};
      --color-info-light: ${semanticColors.info.light};
      --color-info-dark: ${semanticColors.info.dark};

      --color-gray-50: ${gray[50]};
      --color-gray-100: ${gray[100]};
      --color-gray-200: ${gray[200]};
      --color-gray-300: ${gray[300]};
      --color-gray-400: ${gray[400]};
      --color-gray-500: ${gray[500]};
      --color-gray-600: ${gray[600]};
      --color-gray-700: ${gray[700]};
      --color-gray-800: ${gray[800]};
      --color-gray-900: ${gray[900]};
    }
  `;
};