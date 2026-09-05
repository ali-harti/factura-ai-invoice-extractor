import React, { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import '../styles/auth.css';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { resetPassword } = useAuth();
  const t = useCallback((en, fr) => language === 'en' ? en : fr, [language]);

  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (isLoading) return;
    setError('');
    setIsLoading(true);
    try {
      await resetPassword(email);
      // Always show success to prevent email enumeration attacks
      setIsSubmitted(true);
    } catch (err) {
      // auth/user-not-found: still show success (security best practice)
      if (err?.code === 'auth/user-not-found') {
        setIsSubmitted(true);
      } else if (err?.code === 'auth/invalid-email') {
        setError(t('Please enter a valid email address.', 'Veuillez entrer une adresse e-mail valide.'));
      } else if (err?.code === 'auth/network-request-failed') {
        setError(t('Network error. Please check your connection.', 'Erreur r\u00e9seau. V\u00e9rifiez votre connexion.'));
      } else {
        setError(t('An error occurred. Please try again.', 'Une erreur s'\''est produite. Veuillez r\u00e9essayer.'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="auth-card enter" id="auth-card">
        <div className="auth-logo-wrap">
          <Link to="/" className="logo" style={{ textDecoration: 'none', color: 'inherit' }}>
            <img src="/logo.svg" alt="Factura Logo" />
            <span>Factura</span>
          </Link>
        </div>

        {!isSubmitted ? (
          <div id="forgot-container">
            <Link to="/login" className="back-link" style={{ display: 'inline-flex', alignItems: 'center', marginBottom: '1rem', color: 'var(--text-muted)', textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
              {t('Back to sign in', 'Retour \u00e0 la connexion')}
            </Link>

            <h2 className="auth-title">{t('Reset password', 'R\u00e9initialiser le mot de passe')}</h2>
            <p className="auth-subtitle">{t("Enter your email and we'll send you a link", "Entrez votre e-mail et nous vous enverrons un lien")}</p>

            {error && (
              <div className="auth-banner auth-banner--error" role="alert">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {error}
              </div>
            )}

            <form id="forgot-form" onSubmit={handleForgotPassword}>
              <div className="auth-field">
                <label>{t('Email', 'E-mail')}</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  disabled={isLoading}
                  autoComplete="email"
                />
              </div>

              <button type="submit" className="btn btn-primary auth-submit" disabled={isLoading} style={{ fontSize: '1.1rem', letterSpacing: '0.02em', marginTop: '0.5rem', boxShadow: '0 4px 14px 0 rgba(232,114,74,0.39)' }}>
                {isLoading ? (
                  <span className="btn-spinner-wrap">
                    <span className="btn-spinner" />
                    {t('Sending\u2026', 'Envoi\u2026')}
                  </span>
                ) : t('Send reset link', 'Envoyer le lien de r\u00e9initialisation')}
              </button>
            </form>
          </div>
        ) : (
          <div id="forgot-success-state" style={{ textAlign: 'center' }}>
            <div style={{
              width: '64px', height: '64px', background: 'rgba(34,197,94,0.12)',
              borderRadius: '50%', display: 'flex', alignItems: 'center',
              justifyContent: 'center', margin: '0 auto 24px auto',
              border: '1px solid rgba(34,197,94,0.3)'
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 13V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h8"></path>
                <polyline points="22 7 12 14 2 7"></polyline>
                <path d="m16 19 2 2 4-4"></path>
              </svg>
            </div>

            <h2 className="auth-title">{t('Check your email', 'V\u00e9rifiez vos e-mails')}</h2>
            <p className="auth-subtitle" style={{ marginBottom: '32px' }}>
              {t("We've sent a password reset link to", "Nous avons envoy\u00e9 un lien de r\u00e9initialisation \u00e0")} <br/>
              <strong style={{ color: 'var(--text)' }}>{email}</strong>
            </p>

            <button
              type="button"
              className="btn btn-primary auth-submit"
              onClick={() => navigate('/login')}
              style={{ fontSize: '1.1rem', letterSpacing: '0.02em', boxShadow: '0 4px 14px 0 rgba(232,114,74,0.39)' }}
            >
              {t('Return to login', 'Retour \u00e0 la connexion')}
            </button>
          </div>
        )}
      </div>
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
