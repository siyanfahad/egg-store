import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, PackageCheck, Lock, Truck } from 'lucide-react';
import { productApi } from '../services/productApi';
import ProductCard from '../components/product/ProductCard';
import { ProductCardSkeleton } from '../components/common/Skeleton';
import Button from '../components/ui/Button';

const TRUST_ITEMS = [
  { icon: PackageCheck, label: 'Freshly packed' },
  { icon: ShieldCheck, label: 'Quality checked' },
  { icon: Lock, label: 'Secure payments' },
  { icon: Truck, label: 'Reliable delivery' },
];

export default function Home() {
  const [products, setProducts] = useState(null);

  useEffect(() => {
    productApi.list({ size: 6 }).then((res) => setProducts(res.content)).catch(() => setProducts([]));
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-20 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <h1 className="font-display text-4xl sm:text-5xl leading-tight text-charcoal mb-5">
            Fresh eggs.
            <br />
            Delivered to your door.
          </h1>
          <p className="text-muted text-base sm:text-lg mb-8 max-w-md">
            Quality eggs from trusted sources, carefully packed and delivered fresh to your home.
          </p>
          <p className="text-xs text-muted -mt-5 mb-6">
            Sample catalog — prices and stock are illustrative.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/shop">
              <Button size="lg">Shop eggs</Button>
            </Link>
            <Link to="/shop">
              <Button size="lg" variant="secondary">Explore categories</Button>
            </Link>
          </div>
        </div>

        <div className="relative flex items-center justify-center">
          <div className="w-64 h-64 rounded-full bg-gold/15 overflow-hidden border-8 border-white shadow-sm">
            <img
              src={`${import.meta.env.BASE_URL}images/products/assorted-eggs.jpg`}
              alt="Fresh eggs in a carton"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="absolute bottom-2 left-2 sm:left-8 bg-white rounded-card border border-border shadow-sm px-4 py-3">
            <p className="text-xs text-muted">Classic White Eggs</p>
            <p className="text-sm font-semibold">12 for ₹72</p>
          </div>
        </div>
      </section>

      {/* Trust indicators */}
      <section className="border-y border-border bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-2 sm:grid-cols-4 gap-6">
          {TRUST_ITEMS.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2.5 justify-center sm:justify-start">
              <Icon size={18} className="text-forest shrink-0" />
              <span className="text-sm text-charcoal">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Product showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <div className="flex items-end justify-between mb-8">
          <h2 className="font-display text-2xl sm:text-3xl text-charcoal">Choose your eggs</h2>
          <Link to="/shop" className="text-sm text-forest hover:underline">
            View all
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products === null
            ? Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : products.length === 0
            ? (
              <p className="col-span-full text-center text-muted py-12">
                No products yet — check back soon, or add some via the admin dashboard.
              </p>
            )
            : products.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
        </div>
      </section>
    </div>
  );
}
