export function Skeleton({ className = '' }) {
  return <div className={`animate-pulse bg-charcoal/10 rounded ${className}`} />;
}

export function ProductCardSkeleton() {
  return (
    <div className="rounded-card border border-border bg-white overflow-hidden">
      <Skeleton className="aspect-square w-full" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-4 w-1/3 mt-3" />
      </div>
    </div>
  );
}
