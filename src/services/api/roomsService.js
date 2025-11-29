import apiClient from './client';
import { ENDPOINTS } from './config';

export const roomsService = {
  // Get all rooms
  getRooms: async (filters = {}) => {
    // filters: { type, min_capacity, max_capacity }
    const response = await apiClient.get(ENDPOINTS.ROOMS.LIST, filters);
    return response;
  },

  // Get available rooms for a time slot
  getAvailableRooms: async (date, startTime, endTime) => {
    const response = await apiClient.get(ENDPOINTS.ROOMS.AVAILABLE, {
      date,
      start_time: startTime,
      end_time: endTime,
    });
    return response;
  },

  // Get single room details
  getRoomDetails: async (roomId) => {
    const response = await apiClient.get(ENDPOINTS.ROOMS.DETAIL(roomId));
    return response;
  },
};

export const bookingsService = {
  // Get user's bookings
  getBookings: async (status = null) => {
    const params = status ? { status } : {};
    const response = await apiClient.get(ENDPOINTS.BOOKINGS.LIST, params);
    return response;
  },

  // Create a new booking
  createBooking: async (bookingData) => {
    // bookingData: { room_id, date, start_time, end_time, purpose, number_of_attendees, payment_method }
    // payment_method: 'wallet' | 'invoice' | 'cash'
    const response = await apiClient.post(ENDPOINTS.BOOKINGS.CREATE, bookingData);
    return response;
  },

  // Get booking details
  getBookingDetails: async (bookingId) => {
    const response = await apiClient.get(ENDPOINTS.BOOKINGS.DETAIL(bookingId));
    return response;
  },

  // Cancel booking
  cancelBooking: async (bookingId) => {
    const response = await apiClient.post(ENDPOINTS.BOOKINGS.CANCEL(bookingId));
    return response;
  },

  // Reschedule booking (Update booking)
  rescheduleBooking: async (bookingId, rescheduleData) => {
    // rescheduleData: { date, start_time, end_time }
    const response = await apiClient.put(ENDPOINTS.BOOKINGS.DETAIL(bookingId), rescheduleData);
    return response;
  },
};

export default { roomsService, bookingsService };

