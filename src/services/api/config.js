// API Configuration
export const API_CONFIG = {
  BASE_URL: 'https://4a9e53b59c2a.ngrok-free.app/api',
  TIMEOUT: 30000,
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
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
    PURCHASE: '/day-passes/purchase',
    MY_PASSES: '/day-passes',
  },
  
  // Invoices
  INVOICES: {
    LIST: '/invoices',
    DETAIL: (id) => `/invoices/${id}`,
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
};

export default API_CONFIG;

