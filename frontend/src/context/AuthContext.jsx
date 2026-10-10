import { createContext, useContext, useState, useCallback } from 'react';
import { authApi } from '../services/authApi';
import {
  setAccessToken,
  clearAccessToken,
  getAccessToken,
  getOrCreateGuestSessionId,
  clearGuestSessionId,
} from '../api/apiClient';

const AuthContext = createContext(null);

// Decode the JWT payload just enough to know who's logged in — no verification
// happens client-side, the backend is the source of truth for every real request.
function decodeToken(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const token = getAccessToken();
    return token ? decodeToken(token) : null;
  });

  const applyAuthResponse = useCallback((res) => {
    setAccessToken(res.accessToken);
    setUser({ sub: String(res.userId), name: res.name, role: res.role });
    clearGuestSessionId(); // guest cart has been merged server-side, drop the old session id
  }, []);

  const login = useCallback(
    async (emailOrPhone, password) => {
      const guestSessionId = getOrCreateGuestSessionId();
      const res = await authApi.login({ emailOrPhone, password, guestSessionId });
      applyAuthResponse(res);
      return res;
    },
    [applyAuthResponse]
  );

  const signup = useCallback(
    async (name, email, password) => {
      const guestSessionId = getOrCreateGuestSessionId();
      const res = await authApi.signup({ name, email, password, guestSessionId });
      applyAuthResponse(res);
      return res;
    },
    [applyAuthResponse]
  );

  const logout = useCallback(() => {
    clearAccessToken();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
