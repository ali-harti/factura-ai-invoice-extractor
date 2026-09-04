import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import UploadSection from './components/UploadSection';
import HistoryPage from './pages/history/page';
import InvoiceDetailPage from './pages/history/[id]/page';
import LoginPage from './pages/login/page';

const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  import.meta.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
  'placeholder-google-client-id.apps.googleusercontent.com';

function UploadPage() {
  return (
    <div className="pt-24 min-h-screen flex flex-col bg-background transition-colors duration-300">
      <UploadSection />
    </div>
  );
}

export default function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <LanguageProvider>
          <ThemeProvider>
            <div className="min-h-screen bg-background text-foreground font-sans selection:bg-accent selection:text-white relative">
              <Navbar />
              <Routes>
                {/* Public Route */}
                <Route path="/login" element={<LoginPage />} />

                {/* Protected Routes */}
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <UploadPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/history"
                  element={
                    <ProtectedRoute>
                      <HistoryPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/history/:id"
                  element={
                    <ProtectedRoute>
                      <InvoiceDetailPage />
                    </ProtectedRoute>
                  }
                />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </ThemeProvider>
        </LanguageProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}
