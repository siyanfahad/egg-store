import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { addressApi } from '../services/addressApi';
import { useToast } from '../context/ToastContext';
import Button from '../components/ui/Button';
import EmptyState from '../components/common/EmptyState';

const EMPTY_FORM = { label: '', line1: '', line2: '', city: '', state: '', pincode: '', phone: '', isDefault: false };

export default function Addresses() {
  const [addresses, setAddresses] = useState(null);
  const [editing, setEditing] = useState(null); // null = closed, {} = new, {...} = editing existing
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  function load() {
    addressApi.list().then(setAddresses).catch(() => setAddresses([]));
  }

  useEffect(load, []);

  function openNew() {
    setForm(EMPTY_FORM);
    setEditing({});
  }

  function openEdit(addr) {
    setForm({ ...addr });
    setEditing(addr);
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing?.id) {
        await addressApi.update(editing.id, form);
      } else {
        await addressApi.create(form);
      }
      showToast('Address saved', 'success');
      setEditing(null);
      load();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    try {
      await addressApi.remove(id);
      showToast('Address removed', 'success');
      load();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-2xl text-charcoal">Saved addresses</h1>
        <Button size="sm" onClick={openNew}>
          <span className="flex items-center gap-1.5"><Plus size={14} /> Add address</span>
        </Button>
      </div>

      {addresses === null ? (
        <p className="text-muted text-sm">Loading…</p>
      ) : addresses.length === 0 ? (
        <EmptyState title="No addresses yet" subtitle="Add one to speed up checkout." />
      ) : (
        <ul className="flex flex-col gap-3">
          {addresses.map((addr) => (
            <li key={addr.id} className="rounded-card border border-border bg-white p-4 flex justify-between items-start">
              <div>
                <p className="font-medium text-charcoal flex items-center gap-2">
                  {addr.label}
                  {addr.isDefault && <span className="text-[10px] uppercase bg-gold/20 text-charcoal px-1.5 py-0.5 rounded">Default</span>}
                </p>
                <p className="text-sm text-muted">{addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}</p>
                <p className="text-sm text-muted">{addr.city}, {addr.state} {addr.pincode}</p>
                <p className="text-sm text-muted">{addr.phone}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEdit(addr)} className="text-muted hover:text-charcoal"><Pencil size={16} /></button>
                <button onClick={() => handleDelete(addr.id)} className="text-muted hover:text-red-600"><Trash2 size={16} /></button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {editing !== null && (
        <div className="fixed inset-0 bg-charcoal/40 flex items-center justify-center z-50 p-4">
          <form onSubmit={handleSave} className="bg-white rounded-card p-6 w-full max-w-md flex flex-col gap-3">
            <h2 className="font-display text-lg mb-2">{editing?.id ? 'Edit address' : 'Add address'}</h2>
            {['label', 'line1', 'line2', 'city', 'state', 'pincode', 'phone'].map((field) => (
              <input
                key={field}
                required={field !== 'line2'}
                placeholder={field === 'line1' ? 'Address line 1' : field === 'line2' ? 'Address line 2 (optional)' : field[0].toUpperCase() + field.slice(1)}
                value={form[field]}
                onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                className="border border-border rounded-card px-3 py-2 text-sm outline-none focus:border-forest"
              />
            ))}
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.isDefault} onChange={(e) => setForm({ ...form, isDefault: e.target.checked })} />
              Set as default
            </label>
            <div className="flex gap-2 mt-2">
              <Button type="button" variant="secondary" className="flex-1" onClick={() => setEditing(null)}>Cancel</Button>
              <Button type="submit" className="flex-1" disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
