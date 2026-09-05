import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { FileText, Loader, AlertCircle, Calendar, X, Eye } from 'lucide-react';
import ResultsView from '../components/ResultsView';

export default function HistoryPage() {
  const { language } = useLanguage();
  const { currentUser } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Details Modal State
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [invoiceDetails, setInvoiceDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, [currentUser]);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      let token = '';
      if (currentUser) {
        token = await currentUser.getIdToken();
      }

      const res = await fetch('http://127.0.0.1:8000/api/v1/invoices/', {
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });

      if (!res.ok) {
        try {
          const errData = await res.json();
          throw new Error(errData.detail || 'Failed to fetch history');
        } catch(e) {
          if (e.message !== 'Failed to fetch history' && !e.message.includes('Unexpected')) throw e;
          throw new Error(`Failed to fetch history (Status: ${res.status})`);
        }
      }

      const data = await res.json();
      setInvoices(data);
    } catch (err) {
      console.error(err);
      const isNetwork = err instanceof TypeError && err.message === 'Failed to fetch';
      setError(
        isNetwork
          ? (language === 'en' ? 'Cannot reach the server. Make sure the backend is running.' : 'Impossible de joindre le serveur. Vérifiez que le serveur est actif.')
          : err.message
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSeeDetails = async (inv) => {
    setSelectedInvoice(inv);
    setInvoiceDetails(null);
    setDetailsError(null);
    
    if (inv.status !== 'completed') {
       return;
    }
    
    setDetailsLoading(true);
    try {
        let token = '';
        if (currentUser) {
          token = await currentUser.getIdToken();
        }
        const res = await fetch(`http://127.0.0.1:8000/api/v1/invoices/status/${inv.id}`, {
          headers: {
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          }
        });
        if (!res.ok) throw new Error("Failed to fetch details");
        const data = await res.json();
        setInvoiceDetails(data.extracted_data);
    } catch(e) {
        setDetailsError(e.message);
    } finally {
        setDetailsLoading(false);
    }
  };

  const t = {
    title: language === 'en' ? 'Invoice History' : 'Historique des factures',
    subtitle: language === 'en' ? 'Your previously uploaded and extracted invoices.' : 'Vos factures précédemment téléchargées et extraites.',
    noData: language === 'en' ? 'No invoices found.' : 'Aucune facture trouvée.',
    loading: language === 'en' ? 'Loading...' : 'Chargement...',
    error: language === 'en' ? 'Error' : 'Erreur',
    retry: language === 'en' ? 'Retry' : 'Réessayer',
    filename: language === 'en' ? 'Filename' : 'Nom du fichier',
    status: language === 'en' ? 'Status' : 'Statut',
    date: language === 'en' ? 'Date' : 'Date',
    size: language === 'en' ? 'Size' : 'Taille',
    actions: language === 'en' ? 'Actions' : 'Actions',
    see_details: language === 'en' ? 'See Details' : 'Voir les détails',
    no_details: language === 'en' ? 'No details available for this invoice.' : 'Aucun détail disponible pour cette facture.',
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString(language === 'en' ? 'en-US' : 'fr-FR', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const formatSize = (bytes) => {
    if (!bytes) return '0 B';
    const mb = bytes / (1024 * 1024);
    return mb.toFixed(2) + ' MB';
  };

  return (
    <main className="flex-1 w-full max-w-5xl mx-auto px-6 py-12 flex flex-col relative z-10">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold mb-2">{t.title}</h1>
        <p className="text-foreground/70 text-sm">{t.subtitle}</p>
      </div>

      <div className="bg-background/60 backdrop-blur-xl border border-border/50 rounded-3xl shadow-2xl p-6 min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[300px]">
            <Loader className="w-8 h-8 text-accent animate-spin mb-4" />
            <p className="text-sm font-medium text-foreground/70">{t.loading}</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-red-500 gap-4">
            <AlertCircle className="w-10 h-10 mb-1 opacity-80" />
            <p className="text-sm font-medium text-center max-w-sm">{t.error}: {error}</p>
            <button
              onClick={fetchHistory}
              className="px-4 py-2 rounded-lg border border-red-500/20 text-red-500 hover:bg-red-500/10 transition-colors text-xs font-semibold inline-flex items-center gap-1.5"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/>
                <path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/>
              </svg>
              {t.retry}
            </button>
          </div>
        ) : invoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-foreground/50">
            <FileText className="w-12 h-12 mb-4 opacity-50" />
            <p className="text-base font-medium">{t.noData}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border/50 text-foreground/70 text-sm">
                  <th className="py-4 px-4 font-medium">{t.filename}</th>
                  <th className="py-4 px-4 font-medium">{t.date}</th>
                  <th className="py-4 px-4 font-medium">{t.size}</th>
                  <th className="py-4 px-4 font-medium">{t.status}</th>
                  <th className="py-4 px-4 font-medium text-right">{t.actions}</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id} className="border-b border-border/20 hover:bg-foreground/5 transition-colors text-sm">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                          <FileText className="w-4 h-4 text-accent" />
                        </div>
                        <span className="font-medium truncate max-w-[200px] md:max-w-[300px]" title={inv.original_filename}>
                          {inv.original_filename}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-foreground/70 flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(inv.created_at)}
                    </td>
                    <td className="py-4 px-4 text-foreground/70">{formatSize(inv.file_size)}</td>
                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        inv.status === 'completed' ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
                        inv.status === 'failed' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                        'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                      }`}>
                        {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      {inv.status === 'completed' && (
                        <button
                          onClick={() => handleSeeDetails(inv)}
                          className="px-3 py-1.5 rounded-lg border border-accent/20 text-accent hover:bg-accent/10 transition-colors text-xs font-semibold inline-flex items-center gap-1.5"
                        >
                          <Eye size={14} />
                          {t.see_details}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 md:p-12 overflow-y-auto bg-background/80 backdrop-blur-md">
          <div className="relative w-full max-w-5xl mx-auto flex flex-col min-h-0 animate-in fade-in zoom-in-95 duration-200">
             {/* Header with Close button */}
             <div className="flex justify-between items-center mb-4 bg-background/60 backdrop-blur-xl p-4 rounded-2xl border border-border/50 relative z-20 shadow-lg">
               <div>
                  <h3 className="font-semibold text-lg">{selectedInvoice.original_filename}</h3>
                  <p className="text-sm text-foreground/60">{formatDate(selectedInvoice.created_at)}</p>
               </div>
               <button 
                 onClick={() => setSelectedInvoice(null)}
                 className="p-2 rounded-full hover:bg-foreground/10 text-foreground transition-colors"
                 title="Close"
               >
                 <X size={20} />
               </button>
             </div>
             
             {/* Content */}
             <div className="w-full relative">
               {detailsLoading ? (
                  <div className="flex flex-col items-center justify-center py-20 bg-background/60 backdrop-blur-xl border border-border/50 shadow-2xl rounded-[2rem]">
                    <Loader className="w-8 h-8 text-accent animate-spin mb-4" />
                    <p className="text-sm font-medium text-foreground/70">{t.loading}</p>
                  </div>
               ) : detailsError ? (
                   <div className="flex flex-col items-center justify-center py-20 bg-background/60 backdrop-blur-xl border border-border/50 shadow-2xl rounded-[2rem] text-red-500 gap-4">
                     <AlertCircle className="w-10 h-10 opacity-80" />
                     <p className="text-sm font-medium text-center max-w-sm">{t.error}: {detailsError}</p>
                     <button
                       onClick={() => handleSeeDetails(selectedInvoice)}
                       className="px-4 py-2 rounded-lg border border-red-500/20 text-red-500 hover:bg-red-500/10 transition-colors text-xs font-semibold inline-flex items-center gap-1.5"
                     >
                       <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                         <path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/>
                         <path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/>
                       </svg>
                       {t.retry}
                     </button>
                   </div>
               ) : invoiceDetails ? (
                  <div className="-mt-8">
                    <ResultsView data={invoiceDetails} onDataChange={(newData) => setInvoiceDetails(newData)} />
                  </div>
               ) : (
                   <div className="flex flex-col items-center justify-center py-20 bg-background/60 backdrop-blur-xl border border-border/50 shadow-2xl rounded-[2rem] text-foreground/50">
                     <p className="text-sm font-medium">{t.no_details}</p>
                   </div>
               )}
             </div>
          </div>
        </div>
      )}
    </main>
  );
}
