import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, Tag, LogOut } from 'lucide-react';
import { clearAccessToken } from '../../api/apiClient';

const LINKS = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { to: '/admin/categories', label: 'Categories', icon: Tag },
];

export default function AdminLayout() {
  const navigate = useNavigate();

  function handleLogout() {
    clearAccessToken();
    navigate('/admin/login');
  }

  return (
    <div className="min-h-screen flex bg-cream">
      <aside className="w-56 bg-charcoal text-cream flex flex-col shrink-0">
        <div className="px-5 py-5 font-display text-lg border-b border-white/10">EggStore Admin</div>
        <nav className="flex-1 px-2 py-4 flex flex-col gap-1">
          {LINKS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-card text-sm transition-colors ${
                  isActive ? 'bg-white/10 text-white' : 'text-cream/70 hover:bg-white/5'
                }`
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2.5 px-5 py-4 text-sm text-cream/70 hover:text-white border-t border-white/10"
        >
          <LogOut size={16} />
          Log out
        </button>
      </aside>
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
