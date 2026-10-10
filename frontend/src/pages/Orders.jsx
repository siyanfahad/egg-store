import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { orderApi } from '../services/orderApi';
import { formatCurrency } from '../utils/formatCurrency';
import EmptyState from '../components/common/EmptyState';
import Button from '../components/ui/Button';

const STATUS_STYLES = {
  PENDING: 'bg-charcoal/10 text-charcoal',
  CONFIRMED: 'bg-forest/15 text-forest',
  PROCESSING: 'bg-gold/20 text-charcoal',
  OUT_FOR_DELIVERY: 'bg-gold/20 text-charcoal',
  DELIVERED: 'bg-forest/15 text-forest',
  CANCELLED: 'bg-red-100 text-red-700',
  PAYMENT_FAILED: 'bg-red-100 text-red-700',
};

export default function Orders() {
  const [orders, setOrders] = useState(null);

  useEffect(() => {
    orderApi.list().then((res) => setOrders(res.content)).catch(() => setOrders([]));
  }, []);

  if (orders === null) {
    return <div className="max-w-3xl mx-auto px-4 py-20 text-center text-muted">Loading…</div>;
  }

  if (orders.length === 0) {
    return (
      <EmptyState
        title="No orders yet"
        subtitle="Your first order is waiting."
        action={<Link to="/shop"><Button>Start shopping</Button></Link>}
      />
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="font-display text-2xl text-charcoal mb-8">Your orders</h1>
      <ul className="flex flex-col gap-3">
        {orders.map((order) => (
          <li key={order.id} className="rounded-card border border-border bg-white p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="font-medium text-charcoal">Order #{order.id}</p>
              <span className={`text-xs px-2 py-1 rounded-full ${STATUS_STYLES[order.status] || 'bg-charcoal/10'}`}>
                {order.status.replace(/_/g, ' ')}
              </span>
            </div>
            <p className="text-sm text-muted mb-2">
              {order.items.map((i) => i.productName).join(', ')}
            </p>
            <div className="flex items-center justify-between">
              <p className="font-semibold">{formatCurrency(order.totalAmount)}</p>
              <Link to={`/account/orders/${order.id}`} className="text-sm text-forest hover:underline">
                View details
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
