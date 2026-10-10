import { Link } from 'react-router-dom';
import { X, Minus, Plus, Trash2 } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { formatCurrency } from '../../utils/formatCurrency';
import Button from '../ui/Button';
import EmptyState from '../common/EmptyState';

export default function CartDrawer() {
  const { cart, drawerOpen, setDrawerOpen, updateItem, removeItem } = useCart();
  const items = cart?.items || [];

  return (
    <>
      {drawerOpen && (
        <div
          className="fixed inset-0 bg-charcoal/40 z-40"
          onClick={() => setDrawerOpen(false)}
          aria-hidden="true"
        />
      )}
      <aside
        className={`fixed top-0 right-0 h-full w-full sm:w-[420px] bg-white z-50 shadow-xl transition-transform duration-300 flex flex-col ${
          drawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-hidden={!drawerOpen}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="font-display text-lg">Your cart</h2>
          <button onClick={() => setDrawerOpen(false)} aria-label="Close cart">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <EmptyState
              title="Your cart is feeling a little empty"
              subtitle="Let's fix that."
              action={
                <Link to="/shop" onClick={() => setDrawerOpen(false)}>
                  <Button>Shop fresh eggs</Button>
                </Link>
              }
            />
          ) : (
            <ul className="flex flex-col gap-4">
              {items.map((item) => (
                <li key={item.id} className="flex gap-3">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-charcoal">{item.productName}</p>
                    <p className="text-xs text-muted mb-2">{item.packSize} eggs</p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateItem(item.id, Math.max(1, item.quantity - 1))}
                        className="w-6 h-6 flex items-center justify-center border border-border rounded"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="text-sm w-4 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateItem(item.id, item.quantity + 1)}
                        className="w-6 h-6 flex items-center justify-center border border-border rounded"
                      >
                        <Plus size={12} />
                      </button>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="ml-2 text-muted hover:text-red-600"
                        aria-label="Remove item"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm font-medium">{formatCurrency(item.lineTotal)}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-border px-5 py-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted">Subtotal</span>
              <span>{formatCurrency(cart.subtotal)}</span>
            </div>
            {cart.discountAmount > 0 && (
              <div className="flex justify-between text-sm mb-1 text-forest">
                <span>Discount</span>
                <span>-{formatCurrency(cart.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold mb-4">
              <span>Estimated total</span>
              <span>{formatCurrency(cart.estimatedTotal)}</span>
            </div>
            <div className="flex gap-2">
              <Link to="/cart" onClick={() => setDrawerOpen(false)} className="flex-1">
                <Button variant="secondary" className="w-full">View cart</Button>
              </Link>
              <Link to="/checkout" onClick={() => setDrawerOpen(false)} className="flex-1">
                <Button className="w-full">Checkout</Button>
              </Link>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
