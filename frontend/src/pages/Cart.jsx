import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { formatCurrency } from '../utils/formatCurrency';
import Button from '../components/ui/Button';
import EmptyState from '../components/common/EmptyState';

export default function Cart() {
  const { cart, updateItem, removeItem, applyDiscount, removeDiscount, loading } = useCart();
  const { showToast } = useToast();
  const [code, setCode] = useState('');
  const [applying, setApplying] = useState(false);
  const navigate = useNavigate();

  const items = cart?.items || [];

  async function handleApply() {
    if (!code.trim()) return;
    setApplying(true);
    try {
      await applyDiscount(code.trim());
      showToast('Discount applied', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setApplying(false);
    }
  }

  if (loading && !cart) {
    return <div className="max-w-5xl mx-auto px-4 py-20 text-center text-muted">Loading…</div>;
  }

  if (items.length === 0) {
    return (
      <EmptyState
        title="Your cart is feeling a little empty 🥚"
        subtitle="Let's fix that."
        action={
          <Link to="/shop">
            <Button>Shop fresh eggs</Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 grid md:grid-cols-3 gap-10">
      <div className="md:col-span-2">
        <h1 className="font-display text-2xl text-charcoal mb-6">Your cart</h1>
        <ul className="flex flex-col divide-y divide-border">
          {items.map((item) => (
            <li key={item.id} className="py-4 flex items-center gap-4">
              <div className="flex-1">
                <p className="font-medium text-charcoal">{item.productName}</p>
                <p className="text-sm text-muted">{item.packSize} eggs · {formatCurrency(item.currentPrice)} each</p>
              </div>
              <div className="flex items-center border border-border rounded-card">
                <button onClick={() => updateItem(item.id, Math.max(1, item.quantity - 1))} className="w-8 h-8 flex items-center justify-center">
                  <Minus size={12} />
                </button>
                <span className="w-6 text-center text-sm">{item.quantity}</span>
                <button onClick={() => updateItem(item.id, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center">
                  <Plus size={12} />
                </button>
              </div>
              <p className="w-20 text-right font-medium">{formatCurrency(item.lineTotal)}</p>
              <button onClick={() => removeItem(item.id)} aria-label="Remove" className="text-muted hover:text-red-600">
                <Trash2 size={16} />
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <div className="rounded-card border border-border bg-white p-5 sticky top-24">
          <h2 className="font-display text-lg mb-4">Order summary</h2>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted">Subtotal</span>
            <span>{formatCurrency(cart.subtotal)}</span>
          </div>
          {cart.discountAmount > 0 && (
            <div className="flex justify-between text-sm mb-2 text-forest">
              <span>Discount ({cart.appliedDiscountCode})</span>
              <span className="flex items-center gap-2">
                -{formatCurrency(cart.discountAmount)}
                <button onClick={removeDiscount} className="text-xs underline text-muted">remove</button>
              </span>
            </div>
          )}
          <div className="flex justify-between font-semibold text-base pt-2 mt-2 border-t border-border mb-5">
            <span>Total</span>
            <span>{formatCurrency(cart.estimatedTotal)}</span>
          </div>

          {!cart.appliedDiscountCode && (
            <div className="mb-5">
              <p className="text-xs text-muted mb-2">Have a discount code?</p>
              <div className="flex gap-2">
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="EGG10"
                  className="flex-1 text-sm border border-border rounded-card px-3 py-2 outline-none focus:border-forest"
                />
                <Button size="sm" onClick={handleApply} disabled={applying}>Apply</Button>
              </div>
            </div>
          )}

          <Button className="w-full" onClick={() => navigate('/checkout')}>
            Proceed to checkout
          </Button>
        </div>
      </div>
    </div>
  );
}
