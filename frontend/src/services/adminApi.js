import apiClient from '../api/apiClient';

export const adminApi = {
  // Products
  listProducts: (params) => apiClient.get('/api/v1/admin/products', { params }).then((r) => r.data),
  createProduct: (payload) => apiClient.post('/api/v1/admin/products', payload).then((r) => r.data),
  updateProduct: (id, payload) => apiClient.put(`/api/v1/admin/products/${id}`, payload).then((r) => r.data),
  deactivateProduct: (id) => apiClient.delete(`/api/v1/admin/products/${id}`).then((r) => r.data),
  addVariant: (productId, payload) =>
    apiClient.post(`/api/v1/admin/products/${productId}/variants`, payload).then((r) => r.data),
  updateVariant: (variantId, payload) =>
    apiClient.put(`/api/v1/admin/variants/${variantId}`, payload).then((r) => r.data),
  adjustStock: (variantId, payload) =>
    apiClient.put(`/api/v1/admin/variants/${variantId}/stock`, payload).then((r) => r.data),
  lowStock: (threshold = 10) =>
    apiClient.get('/api/v1/admin/stock/low', { params: { threshold } }).then((r) => r.data),

  // Categories
  listCategories: () => apiClient.get('/api/v1/admin/categories').then((r) => r.data),
  createCategory: (payload) => apiClient.post('/api/v1/admin/categories', payload).then((r) => r.data),

  // Orders
  listOrders: (params) => apiClient.get('/api/v1/admin/orders', { params }).then((r) => r.data),
  getOrder: (id) => apiClient.get(`/api/v1/admin/orders/${id}`).then((r) => r.data),
  updateOrderStatus: (id, status) =>
    apiClient.patch(`/api/v1/admin/orders/${id}/status`, { status }).then((r) => r.data),

  // Customers
  listCustomers: (params) => apiClient.get('/api/v1/admin/customers', { params }).then((r) => r.data),
};
