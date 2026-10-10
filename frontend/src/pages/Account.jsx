import { Link } from 'react-router-dom';
import { Package, MapPin, User as UserIcon, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LINKS = [
  { to: '/account/orders', label: 'Recent orders', icon: Package },
  { to: '/account/addresses', label: 'Saved addresses', icon: MapPin },
];

export default function Account() {
  const { user, logout } = useAuth();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="font-display text-2xl text-charcoal mb-1">Hello, {user?.name || 'there'} 👋</h1>
      <p className="text-muted text-sm mb-8">Manage your orders and account details.</p>

      <div className="grid sm:grid-cols-2 gap-4">
        {LINKS.map(({ to, label, icon: Icon }) => (
          <Link key={to} to={to} className="flex items-center gap-3 rounded-card border border-border bg-white p-5 hover:border-forest transition-colors">
            <Icon size={20} className="text-forest" />
            <span className="font-medium text-charcoal">{label}</span>
          </Link>
        ))}
        <button
          onClick={logout}
          className="flex items-center gap-3 rounded-card border border-border bg-white p-5 hover:border-red-400 transition-colors text-left"
        >
          <LogOut size={20} className="text-muted" />
          <span className="font-medium text-charcoal">Log out</span>
        </button>
      </div>
    </div>
  );
}
