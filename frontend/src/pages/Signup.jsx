import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Button from '../components/ui/Button';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await signup(name, email, password);
      showToast('Account created', 'success');
      navigate('/account');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-sm mx-auto px-4 py-20">
      <h1 className="font-display text-2xl text-charcoal mb-6">Create account</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          required
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border border-border rounded-card px-3 py-2.5 text-sm outline-none focus:border-forest"
        />
        <input
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border border-border rounded-card px-3 py-2.5 text-sm outline-none focus:border-forest"
        />
        <input
          type="password"
          required
          minLength={8}
          placeholder="Password (min. 8 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border border-border rounded-card px-3 py-2.5 text-sm outline-none focus:border-forest"
        />
        <Button type="submit" disabled={loading}>{loading ? 'Creating…' : 'Create account'}</Button>
      </form>
      <p className="text-sm text-muted mt-5">
        Already have an account? <Link to="/login" className="text-forest hover:underline">Log in</Link>
      </p>
    </div>
  );
}
