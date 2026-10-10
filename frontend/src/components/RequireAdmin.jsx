import { Navigate } from 'react-router-dom';
import { getAccessToken } from '../api/apiClient';

function decodeRole(token) {
  try {
    return JSON.parse(atob(token.split('.')[1])).role;
  } catch {
    return null;
  }
}

export default function RequireAdmin({ children }) {
  const token = getAccessToken();
  const role = token ? decodeRole(token) : null;

  if (role !== 'ADMIN') {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
}
