import apiClient from './client';
import { ENDPOINTS } from './config';

export const dayPassService = {
  // Check day pass availability
  checkAvailability: async (date) => {
    const response = await apiClient.get(ENDPOINTS.DAY_PASSES.CHECK, { date });
    return response;
  },

  // Purchase a day pass
  purchaseDayPass: async (date, paymentMethod = 'wallet') => {
    // paymentMethod: 'wallet' | 'invoice' | 'cash'
    const response = await apiClient.post(ENDPOINTS.DAY_PASSES.PURCHASE, {
      date,
      payment_method: paymentMethod,
    });
    return response;
  },

  // Get user's day passes
  getMyPasses: async () => {
    const response = await apiClient.get(ENDPOINTS.DAY_PASSES.MY_PASSES);
    return response;
  },
};

export default dayPassService;

