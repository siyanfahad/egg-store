import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Button from '../components/ui/Button';

export default function Login() {
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await login(emailOrPhone, password);
      showToast('Welcome back', 'success');
      navigate(location.state?.from || '/account');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-sm mx-auto px-4 py-20">
      <h1 className="font-display text-2xl text-charcoal mb-6">Log in</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          required
          placeholder="Email or phone"
          value={emailOrPhone}
          onChange={(e) => setEmailOrPhone(e.target.value)}
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
      <p className="text-sm text-muted mt-5">
        New here? <Link to="/signup" className="text-forest hover:underline">Create an account</Link>
      </p>
    </div>
  );
}
