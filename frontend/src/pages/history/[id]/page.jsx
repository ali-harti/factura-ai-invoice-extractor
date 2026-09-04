import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, AlertTriangle } from 'lucide-react';
import { getInvoice } from '../../../services/api';
import ResultsView from '../../../components/ResultsView';

export default function InvoiceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [invoiceData, setInvoiceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchInvoiceDetail = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getInvoice(id);
      // The API returns invoice object which might contain an 'extraction' sub-object or top-level fields
      const extraction = res.extraction ? { ...res, ...res.extraction } : res;
      setInvoiceData(extraction);
    } catch (err) {
      console.error("Failed to load invoice detail:", err);
      setError("Impossible de charger les détails de cette facture. Vérifiez qu'elle existe et que le serveur est démarré.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoiceDetail();
  }, [id]);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans pt-24 pb-16 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Back Button */}
        <div>
          <button
            type="button"
            onClick={() => navigate('/history')}
            className="inline-flex items-center gap-2 text-sm font-medium text-foreground/60 hover:text-[#E8724A] transition-colors group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
            <span>Retour à l'historique</span>
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-card border border-border rounded-2xl p-16 flex flex-col items-center justify-center space-y-4 shadow-sm transition-colors">
            <Loader2 size={36} className="text-[#E8724A] animate-spin" />
            <p className="text-sm text-foreground/60 font-medium">
              Chargement des détails de la facture...
            </p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 text-center space-y-4 text-red-600 dark:text-red-400">
            <div className="w-12 h-12 rounded-xl bg-red-500/20 text-red-500 flex items-center justify-center mx-auto">
              <AlertTriangle size={24} />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="text-base font-bold text-foreground">Erreur de chargement</h3>
              <p className="text-sm">{error}</p>
            </div>
            <button
              type="button"
              onClick={fetchInvoiceDetail}
              className="px-4 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-700 dark:text-red-200 text-xs font-semibold transition-colors"
            >
              Réessayer
            </button>
          </div>
        )}

        {/* Results View */}
        {!loading && !error && invoiceData && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-border">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-foreground">
                  {invoiceData.original_filename || 'Facture'}
                </h1>
                <p className="text-xs text-foreground/60 font-mono mt-0.5">
                  ID: {invoiceData.id || id}
                </p>
              </div>
            </div>

            {/* Reusing existing ResultsView component */}
            <ResultsView
              data={invoiceData}
              invoiceId={id}
              onDataChange={(updated) => setInvoiceData((prev) => ({ ...prev, ...updated }))}
            />
          </div>
        )}

      </div>
    </div>
  );
}
