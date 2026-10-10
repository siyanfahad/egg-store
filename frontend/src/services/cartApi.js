import apiClient from '../api/apiClient';

export const cartApi = {
  get: () => apiClient.get('/api/v1/cart').then((r) => r.data),
  addItem: (productVariantId, quantity) =>
    apiClient.post('/api/v1/cart/items', { productVariantId, quantity }).then((r) => r.data),
  updateItem: (itemId, quantity) =>
    apiClient.put(`/api/v1/cart/items/${itemId}`, { quantity }).then((r) => r.data),
  removeItem: (itemId) => apiClient.delete(`/api/v1/cart/items/${itemId}`).then((r) => r.data),
  applyDiscount: (code) => apiClient.post('/api/v1/cart/apply-discount', { code }).then((r) => r.data),
  removeDiscount: () => apiClient.delete('/api/v1/cart/discount').then((r) => r.data),
};
