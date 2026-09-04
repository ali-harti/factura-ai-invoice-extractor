import React, { useState } from 'react';
import { FileText, Building2, Calendar, DollarSign, List, ChevronRight, Edit2, Save, X, Download, FileSpreadsheet } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function ResultsView({ data, onDataChange }) {
  const { language } = useLanguage();
  const [isEditingRaw, setIsEditingRaw] = useState(false);
  const [rawJsonStr, setRawJsonStr] = useState('');
  const [jsonError, setJsonError] = useState('');
  
  const t = {
    vendor: language === 'en' ? 'Vendor' : 'Fournisseur',
    invoice_num: language === 'en' ? 'Invoice No.' : 'N° Facture',
    date: language === 'en' ? 'Date' : 'Date',
    due_date: language === 'en' ? 'Due Date' : 'Échéance',
    total: language === 'en' ? 'Total Amount' : 'Montant Total',
    subtotal: language === 'en' ? 'Subtotal' : 'Sous-total',
    tax_rate: language === 'en' ? 'Tax Rate' : 'Taux de Taxe',
    tax_amount: language === 'en' ? 'Tax Amount' : 'Montant Taxe',
    line_items: language === 'en' ? 'Line Items' : 'Lignes',
    desc: language === 'en' ? 'Description' : 'Description',
    qty: language === 'en' ? 'Qty' : 'Qté',
    unit_price: language === 'en' ? 'Unit Price' : 'Prix Unitaire',
    raw: language === 'en' ? 'View Raw JSON' : 'Voir JSON Brut',
    unknown: language === 'en' ? 'Unknown' : 'Inconnu',
    no_address: language === 'en' ? 'No address found' : 'Aucune adresse trouvée',
    na: language === 'en' ? 'N/A' : 'N/D',
    includes_tax: language === 'en' ? 'Includes' : 'Inclut',
    tax: language === 'en' ? 'tax' : 'de taxes',
    no_line_items: language === 'en' ? 'No line items extracted.' : 'Aucune ligne extraite.',
    language: language === 'en' ? 'Language' : 'Langue',
    confidence: language === 'en' ? 'Confidence' : 'Confiance',
  };

  if (!data) return null;

  // Format currency
  const formatMoney = (amount) => {
    if (amount === null || amount === undefined) return '-';
    return new Intl.NumberFormat(language === 'en' ? 'en-US' : 'fr-FR', {
      style: 'currency',
      currency: data.currency || 'USD'
    }).format(amount);
  };

  const handleDownloadJson = () => {
    let exportData = data;
    
    // Translate JSON keys if language is French
    if (language === 'fr') {
      exportData = {
        nom_fournisseur: data.vendor_name,
        adresse_fournisseur: data.vendor_address,
        numero_facture: data.invoice_number,
        date_facture: data.invoice_date,
        date_echeance: data.due_date,
        devise: data.currency,
        sous_total: data.subtotal,
        taux_taxe: data.tax_rate,
        montant_taxe: data.tax_amount,
        montant_total: data.total_amount,
        langue_detectee: data.language_detected,
        score_confiance: data.confidence_score,
        lignes: data.line_items ? data.line_items.map(item => ({
          description: item.description,
          quantite: item.quantity,
          prix_unitaire: item.unit_price,
          total: item.total
        })) : []
      };
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = data.invoice_number ? `facture_${data.invoice_number}.json` : 'donnees_facture.json';
    if (language === 'en') {
      a.download = data.invoice_number ? `invoice_${data.invoice_number}.json` : 'invoice_data.json';
    }
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadCsv = () => {
    const escapeCsv = (str) => {
      if (str === null || str === undefined) return '""';
      const s = String(str).replace(/"/g, '""');
      return `"${s}"`;
    };

    const rows = [];
    const isFr = language === 'fr';
    
    // 1. General Invoice Info
    rows.push([isFr ? 'Numéro de Facture' : 'Invoice Number', escapeCsv(data.invoice_number)]);
    rows.push([isFr ? 'Date de Facture' : 'Invoice Date', escapeCsv(data.invoice_date)]);
    rows.push([isFr ? 'Date d\'Échéance' : 'Due Date', escapeCsv(data.due_date)]);
    rows.push([isFr ? 'Nom du Fournisseur' : 'Vendor Name', escapeCsv(data.vendor_name)]);
    rows.push([isFr ? 'Adresse du Fournisseur' : 'Vendor Address', escapeCsv(data.vendor_address?.replace(/\n/g, ' '))]);
    rows.push([isFr ? 'Devise' : 'Currency', escapeCsv(data.currency)]);
    rows.push([isFr ? 'Langue Détectée' : 'Language Detected', escapeCsv(data.language_detected)]);
    rows.push([isFr ? 'Score de Confiance' : 'Confidence Score', escapeCsv(data.confidence_score !== null ? `${Math.round(data.confidence_score * 100)}%` : '')]);
    
    rows.push([]); // Empty row for spacing
    
    // 2. Financial Summary
    rows.push([isFr ? 'Sous-total' : 'Subtotal', escapeCsv(data.subtotal)]);
    rows.push([isFr ? 'Taux de Taxe (%)' : 'Tax Rate (%)', escapeCsv(data.tax_rate)]);
    rows.push([isFr ? 'Montant de la Taxe' : 'Tax Amount', escapeCsv(data.tax_amount)]);
    rows.push([isFr ? 'Montant Total' : 'Total Amount', escapeCsv(data.total_amount)]);
    
    rows.push([]); // Empty row for spacing
    
    // 3. Line Items
    rows.push([isFr ? 'Lignes de Facture' : 'Line Items']);
    rows.push([
      isFr ? 'Description' : 'Description', 
      isFr ? 'Qté' : 'Qty', 
      isFr ? 'Prix Unitaire' : 'Unit Price', 
      isFr ? 'Total' : 'Total'
    ].map(escapeCsv));
    
    if (data.line_items && data.line_items.length > 0) {
      data.line_items.forEach(item => {
        rows.push([
          escapeCsv(item.description),
          escapeCsv(item.quantity),
          escapeCsv(item.unit_price),
          escapeCsv(item.total)
        ]);
      });
    } else {
      rows.push([isFr ? 'Aucune ligne trouvée' : 'No line items found']);
    }

    const csvContent = rows.map(row => row.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = data.invoice_number ? `facture_${data.invoice_number}.csv` : 'donnees_facture.csv';
    if (language === 'en') {
      a.download = data.invoice_number ? `invoice_${data.invoice_number}.csv` : 'invoice_data.csv';
    }
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleEditRaw = () => {
    setRawJsonStr(JSON.stringify(data, null, 2));
    setJsonError('');
    setIsEditingRaw(true);
  };

  const handleSaveRaw = () => {
    try {
      const parsed = JSON.parse(rawJsonStr);
      if (onDataChange) {
        onDataChange(parsed);
      }
      setIsEditingRaw(false);
    } catch (err) {
      setJsonError(language === 'en' ? 'Invalid JSON format' : 'Format JSON invalide');
    }
  };

  const handleCancelRaw = () => {
    setIsEditingRaw(false);
    setJsonError('');
  };

  return (
    <div className="micro-ui-card p-6 mt-8 relative">
      {/* Top Action Bar */}
      <div className="flex justify-end mb-4 gap-2">
        <button
          onClick={handleDownloadCsv}
          className="flex items-center gap-2 px-3 py-1.5 bg-foreground/5 hover:bg-foreground/10 text-foreground/80 hover:text-foreground rounded-md text-xs font-semibold transition-colors"
        >
          <FileSpreadsheet size={14} />
          {language === 'en' ? 'Download CSV' : 'Télécharger CSV'}
        </button>
        <button
          onClick={handleDownloadJson}
          className="flex items-center gap-2 px-3 py-1.5 bg-foreground/5 hover:bg-foreground/10 text-foreground/80 hover:text-foreground rounded-md text-xs font-semibold transition-colors"
        >
          <Download size={14} />
          {language === 'en' ? 'Download JSON' : 'Télécharger JSON'}
        </button>
      </div>

      {/* Header Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        
        <div className="bg-background/50 rounded-lg p-5 border border-border lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2 text-foreground/60">
              <Building2 size={14} />
              <span className="font-mono text-xs font-semibold uppercase">{t.vendor}</span>
            </div>
            <p className="font-sans font-medium text-lg text-foreground break-words" title={data.vendor_name}>
              {data.vendor_name || t.unknown}
            </p>
            <p className="text-sm text-foreground/60 mt-2 break-words font-mono whitespace-pre-wrap" title={data.vendor_address}>
              {data.vendor_address || t.no_address}
            </p>
          </div>
          {(data.language_detected || data.confidence_score !== null) && (
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border">
              {data.language_detected && (
                <div className="flex items-center gap-2 text-xs font-mono text-foreground/60">
                  <span className="uppercase">{t.language}:</span>
                  <span className="font-semibold text-foreground">{data.language_detected.toUpperCase()}</span>
                </div>
              )}
              {data.confidence_score !== null && data.confidence_score !== undefined && (
                <div className="flex items-center gap-2 text-xs font-mono text-foreground/60">
                  <span className="uppercase">{t.confidence}:</span>
                  <span className="font-semibold text-foreground">{Math.round(data.confidence_score * 100)}%</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4 lg:col-span-1">
          <div className="bg-background/50 rounded-lg p-5 border border-border flex-1">
            <div className="flex items-center gap-2 mb-2 text-foreground/60">
              <FileText size={14} />
              <span className="font-mono text-xs font-semibold uppercase">{t.invoice_num}</span>
            </div>
            <p className="font-sans font-medium text-lg text-foreground break-all">
              {data.invoice_number || t.na}
            </p>
          </div>
          
          <div className="bg-background/50 rounded-lg p-5 border border-border flex-1">
            <div className="flex items-center gap-2 mb-2 text-foreground/60">
              <Calendar size={14} />
              <span className="font-mono text-xs font-semibold uppercase">{t.date}</span>
            </div>
            <p className="font-sans font-medium text-lg text-foreground">
              {data.invoice_date || t.na}
            </p>
            {data.due_date && (
              <div className="mt-2 pt-2 border-t border-border/50">
                <span className="font-mono text-[10px] uppercase text-foreground/50 block">{t.due_date}</span>
                <span className="font-sans text-sm text-foreground/80">{data.due_date}</span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-accent/10 rounded-lg p-5 border border-accent/20 lg:col-span-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2 text-accent">
              <DollarSign size={14} />
              <span className="font-mono text-xs font-semibold uppercase">{t.total}</span>
            </div>
            <p className="font-sans font-semibold text-2xl xl:text-3xl text-foreground break-words">
              {formatMoney(data.total_amount)}
            </p>
          </div>
          
          <div className="mt-4 pt-4 border-t border-accent/20 flex flex-col gap-3">
            <div className="flex justify-between items-start text-sm font-mono gap-4">
              <span className="text-foreground/60 leading-tight">{t.subtotal}</span>
              <span className="text-foreground whitespace-nowrap">{formatMoney(data.subtotal)}</span>
            </div>
            <div className="flex justify-between items-start text-sm font-mono gap-4">
              <span className="text-foreground/60 leading-tight">{t.tax_amount} {data.tax_rate ? `(${data.tax_rate}%)` : ''}</span>
              <span className="text-foreground whitespace-nowrap">{formatMoney(data.tax_amount)}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Line Items */}
      <div>
        <div className="flex items-center gap-2 mb-4 px-1">
          <List size={18} className="text-foreground/70" />
          <h4 className="font-sans font-semibold text-lg text-foreground">{t.line_items}</h4>
        </div>
        
        {data.line_items && data.line_items.length > 0 ? (
          <div className="overflow-hidden rounded-lg border border-border bg-background/50">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-card">
                  <th className="py-3 px-4 font-sans text-sm text-foreground/70 font-medium">{t.desc}</th>
                  <th className="py-3 px-4 font-sans text-sm text-foreground/70 font-medium text-right">{t.qty}</th>
                  <th className="py-3 px-4 font-sans text-sm text-foreground/70 font-medium text-right">{t.unit_price}</th>
                  <th className="py-3 px-4 font-sans text-sm text-foreground/70 font-medium text-right">{t.total}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.line_items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-foreground/5 transition-colors">
                    <td className="py-4 px-4 font-sans text-sm text-foreground">{item.description}</td>
                    <td className="py-4 px-4 font-mono text-sm text-foreground/80 text-right">{item.quantity}</td>
                    <td className="py-4 px-4 font-mono text-sm text-foreground/80 text-right">{formatMoney(item.unit_price)}</td>
                    <td className="py-4 px-4 font-mono text-sm font-medium text-foreground text-right">{formatMoney(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center bg-background/50 rounded-lg border border-dashed border-border">
            <p className="text-foreground/60 font-sans text-sm">{t.no_line_items}</p>
          </div>
        )}
      </div>
      
      {/* Raw Data Toggle */}
      <div className="mt-8 pt-6 border-t border-border">
        <details className="group cursor-pointer">
          <summary className="font-sans text-sm font-medium text-foreground/70 hover:text-foreground select-none flex items-center gap-2">
            <span className="w-5 h-5 flex items-center justify-center group-open:rotate-90 transition-transform">
              <ChevronRight size={16} />
            </span>
            {t.raw}
          </summary>
          <div className="mt-4 bg-background rounded-lg p-5 border border-border">
            {!isEditingRaw ? (
              <div className="relative group/edit">
                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover/edit:opacity-100 transition-opacity">
                  <button
                    onClick={handleDownloadJson}
                    className="p-2 bg-foreground/5 hover:bg-foreground/10 text-foreground/70 hover:text-foreground rounded-md transition-colors flex items-center gap-2 text-xs font-semibold"
                  >
                    <Download size={14} />
                    {language === 'en' ? 'Download' : 'Télécharger'}
                  </button>
                  <button
                    onClick={handleEditRaw}
                    className="p-2 bg-foreground/5 hover:bg-foreground/10 text-foreground/70 hover:text-foreground rounded-md transition-colors flex items-center gap-2 text-xs font-semibold"
                  >
                    <Edit2 size={14} />
                    {language === 'en' ? 'Edit' : 'Modifier'}
                  </button>
                </div>
                <pre className="font-mono text-xs text-foreground/80 leading-relaxed overflow-x-auto">
                  {JSON.stringify(data, null, 2)}
                </pre>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <textarea
                  value={rawJsonStr}
                  onChange={(e) => setRawJsonStr(e.target.value)}
                  className="w-full h-96 bg-background font-mono text-xs text-foreground/80 leading-relaxed p-4 rounded-md border border-border focus:border-accent outline-none resize-y"
                  spellCheck={false}
                />
                {jsonError && (
                  <p className="text-red-500 text-xs font-semibold">{jsonError}</p>
                )}
                <div className="flex justify-end gap-2">
                  <button
                    onClick={handleCancelRaw}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-border text-foreground/70 hover:bg-foreground/5 hover:text-foreground text-xs font-medium transition-colors"
                  >
                    <X size={14} />
                    {language === 'en' ? 'Cancel' : 'Annuler'}
                  </button>
                  <button
                    onClick={handleSaveRaw}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-accent text-white hover:bg-accent/90 text-xs font-medium transition-colors"
                  >
                    <Save size={14} />
                    {language === 'en' ? 'Save' : 'Enregistrer'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </details>
      </div>
    </div>
  );
}
