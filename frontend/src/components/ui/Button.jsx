const VARIANTS = {
  primary: 'bg-forest text-white hover:bg-forest-dark disabled:bg-forest/40',
  secondary: 'bg-transparent text-charcoal border border-charcoal/20 hover:border-charcoal/50 disabled:opacity-40',
  gold: 'bg-gold text-charcoal hover:bg-gold-light disabled:bg-gold/40',
  ghost: 'bg-transparent text-forest hover:bg-forest/5 disabled:opacity-40',
};

const SIZES = {
  sm: 'text-sm px-3 py-1.5',
  md: 'text-sm px-5 py-2.5',
  lg: 'text-base px-6 py-3',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}) {
  return (
    <button
      className={`rounded-card font-medium transition-colors duration-150 disabled:cursor-not-allowed ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
