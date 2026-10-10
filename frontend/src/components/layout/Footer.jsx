import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-border mt-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="col-span-2 md:col-span-1">
          <p className="font-display text-lg text-charcoal mb-2">EggStore</p>
          <p className="text-sm text-muted">Fresh eggs. Better every day.</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-muted mb-3">Shop</p>
          <div className="flex flex-col gap-2 text-sm">
            <Link to="/shop" className="hover:text-forest">All products</Link>
            <Link to="/shop" className="hover:text-forest">Categories</Link>
          </div>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-muted mb-3">Account</p>
          <div className="flex flex-col gap-2 text-sm">
            <Link to="/account" className="hover:text-forest">My account</Link>
            <Link to="/account/orders" className="hover:text-forest">Orders</Link>
          </div>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-muted mb-3">Support</p>
          <div className="flex flex-col gap-2 text-sm text-muted">
            <span>Mon–Sat, 9am–7pm</span>
          </div>
        </div>
      </div>
      <div className="border-t border-border py-4 text-center text-xs text-muted">
        © {new Date().getFullYear()} EggStore.
      </div>
    </footer>
  );
}
