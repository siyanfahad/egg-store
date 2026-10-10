import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Check } from 'lucide-react';
import { orderApi } from '../services/orderApi';
import { formatCurrency } from '../utils/formatCurrency';
import { useToast } from '../context/ToastContext';
import Button from '../components/ui/Button';

const TIMELINE_STEPS = ['PENDING', 'CONFIRMED', 'PROCESSING', 'OUT_FOR_DELIVERY', 'DELIVERED'];
const TIMELINE_LABELS = {
  PENDING: 'Order placed',
  CONFIRMED: 'Payment confirmed',
  PROCESSING: 'Preparing',
  OUT_FOR_DELIVERY: 'Out for delivery',
  DELIVERED: 'Delivered',
};

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const { showToast } = useToast();

  function load() {
    orderApi.getById(id).then(setOrder).catch((err) => showToast(err.message, 'error'));
  }

  useEffect(load, [id]);

  if (!order) return <div className="max-w-3xl mx-auto px-4 py-20 text-center text-muted">Loading…</div>;

  const isTerminalIssue = order.status === 'CANCELLED' || order.status === 'PAYMENT_FAILED';
  const currentIndex = TIMELINE_STEPS.indexOf(order.status);

  async function handleCancel() {
    try {
      await orderApi.cancel(order.id);
      showToast('Order cancelled', 'success');
      load();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="font-display text-2xl text-charcoal mb-1">Order #{order.id}</h1>
      <p className="text-sm text-muted mb-8">{new Date(order.createdAt).toLocaleDateString()}</p>

      {isTerminalIssue ? (
        <div className="rounded-card border border-red-200 bg-red-50 p-4 mb-8 text-sm text-red-700">
          This order is {order.status === 'CANCELLED' ? 'cancelled' : 'marked as payment failed'}.
        </div>
      ) : (
        <div className="mb-10">
          {TIMELINE_STEPS.map((step, i) => (
            <div key={step} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                    i <= currentIndex ? 'bg-forest text-white' : 'border border-border text-transparent'
                  }`}
                >
                  <Check size={12} />
                </div>
                {i < TIMELINE_STEPS.length - 1 && (
                  <div className={`w-px flex-1 min-h-6 ${i < currentIndex ? 'bg-forest' : 'bg-border'}`} />
                )}
              </div>
              <p className={`text-sm pb-6 ${i <= currentIndex ? 'text-charcoal font-medium' : 'text-muted'}`}>
                {TIMELINE_LABELS[step]}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-card border border-border bg-white p-5 mb-6">
        <ul className="divide-y divide-border mb-4">
          {order.items.map((item, i) => (
            <li key={i} className="py-2 flex justify-between text-sm">
              <span>{item.productName} ({item.packSize} eggs) × {item.quantity}</span>
              <span>{formatCurrency(item.priceAtPurchase * item.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="flex justify-between text-sm mb-1">
          <span className="text-muted">Subtotal</span>
          <span>{formatCurrency(order.subtotal)}</span>
        </div>
        {order.discountAmount > 0 && (
          <div className="flex justify-between text-sm mb-1 text-forest">
            <span>Discount</span>
            <span>-{formatCurrency(order.discountAmount)}</span>
          </div>
        )}
        <div className="flex justify-between font-semibold pt-2 mt-2 border-t border-border">
          <span>Total</span>
          <span>{formatCurrency(order.totalAmount)}</span>
        </div>
      </div>

      {(order.status === 'PENDING' || order.status === 'CONFIRMED') && (
        <Button variant="secondary" onClick={handleCancel}>Cancel order</Button>
      )}
    </div>
  );
}
