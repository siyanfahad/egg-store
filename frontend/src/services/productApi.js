import apiClient from '../api/apiClient';

export const productApi = {
  list: (params) => apiClient.get('/api/v1/products', { params }).then((r) => r.data),
  getById: (id) => apiClient.get(`/api/v1/products/${id}`).then((r) => r.data),
  listCategories: () => apiClient.get('/api/v1/categories').then((r) => r.data),
};
