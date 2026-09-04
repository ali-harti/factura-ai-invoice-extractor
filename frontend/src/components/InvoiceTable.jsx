import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Eye, Download, Check } from 'lucide-react';
import StatusBadge from './StatusBadge';
import ConfidenceBadge from './ConfidenceBadge';
import { exportInvoices } from '../services/api';

function formatDate(dateStr) {
  if (!dateStr) return '-';
  try {
    // Handle YYYY-MM-DD or ISO strings
    const parts = dateStr.split('T')[0].split('-');
    if (parts.length === 3) {
      return `${parts[2].padStart(2, '0')}/${parts[1].padStart(2, '0')}/${parts[0]}`;
    }
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return dateStr;
  }
}

function formatAmount(amount, currency = 'USD') {
  if (amount === null || amount === undefined || amount === '') return '-';
  const num = Number(amount);
  if (isNaN(num)) return amount;
  try {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 2
    }).format(num);
  } catch {
    return `${num.toFixed(2)} ${currency || ''}`;
  }
}

export default function InvoiceTable({ invoices = [] }) {
  const navigate = useNavigate();
  const [downloadingId, setDownloadingId] = useState(null);
  const [downloadSuccessId, setDownloadSuccessId] = useState(null);

  const handleRowClick = (id) => {
    navigate(`/history/${id}`);
  };

  const handleDownload = async (e, id) => {
    e.stopPropagation();
    try {
      setDownloadingId(id);
      await exportInvoices([id], 'csv', 'fr');
      setDownloadSuccessId(id);
      setTimeout(() => {
        setDownloadSuccessId((current) => (current === id ? null : current));
      }, 2000);
    } catch (err) {
      console.error("Export CSV failed:", err);
    } finally {
      setDownloadingId(null);
    }
  };

  const handleView = (e, id) => {
    e.stopPropagation();
    navigate(`/history/${id}`);
  };

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-border bg-card shadow-sm transition-colors">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-border bg-foreground/5 text-xs font-semibold text-foreground/60 uppercase tracking-wider">
            <th className="py-3.5 px-4">Facture</th>
            <th className="py-3.5 px-4">Fournisseur</th>
            <th className="py-3.5 px-4">Date</th>
            <th className="py-3.5 px-4">Montant</th>
            <th className="py-3.5 px-4">Confiance</th>
            <th className="py-3.5 px-4">Statut</th>
            <th className="py-3.5 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border text-sm">
          {invoices.map((inv) => {
            const isSuccess = downloadSuccessId === inv.id;
            const isDownloading = downloadingId === inv.id;

            return (
              <tr
                key={inv.id}
                onClick={() => handleRowClick(inv.id)}
                className="group hover:bg-foreground/[0.03] transition-colors cursor-pointer"
              >
                {/* Facture */}
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-foreground/5 border border-border flex items-center justify-center text-[#E8724A] shrink-0 group-hover:border-[#E8724A]/40 transition-colors">
                      <FileText size={18} />
                    </div>
                    <div className="min-w-0 max-w-xs">
                      <div className="font-semibold text-foreground truncate group-hover:text-[#E8724A] transition-colors" title={inv.original_filename}>
                        {inv.original_filename || 'Facture'}
                      </div>
                      <div className="text-xs text-foreground/50 truncate">
                        {inv.invoice_number ? `N° ${inv.invoice_number}` : 'N° non détecté'}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Fournisseur */}
                <td className="py-3.5 px-4">
                  <div className="min-w-0 max-w-xs">
                    <div className="font-medium text-foreground truncate">
                      {inv.vendor_name || 'Fournisseur inconnu'}
                    </div>
                    <div className="text-xs text-foreground/50 truncate" title={inv.vendor_address || ''}>
                      {inv.vendor_address || '-'}
                    </div>
                  </div>
                </td>

                {/* Date */}
                <td className="py-3.5 px-4 text-foreground/70 whitespace-nowrap">
                  {formatDate(inv.invoice_date || inv.created_at)}
                </td>

                {/* Montant */}
                <td className="py-3.5 px-4 font-semibold text-foreground whitespace-nowrap">
                  {formatAmount(inv.total_amount, inv.currency)}
                </td>

                {/* Confiance */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <ConfidenceBadge score={inv.confidence_score} />
                </td>

                {/* Statut */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <StatusBadge status={inv.status} />
                </td>

                {/* Actions */}
                <td className="py-3.5 px-4 text-right whitespace-nowrap">
                  <div className="inline-flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={(e) => handleView(e, inv.id)}
                      title="Voir le détail"
                      className="p-2 rounded-lg text-foreground/60 hover:text-foreground hover:bg-foreground/10 transition-colors"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleDownload(e, inv.id)}
                      disabled={isDownloading}
                      title="Télécharger CSV"
                      className={`p-2 rounded-lg transition-colors ${
                        isSuccess
                          ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                          : 'text-foreground/60 hover:text-[#E8724A] hover:bg-foreground/10'
                      }`}
                    >
                      {isSuccess ? <Check size={16} /> : <Download size={16} />}
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
