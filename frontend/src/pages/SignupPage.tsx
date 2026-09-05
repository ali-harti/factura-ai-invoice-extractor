import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';

const SignupPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup, googleLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please try again.');
      return;
    }

    setLoading(true);
    try {
      await signup({ name, email, password });
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const signupGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        await googleLogin(tokenResponse.access_token);
        navigate('/');
      } catch (err: any) {
        setError(err.message || 'Google signup failed');
      }
    },
    onError: () => setError('Google signup failed')
  });

  const handleGoogle = () => {
    signupGoogle();
  };

  return (
    <div className="auth-view" style={{ display: 'flex', opacity: 1, minHeight: '100vh', alignItems: 'center', justifyContent: 'center' }}>
      <div className="auth-card enter" id="auth-card">
        <Link to="/" className="auth-logo">
          <div className="logo-mark">F</div>
          Factura
        </Link>
        <div id="signup-container" style={{ display: 'block', opacity: 1 }}>
          <h2 className="auth-title">Create an account</h2>
          <p className="auth-sub">Start extracting invoice data in seconds.</p>
          
          {error && (
            <div className="auth-error-banner" id="signup-error" style={{ display: 'block' }}>
              {error}
            </div>
          )}
          
          <button className="auth-google-btn" type="button" onClick={handleGoogle}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Sign up with Google
          </button>
          
          <div className="auth-divider">
            <span>or sign up with email</span>
          </div>
          
          <form id="signup-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="signup-name">Full Name</label>
              <input type="text" id="signup-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" required />
            </div>
            <div className="form-group">
              <label htmlFor="signup-email">Email</label>
              <input type="email" id="signup-email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" required />
            </div>
            <div className="form-group">
              <label htmlFor="signup-password">Password</label>
              <div className="pwd-wrapper">
                <input type="password" id="signup-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="signup-confirm">Confirm Password</label>
              <div className="pwd-wrapper">
                <input type="password" id="signup-confirm" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
              </div>
            </div>
            
            <div className="form-options">
              <label className="checkbox-label">
                <input type="checkbox" required />
                <span>I agree to the Terms and Privacy Policy</span>
              </label>
            </div>
            <button type="submit" className="btn btn-primary auth-submit-btn" id="signup-btn" disabled={loading}>
              {loading ? 'Creating...' : 'Create account'}
            </button>
          </form>
          
          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
