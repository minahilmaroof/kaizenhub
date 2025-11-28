import apiClient from './client';
import { ENDPOINTS } from './config';

export const foodService = {
  // Get all food items
  getFoodItems: async (type = null) => {
    const params = type ? { type } : {};
    const response = await apiClient.get(ENDPOINTS.FOOD.ITEMS, params);
    return response;
  },

  // Get single food item details
  getFoodItemDetails: async (itemId) => {
    const response = await apiClient.get(ENDPOINTS.FOOD.ITEM_DETAIL(itemId));
    return response;
  },
};

export const ordersService = {
  // Get user's orders
  getOrders: async (status = null) => {
    const params = status ? { status } : {};
    const response = await apiClient.get(ENDPOINTS.ORDERS.LIST, params);
    return response;
  },

  // Create a new order
  createOrder: async (orderData) => {
    // orderData: { items: [{ food_item_id, quantity }], delivery_location, notes, payment_method }
    // payment_method: 'wallet' | 'invoice' | 'cash'
    const response = await apiClient.post(ENDPOINTS.ORDERS.CREATE, orderData);
    return response;
  },

  // Get order details
  getOrderDetails: async (orderId) => {
    const response = await apiClient.get(ENDPOINTS.ORDERS.DETAIL(orderId));
    return response;
  },

  // Cancel order
  cancelOrder: async (orderId) => {
    const response = await apiClient.post(ENDPOINTS.ORDERS.CANCEL(orderId));
    return response;
  },
};

export default { foodService, ordersService };

