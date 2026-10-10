import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export const GUEST_SESSION_KEY = 'eggstore_guest_session_id';
export const ACCESS_TOKEN_KEY = 'eggstore_access_token';

export function getOrCreateGuestSessionId() {
  let id = localStorage.getItem(GUEST_SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(GUEST_SESSION_KEY, id);
  }
  return id;
}

export function clearGuestSessionId() {
  localStorage.removeItem(GUEST_SESSION_KEY);
}

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setAccessToken(token) {
  if (token) localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function clearAccessToken() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
}

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT (if logged in) and guest session id (if not) to every request.
apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    config.headers['X-Guest-Session-Id'] = getOrCreateGuestSessionId();
  }
  return config;
});

// Normalize errors into a consistent, friendly shape the UI can render directly.
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const backendMessage = error.response?.data?.message;

    const messages = {
      401: 'Please log in again.',
      403: "You don't have permission to do that.",
      404: backendMessage || 'Not found.',
      409: backendMessage || 'This item is no longer available in the requested quantity.',
      422: backendMessage || 'Please check the information you entered.',
      400: backendMessage || 'Please check the information you entered.',
      500: 'Something went wrong on our end. Please try again.',
    };

    if (status === 401) {
      clearAccessToken();
    }

    const friendlyMessage = messages[status] || backendMessage || 'Something went wrong. Please try again.';
    return Promise.reject({ status, message: friendlyMessage, raw: error });
  }
);

export default apiClient;
