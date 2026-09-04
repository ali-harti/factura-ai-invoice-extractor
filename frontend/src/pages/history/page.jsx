import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, RotateCcw, AlertTriangle, FileText, Upload } from 'lucide-react';
import { getHistory } from '../../services/api';
import InvoiceTable from '../../components/InvoiceTable';
import InvoiceCard from '../../components/InvoiceCard';
import Pagination from '../../components/Pagination';
import SkeletonRow, { SkeletonCard } from '../../components/SkeletonRow';

export default function HistoryPage() {
  const navigate = useNavigate();

  // State management per prompt requirements
  const [invoices, setInvoices] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    vendor: '',
    status: '',
    date_from: '',
    date_to: '',
  });

  // Local search input state for 400ms debounce
  const [searchQuery, setSearchQuery] = useState('');
  const debounceTimerRef = useRef(null);

  // Handle search input debounce (400ms)
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      setFilters((prev) => ({ ...prev, vendor: val }));
      setPage(1);
    }, 400);
  };

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Fetch history data
  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        limit: 20,
        vendor: filters.vendor || undefined,
        status: filters.status && filters.status !== 'all' ? filters.status : undefined,
        date_from: filters.date_from || undefined,
        date_to: filters.date_to || undefined,
      };

      const res = await getHistory(params);
      const items = res.items || res.data || [];
      setInvoices(items);
      setTotal(res.total ?? items.length);
    } catch (err) {
      console.error("Failed to load history:", err);
      setError("Impossible de charger l'historique. Vérifiez que le serveur est démarré.");
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  // Trigger fetch on filter change or page change
  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Handle filter changes
  const handleStatusChange = (e) => {
    setFilters((prev) => ({ ...prev, status: e.target.value }));
    setPage(1);
  };

  const handleDateFromChange = (e) => {
    setFilters((prev) => ({ ...prev, date_from: e.target.value }));
    setPage(1);
  };

  const handleDateToChange = (e) => {
    setFilters((prev) => ({ ...prev, date_to: e.target.value }));
    setPage(1);
  };

  // Reset all filters
  const handleResetFilters = () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    setSearchQuery('');
    setFilters({
      vendor: '',
      status: '',
      date_from: '',
      date_to: '',
    });
    setPage(1);
  };

  const totalPages = Math.ceil(total / 20) || 1;

  return (
    <div className="min-h-screen bg-background text-foreground font-sans pt-24 pb-16 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Top Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Historique des extractions
            </h1>
            <p className="text-sm text-foreground/60 mt-1">
              Toutes vos factures traitées
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate('/')}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#E8724A] hover:bg-[#E8724A]/90 text-white font-medium text-sm transition-all shadow-sm active:scale-[0.98] self-start sm:self-auto"
          >
            <Plus size={18} />
            Nouvelle facture
          </button>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-card border border-border rounded-2xl p-4 shadow-sm transition-colors">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3.5 items-center">
            
            {/* Search Input (5 cols on lg) */}
            <div className="relative lg:col-span-4">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-foreground/40">
                <Search size={16} />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Rechercher par fournisseur..."
                className="w-full pl-10 pr-3.5 py-2 rounded-xl bg-background border border-border text-sm text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-[#E8724A] transition-colors"
              />
            </div>

            {/* Status Filter (3 cols on lg) */}
            <div className="lg:col-span-3">
              <select
                value={filters.status}
                onChange={handleStatusChange}
                className="w-full px-3.5 py-2 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:border-[#E8724A] transition-colors cursor-pointer"
              >
                <option value="">Tous les statuts</option>
                <option value="completed">Complété</option>
                <option value="processing">En cours</option>
                <option value="failed">Échoué</option>
              </select>
            </div>

            {/* Date From (2 cols on lg) */}
            <div className="flex items-center gap-2 lg:col-span-2">
              <span className="text-xs font-medium text-foreground/60 shrink-0">Du</span>
              <input
                type="date"
                value={filters.date_from}
                onChange={handleDateFromChange}
                className="w-full px-2.5 py-1.5 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none focus:border-[#E8724A] transition-colors dark:[color-scheme:dark] [color-scheme:light]"
              />
            </div>

            {/* Date To (2 cols on lg) */}
            <div className="flex items-center gap-2 lg:col-span-2">
              <span className="text-xs font-medium text-foreground/60 shrink-0">Au</span>
              <input
                type="date"
                value={filters.date_to}
                onChange={handleDateToChange}
                className="w-full px-2.5 py-1.5 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none focus:border-[#E8724A] transition-colors dark:[color-scheme:dark] [color-scheme:light]"
              />
            </div>

            {/* Reset Button (1 col on lg) */}
            <div className="lg:col-span-1 flex justify-end">
              <button
                type="button"
                onClick={handleResetFilters}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-foreground/60 hover:text-foreground hover:bg-foreground/5 border border-border bg-card transition-colors"
                title="Effacer les filtres"
              >
                <RotateCcw size={14} />
                <span>Réinitialiser</span>
              </button>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-red-600 dark:text-red-400">
            <div className="flex items-center gap-2.5">
              <AlertTriangle size={18} className="text-red-500 shrink-0" />
              <span className="text-sm font-medium">{error}</span>
            </div>
            <button
              type="button"
              onClick={fetchHistory}
              className="px-3.5 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-700 dark:text-red-200 text-xs font-semibold transition-colors shrink-0"
            >
              Réessayer
            </button>
          </div>
        )}

        {/* Invoice List / Loading / Empty State */}
        {loading ? (
          <div>
            {/* Desktop skeleton */}
            <div className="hidden md:block overflow-hidden rounded-xl border border-border bg-card">
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
                <tbody>
                  {[...Array(5)].map((_, i) => (
                    <SkeletonRow key={`skel-row-${i}`} />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile skeleton */}
            <div className="md:hidden space-y-3">
              {[...Array(5)].map((_, i) => (
                <SkeletonCard key={`skel-card-${i}`} />
              ))}
            </div>
          </div>
        ) : invoices.length === 0 ? (
          /* Empty State */
          <div className="bg-card border border-border rounded-2xl p-12 text-center space-y-4 shadow-sm transition-colors">
            <div className="w-16 h-16 rounded-2xl bg-foreground/5 border border-border text-[#E8724A] flex items-center justify-center mx-auto">
              <FileText size={32} />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="text-lg font-bold text-foreground">
                Aucune facture trouvée
              </h3>
              <p className="text-sm text-foreground/60">
                Uploadez votre première facture pour commencer
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#E8724A] hover:bg-[#E8724A]/90 text-white font-semibold text-sm transition-all shadow-sm active:scale-[0.98]"
            >
              <Upload size={16} />
              Uploader une facture
            </button>
          </div>
        ) : (
          /* Table on desktop, Stack on mobile */
          <div className="space-y-4">
            <div className="hidden md:block">
              <InvoiceTable invoices={invoices} />
            </div>
            <div className="md:hidden space-y-3">
              {invoices.map((inv) => (
                <InvoiceCard key={inv.id} invoice={inv} />
              ))}
            </div>

            {/* Pagination */}
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalItems={total}
              itemsPerPage={20}
              onPageChange={(newPage) => setPage(newPage)}
            />
          </div>
        )}

      </div>
    </div>
  );
}
