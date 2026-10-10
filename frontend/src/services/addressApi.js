import apiClient from '../api/apiClient';

export const addressApi = {
  list: () => apiClient.get('/api/v1/customers/me/addresses').then((r) => r.data),
  create: (payload) => apiClient.post('/api/v1/customers/me/addresses', payload).then((r) => r.data),
  update: (id, payload) => apiClient.put(`/api/v1/customers/me/addresses/${id}`, payload).then((r) => r.data),
  remove: (id) => apiClient.delete(`/api/v1/customers/me/addresses/${id}`).then((r) => r.data),
};
