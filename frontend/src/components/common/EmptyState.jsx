export default function EmptyState({ title, subtitle, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 px-4">
      <h3 className="text-xl font-display text-charcoal mb-1">{title}</h3>
      {subtitle && <p className="text-muted text-sm mb-6 max-w-xs">{subtitle}</p>}
      {action}
    </div>
  );
}
