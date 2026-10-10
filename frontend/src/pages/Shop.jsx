import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search as SearchIcon } from 'lucide-react';
import { productApi } from '../services/productApi';
import ProductCard from '../components/product/ProductCard';
import { ProductCardSkeleton } from '../components/common/Skeleton';
import EmptyState from '../components/common/EmptyState';

const SORTS = [
  { value: '', label: 'Popular' },
  { value: 'price,asc', label: 'Price: Low to High' },
  { value: 'price,desc', label: 'Price: High to Low' },
  { value: 'id,desc', label: 'Newest' },
];

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || '';
  const inStock = searchParams.get('inStock') === 'true';

  useEffect(() => {
    productApi.listCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  const load = useCallback(() => {
    setProducts(null);
    productApi
      .list({
        search: search || undefined,
        category: category || undefined,
        sort: sort || undefined,
        inStock: inStock || undefined,
        page,
        size: 12,
      })
      .then((res) => {
        setProducts(res.content);
        setTotalPages(res.totalPages);
      })
      .catch(() => setProducts([]));
  }, [search, category, sort, inStock, page]);

  useEffect(() => {
    load();
  }, [load]);

  function updateParam(key, value) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next);
    setPage(0);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="font-display text-3xl text-charcoal mb-6">Shop eggs</h1>
      <p className="text-xs text-muted -mt-4 mb-6">
        Sample catalog — prices and stock are illustrative.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center mb-8">
        <div className="relative flex-1 max-w-sm">
          <SearchIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            defaultValue={search}
            placeholder="Search eggs, packs, categories..."
            onKeyDown={(e) => e.key === 'Enter' && updateParam('search', e.target.value)}
            onBlur={(e) => updateParam('search', e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-card border border-border bg-white focus:border-forest outline-none"
          />
        </div>

        <select
          value={category}
          onChange={(e) => updateParam('category', e.target.value)}
          className="text-sm rounded-card border border-border bg-white px-3 py-2"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <select
          value={sort}
          onChange={(e) => updateParam('sort', e.target.value)}
          className="text-sm rounded-card border border-border bg-white px-3 py-2"
        >
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>

        <label className="flex items-center gap-2 text-sm text-charcoal">
          <input
            type="checkbox"
            checked={inStock}
            onChange={(e) => updateParam('inStock', e.target.checked ? 'true' : '')}
          />
          In stock only
        </label>
      </div>

      {products === null ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)}
        </div>
      ) : products.length === 0 ? (
        <EmptyState title="We couldn't find those eggs" subtitle="Try another search or clear your filters." />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {products.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i)}
                  className={`w-8 h-8 rounded-full text-sm ${
                    page === i ? 'bg-forest text-white' : 'border border-border text-charcoal'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
