import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Download, Check } from 'lucide-react';
import StatusBadge from './StatusBadge';
import ConfidenceBadge from './ConfidenceBadge';
import { exportInvoices } from '../services/api';

function formatDate(dateStr) {
  if (!dateStr) return '-';
  try {
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

export default function InvoiceCard({ invoice }) {
  const navigate = useNavigate();
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async (e) => {
    e.stopPropagation();
    try {
      setIsDownloading(true);
      await exportInvoices([invoice.id], 'csv', 'fr');
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 2000);
    } catch (err) {
      console.error("Export CSV failed:", err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div
      onClick={() => navigate(`/history/${invoice.id}`)}
      className="bg-card border border-border hover:border-[#E8724A]/40 rounded-xl p-4 transition-all duration-200 cursor-pointer space-y-3.5 shadow-sm"
    >
      {/* Top row: Filename, vendor, download */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-10 h-10 rounded-lg bg-foreground/5 border border-border flex items-center justify-center text-[#E8724A] shrink-0 mt-0.5">
            <FileText size={20} />
          </div>
          <div className="min-w-0">
            <h4 className="font-bold text-foreground text-sm truncate" title={invoice.original_filename}>
              {invoice.original_filename || 'Facture'}
            </h4>
            <p className="text-xs text-foreground/60 font-medium truncate mt-0.5">
              {invoice.vendor_name || 'Fournisseur inconnu'}
            </p>
            {invoice.invoice_number && (
              <p className="text-[11px] text-foreground/40 truncate">
                N° {invoice.invoice_number}
              </p>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={handleDownload}
          disabled={isDownloading}
          title="Télécharger CSV"
          className={`p-2 rounded-lg shrink-0 transition-colors ${
            downloadSuccess
              ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
              : 'bg-foreground/5 border border-border text-foreground/60 hover:text-[#E8724A] hover:bg-foreground/10'
          }`}
        >
          {downloadSuccess ? <Check size={16} /> : <Download size={16} />}
        </button>
      </div>

      {/* Middle row: Badges and Amount/Date */}
      <div className="flex items-center justify-between pt-2 border-t border-border text-xs">
        <div className="flex items-center gap-2">
          <StatusBadge status={invoice.status} />
          <ConfidenceBadge score={invoice.confidence_score} />
        </div>
        <div className="text-right">
          <div className="font-bold text-foreground text-sm">
            {formatAmount(invoice.total_amount, invoice.currency)}
          </div>
          <div className="text-[11px] text-foreground/60">
            {formatDate(invoice.invoice_date || invoice.created_at)}
          </div>
        </div>
      </div>

      {/* Bottom Button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          navigate(`/history/${invoice.id}`);
        }}
        className="w-full py-2 px-3 rounded-lg bg-foreground/5 hover:bg-[#E8724A] text-foreground hover:text-white text-xs font-semibold tracking-wide transition-colors flex items-center justify-center gap-1.5 border border-border hover:border-[#E8724A]"
      >
        Voir
      </button>
    </div>
  );
}
