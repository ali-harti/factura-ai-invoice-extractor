import React, { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { getAuthErrorMessage } from '../utils/firebaseErrors';
import '../styles/auth.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { loginWithEmail, loginWithGoogle } = useAuth();
  const t = useCallback((en, fr) => language === 'en' ? en : fr, [language]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (isLoading) return;
    setError('');
    setIsLoading(true);
    try {
      await loginWithEmail(email, password);
      navigate('/app');
    } catch (err) {
      setError(getAuthErrorMessage(err, language));
    } finally {
      setIsLoading(false);
    }
  };

  const triggerGoogleAuth = async () => {
    if (isLoading) return;
    setError('');
    setIsLoading(true);
    try {
      await loginWithGoogle();
      navigate('/app');
    } catch (err) {
      setError(getAuthErrorMessage(err, language));
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

        <div id="login-container">
          <h2 className="auth-title">{t('Welcome back', 'Ravi de vous revoir')}</h2>
          <p className="auth-subtitle">{t('Sign in to your Factura account', 'Connectez-vous \u00e0 votre compte Factura')}</p>

          {error && (
            <div id="login-error" className="auth-banner auth-banner--error" role="alert">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          <button type="button" className="google-btn" onClick={triggerGoogleAuth} disabled={isLoading}>
            <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span>{t('Continue with Google', 'Continuer avec Google')}</span>
          </button>

          <div className="auth-divider">
            <span>{t('or', 'ou')}</span>
          </div>

          <form id="login-form" onSubmit={handleLogin}>
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

            <div className="auth-field">
              <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{t('Password', 'Mot de passe')}</span>
                <Link to="/forgot-password" tabIndex="-1" className="forgot-link" style={{ color: 'var(--accent)', textDecoration: 'none', fontSize: '13px', fontWeight: 500 }}>
                  {t('Forgot?', 'Oubli\u00e9 ?')}
                </Link>
              </label>
              <div className="password-wrap">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  style={{ paddingRight: '40px' }}
                  disabled={isLoading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="pwd-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={t('Toggle password visibility', 'Afficher/masquer le mot de passe')}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="auth-terms">
              <label>
                <input type="checkbox" />
                <span style={{ color: 'var(--text-muted)' }}>{t('Keep me signed in', 'Rester connect\u00e9')}</span>
              </label>
            </div>

            <button type="submit" className="btn btn-primary auth-submit" disabled={isLoading} style={{ fontSize: '1.1rem', letterSpacing: '0.02em', marginTop: '0.5rem', boxShadow: '0 4px 14px 0 rgba(232,114,74,0.39)' }}>
              {isLoading ? (
                <span className="btn-spinner-wrap">
                  <span className="btn-spinner" />
                  {t('Signing in\u2026', 'Connexion\u2026')}
                </span>
              ) : t('Sign in', 'Se connecter')}
            </button>
          </form>

          <p className="auth-bottom">
            {t("Don't have an account?", "Vous n'avez pas de compte ?")} <Link to="/signup">{t('Sign up for free', "S'inscrire gratuitement")}</Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
};

export default LoginPage;
