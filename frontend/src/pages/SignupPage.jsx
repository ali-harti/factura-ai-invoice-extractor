import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import '../styles/auth.css';

const SignupPage = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { loginWithGoogle } = useAuth();
  const t = useCallback((en, fr) => language === 'en' ? en : fr, [language]);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [strength, setStrength] = useState(0);
  const [error, setError] = useState('');

  // Evaluate password strength
  useEffect(() => {
    let s = 0;
    if (password.length > 5) s++;
    if (password.length > 8) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9!@#$]/.test(password)) s++;
    setStrength(password ? s : 0);
  }, [password]);

  const handleSignup = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError(t('Passwords do not match', 'Les mots de passe ne correspondent pas'));
      return;
    }
    navigate('/app');
  };

  const triggerGoogleAuth = async () => {
    try {
      await loginWithGoogle();
      navigate('/app');
    } catch (err) {
      setError(t('Failed to sign up with Google.', 'Échec de l\'inscription avec Google.'));
      console.error(err);
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
        
        <div id="signup-container">
          <h2 className="auth-title">{t('Create your account', 'Créez votre compte')}</h2>
          <p className="auth-subtitle">{t('Start extracting invoices in minutes', 'Commencez à extraire des factures en quelques minutes')}</p>
          {error && <div className="auth-banner">{error}</div>}
          
          <button type="button" className="google-btn" onClick={triggerGoogleAuth}>
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
          
          <form id="signup-form" onSubmit={handleSignup}>
            <div className="auth-field">
              <label>{t('Full name', 'Nom complet')}</label>
              <input 
                type="text" 
                required 
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            
            <div className="auth-field">
              <label>{t('Email', 'E-mail')}</label>
              <input 
                type="email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div className="auth-field">
              <label>{t('Password', 'Mot de passe')}</label>
              <div className="password-wrap">
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingRight: '40px' }}
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
              <div className="pwd-strength">
                <div className={`pwd-seg ${strength >= 1 ? 's-1' : ''}`}></div>
                <div className={`pwd-seg ${strength >= 2 ? 's-2' : ''}`}></div>
                <div className={`pwd-seg ${strength >= 3 ? 's-3' : ''}`}></div>
                <div className={`pwd-seg ${strength >= 4 ? 's-4' : ''}`}></div>
              </div>
            </div>
            
            <div className="auth-field">
              <label>{t('Confirm password', 'Confirmer le mot de passe')}</label>
              <input 
                type="password" 
                required 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              {error && <div className="inline-err">{error}</div>}
            </div>
            
            <div className="auth-terms">
              <label>
                <input type="checkbox" required />
                <span>
                  {t('I agree to the ', 'J\'accepte les ')} 
                  <Link to="#">{t('Terms of Service', 'Conditions d\'utilisation')}</Link> 
                  {t(' and ', ' et la ')} 
                  <Link to="#">{t('Privacy Policy', 'Politique de confidentialité')}</Link>
                </span>
              </label>
            </div>
            
            <button type="submit" className="btn btn-primary auth-submit" style={{ fontSize: '1.1rem', letterSpacing: '0.02em', marginTop: '0.5rem', boxShadow: '0 4px 14px 0 rgba(232,114,74,0.39)' }}>
              {t('Create account', 'Créer un compte')}
            </button>
          </form>
          
          <p className="auth-bottom">
            {t('Already have an account?', 'Vous avez déjà un compte ?')} <Link to="/login">{t('Sign in', 'Se connecter')}</Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
};

export default SignupPage;
