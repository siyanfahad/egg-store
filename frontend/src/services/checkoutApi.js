import apiClient from '../api/apiClient';

export const checkoutApi = {
  summary: () => apiClient.post('/api/v1/checkout/summary').then((r) => r.data),
};
