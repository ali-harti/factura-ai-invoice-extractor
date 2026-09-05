import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import UploadSection from './components/UploadSection';

/* Lazy-load the landing page so it doesn't bloat the main bundle */
const LandingPage  = lazy(() => import('./pages/LandingPage'));

/* Public routes that render their own navbar — hide the app Navbar there */
const PUBLIC_ROUTES = ['/'];

function UploadPage() {
  return (
    <div className="pt-24 min-h-screen flex flex-col bg-background transition-colors duration-300">
      <UploadSection />
    </div>
  );
}

function AppShell() {
  const location   = useLocation();
  const isPublic   = PUBLIC_ROUTES.includes(location.pathname);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-accent selection:text-white relative">
      {/* Hide the app Navbar on public/marketing routes */}
      {!isPublic && <Navbar />}

      <Suspense fallback={<div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#E8724A' }}>Loading…</div>}>
        <Routes>
          {/* ── Marketing ── */}
          <Route path="/" element={<LandingPage />} />

          {/* ── App ── */}
          <Route path="/app" element={<UploadPage />} />

          {/* ── Catch-all ── */}
          <Route path="*" element={<Navigate to="/app" replace />} />
        </Routes>
      </Suspense>
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <AppShell />
      </ThemeProvider>
    </LanguageProvider>
  );
}
