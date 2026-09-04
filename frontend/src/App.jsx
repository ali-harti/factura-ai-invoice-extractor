import { Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import UploadSection from './components/UploadSection';
import HistoryPage from './pages/history/page';
import InvoiceDetailPage from './pages/history/[id]/page';

function UploadPage() {
  return (
    <div className="pt-24 min-h-screen flex flex-col bg-background transition-colors duration-300">
      <UploadSection />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <div className="min-h-screen bg-background text-foreground font-sans selection:bg-accent selection:text-white relative">
          <Navbar />
          <Routes>
            <Route path="/" element={<UploadPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/history/:id" element={<InvoiceDetailPage />} />
          </Routes>
        </div>
      </ThemeProvider>
    </LanguageProvider>
  );
}
