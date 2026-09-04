import React, { useState } from 'react';
import { X, Save, Plus, Trash2, Edit3 } from 'lucide-react';
import { saveCorrections } from '../services/api';

export default function FieldEditor({ data, invoiceId, isOpen, onClose, onSaveSuccess }) {
  const [formData, setFormData] = useState(() => ({
    vendor_name: data?.vendor_name || '',
    vendor_address: data?.vendor_address || '',
    invoice_number: data?.invoice_number || '',
    invoice_date: data?.invoice_date || '',
    due_date: data?.due_date || '',
    currency: data?.currency || 'USD',
    subtotal: data?.subtotal ?? '',
    tax_rate: data?.tax_rate ?? '',
    tax_amount: data?.tax_amount ?? '',
    total_amount: data?.total_amount ?? '',
    line_items: Array.isArray(data?.line_items) ? JSON.parse(JSON.stringify(data.line_items)) : []
  }));

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLineItemChange = (idx, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.line_items];
      updated[idx] = { ...updated[idx], [field]: value };
      return { ...prev, line_items: updated };
    });
  };

  const handleAddLineItem = () => {
    setFormData((prev) => ({
      ...prev,
      line_items: [
        ...prev.line_items,
        { description: '', quantity: 1, unit_price: 0, total: 0 }
      ]
    }));
  };

  const handleRemoveLineItem = (idx) => {
    setFormData((prev) => ({
      ...prev,
      line_items: prev.line_items.filter((_, i) => i !== idx)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');

    try {
      const payload = {
        ...data,
        ...formData,
        subtotal: formData.subtotal === '' ? null : Number(formData.subtotal),
        tax_rate: formData.tax_rate === '' ? null : Number(formData.tax_rate),
        tax_amount: formData.tax_amount === '' ? null : Number(formData.tax_amount),
        total_amount: formData.total_amount === '' ? null : Number(formData.total_amount),
        line_items: formData.line_items.map((item) => ({
          ...item,
          quantity: item.quantity === '' ? 0 : Number(item.quantity),
          unit_price: item.unit_price === '' ? 0 : Number(item.unit_price),
          total: item.total === '' ? 0 : Number(item.total)
        }))
      };

      if (invoiceId) {
        await saveCorrections(invoiceId, payload);
      }

      if (onSaveSuccess) {
        onSaveSuccess(payload);
      }
      onClose();
    } catch (err) {
      console.error("Failed to save corrections:", err);
      setError(err.message || "Erreur lors de la sauvegarde des modifications.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card border border-border rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-foreground">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-foreground/5">
          <div className="flex items-center gap-2 text-foreground">
            <Edit3 size={18} className="text-[#E8724A]" />
            <h3 className="font-bold text-base text-foreground">
              Modifier les champs de la facture
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-foreground/60 hover:text-foreground hover:bg-foreground/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6 flex-1 text-sm text-foreground">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-600 dark:text-red-400 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Section: General Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-foreground/60 mb-1.5">
                Nom du fournisseur
              </label>
              <input
                type="text"
                value={formData.vendor_name}
                onChange={(e) => handleChange('vendor_name', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-background border border-border text-foreground focus:outline-none focus:border-[#E8724A] text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground/60 mb-1.5">
                Numéro de facture
              </label>
              <input
                type="text"
                value={formData.invoice_number}
                onChange={(e) => handleChange('invoice_number', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-background border border-border text-foreground focus:outline-none focus:border-[#E8724A] text-sm"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-foreground/60 mb-1.5">
                Adresse du fournisseur
              </label>
              <textarea
                rows={2}
                value={formData.vendor_address}
                onChange={(e) => handleChange('vendor_address', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-background border border-border text-foreground focus:outline-none focus:border-[#E8724A] text-sm resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground/60 mb-1.5">
                Date de facture
              </label>
              <input
                type="text"
                placeholder="YYYY-MM-DD"
                value={formData.invoice_date}
                onChange={(e) => handleChange('invoice_date', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-background border border-border text-foreground focus:outline-none focus:border-[#E8724A] text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground/60 mb-1.5">
                Date d'échéance
              </label>
              <input
                type="text"
                placeholder="YYYY-MM-DD"
                value={formData.due_date}
                onChange={(e) => handleChange('due_date', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-background border border-border text-foreground focus:outline-none focus:border-[#E8724A] text-sm"
              />
            </div>
          </div>

          {/* Section: Amounts */}
          <div className="pt-4 border-t border-border">
            <h4 className="font-semibold text-xs text-foreground/60 uppercase tracking-wider mb-3">
              Montants & Taxes
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-medium text-foreground/60 mb-1">
                  Devise
                </label>
                <input
                  type="text"
                  value={formData.currency}
                  onChange={(e) => handleChange('currency', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-background border border-border text-foreground focus:outline-none focus:border-[#E8724A] text-sm uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground/60 mb-1">
                  Sous-total
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.subtotal}
                  onChange={(e) => handleChange('subtotal', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-background border border-border text-foreground focus:outline-none focus:border-[#E8724A] text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground/60 mb-1">
                  Taux taxe (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.tax_rate}
                  onChange={(e) => handleChange('tax_rate', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-background border border-border text-foreground focus:outline-none focus:border-[#E8724A] text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground/60 mb-1">
                  Total
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.total_amount}
                  onChange={(e) => handleChange('total_amount', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-background border border-border text-[#E8724A] focus:outline-none focus:border-[#E8724A] text-sm font-mono font-bold"
                />
              </div>
            </div>
          </div>

          {/* Section: Line Items */}
          <div className="pt-4 border-t border-border">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-xs text-foreground/60 uppercase tracking-wider">
                Lignes d'articles ({formData.line_items.length})
              </h4>
              <button
                type="button"
                onClick={handleAddLineItem}
                className="inline-flex items-center gap-1 text-xs font-medium text-[#E8724A] hover:underline"
              >
                <Plus size={14} />
                Ajouter une ligne
              </button>
            </div>

            <div className="space-y-2.5">
              {formData.line_items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-foreground/5 p-2.5 rounded-xl border border-border">
                  <input
                    type="text"
                    placeholder="Description"
                    value={item.description || ''}
                    onChange={(e) => handleLineItemChange(idx, 'description', e.target.value)}
                    className="flex-1 px-2.5 py-1.5 rounded-lg bg-card border border-border text-foreground text-xs"
                  />
                  <input
                    type="number"
                    placeholder="Qté"
                    value={item.quantity ?? ''}
                    onChange={(e) => handleLineItemChange(idx, 'quantity', e.target.value)}
                    className="w-16 px-2 py-1.5 rounded-lg bg-card border border-border text-foreground text-xs font-mono text-right"
                  />
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Prix"
                    value={item.unit_price ?? ''}
                    onChange={(e) => handleLineItemChange(idx, 'unit_price', e.target.value)}
                    className="w-20 px-2 py-1.5 rounded-lg bg-card border border-border text-foreground text-xs font-mono text-right"
                  />
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Total"
                    value={item.total ?? ''}
                    onChange={(e) => handleLineItemChange(idx, 'total', e.target.value)}
                    className="w-20 px-2 py-1.5 rounded-lg bg-card border border-border text-foreground text-xs font-mono text-right"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveLineItem(idx)}
                    className="p-1.5 text-foreground/40 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </form>

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-foreground/5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-foreground/70 hover:text-foreground hover:bg-foreground/10 border border-border transition-colors"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#E8724A] hover:bg-[#E8724A]/90 text-white text-xs font-semibold transition-all disabled:opacity-50"
          >
            <Save size={14} />
            {isSaving ? "Sauvegarde..." : "Enregistrer les corrections"}
          </button>
        </div>

      </div>
    </div>
  );
}
