import { formatCurrency } from '../../utils/formatCurrency';

export default function VariantSelector({ variants, selected, onSelect, size = 'md' }) {
  const padding = size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3.5 py-2 text-sm';

  return (
    <div className="flex flex-wrap gap-2">
      {variants.map((v) => {
        const isSelected = selected?.id === v.id;
        const disabled = !v.inStock;
        return (
          <button
            key={v.id}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(v)}
            className={`rounded-full border transition-colors ${padding} ${
              disabled
                ? 'border-border text-muted/50 cursor-not-allowed line-through'
                : isSelected
                ? 'border-forest bg-forest text-white'
                : 'border-border text-charcoal hover:border-forest'
            }`}
          >
            {v.packSize} eggs · {formatCurrency(v.price)}
          </button>
        );
      })}
    </div>
  );
}
