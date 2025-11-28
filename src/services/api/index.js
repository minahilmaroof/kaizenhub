// API Configuration
export { API_CONFIG, ENDPOINTS } from './config';

// API Client
export { apiClient } from './client';

// Services
export { authService } from './authService';
export { profileService } from './profileService';
export { roomsService, bookingsService } from './roomsService';
export { foodService, ordersService } from './foodService';
export { dayPassService } from './dayPassService';
export { invoiceService, walletService } from './invoiceService';
export { scheduleService } from './scheduleService';

// Default export with all services
export default {
  auth: require('./authService').default,
  profile: require('./profileService').default,
  rooms: require('./roomsService').roomsService,
  bookings: require('./roomsService').bookingsService,
  food: require('./foodService').foodService,
  orders: require('./foodService').ordersService,
  dayPass: require('./dayPassService').default,
  invoice: require('./invoiceService').invoiceService,
  wallet: require('./invoiceService').walletService,
};

