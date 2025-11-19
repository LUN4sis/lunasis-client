export const MESSAGES = {
  // Notification
  NOTIFICATION: {
    SEND_SUCCESS: 'Notification sent successfully.',
    SEND_FAILED: 'Notification sending failed.',
    NOT_SUPPORTED: 'Push notifications are not supported in this browser.',
    PERMISSION_DENIED: 'Notification permission denied.',
    PERMISSION_GRANTED: 'Notification permission granted.',
  },

  // Auth
  AUTH: {
    LOGIN_SUCCESS: 'Login successful.',
    LOGIN_FAILED: 'Login failed.',
    LOGOUT_SUCCESS: 'Logout successful.',
    SESSION_EXPIRED: 'Session expired. Please login again.',
    UNAUTHORIZED: 'Authentication is required.',
  },

  // Common
  COMMON: {
    LOADING: 'Loading...',
    SAVE_SUCCESS: 'Save successful.',
    SAVE_FAILED: 'Save failed.',
    DELETE_SUCCESS: 'Delete successful.',
    DELETE_FAILED: 'Delete failed.',
    NETWORK_ERROR: 'Network error occurred.',
    UNKNOWN_ERROR: 'Unknown error occurred.',
  },

  // Validation
  VALIDATION: {
    REQUIRED: 'Required field.',
    INVALID_EMAIL: 'Please enter a valid email address.',
    INVALID_PASSWORD: 'Password must be at least 8 characters long.',
    PASSWORD_MISMATCH: 'Password does not match.',
    INVALID_FORMAT: 'Invalid format.',
  },
} as const;

export const CONFIRM_MESSAGES = {
  DELETE: 'Are you sure you want to delete?',
  LOGOUT: 'Are you sure you want to logout?',
  CANCEL: 'Are you sure you want to cancel? Your changes will be lost.',
  LEAVE: 'Are you sure you want to leave? Your changes will not be saved.',
} as const;
