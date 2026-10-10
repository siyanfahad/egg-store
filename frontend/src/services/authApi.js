import apiClient from '../api/apiClient';

export const authApi = {
  signup: (payload) => apiClient.post('/api/v1/auth/signup', payload).then((r) => r.data),
  login: (payload) => apiClient.post('/api/v1/auth/login', payload).then((r) => r.data),
  adminLogin: (payload) => apiClient.post('/api/v1/auth/admin/login', payload).then((r) => r.data),
};
