import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import '../styles/landing.css';

export default function AuthLayout({ children }) {
  const navigate = useNavigate();
  const { language, toggleLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const canvasRef = useRef(null);

  /* ── Canvas particle system ── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let particles = [];

    const init = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
      const n = Math.min(Math.floor((canvas.width * canvas.height) / 4000), 400);
      particles = Array.from({ length: n }, () => ({
        x:       Math.random() * canvas.width,
        y:       Math.random() * canvas.height,
        radius:  Math.random() * 3 + 1,
        vx:      (Math.random() - 0.5) * 0.35,
        vy:      (Math.random() - 0.5) * 0.35,
        alpha:   Math.random() * 0.7 + 0.1,
        dAlpha:  (Math.random() - 0.5) * 0.012,
        accent:  Math.random() > 0.75,
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const isLight = document.documentElement.getAttribute('data-theme') === 'light';
      const base    = isLight ? 'rgba(0,0,0,' : 'rgba(255,255,255,';
      const accent  = 'rgba(232,114,74,';
      particles.forEach((p) => {
        p.x += p.vx; p.y += p.vy;
        p.alpha += p.dAlpha;
        if (p.alpha <= 0.1 || p.alpha >= 0.85) p.dAlpha *= -1;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${p.accent ? accent : base}${p.alpha})`;
        ctx.fill();
      });
      animId = requestAnimationFrame(draw);
    };

    init();
    draw();
    window.addEventListener('resize', init);
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', init); };
  }, []);

  return (
    <div className="landing-root auth-layout" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Canvas particles */}
      <canvas ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', pointerEvents: 'none', zIndex: 0 }} />
      
      {/* BG orbs */}
      <div className="bg-orbs" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }}>
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>

      {/* Header */}
      <nav className="l-nav scrolled" style={{ position: 'absolute', top: 0, width: '100%', zIndex: 10, background: 'transparent', borderBottom: 'none' }}>
        <div className="l-container l-nav-content" style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 2rem' }}>
          {/* Logo */}
          <a href="/" onClick={(e) => { e.preventDefault(); navigate('/'); }} className="l-logo" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'inherit', fontWeight: 'bold', fontSize: '1.5rem' }}>
            <img src="/logo.svg" alt="Factura Logo" style={{ width: '32px', height: '32px' }} />
            Factura
          </a>
          
          {/* Right actions */}
          <div className="l-nav-actions" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button className="l-theme-toggle" style={{ fontWeight: 700, fontSize: '14px', background: 'transparent', border: '1px solid rgba(150,150,150,0.2)', color: 'inherit', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              onClick={toggleLanguage}
              aria-label="Toggle language"
            >
              {language === 'en' ? 'FR' : 'EN'}
            </button>

            <button className="l-theme-toggle" style={{ background: 'transparent', border: '1px solid rgba(150,150,150,0.2)', color: 'inherit', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', cursor: 'pointer' }} onClick={toggleTheme} aria-label="Toggle theme">
              {theme === 'dark' ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                </svg>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', padding: '6rem 1rem 2rem 1rem' }}>
        {children}
      </div>
    </div>
  );
}
