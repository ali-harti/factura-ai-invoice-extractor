import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import UploadSection from './components/UploadSection';
import DashboardLayout from './components/DashboardLayout';

/* Lazy-load the landing page so it doesn't bloat the main bundle */
const LandingPage  = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const SignupPage = lazy(() => import('./pages/SignupPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const HistoryPage = lazy(() => import('./pages/HistoryPage'));

/* Public routes that render their own navbar — hide the app Navbar there */
const PUBLIC_ROUTES = ['/', '/login', '/signup', '/forgot-password'];

function UploadPage() {
  return (
    <DashboardLayout>
      <UploadSection />
    </DashboardLayout>
  );
}

function HistoryPageRoute() {
  return (
    <DashboardLayout>
      <HistoryPage />
    </DashboardLayout>
  );
}

function ProtectedRoute({ children }) {
  const { currentUser } = useAuth();
  const location = useLocation();

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

function AppShell() {
  const location   = useLocation();
  const isPublic   = PUBLIC_ROUTES.includes(location.pathname);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-accent selection:text-white relative">

      <Suspense fallback={<div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#E8724A' }}>Loading…</div>}>
        <Routes>
          {/* ── Marketing ── */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* ── App ── */}
          <Route path="/app" element={
            <ProtectedRoute>
              <UploadPage />
            </ProtectedRoute>
          } />
          <Route path="/app/history" element={
            <ProtectedRoute>
              <HistoryPageRoute />
            </ProtectedRoute>
          } />

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
        <AuthProvider>
          <AppShell />
        </AuthProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}
