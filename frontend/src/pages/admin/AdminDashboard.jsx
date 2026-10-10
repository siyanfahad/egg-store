import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../services/adminApi';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ products: null, orders: null, lowStock: null });

  useEffect(() => {
    adminApi.listProducts({ size: 1 }).then((res) => setStats((s) => ({ ...s, products: res.totalElements })));
    adminApi.listOrders({ size: 1 }).then((res) => setStats((s) => ({ ...s, orders: res.totalElements })));
    adminApi.lowStock(10).then((res) => setStats((s) => ({ ...s, lowStock: res.length })));
  }, []);

  const CARDS = [
    { label: 'Products', value: stats.products, to: '/admin/products' },
    { label: 'Orders', value: stats.orders, to: '/admin/orders' },
    { label: 'Low stock', value: stats.lowStock, to: '/admin/products' },
  ];

  return (
    <div className="px-8 py-8">
      <h1 className="font-display text-2xl text-charcoal mb-8">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {CARDS.map((card) => (
          <Link
            key={card.label}
            to={card.to}
            className="rounded-card border border-border bg-white p-6 hover:border-forest transition-colors"
          >
            <p className="text-sm text-muted mb-2">{card.label}</p>
            <p className="text-3xl font-display text-charcoal">{card.value ?? '—'}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
