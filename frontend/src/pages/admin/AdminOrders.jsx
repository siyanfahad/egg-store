import { useEffect, useState } from 'react';
import { adminApi } from '../../services/adminApi';
import { useToast } from '../../context/ToastContext';
import { formatCurrency } from '../../utils/formatCurrency';

const STATUSES = ['PENDING', 'CONFIRMED', 'PROCESSING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'PAYMENT_FAILED'];

export default function AdminOrders() {
  const [orders, setOrders] = useState(null);
  const [filter, setFilter] = useState('');
  const { showToast } = useToast();

  function load() {
    adminApi.listOrders({ status: filter || undefined, size: 50 }).then((res) => setOrders(res.content)).catch(() => setOrders([]));
  }

  useEffect(load, [filter]);

  async function handleStatusChange(orderId, status) {
    try {
      await adminApi.updateOrderStatus(orderId, status);
      showToast('Order status updated', 'success');
      load();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  return (
    <div className="px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-2xl text-charcoal">Orders</h1>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="border border-border rounded-card px-3 py-2 text-sm bg-white">
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
        </select>
      </div>

      <div className="rounded-card border border-border bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-cream text-left text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Order</th>
              <th className="px-4 py-3 font-medium">Amount</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {orders === null ? (
              <tr><td className="px-4 py-6 text-muted" colSpan={3}>Loading…</td></tr>
            ) : orders.length === 0 ? (
              <tr><td className="px-4 py-6 text-muted" colSpan={3}>No orders found.</td></tr>
            ) : (
              orders.map((o) => (
                <tr key={o.id}>
                  <td className="px-4 py-3 font-medium text-charcoal">#{o.id}</td>
                  <td className="px-4 py-3">{formatCurrency(o.totalAmount)}</td>
                  <td className="px-4 py-3">
                    <select
                      value={o.status}
                      onChange={(e) => handleStatusChange(o.id, e.target.value)}
                      className="border border-border rounded-card px-2 py-1 text-xs bg-white"
                    >
                      {STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
