import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import ProductImage from '../common/ProductImage';
import { formatCurrency } from '../../utils/formatCurrency';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';

export default function ProductCard({ product, index = 0 }) {
  const variants = product.variants || [];
  const inStockVariants = variants.filter((v) => v.inStock);
  const [selected, setSelected] = useState(inStockVariants[0] || variants[0]);
  const { addItem } = useCart();
  const { showToast } = useToast();
  const [adding, setAdding] = useState(false);

  const cheapest = variants.reduce(
    (min, v) => (min === null || v.price < min ? v.price : min),
    null
  );

  async function handleQuickAdd(e) {
    e.preventDefault();
    if (!selected) return;
    setAdding(true);
    try {
      await addItem(selected, product, 1);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="group rounded-card border border-border bg-white overflow-hidden flex flex-col">
      <Link to={`/products/${product.id}`}>
        <ProductImage
          seed={index}
          imageUrl={product.imageUrl}
          alt={product.name}
          className="aspect-square w-full transition-transform duration-300 group-hover:scale-[1.03]"
        />
      </Link>
      <div className="p-4 flex flex-col flex-1">
        <Link to={`/products/${product.id}`}>
          <h3 className="font-display text-lg text-charcoal mb-0.5">{product.name}</h3>
        </Link>
        <p className="text-sm text-muted line-clamp-2 mb-3">{product.description}</p>

        {cheapest !== null && (
          <p className="text-sm text-charcoal mb-3">
            From <span className="font-semibold">{formatCurrency(cheapest)}</span>
          </p>
        )}

        {variants.length > 0 && (
          <div className="mb-4">
            <VariantChips variants={variants} selected={selected} onSelect={setSelected} />
          </div>
        )}

        <div className="mt-auto flex gap-2">
          <Link
            to={`/products/${product.id}`}
            className="flex-1 text-center text-sm border border-border rounded-card px-3 py-2 hover:border-forest transition-colors"
          >
            View details
          </Link>
          <button
            onClick={handleQuickAdd}
            disabled={!selected?.inStock || adding}
            aria-label="Quick add to cart"
            className="shrink-0 w-10 h-10 rounded-card bg-forest text-white flex items-center justify-center hover:bg-forest-dark disabled:bg-forest/30 transition-colors"
          >
            <Plus size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

function VariantChips({ variants, selected, onSelect }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {variants.map((v) => (
        <button
          key={v.id}
          type="button"
          disabled={!v.inStock}
          onClick={(e) => {
            e.preventDefault();
            onSelect(v);
          }}
          className={`text-xs rounded-full border px-2 py-1 transition-colors ${
            !v.inStock
              ? 'border-border text-muted/40 cursor-not-allowed'
              : selected?.id === v.id
              ? 'border-forest bg-forest text-white'
              : 'border-border text-charcoal hover:border-forest'
          }`}
        >
          {v.packSize}
        </button>
      ))}
    </div>
  );
}
