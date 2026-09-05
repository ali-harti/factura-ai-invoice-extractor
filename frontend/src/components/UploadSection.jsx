import { useState, useRef, useEffect } from 'react';
import { Upload, File, CheckCircle, AlertCircle, Loader, Info } from 'lucide-react';
import ResultsView from './ResultsView';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

export default function UploadSection() {
  const sectionRef = useRef(null);
  const { language } = useLanguage();
  const { currentUser } = useAuth();
  
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [uploadState, setUploadState] = useState('idle'); // idle, uploading, processing, complete, error
  const [errorMsg, setErrorMsg] = useState('');
  const [extractedData, setExtractedData] = useState(null);
  const [invoiceId, setInvoiceId] = useState(null);

  // Poll status when processing
  useEffect(() => {
    let pollInterval;
    if (uploadState === 'processing' && invoiceId) {
      pollInterval = setInterval(async () => {
        try {
          let token = '';
          if (currentUser) {
            token = await currentUser.getIdToken();
          }
          const res = await fetch(`http://127.0.0.1:8000/api/v1/invoices/status/${invoiceId}`, {
            headers: {
              ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            }
          });
          if (!res.ok) throw new Error("Failed to check status");
          const data = await res.json();
          
          if (data.status === 'completed') {
            setUploadState('complete');
            setExtractedData(data.extracted_data);
            clearInterval(pollInterval);
          } else if (data.status === 'failed') {
            setUploadState('error');
            setErrorMsg(data.error_message || "Extraction failed.");
            clearInterval(pollInterval);
          }
        } catch (err) {
          console.error(err);
        }
      }, 3000);
    }
    return () => clearInterval(pollInterval);
  }, [uploadState, invoiceId]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateAndSetFile = (selectedFile) => {
    if (!selectedFile) return;
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!validTypes.includes(selectedFile.type)) {
      setUploadState('error');
      setErrorMsg('Invalid file type. Please upload a PDF, JPEG, or PNG.');
      return;
    }
    setFile(selectedFile);
    setUploadState('idle');
    setErrorMsg('');
    setExtractedData(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    
    setUploadState('uploading');
    const formData = new FormData();
    formData.append('file', file);

    try {
      let token = '';
      if (currentUser) {
        token = await currentUser.getIdToken();
      }
      
      const res = await fetch('http://127.0.0.1:8000/api/v1/invoices/upload', {
        method: 'POST',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: formData,
      });
      
      if (!res.ok) {
        throw new Error('Upload failed');
      }
      
      const data = await res.json();
      setInvoiceId(data.id);
      setUploadState('processing');
    } catch (err) {
      console.error(err);
      setUploadState('error');
      setErrorMsg('Network error during upload. Ensure backend is running.');
    }
  };

  const reset = () => {
    setFile(null);
    setUploadState('idle');
    setExtractedData(null);
    setInvoiceId(null);
  };

  const t = {
    title: language === 'en' ? 'Upload Invoice' : 'Télécharger la facture',
    subtitle: language === 'en' ? 'Upload your document to extract structured data.' : 'Téléchargez votre document pour extraire des données structurées.',
    drag: language === 'en' ? 'Drag & drop a file here' : 'Glissez-déposez un fichier ici',
    or: language === 'en' ? 'or click to select' : 'ou cliquez pour sélectionner',
    cancel: language === 'en' ? 'Cancel' : 'Annuler',
    begin: language === 'en' ? 'Extract Data' : 'Extraire les données',
    uploading: language === 'en' ? 'Uploading...' : 'Téléchargement...',
    processing: language === 'en' ? 'Processing with AI...' : 'Traitement par IA en cours...',
    complete: language === 'en' ? 'Processing Complete' : 'Traitement terminé',
    another: language === 'en' ? 'Upload Another' : 'Télécharger une autre',
  };

  return (
    <main ref={sectionRef} className="flex-1 w-full max-w-3xl mx-auto px-6 py-12 flex flex-col relative z-10">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold mb-2">{t.title}</h1>
        <p className="text-foreground/70 text-sm">{t.subtitle}</p>
      </div>
      
      {!extractedData ? (
        <div className="relative">
          {/* The Drop Zone */}
          <form 
            onDragEnter={handleDrag} 
            onDragLeave={handleDrag} 
            onDragOver={handleDrag} 
            onDrop={handleDrop}
            onSubmit={(e) => e.preventDefault()}
            className={`border rounded-[2rem] p-10 transition-colors flex flex-col items-center justify-center text-center backdrop-blur-xl shadow-2xl
              ${dragActive ? 'border-accent bg-accent/10' : 'border-border/50 hover:border-foreground/30 bg-background/60'}
              ${uploadState !== 'idle' && uploadState !== 'error' ? 'pointer-events-none opacity-50' : ''}
            `}
          >
            <input 
              type="file" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={handleChange}
              accept=".pdf,image/jpeg,image/png"
              disabled={uploadState === 'uploading' || uploadState === 'processing'}
            />
            
            {!file ? (
              <>
                <Upload size={24} className="text-foreground/50 mb-4" />
                <h3 className="text-base font-medium mb-1">{t.drag}</h3>
                <p className="text-foreground/50 text-sm mb-6">{t.or}</p>
                <div className="flex gap-2 text-xs text-foreground/50">
                  <span>PDF</span> &bull; <span>JPEG</span> &bull; <span>PNG</span>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center z-10 relative w-full">
                <File size={24} className="text-accent mb-3" />
                <h3 className="text-base font-medium mb-1 break-all">{file.name}</h3>
                <p className="text-foreground/50 text-xs mb-8">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                
                {uploadState === 'idle' || uploadState === 'error' ? (
                  <div className="flex gap-3">
                    <button 
                      onClick={(e) => { e.stopPropagation(); reset(); }}
                      className="px-5 py-2 rounded-lg border border-border/50 hover:bg-foreground/5 transition-colors text-sm font-medium backdrop-blur-md"
                    >
                      {t.cancel}
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleUpload(); }}
                      className="px-6 py-2 rounded-lg bg-accent text-white font-medium hover:bg-accent/90 transition-all text-sm"
                      style={{ boxShadow: '0 4px 14px 0 rgba(232,114,74,0.39)' }}
                    >
                      {t.begin}
                    </button>
                  </div>
                ) : null}
              </div>
            )}
          </form>

          {/* Status Overlays */}
          {(uploadState === 'uploading' || uploadState === 'processing') && (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none">
              <Loader className="w-6 h-6 text-foreground animate-spin mb-3" />
              <p className="text-sm font-medium text-foreground">
                {uploadState === 'uploading' ? t.uploading : t.processing}
              </p>
            </div>
          )}

          {uploadState === 'error' && (
            <div className="mt-4 p-4 border border-red-500/20 bg-red-500/5 rounded-lg flex items-start gap-3 text-red-500 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <p>{errorMsg}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-background/60 backdrop-blur-xl border border-border/50 rounded-2xl shadow-xl">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <CheckCircle size={16} className="text-green-500" />
              {t.complete}
            </div>
            <button 
              onClick={reset}
              className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors"
            >
              {t.another}
            </button>
          </div>
          <ResultsView data={extractedData} onDataChange={setExtractedData} />
        </div>
      )}
    </main>
  );
}
