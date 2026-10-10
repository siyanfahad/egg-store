import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../services/authApi';
import { setAccessToken } from '../../api/apiClient';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/ui/Button';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authApi.adminLogin({ email, password });
      setAccessToken(res.accessToken);
      navigate('/admin');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-charcoal">
      <form onSubmit={handleSubmit} className="bg-white rounded-card p-8 w-full max-w-sm flex flex-col gap-4">
        <h1 className="font-display text-xl text-charcoal mb-2">EggStore Admin</h1>
        <input
          type="email"
          required
          placeholder="Admin email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border border-border rounded-card px-3 py-2.5 text-sm outline-none focus:border-forest"
        />
        <input
          type="password"
          required
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border border-border rounded-card px-3 py-2.5 text-sm outline-none focus:border-forest"
        />
        <Button type="submit" disabled={loading}>{loading ? 'Logging in…' : 'Log in'}</Button>
      </form>
    </div>
  );
}
