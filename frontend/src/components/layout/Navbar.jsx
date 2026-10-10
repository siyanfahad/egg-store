import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Search, User, Menu, X } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

const NAV_LINKS = [
  { to: '/shop', label: 'Shop' },
  { to: '/shop?category=1', label: 'Categories' },
  { to: '/account/orders', label: 'Track Order' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { itemCount, setDrawerOpen } = useCart();
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 bg-cream/95 backdrop-blur transition-shadow ${
        scrolled ? 'shadow-sm border-b border-border' : 'border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <Link to="/" className="font-display text-xl text-charcoal shrink-0">
          EggStore
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map((link) => (
            <Link key={link.label} to={link.to} className="text-sm text-charcoal hover:text-forest transition-colors">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button
            aria-label="Search"
            onClick={() => navigate('/shop')}
            className="hidden sm:flex w-9 h-9 items-center justify-center rounded-full hover:bg-charcoal/5 transition-colors"
          >
            <Search size={18} />
          </button>

          <Link
            to={isAuthenticated ? '/account' : '/login'}
            aria-label="Account"
            className="hidden sm:flex w-9 h-9 items-center justify-center rounded-full hover:bg-charcoal/5 transition-colors"
          >
            <User size={18} />
          </Link>

          {isAuthenticated && (
            <button onClick={logout} className="hidden sm:block text-xs text-muted hover:text-charcoal">
              Log out
            </button>
          )}

          <button
            aria-label="Open cart"
            onClick={() => setDrawerOpen(true)}
            className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-charcoal/5 transition-colors"
          >
            <ShoppingBag size={18} />
            {itemCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-forest text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </button>

          <button
            aria-label="Menu"
            className="md:hidden w-9 h-9 flex items-center justify-center"
            onClick={() => setMobileOpen((o) => !o)}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-cream px-4 py-3 flex flex-col gap-3">
          {NAV_LINKS.map((link) => (
            <Link key={link.label} to={link.to} onClick={() => setMobileOpen(false)} className="text-sm text-charcoal">
              {link.label}
            </Link>
          ))}
          <Link to={isAuthenticated ? '/account' : '/login'} onClick={() => setMobileOpen(false)} className="text-sm text-charcoal">
            {isAuthenticated ? `Hi, ${user?.name || 'Account'}` : 'Login / Sign up'}
          </Link>
        </div>
      )}
    </header>
  );
}
