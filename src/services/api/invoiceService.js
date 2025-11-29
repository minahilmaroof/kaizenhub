import apiClient from './client';
import { ENDPOINTS } from './config';

export const invoiceService = {
  // Get all invoices
  getInvoices: async (params = {}) => {
    // params: { page, per_page, status }
    const response = await apiClient.get(ENDPOINTS.INVOICES.LIST, params);
    return response;
  },

  // Get invoice details
  getInvoiceDetails: async (invoiceId) => {
    const response = await apiClient.get(ENDPOINTS.INVOICES.DETAIL(invoiceId));
    return response;
  },

  // Download invoice PDF - returns the PDF URL or blob
  downloadInvoice: async (invoiceId) => {
    // For React Native, we'll get the PDF URL or fetch it as base64
    // The API should return either a URL or the PDF data
    const response = await apiClient.get(ENDPOINTS.INVOICES.DOWNLOAD(invoiceId));
    return response;
  },
};

export const walletService = {
  // Get wallet balance
  getBalance: async () => {
    const response = await apiClient.get(ENDPOINTS.WALLET.BALANCE);
    return response;
  },

  // Get wallet transactions
  getTransactions: async (params = {}) => {
    // params: { page, per_page }
    const response = await apiClient.get(ENDPOINTS.WALLET.TRANSACTIONS, params);
    return response;
  },
};

export default { invoiceService, walletService };

