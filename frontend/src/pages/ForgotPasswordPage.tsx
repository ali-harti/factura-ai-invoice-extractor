import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const response = await fetch('/api/v1/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await response.json();
      
      if (response.ok) {
        setSuccess(true);
      } else {
        setError(data.error || "An error occurred. Please try again.");
      }
    } catch (err) {
      setError("A network error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-view" style={{ display: 'flex', opacity: 1, minHeight: '100vh', alignItems: 'center', justifyContent: 'center' }}>
      <div className="auth-card enter" id="auth-card">
        <Link to="/" className="auth-logo">
          <div className="logo-mark">F</div>
          Factura
        </Link>
        <div id="forgot-container" style={{ display: 'block', opacity: 1 }}>
          
          {!success ? (
            <div id="forgot-entry-state">
              <h2 className="auth-title">Reset password</h2>
              <p className="auth-sub">Enter your email and we'll send you a link to reset your password.</p>
              
              {error && (
                <div className="auth-error-banner" id="forgot-error-banner" style={{ display: 'block' }}>
                  {error}
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="forgot-email">Email</label>
                  <input type="email" id="forgot-email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" required />
                </div>
                <button type="submit" className="btn btn-primary auth-submit-btn" id="forgot-btn" disabled={loading} style={{ marginTop: '0.5rem' }}>
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>
              
              <p className="auth-switch" style={{ marginTop: '2rem' }}>
                <Link to="/login" className="back-link">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                  Back to login
                </Link>
              </p>
            </div>
          ) : (
            <div id="forgot-success-state" style={{ textAlign: 'center', padding: '1rem 0' }}>
              <div className="success-icon" style={{ margin: '0 auto 1.5rem' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
              </div>
              <h2 className="auth-title">Check your email</h2>
              <p className="auth-sub" style={{ marginBottom: '2rem' }}>We sent a password reset link to <strong id="forgot-success-email" style={{ color: 'var(--text)' }}>{email}</strong>.</p>
              
              <p className="auth-switch">
                <Link to="/login" className="back-link" style={{ justifyContent: 'center' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                  Back to login
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
