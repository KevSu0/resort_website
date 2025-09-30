/**
 * Centralized error messages with user-friendly copy and recovery suggestions
 */

export interface ErrorConfig {
  title: string;
  message: string;
  suggestion: string;
  technicalCode?: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  recoveryActions?: {
    label: string;
    action: () => void;
    primary?: boolean;
  }[];
}

// Error codes and their configurations
export const ERROR_CONFIGS: Record<string, ErrorConfig> = {
  // Authentication errors
  'AUTH_001': {
    title: 'Login Failed',
    message: 'We couldn\'t verify your credentials. Please check your username and password.',
    suggestion: 'Make sure Caps Lock is off and your password is correct.',
    technicalCode: 'AUTH_001',
    severity: 'error',
    recoveryActions: [
      {
        label: 'Reset Password',
        action: () => { /* Navigate to password reset */ },
        primary: false,
      },
      {
        label: 'Try Again',
        action: () => { /* Clear form and focus */ },
        primary: true,
      },
    ],
  },

  'AUTH_002': {
    title: 'Session Expired',
    message: 'Your session has expired due to inactivity.',
    suggestion: 'Please log in again to continue.',
    technicalCode: 'AUTH_002',
    severity: 'warning',
    recoveryActions: [
      {
        label: 'Log In Again',
        action: () => { /* Redirect to login */ },
        primary: true,
      },
    ],
  },

  'AUTH_003': {
    title: 'Insufficient Permissions',
    message: 'You don\'t have permission to access this resource.',
    suggestion: 'Contact your administrator if you need access to this feature.',
    technicalCode: 'AUTH_003',
    severity: 'error',
  },

  // Storage errors
  'STORAGE_001': {
    title: 'Storage Full',
    message: 'You\'ve reached your storage limit.',
    suggestion: 'Delete unnecessary files or upgrade your storage plan.',
    technicalCode: 'STORAGE_001',
    severity: 'critical',
    recoveryActions: [
      {
        label: 'View Storage',
        action: () => { /* Navigate to storage management */ },
        primary: true,
      },
      {
        label: 'Upgrade Plan',
        action: () => { /* Navigate to billing */ },
        primary: false,
      },
    ],
  },

  'STORAGE_002': {
    title: 'Upload Failed',
    message: 'We couldn\'t upload your file.',
    suggestion: 'Check if the file is smaller than 10MB and try again.',
    technicalCode: 'STORAGE_002',
    severity: 'error',
    recoveryActions: [
      {
        label: 'Retry Upload',
        action: () => { /* Retry upload */ },
        primary: true,
      },
      {
        label: 'Choose Different File',
        action: () => { /* Open file picker */ },
        primary: false,
      },
    ],
  },

  // Network errors
  'NETWORK_001': {
    title: 'Connection Error',
    message: 'We\'re having trouble connecting to our servers.',
    suggestion: 'Check your internet connection and try again.',
    technicalCode: 'NETWORK_001',
    severity: 'error',
    recoveryActions: [
      {
        label: 'Retry',
        action: () => { /* Retry request */ },
        primary: true,
      },
    ],
  },

  'NETWORK_002': {
    title: 'Server Error',
    message: 'Something went wrong on our end.',
    suggestion: 'Please wait a moment and try again.',
    technicalCode: 'NETWORK_002',
    severity: 'critical',
    recoveryActions: [
      {
        label: 'Refresh Page',
        action: () => { /* Refresh page */ },
        primary: true,
      },
      {
        label: 'Report Issue',
        action: () => { /* Open support ticket */ },
        primary: false,
      },
    ],
  },

  // Form errors
  'FORM_001': {
    title: 'Invalid Data',
    message: 'Some information in your form is incorrect.',
    suggestion: 'Please review the highlighted fields and correct any errors.',
    technicalCode: 'FORM_001',
    severity: 'warning',
  },

  'FORM_002': {
    title: 'Required Fields Missing',
    message: 'Please fill in all required fields.',
    suggestion: 'Look for fields marked with a red asterisk (*).',
    technicalCode: 'FORM_002',
    severity: 'warning',
  },

  // File errors
  'FILE_001': {
    title: 'Invalid File Type',
    message: 'This file type isn\'t supported.',
    suggestion: 'Please use JPG, PNG, PDF, or DOC files.',
    technicalCode: 'FILE_001',
    severity: 'error',
  },

  'FILE_002': {
    title: 'File Too Large',
    message: 'This file exceeds the size limit.',
    suggestion: 'Files must be smaller than 10MB. Try compressing it.',
    technicalCode: 'FILE_002',
    severity: 'error',
  },

  // Generic errors
  'UNKNOWN_001': {
    title: 'Something Went Wrong',
    message: 'An unexpected error occurred.',
    suggestion: 'Please try again. If the problem persists, contact support.',
    technicalCode: 'UNKNOWN_001',
    severity: 'error',
    recoveryActions: [
      {
        label: 'Try Again',
        action: () => { /* Retry action */ },
        primary: true,
      },
      {
        label: 'Contact Support',
        action: () => { /* Open support */ },
        primary: false,
      },
    ],
  },
};

// Get error configuration by code or create a generic one
export const getErrorConfig = (code?: string, customMessage?: string): ErrorConfig => {
  if (code && ERROR_CONFIGS[code]) {
    const config = ERROR_CONFIGS[code];
    if (customMessage) {
      return { ...config, message: customMessage };
    }
    return config;
  }

  // Create a generic error with the provided message
  return {
    title: 'Error',
    message: customMessage || 'An error occurred.',
    suggestion: 'Please try again or contact support if the problem persists.',
    severity: 'error',
  };
};

// Map HTTP status codes to error configs
export const getErrorFromStatus = (status: number): ErrorConfig => {
  switch (status) {
    case 400:
      return getErrorConfig('FORM_001');
    case 401:
      return getErrorConfig('AUTH_001');
    case 403:
      return getErrorConfig('AUTH_003');
    case 404:
      return getErrorConfig('UNKNOWN_001', 'The requested resource was not found.');
    case 413:
      return getErrorConfig('FILE_002');
    case 429:
      return getErrorConfig('NETWORK_001', 'Too many requests. Please wait and try again.');
    case 500:
    case 502:
    case 503:
    case 504:
      return getErrorConfig('NETWORK_002');
    default:
      return getErrorConfig('UNKNOWN_001');
  }
};

// Error severity styles
export const getErrorStyles = (severity: ErrorConfig['severity']) => {
  switch (severity) {
    case 'info':
      return {
        container: 'bg-blue-50 border-blue-200',
        icon: 'text-blue-600',
        title: 'text-blue-800',
        message: 'text-blue-700',
        button: 'bg-blue-600 hover:bg-blue-700',
      };
    case 'warning':
      return {
        container: 'bg-yellow-50 border-yellow-200',
        icon: 'text-yellow-600',
        title: 'text-yellow-800',
        message: 'text-yellow-700',
        button: 'bg-yellow-600 hover:bg-yellow-700',
      };
    case 'error':
      return {
        container: 'bg-red-50 border-red-200',
        icon: 'text-red-600',
        title: 'text-red-800',
        message: 'text-red-700',
        button: 'bg-red-600 hover:bg-red-700',
      };
    case 'critical':
      return {
        container: 'bg-red-100 border-red-300',
        icon: 'text-red-700',
        title: 'text-red-900',
        message: 'text-red-800',
        button: 'bg-red-700 hover:bg-red-800',
      };
    default:
      return {
        container: 'bg-gray-50 border-gray-200',
        icon: 'text-gray-600',
        title: 'text-gray-800',
        message: 'text-gray-700',
        button: 'bg-gray-600 hover:bg-gray-700',
      };
  }
};

// Error logging helper
export const logError = (error: Error | string, context?: any, code?: string) => {
  const errorInfo = {
    message: error instanceof Error ? error.message : error,
    code,
    timestamp: new Date().toISOString(),
    context,
    stack: error instanceof Error ? error.stack : undefined,
  };

  // In production, send to error tracking service
  console.error('Error logged:', errorInfo);

  // For development, show detailed error
  if (process.env.NODE_ENV === 'development') {
    console.debug('Full error details:', errorInfo);
  }
};