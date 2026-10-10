import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Minus, Plus, ChevronDown } from 'lucide-react';
import { productApi } from '../services/productApi';
import ProductImage from '../components/common/ProductImage';
import VariantSelector from '../components/product/VariantSelector';
import Button from '../components/ui/Button';
import { formatCurrency } from '../utils/formatCurrency';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

const FAQS = [
  { q: 'How are the eggs packed?', a: 'Eggs are packed in protective cartons designed to keep them safe during transit.' },
  { q: 'How long do they stay fresh?', a: 'Store refrigerated for best freshness. We recommend using within the printed best-by window.' },
  { q: 'What if an egg arrives broken?', a: 'Contact support with your order number and we\u2019ll sort out a replacement or refund.' },
];

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [selected, setSelected] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [openFaq, setOpenFaq] = useState(null);
  const [adding, setAdding] = useState(false);
  const { addItem } = useCart();
  const { showToast } = useToast();

  useEffect(() => {
    productApi.getById(id).then((p) => {
      setProduct(p);
      setSelected(p.variants?.find((v) => v.inStock) || p.variants?.[0] || null);
    });
  }, [id]);

  if (!product) {
    return <div className="max-w-5xl mx-auto px-4 py-20 text-center text-muted">Loading…</div>;
  }

  async function handleAddToCart() {
    if (!selected) return;
    setAdding(true);
    try {
      await addItem(selected, product, quantity);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setAdding(false);
    }
  }

  async function handleBuyNow() {
    await handleAddToCart();
    navigate('/cart');
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <div className="grid md:grid-cols-2 gap-10">
        <ProductImage
          seed={product.id}
          imageUrl={selected?.imageUrl || product.imageUrl}
          alt={product.name}
          className="aspect-square w-full rounded-card"
        />

        <div>
          <p className="text-xs uppercase tracking-wide text-muted mb-2">{product.category?.name}</p>
          <h1 className="font-display text-3xl text-charcoal mb-3">{product.name}</h1>
          <p className="text-muted mb-6">{product.description}</p>
          <p className="text-xs text-muted -mt-3 mb-5">
            Sample catalog — prices and stock are illustrative.
          </p>

          {selected && (
            <p className="text-2xl font-semibold text-charcoal mb-5">{formatCurrency(selected.price)}</p>
          )}

          <div className="mb-6">
            <p className="text-sm font-medium text-charcoal mb-2">Pack size</p>
            <VariantSelector variants={product.variants} selected={selected} onSelect={setSelected} />
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center border border-border rounded-card">
              <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="w-9 h-9 flex items-center justify-center">
                <Minus size={14} />
              </button>
              <span className="w-8 text-center text-sm">{quantity}</span>
              <button onClick={() => setQuantity((q) => q + 1)} className="w-9 h-9 flex items-center justify-center">
                <Plus size={14} />
              </button>
            </div>
            <span className="text-sm text-muted">
              {selected?.inStock ? `${selected.stockQuantity} in stock` : 'Out of stock'}
            </span>
          </div>

          <div className="flex gap-3 mb-10">
            <Button variant="secondary" className="flex-1" disabled={!selected?.inStock || adding} onClick={handleAddToCart}>
              Add to cart
            </Button>
            <Button className="flex-1" disabled={!selected?.inStock || adding} onClick={handleBuyNow}>
              Buy now
            </Button>
          </div>

          <div className="border-t border-border pt-6">
            <h3 className="font-display text-lg mb-3">Why you'll love it</h3>
            <ul className="text-sm text-muted space-y-1.5 list-disc list-inside">
              <li>Sourced from trusted, regularly inspected suppliers</li>
              <li>Packed the same day to lock in freshness</li>
              <li>Delivered in protective, crush-resistant cartons</li>
            </ul>
          </div>

          <div className="border-t border-border mt-6 pt-6">
            {FAQS.map((faq, i) => (
              <div key={i} className="border-b border-border last:border-0">
                <button
                  className="w-full flex items-center justify-between py-3 text-left text-sm font-medium text-charcoal"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  {faq.q}
                  <ChevronDown
                    size={16}
                    className={`transition-transform ${openFaq === i ? 'rotate-180' : ''}`}
                  />
                </button>
                {openFaq === i && <p className="text-sm text-muted pb-3">{faq.a}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
