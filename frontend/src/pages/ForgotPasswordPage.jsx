import React, { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import { useLanguage } from '../context/LanguageContext';
import '../styles/auth.css';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = useCallback((en, fr) => language === 'en' ? en : fr, [language]);
  
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleForgotPassword = (e) => {
    e.preventDefault();
    setIsSubmitted(true);
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
              {t('Back to sign in', 'Retour à la connexion')}
            </Link>
            
            <h2 className="auth-title">{t('Reset password', 'Réinitialiser le mot de passe')}</h2>
            <p className="auth-subtitle">{t("Enter your email and we'll send you a link", "Entrez votre e-mail et nous vous enverrons un lien")}</p>
            
            <form id="forgot-form" onSubmit={handleForgotPassword}>
              <div className="auth-field">
                <label>{t('Email', 'E-mail')}</label>
                <input 
                  type="email" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              
              <button type="submit" className="btn btn-primary auth-submit" style={{ fontSize: '1.1rem', letterSpacing: '0.02em', marginTop: '0.5rem', boxShadow: '0 4px 14px 0 rgba(232,114,74,0.39)' }}>
                {t('Send reset link', 'Envoyer le lien de réinitialisation')}
              </button>
            </form>
          </div>
        ) : (
          <div id="forgot-success-state" style={{ textAlign: 'center' }}>
            <div style={{ 
              width: '64px', height: '64px', background: 'rgba(232, 114, 74, 0.1)', 
              borderRadius: '50%', display: 'flex', alignItems: 'center', 
              justifyContent: 'center', margin: '0 auto 24px auto' 
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 13V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h8"></path>
                <polyline points="22 7 12 14 2 7"></polyline>
                <path d="m16 19 2 2 4-4"></path>
              </svg>
            </div>
            
            <h2 className="auth-title">{t('Check your email', 'Vérifiez vos e-mails')}</h2>
            <p className="auth-subtitle" style={{ marginBottom: '32px' }}>
              {t("We've sent a password reset link to", "Nous avons envoyé un lien de réinitialisation à")} <br/>
              <strong style={{ color: 'var(--text)' }}>{email}</strong>
            </p>
            
            <button 
              type="button" 
              className="btn btn-primary auth-submit" 
              onClick={() => navigate('/login')}
              style={{ fontSize: '1.1rem', letterSpacing: '0.02em', boxShadow: '0 4px 14px 0 rgba(232,114,74,0.39)' }}
            >
              {t('Return to login', 'Retour à la connexion')}
            </button>
          </div>
        )}
      </div>
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
