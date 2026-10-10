import apiClient from '../api/apiClient';

export const orderApi = {
  create: (addressId) => apiClient.post('/api/v1/orders', { addressId }).then((r) => r.data),
  verifyPayment: (orderId, payload) =>
    apiClient.post(`/api/v1/orders/${orderId}/verify-payment`, payload).then((r) => r.data),
  list: (params) => apiClient.get('/api/v1/orders', { params }).then((r) => r.data),
  getById: (id) => apiClient.get(`/api/v1/orders/${id}`).then((r) => r.data),
  cancel: (id) => apiClient.post(`/api/v1/orders/${id}/cancel`).then((r) => r.data),
};
