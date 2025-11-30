// API Configuration
export const API_CONFIG = {
  BASE_URL: 'http://smartkaizenapp.onyxtec.io/api',
  STORAGE_BASE_URL: 'http://smartkaizenapp.onyxtec.io',
  TIMEOUT: 30000,
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};

// Helper function to get full image URL
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // If it starts with /, prepend storage base URL
  if (imagePath.startsWith('/')) {
    return `${API_CONFIG.STORAGE_BASE_URL}${imagePath}`;
  }
  
  // Otherwise, assume it's a relative path and prepend storage base URL with /
  return `${API_CONFIG.STORAGE_BASE_URL}/${imagePath}`;
};

// Helper function to check if image is the default user icon
export const isDefaultUserIcon = (imagePath) => {
  if (!imagePath) return true;
  const imageUrl = getImageUrl(imagePath);
  // Check if the URL contains the default user icon path
  return imageUrl && imageUrl.includes('/images/user-icon.svg');
};

export const ENDPOINTS = {
  // Authentication
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    SEND_OTP: '/auth/send-otp',
    VERIFY_OTP: '/auth/verify-otp',
    ADMIN_LOGIN: '/auth/admin/login',
    LOGOUT: '/auth/logout',
  },
  
  // User Profile
  PROFILE: {
    GET: '/profile',
    UPDATE: '/profile',
  },
  
  // Rooms
  ROOMS: {
    LIST: '/rooms',
    AVAILABLE: '/bookings/available-rooms',
    DETAIL: (id) => `/rooms/${id}`,
  },
  
  // Bookings
  BOOKINGS: {
    LIST: '/bookings',
    CREATE: '/bookings',
    DETAIL: (id) => `/bookings/${id}`,
    CANCEL: (id) => `/bookings/${id}/cancel`,
  },
  
  // Food
  FOOD: {
    ITEMS: '/food-items',
    ITEM_DETAIL: (id) => `/food-items/${id}`,
  },
  
  // Orders
  ORDERS: {
    LIST: '/orders',
    CREATE: '/orders',
    DETAIL: (id) => `/orders/${id}`,
    CANCEL: (id) => `/orders/${id}/cancel`,
  },
  
  // Day Passes
  DAY_PASSES: {
    CHECK: '/day-passes/check',
    PURCHASE: '/day-passes',
    MY_PASSES: '/day-passes',
  },
  
  // Invoices
  INVOICES: {
    LIST: '/invoices',
    DETAIL: (id) => `/invoices/${id}`,
    DOWNLOAD: (id) => `/invoices/${id}/download`,
  },
  
  // Wallet
  WALLET: {
    BALANCE: '/wallet/balance',
    TRANSACTIONS: '/wallet/transactions',
  },
  
  // Schedule
  SCHEDULE: {
    TODAY: '/schedule/today',
  },
  
  // Notifications
  NOTIFICATIONS: {
    LIST: '/notifications',
    UNREAD_COUNT: '/notifications/unread-count',
    RECENT: '/notifications/recent',
    MARK_READ: (id) => `/notifications/${id}/read`,
    MARK_ALL_READ: '/notifications/mark-all-read',
    DELETE: (id) => `/notifications/${id}`,
    CLEAR_READ: '/notifications/clear-read',
  },
};

export default API_CONFIG;

