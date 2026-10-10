import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addressApi } from '../services/addressApi';
import { checkoutApi } from '../services/checkoutApi';
import { orderApi } from '../services/orderApi';
import { useToast } from '../context/ToastContext';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/formatCurrency';
import Button from '../components/ui/Button';

const STEPS = ['Address', 'Review', 'Payment'];

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function Checkout() {
  const [step, setStep] = useState(0);
  const [addresses, setAddresses] = useState(null);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [summary, setSummary] = useState(null);
  const [placing, setPlacing] = useState(false);
  const { showToast } = useToast();
  const { refresh: refreshCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    addressApi.list().then((addrs) => {
      setAddresses(addrs);
      const def = addrs.find((a) => a.isDefault) || addrs[0];
      if (def) setSelectedAddressId(def.id);
    });
    checkoutApi.summary().then(setSummary).catch((err) => showToast(err.message, 'error'));
  }, []);

  async function handlePlaceOrder() {
    if (!selectedAddressId) {
      showToast('Please select a delivery address', 'error');
      return;
    }
    setPlacing(true);
    try {
      const order = await orderApi.create(selectedAddressId);
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        showToast('Could not load payment gateway. Check your connection.', 'error');
        setPlacing(false);
        return;
      }

      const rzp = new window.Razorpay({
        key: order.razorpayKeyId,
        amount: Math.round(order.totalAmount * 100),
        currency: 'INR',
        name: 'EggStore',
        description: `Order #${order.id}`,
        order_id: order.razorpayOrderId,
        handler: async (response) => {
          try {
            await orderApi.verifyPayment(order.id, {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            await refreshCart();
            navigate(`/order-success/${order.id}`);
          } catch (err) {
            showToast(err.message || 'Payment verification failed', 'error');
            setPlacing(false);
          }
        },
        modal: {
          ondismiss: () => setPlacing(false),
        },
        theme: { color: '#3F5D3A' },
      });
      rzp.open();
    } catch (err) {
      showToast(err.message, 'error');
      setPlacing(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="font-display text-2xl text-charcoal mb-2">Checkout</h1>

      <div className="flex items-center gap-2 mb-10 text-sm text-muted">
        {STEPS.map((s, i) => (
          <span key={s} className="flex items-center gap-2">
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${i <= step ? 'bg-forest text-white' : 'border border-border'}`}>
              {i + 1}
            </span>
            {s}
            {i < STEPS.length - 1 && <span className="mx-1">→</span>}
          </span>
        ))}
      </div>

      {step === 0 && (
        <div>
          <h2 className="font-medium text-charcoal mb-4">Select delivery address</h2>
          {addresses === null ? (
            <p className="text-muted text-sm">Loading…</p>
          ) : addresses.length === 0 ? (
            <div className="rounded-card border border-border bg-white p-6 text-center">
              <p className="text-sm text-muted mb-4">You don't have any saved addresses yet.</p>
              <Button onClick={() => navigate('/account/addresses')}>Add an address</Button>
            </div>
          ) : (
            <div className="flex flex-col gap-3 mb-6">
              {addresses.map((addr) => (
                <label
                  key={addr.id}
                  className={`rounded-card border p-4 cursor-pointer ${
                    selectedAddressId === addr.id ? 'border-forest' : 'border-border'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="address"
                      checked={selectedAddressId === addr.id}
                      onChange={() => setSelectedAddressId(addr.id)}
                      className="mt-1"
                    />
                    <div>
                      <p className="font-medium text-charcoal">{addr.label}</p>
                      <p className="text-sm text-muted">{addr.line1}, {addr.city}, {addr.state} {addr.pincode}</p>
                      <p className="text-sm text-muted">{addr.phone}</p>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          )}
          <Button disabled={!selectedAddressId} onClick={() => setStep(1)}>Continue</Button>
        </div>
      )}

      {step === 1 && summary && (
        <div>
          <h2 className="font-medium text-charcoal mb-4">Review your order</h2>
          <div className="rounded-card border border-border bg-white p-5 mb-6">
            <ul className="divide-y divide-border mb-4">
              {summary.items.map((item, i) => (
                <li key={i} className="py-2 flex justify-between text-sm">
                  <span>{item.productName} ({item.packSize} eggs) × {item.quantity}</span>
                  <span>{formatCurrency(item.priceAtPurchase * item.quantity)}</span>
                </li>
              ))}
            </ul>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted">Subtotal</span>
              <span>{formatCurrency(summary.subtotal)}</span>
            </div>
            {summary.discountAmount > 0 && (
              <div className="flex justify-between text-sm mb-1 text-forest">
                <span>Discount</span>
                <span>-{formatCurrency(summary.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold pt-2 mt-2 border-t border-border">
              <span>Total</span>
              <span>{formatCurrency(summary.total)}</span>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setStep(0)}>Back</Button>
            <Button onClick={() => setStep(2)}>Continue to payment</Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <h2 className="font-medium text-charcoal mb-4">Payment</h2>
          <p className="text-sm text-muted mb-6">
            You'll be redirected to Razorpay's secure checkout to complete payment of{' '}
            <strong>{summary ? formatCurrency(summary.total) : ''}</strong>.
          </p>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setStep(1)}>Back</Button>
            <Button onClick={handlePlaceOrder} disabled={placing}>
              {placing ? 'Processing…' : 'Pay now'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
