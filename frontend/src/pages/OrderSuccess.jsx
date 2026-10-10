import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { orderApi } from '../services/orderApi';
import { formatCurrency } from '../utils/formatCurrency';
import Button from '../components/ui/Button';

export default function OrderSuccess() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    orderApi.getById(id).then(setOrder).catch(() => {});
  }, [id]);

  return (
    <div className="max-w-md mx-auto px-4 py-20 text-center">
      <CheckCircle2 size={56} className="text-forest mx-auto mb-5 animate-[popIn_0.4s_ease-out]" />
      <h1 className="font-display text-2xl text-charcoal mb-2">Order confirmed</h1>
      <p className="text-muted mb-6">Thank you for your order!</p>

      <div className="rounded-card border border-border bg-white p-6 mb-8">
        <p className="text-sm text-muted mb-1">Order #{id}</p>
        {order && (
          <>
            <p className="text-2xl font-semibold text-charcoal mb-1">{formatCurrency(order.totalAmount)} paid</p>
            <p className="text-sm text-muted">{order.status}</p>
          </>
        )}
      </div>

      <div className="flex gap-3 justify-center">
        <Link to={`/account/orders/${id}`}>
          <Button variant="secondary">Track order</Button>
        </Link>
        <Link to="/shop">
          <Button>Continue shopping</Button>
        </Link>
      </div>

      <style>{`
        @keyframes popIn {
          0% { transform: scale(0.7); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
