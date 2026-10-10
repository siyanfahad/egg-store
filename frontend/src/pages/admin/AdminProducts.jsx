import { useEffect, useState } from 'react';
import { Plus, Pencil, Layers, PackagePlus } from 'lucide-react';
import { adminApi } from '../../services/adminApi';
import { useToast } from '../../context/ToastContext';
import { formatCurrency } from '../../utils/formatCurrency';
import Button from '../../components/ui/Button';

const EMPTY_PRODUCT = { categoryId: '', name: '', description: '', imageUrl: '' };
const EMPTY_VARIANT = { packSize: '', price: '', stockQuantity: '' };
const EMPTY_STOCK = { changeQuantity: '', reason: 'RESTOCK' };

export default function AdminProducts() {
  const [products, setProducts] = useState(null);
  const [categories, setCategories] = useState([]);
  const { showToast } = useToast();

  const [productModal, setProductModal] = useState(null); // null closed, {} new, {...} edit
  const [productForm, setProductForm] = useState(EMPTY_PRODUCT);

  const [variantModal, setVariantModal] = useState(null); // { productId }
  const [variantForm, setVariantForm] = useState(EMPTY_VARIANT);

  const [stockModal, setStockModal] = useState(null); // { variantId, productName, packSize }
  const [stockForm, setStockForm] = useState(EMPTY_STOCK);

  function load() {
    adminApi.listProducts({ size: 100 }).then((res) => setProducts(res.content)).catch(() => setProducts([]));
  }

  useEffect(() => {
    load();
    adminApi.listCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  function openNewProduct() {
    setProductForm(EMPTY_PRODUCT);
    setProductModal({});
  }

  function openEditProduct(p) {
    setProductForm({ categoryId: p.category?.id || '', name: p.name, description: p.description || '', imageUrl: p.imageUrl || '' });
    setProductModal(p);
  }

  async function handleSaveProduct(e) {
    e.preventDefault();
    try {
      const payload = { ...productForm, categoryId: Number(productForm.categoryId) };
      if (productModal?.id) {
        await adminApi.updateProduct(productModal.id, payload);
      } else {
        await adminApi.createProduct(payload);
      }
      showToast('Product saved', 'success');
      setProductModal(null);
      load();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  async function handleDeactivate(id) {
    try {
      await adminApi.deactivateProduct(id);
      showToast('Product deactivated', 'success');
      load();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  async function handleAddVariant(e) {
    e.preventDefault();
    try {
      await adminApi.addVariant(variantModal.productId, {
        packSize: Number(variantForm.packSize),
        price: Number(variantForm.price),
        stockQuantity: Number(variantForm.stockQuantity),
      });
      showToast('Variant added', 'success');
      setVariantModal(null);
      setVariantForm(EMPTY_VARIANT);
      load();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  async function handleAdjustStock(e) {
    e.preventDefault();
    try {
      await adminApi.adjustStock(stockModal.variantId, {
        changeQuantity: Number(stockForm.changeQuantity),
        reason: stockForm.reason,
      });
      showToast('Stock updated', 'success');
      setStockModal(null);
      setStockForm(EMPTY_STOCK);
      load();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  return (
    <div className="px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-2xl text-charcoal">Products</h1>
        <Button size="sm" onClick={openNewProduct}>
          <span className="flex items-center gap-1.5"><Plus size={14} /> Add product</span>
        </Button>
      </div>

      <div className="rounded-card border border-border bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-cream text-left text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Variants</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {products === null ? (
              <tr><td className="px-4 py-6 text-muted" colSpan={5}>Loading…</td></tr>
            ) : products.length === 0 ? (
              <tr><td className="px-4 py-6 text-muted" colSpan={5}>No products yet.</td></tr>
            ) : (
              products.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-3 font-medium text-charcoal">{p.name}</td>
                  <td className="px-4 py-3 text-muted">{p.category?.name}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      {(p.variants || []).map((v) => (
                        <span key={v.id} className="text-xs text-muted">
                          {v.packSize} eggs · {formatCurrency(v.price)} · stock {v.stockQuantity}
                          <button
                            className="ml-2 text-forest hover:underline"
                            onClick={() => { setStockModal({ variantId: v.id, productName: p.name, packSize: v.packSize }); setStockForm(EMPTY_STOCK); }}
                          >
                            adjust
                          </button>
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${p.active !== false ? 'bg-forest/15 text-forest' : 'bg-charcoal/10 text-muted'}`}>
                      {p.active !== false ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3">
                      <button onClick={() => openEditProduct(p)} className="text-muted hover:text-charcoal" aria-label="Edit product"><Pencil size={15} /></button>
                      <button onClick={() => { setVariantModal({ productId: p.id }); setVariantForm(EMPTY_VARIANT); }} className="text-muted hover:text-charcoal" aria-label="Add variant"><PackagePlus size={15} /></button>
                      <button onClick={() => handleDeactivate(p.id)} className="text-muted hover:text-red-600" aria-label="Deactivate"><Layers size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Product modal */}
      {productModal !== null && (
        <Modal title={productModal?.id ? 'Edit product' : 'Add product'} onClose={() => setProductModal(null)}>
          <form onSubmit={handleSaveProduct} className="flex flex-col gap-3">
            <select
              required
              value={productForm.categoryId}
              onChange={(e) => setProductForm({ ...productForm, categoryId: e.target.value })}
              className="border border-border rounded-card px-3 py-2 text-sm"
            >
              <option value="">Select category</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <input required placeholder="Product name" value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} className="border border-border rounded-card px-3 py-2 text-sm" />
            <textarea placeholder="Description" value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} className="border border-border rounded-card px-3 py-2 text-sm" rows={3} />
            <input placeholder="Image URL (optional)" value={productForm.imageUrl} onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })} className="border border-border rounded-card px-3 py-2 text-sm" />
            <div className="flex gap-2 mt-2">
              <Button type="button" variant="secondary" className="flex-1" onClick={() => setProductModal(null)}>Cancel</Button>
              <Button type="submit" className="flex-1">Save</Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Variant modal */}
      {variantModal !== null && (
        <Modal title="Add variant" onClose={() => setVariantModal(null)}>
          <form onSubmit={handleAddVariant} className="flex flex-col gap-3">
            <input required type="number" placeholder="Pack size (e.g. 12)" value={variantForm.packSize} onChange={(e) => setVariantForm({ ...variantForm, packSize: e.target.value })} className="border border-border rounded-card px-3 py-2 text-sm" />
            <input required type="number" step="0.01" placeholder="Price" value={variantForm.price} onChange={(e) => setVariantForm({ ...variantForm, price: e.target.value })} className="border border-border rounded-card px-3 py-2 text-sm" />
            <input required type="number" placeholder="Initial stock" value={variantForm.stockQuantity} onChange={(e) => setVariantForm({ ...variantForm, stockQuantity: e.target.value })} className="border border-border rounded-card px-3 py-2 text-sm" />
            <div className="flex gap-2 mt-2">
              <Button type="button" variant="secondary" className="flex-1" onClick={() => setVariantModal(null)}>Cancel</Button>
              <Button type="submit" className="flex-1">Add</Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Stock adjust modal */}
      {stockModal !== null && (
        <Modal title={`Adjust stock — ${stockModal.productName} (${stockModal.packSize} eggs)`} onClose={() => setStockModal(null)}>
          <form onSubmit={handleAdjustStock} className="flex flex-col gap-3">
            <input required type="number" placeholder="Change (+10 to add, -5 to reduce)" value={stockForm.changeQuantity} onChange={(e) => setStockForm({ ...stockForm, changeQuantity: e.target.value })} className="border border-border rounded-card px-3 py-2 text-sm" />
            <select value={stockForm.reason} onChange={(e) => setStockForm({ ...stockForm, reason: e.target.value })} className="border border-border rounded-card px-3 py-2 text-sm">
              <option value="RESTOCK">Restock</option>
              <option value="ADJUSTMENT">Adjustment</option>
            </select>
            <div className="flex gap-2 mt-2">
              <Button type="button" variant="secondary" className="flex-1" onClick={() => setStockModal(null)}>Cancel</Button>
              <Button type="submit" className="flex-1">Update</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-charcoal/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-card p-6 w-full max-w-md">
        <h2 className="font-display text-lg mb-4">{title}</h2>
        {children}
      </div>
    </div>
  );
}
