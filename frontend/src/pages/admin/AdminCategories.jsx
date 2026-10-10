import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { adminApi } from '../../services/adminApi';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/ui/Button';

export default function AdminCategories() {
  const [categories, setCategories] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const { showToast } = useToast();

  function load() {
    adminApi.listCategories().then(setCategories).catch(() => setCategories([]));
  }

  useEffect(load, []);

  async function handleSave(e) {
    e.preventDefault();
    try {
      await adminApi.createCategory(form);
      showToast('Category created', 'success');
      setForm({ name: '', description: '' });
      setModalOpen(false);
      load();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  return (
    <div className="px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-2xl text-charcoal">Categories</h1>
        <Button size="sm" onClick={() => setModalOpen(true)}>
          <span className="flex items-center gap-1.5"><Plus size={14} /> Add category</span>
        </Button>
      </div>

      <div className="rounded-card border border-border bg-white divide-y divide-border">
        {categories === null ? (
          <p className="px-4 py-6 text-muted text-sm">Loading…</p>
        ) : categories.length === 0 ? (
          <p className="px-4 py-6 text-muted text-sm">No categories yet.</p>
        ) : (
          categories.map((c) => (
            <div key={c.id} className="px-4 py-3 flex justify-between items-center">
              <div>
                <p className="font-medium text-charcoal text-sm">{c.name}</p>
                <p className="text-xs text-muted">{c.description}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-charcoal/40 flex items-center justify-center z-50 p-4">
          <form onSubmit={handleSave} className="bg-white rounded-card p-6 w-full max-w-sm flex flex-col gap-3">
            <h2 className="font-display text-lg mb-2">Add category</h2>
            <input required placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="border border-border rounded-card px-3 py-2 text-sm" />
            <input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="border border-border rounded-card px-3 py-2 text-sm" />
            <div className="flex gap-2 mt-2">
              <Button type="button" variant="secondary" className="flex-1" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button type="submit" className="flex-1">Save</Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
