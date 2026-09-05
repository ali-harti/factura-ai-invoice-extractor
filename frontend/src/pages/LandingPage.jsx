import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/landing.css';

/* ─────────────────────────────────────
   Static data
───────────────────────────────────── */
const TESTIMONIALS = [
  { initials: 'JD', quote: '"Factura cut our invoice processing time by 90%. It\'s like magic."',                                    name: 'Jane Doe',      role: 'CFO at TechFlow'             },
  { initials: 'AK', quote: '"We process invoices in 15 languages. Factura handles them all without a hiccup."',                    name: 'Ahmed Khan',    role: 'VP Finance, GlobalTrade'      },
  { initials: 'SD', quote: '"The best AI tool we\'ve integrated this year. Simple, fast, and incredibly accurate."',               name: 'Sarah Dubois',  role: 'Accounting Director, Luxe'   },
  { initials: 'YT', quote: '"No more manual entry. Our team can finally focus on strategic work."',                                name: 'Yosuke Tanaka', role: 'Operations Lead, K.K. Nexus'  },
];

const FAQS = [
  {
    q: 'What languages does Factura support?',
    a: 'Factura supports over 50 languages globally. Our AI vision model is trained to recognize Latin, Arabic, Cyrillic, Devanagari, and CJK (Chinese, Japanese, Korean) scripts seamlessly without any manual pre-configuration.',
  },
  {
    q: 'How accurate is the extraction?',
    a: 'On clean, digital PDFs and high-quality scans, Factura achieves 95%+ accuracy. For every extraction, we provide a confidence score so your team knows exactly which invoices might require a quick human review.',
  },
  {
    q: 'Is my invoice data secure?',
    a: 'Absolutely. Data is encrypted in transit and at rest. We are SOC2 compliant, and we do not use your invoice data to train our foundational models. For maximum security, see our Enterprise private deployment option.',
  },
  {
    q: 'What file formats are accepted?',
    a: 'We accept PDF (both native text and scanned), JPG, and PNG formats. Multi-page documents are fully supported up to a file size of 20MB per upload.',
  },
  {
    q: 'Can I self-host Factura for full data privacy?',
    a: 'Yes, our Enterprise plan includes an option for VPC or on-premise deployment. This ensures that your sensitive financial data never leaves your internal corporate network.',
  },
];

/* ─────────────────────────────────────
   Helper: scroll to anchor
───────────────────────────────────── */
const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

/* ─────────────────────────────────────
   Main component
───────────────────────────────────── */
export default function LandingPage() {
  const navigate = useNavigate();

  // ── UI state ──
  const [theme, setTheme]             = useState('dark');
  const [lang, setLang]               = useState('en');
  const [scrolled, setScrolled]       = useState(false);
  const [progress, setProgress]       = useState(0);
  const [activeFaq, setActiveFaq]     = useState(null);
  const [chatOpen, setChatOpen]       = useState(false);
  const [chatInput, setChatInput]     = useState('');
  const [messages, setMessages]       = useState([
    { text: "Hi there! I'm the Factura AI assistant. How can I help you today?", sender: 'bot' },
  ]);

  // ── Refs ──
  const canvasRef    = useRef(null);
  const chatEndRef   = useRef(null);

  // ── Translation helper ──
  const t = useCallback((en, fr) => lang === 'en' ? en : fr, [lang]);

  /* ── Theme: set data-theme on <html> ── */
  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    return () => document.documentElement.removeAttribute('data-theme');
  }, [theme]);

  /* ── Scroll: navbar + progress bar ── */
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 50);
      const scrollTop    = document.documentElement.scrollTop || document.body.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      setProgress(scrollHeight ? (scrollTop / scrollHeight) * 100 : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* ── Fade-up IntersectionObserver ── */
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } }),
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' },
    );
    document.querySelectorAll('.fade-up').forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  /* ── Stats count-up ── */
  useEffect(() => {
    const obs = new IntersectionObserver((entries, o) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el       = entry.target;
        const target   = parseFloat(el.getAttribute('data-target'));
        const isPercent = el.hasAttribute('data-percent');
        const isSecs    = el.hasAttribute('data-seconds');
        const isPlus    = el.hasAttribute('data-plus');
        const start = performance.now();
        const animate = (now) => {
          const p = Math.min((now - start) / 2000, 1);
          const ease = 1 - (1 - p) ** 2;
          const prefix = isSecs ? '< ' : '';
          const suffix = isPercent ? '%' : isPlus ? '+' : '';
          el.textContent = `${prefix}${Math.floor(target * ease)}${suffix}`;
          if (p < 1) requestAnimationFrame(animate);
          else el.textContent = `${prefix}${target}${suffix}`;
        };
        requestAnimationFrame(animate);
        o.unobserve(el);
      });
    }, { threshold: 0.5 });
    document.querySelectorAll('.l-stat-num').forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

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
      // Higher density: 1 particle per 4000 px², capped at 400
      const n = Math.min(Math.floor((canvas.width * canvas.height) / 4000), 400);
      particles = Array.from({ length: n }, () => ({
        x:       Math.random() * canvas.width,
        y:       Math.random() * canvas.height,
        radius:  Math.random() * 3 + 1,          // 1 – 4 px
        vx:      (Math.random() - 0.5) * 0.35,
        vy:      (Math.random() - 0.5) * 0.35,
        alpha:   Math.random() * 0.7 + 0.1,       // 0.1 – 0.8 opacity
        dAlpha:  (Math.random() - 0.5) * 0.012,
        accent:  Math.random() > 0.75,             // 25% accent colour
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

  /* ── Auto-scroll chat ── */
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /* ─── Chat handler ─── */
  const handleChat = async (e) => {
    e.preventDefault();
    const text = chatInput.trim();
    if (!text) return;
    setChatInput('');
    setMessages((m) => [...m, { text, sender: 'user' }, { text: 'Thinking…', sender: 'bot loading' }]);
    try {
      const res  = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: text, sessionId: 'user-session' }) });
      const data = await res.json();
      setMessages((m) => [...m.filter((x) => x.sender !== 'bot loading'), { text: res.ok ? data.text : 'Sorry, I encountered an error.', sender: 'bot' }]);
    } catch {
      setMessages((m) => [...m.filter((x) => x.sender !== 'bot loading'), { text: 'Network error. Is the server running?', sender: 'bot' }]);
    }
  };

  /* ─── Headline ─── */
  const renderHeadline = () => {
    if (lang === 'fr') {
      return (
        <>
          <span className="reveal-word" style={{ animationDelay: '0s' }}>Toute facture.</span><br />
          <span className="reveal-word" style={{ animationDelay: '0.15s' }}>Toute langue.</span><br />
          <span className="reveal-word" style={{ animationDelay: '0.3s' }}>En secondes.</span>
        </>
      );
    }
    return (
      <>
        <span className="reveal-word" style={{ animationDelay: '0s' }}>Any invoice. Any</span><br />
        <span className="reveal-word" style={{ animationDelay: '0.15s' }}>language. Seconds.</span>
      </>
    );
  };

  /* ═══════════════════════════════════
     RENDER
  ═══════════════════════════════════ */
  return (
    <div className="landing-root">
      {/* Canvas particles */}
      <canvas ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', pointerEvents: 'none', zIndex: 0 }} />

      {/* Scroll progress */}
      <div className="scroll-progress" style={{ width: `${progress}%` }} />

      {/* BG orbs — three for depth */}
      <div className="bg-orbs">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>

      {/* ── NAVBAR ── */}
      <nav className={`l-nav${scrolled ? ' scrolled' : ''}`}>
        <div className="l-container l-nav-content">
          {/* Logo */}
          <a href="/" onClick={(e) => { e.preventDefault(); navigate('/'); }} className="l-logo">
            <img src="/logo.svg" alt="Factura Logo" />
            Factura
          </a>

          {/* Center links */}
          <div className="l-nav-links">
            <a href="#features"    onClick={(e) => { e.preventDefault(); scrollTo('features');    }}>{t('Features',    'Fonctionnalités')}</a>
            <a href="#how-it-works" onClick={(e) => { e.preventDefault(); scrollTo('how-it-works'); }}>{t('How it works', 'Comment ça marche')}</a>
            <a href="#pricing"     onClick={(e) => { e.preventDefault(); scrollTo('pricing');     }}>{t('Pricing',      'Tarifs')}</a>
            <a href="#faq"         onClick={(e) => { e.preventDefault(); scrollTo('faq');         }}>FAQ</a>
          </div>

          {/* Right actions */}
          <div className="l-nav-actions">
            {/* Language toggle */}
            <button className="l-theme-toggle" style={{ fontWeight: 700, fontSize: '14px' }}
              onClick={() => setLang((l) => l === 'en' ? 'fr' : 'en')}
              aria-label="Toggle language"
            >
              {lang === 'en' ? 'FR' : 'EN'}
            </button>

            {/* Theme toggle */}
            <button className="l-theme-toggle" onClick={() => setTheme((t) => t === 'dark' ? 'light' : 'dark')} aria-label="Toggle theme">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
              </svg>
            </button>

            <a href="/app"  className="l-nav-signin"    onClick={(e) => { e.preventDefault(); navigate('/app');  }}>{t('Sign In',     'Connexion')}</a>
            <a href="/app" className="l-nav-cta l-btn-primary" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }} onClick={(e) => { e.preventDefault(); navigate('/app'); }}>{t('Get Started', 'Démarrer')}</a>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="l-hero">
        <div className="l-hero-bg" />
        <div className="l-container l-hero-content fade-up">
          <h1 className="l-hero-headline">
            {renderHeadline()}
          </h1>
          <p className="l-hero-sub">
            {t(
              'One AI that reads Arabic, French, English, Japanese, and 50+ more languages. PDFs, photos, scans. Factura turns any invoice from anywhere in the world into clean, exportable data. In under 30 seconds.',
              "Une IA qui lit l'arabe, le français, l'anglais, le japonais et plus de 50 autres langues. Factura transforme toute facture en données propres. En moins de 30 secondes.",
            )}
          </p>
          <div className="l-hero-ctas">
            <a href="/app" className="l-btn l-btn-primary" onClick={(e) => { e.preventDefault(); navigate('/app'); }}>
              {t('Start for free', 'Commencer gratuitement')}
            </a>
            <a href="#features" className="l-btn l-btn-outline" onClick={(e) => { e.preventDefault(); scrollTo('features'); }}>
              {t('See it in action', 'Voir en action')}
            </a>
          </div>
          <div className="l-flags-row">
            <div className="l-flags">🇺🇸 🇫🇷 🇸🇦 🇦🇪 🇪🇬 🇩🇪 🇯🇵 🇧🇷 🇮🇳 🇨🇳</div>
            <div className="l-flags-label">{t('Invoices from 50+ countries supported', 'Factures de 50+ pays prises en charge')}</div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS CAROUSEL ── */}
      <section className="l-testimonials fade-up">
        <h2>{t('Trusted by finance and operations teams worldwide', 'Approuvé par les équipes financières du monde entier')}</h2>
        <div className="l-marquee">
          <div className="l-marquee-content">
            {[...TESTIMONIALS, ...TESTIMONIALS].map((item, i) => (
              <div key={i} className="l-testimonial-card">
                <p className="l-quote">{item.quote}</p>
                <div className="l-t-author">
                  <div className="l-t-avatar">{item.initials}</div>
                  <div className="l-t-meta">
                    <h4>{item.name}</h4>
                    <p>{item.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROBLEM SECTION ── */}
      <section className="l-section">
        <div className="l-container">
          <div className="l-grid-3">
            {/* Card 1 */}
            <div className="l-problem-card fade-up">
              <div className="l-problem-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <h3>{t('Hours wasted daily', 'Heures perdues quotidiennement')}</h3>
              <p>{t('Manual data entry wastes hours every day, pulling your team away from actual analysis and strategy.', 'La saisie manuelle fait perdre des heures chaque jour, éloignant votre équipe de l\'analyse et de la stratégie.')}</p>
            </div>
            {/* Card 2 */}
            <div className="l-problem-card fade-up" style={{ transitionDelay: '0.1s' }}>
              <div className="l-problem-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              <h3>{t('Costly errors', 'Erreurs coûteuses')}</h3>
              <p>{t('One typo in an invoice means payment disputes, delayed reconciliations, and damaged vendor relationships.', 'Une seule faute de frappe entraîne des litiges, des retards et nuit aux relations avec les fournisseurs.')}</p>
            </div>
            {/* Card 3 */}
            <div className="l-problem-card fade-up" style={{ transitionDelay: '0.2s' }}>
              <div className="l-problem-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <h3>{t('Global chaos', 'Chaos global')}</h3>
              <p>{t('Your invoices arrive in 5 languages and 3 formats, your team handles none of them efficiently.', 'Vos factures arrivent dans 5 langues et 3 formats, votre équipe ne gère aucun d\'eux efficacement.')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="l-section" style={{ paddingTop: '2rem' }}>
        <div className="l-container">

          {/* Feature 1 — Upload anything */}
          <div className="l-feature-block fade-up">
            <div className="l-feature-content">
              <span className="l-feature-label">{t('Seamless Ingestion', 'Ingestion fluide')}</span>
              <h2>{t('Upload anything', 'Téléchargez n\'importe quoi')}</h2>
              <p>{t('Drag & drop, email forwarding, or API. We accept PDF, JPG, PNG, and multi-page documents up to 20MB. Factura normalizes the input instantly.', 'Glisser-déposer, email, ou API. PDF, JPG, PNG jusqu\'à 20Mo acceptés. Factura normalise tout instantanément.')}</p>
            </div>
            <div className="l-feature-visual">
              <div className="l-upload-box">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" strokeWidth="2" className="l-upload-icon">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="var(--text-muted)" />
                  <g className="l-upload-arrow">
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </g>
                </svg>
                <p className="l-upload-title">{t('Drag and drop invoice', 'Glissez-déposez la facture')}</p>
                <p className="l-upload-subtitle">PDF, PNG, JPG (max 20MB)</p>
              </div>
            </div>
          </div>

          {/* Feature 2 — AI reads every language */}
          <div className="l-feature-block fade-up">
            <div className="l-feature-content">
              <span className="l-feature-label">{t('Global Intelligence', 'Intelligence globale')}</span>
              <h2>{t('AI reads every language', 'L\'IA lit toutes les langues')}</h2>
              <p>{t('Powered by a state-of-the-art vision model, Factura extracts structured data from Latin, Arabic, CJK, Cyrillic, Devanagari scripts and more. Always returns a confidence score and detected language.', 'Factura extrait les données de divers scripts et langues. Renvoie toujours un score de confiance et la langue détectée.')}</p>
            </div>
            <div className="l-feature-visual">
              <div style={{ position: 'relative', width: '80%', overflow: 'hidden' }}>
                <div className="scan-line" />
                <div style={{ background: '#0f0f0f', borderRadius: '0.5rem', padding: '1.5rem', fontFamily: 'monospace', fontSize: '0.85rem', color: '#a0a0a0', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
                  <div style={{ color: '#4ade80' }}>{'{'}</div>
                  <div style={{ paddingLeft: '1rem' }}>
                    <span style={{ color: '#a0a0a0' }}>"vendor": </span><span style={{ color: '#fca5a5' }}>"TechCorp K.K."</span>,<br />
                    <span style={{ color: '#a0a0a0' }}>"language_detected": </span><span style={{ color: '#fca5a5' }}>"Japanese"</span>,<br />
                    <span style={{ color: '#a0a0a0' }}>"total_amount": </span><span style={{ color: '#93c5fd' }}>245000</span>,<br />
                    <span style={{ color: '#a0a0a0' }}>"currency": </span><span style={{ color: '#fca5a5' }}>"JPY"</span>,<br />
                    <span style={{ color: '#a0a0a0' }}>"confidence_score": </span><span style={{ color: '#93c5fd' }}>0.98</span>
                  </div>
                  <div style={{ color: '#4ade80' }}>{'}'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 3 — Export & integrate */}
          <div className="l-feature-block fade-up">
            <div className="l-feature-content">
              <span className="l-feature-label">{t('Workflow Ready', 'Prêt pour le workflow')}</span>
              <h2>{t('Correct, export, integrate', 'Corrigez, exportez, intégrez')}</h2>
              <p>{t('Review data in our intuitive inline JSON editor for human corrections. Export to CSV and JSON, search your history, or push directly to your ERP via API.', 'Révisez et corrigez les données. Exportez en CSV/JSON, ou poussez vers votre ERP via API.')}</p>
            </div>
            <div className="l-feature-visual">
              <div style={{ width: '80%', height: '60%', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '0.5rem', display: 'flex', flexDirection: 'column' }}>
                <div style={{ borderBottom: '1px solid var(--border)', padding: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                  <span className="l-btn l-btn-primary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}>{t('Export CSV', 'Exporter CSV')}</span>
                  <span className="l-btn l-btn-outline" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}>{t('Sync to ERP', 'Synchroniser ERP')}</span>
                </div>
                <div style={{ padding: '1rem', flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--text)', fontSize: '0.85rem' }}>Invoice #INV-2026</span>
                    <span style={{ color: '#4ade80', fontSize: '0.85rem' }}>Verified</span>
                  </div>
                  <div className="mock-line" style={{ width: '100%', marginBottom: '0.5rem' }} />
                  <div className="mock-line" style={{ width: '80%', marginBottom: '0.5rem' }} />
                  <div className="mock-line" style={{ width: '60%' }} />
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── LANGUAGE SHOWCASE ── */}
      <section className="l-section l-lang-showcase fade-up">
        <div className="l-container">
          <h2>{t('One tool. Every language.', 'Un outil. Toutes les langues.')}</h2>
          <p style={{ maxWidth: 700, margin: '0 auto 3rem' }}>
            {t('From Latin scripts to Arabic RTL, CJK characters to Devanagari, Factura\'s AI vision model handles them all natively, with no configuration needed.', 'Des scripts latins à l\'arabe RTL, en passant par le CJK et le Devanagari, le modèle d\'IA de Factura gère tout nativement.')}
          </p>
          <div className="l-lang-cards">
            {[
              { lang: t('English', 'Anglais'),         acc: '99%', rtl: false },
              { lang: t('Arabic (RTL)', 'Arabe (RTL)'), acc: '97%', rtl: true  },
              { lang: t('Japanese (CJK)', 'Japonais (CJK)'), acc: '98%', rtl: false, cjk: true },
              { lang: t('French', 'Français'),          acc: '99%', rtl: false },
            ].map((item) => (
              <div key={item.lang} className="l-lang-card">
                <div className="l-lang-card-header">
                  <span>{item.lang}</span>
                  <span style={{ color: '#4ade80' }}>{item.acc}</span>
                </div>
                <div className="l-lang-mockup" style={item.rtl ? { alignItems: 'flex-end' } : {}}>
                  {item.cjk ? (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                        <div className="mock-line" style={{ width: '20%', background: 'var(--accent)', height: 40, borderRadius: 4 }} />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '60%', alignItems: 'flex-end' }}>
                          <div className="mock-line" style={{ width: '100%' }} />
                          <div className="mock-line" style={{ width: '80%' }} />
                        </div>
                      </div>
                      <div className="mock-line" style={{ width: '30%', marginTop: 'auto', background: 'var(--text)' }} />
                    </>
                  ) : (
                    <>
                      <div className="mock-line" style={{ width: item.rtl ? '40%' : '50%', background: 'var(--accent)' }} />
                      <div className="mock-line" style={{ width: '100%', marginTop: '1rem' }} />
                      <div className="mock-line" style={{ width: item.rtl ? '80%' : '70%' }} />
                      <div className="mock-line" style={{ width: '30%', marginTop: 'auto', alignSelf: item.rtl ? 'flex-start' : 'flex-end', background: 'var(--text)' }} />
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="l-section">
        <div className="l-container fade-up">
          <h2 style={{ textAlign: 'center' }}>{t('How it works', 'Comment ça marche')}</h2>
          <div className="l-timeline">
            {[
              { n: 1, title: t('Upload your invoice', 'Téléchargez votre facture'),     desc: t('Upload any format (PDF, JPG, PNG) in any language. Drag & drop or use our API.', 'Téléchargez tout format, toute langue. Glissez-déposez ou utilisez l\'API.') },
              { n: 2, title: t('AI extracts in seconds', 'L\'IA extrait en secondes'), desc: t('Our model returns structured JSON data, language detected, and a confidence score instantly.', 'Données JSON, langue et score de confiance instantanés.') },
              { n: 3, title: t('Export and move on', 'Exportez et avancez'),          desc: t('Review, correct if needed, and export to CSV, JSON, or sync directly to your ERP.', 'Vérifiez, corrigez et exportez en CSV/JSON, ou synchronisez votre ERP.') },
            ].map((step) => (
              <div key={step.n} className="l-step">
                <div className="l-step-num">{step.n}</div>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="l-stats fade-up">
        <div className="l-container l-grid-3" style={{ gap: '4rem' }}>
          <div className="l-stat-item">
            <div className="l-stat-num" data-target="30" data-seconds>0</div>
            <div className="l-stat-label">{t('Average processing time', 'Temps de traitement moyen')}</div>
          </div>
          <div className="l-stat-item">
            <div className="l-stat-num" data-target="95" data-percent>0</div>
            <div className="l-stat-label">{t('Accuracy on clean scans', 'Précision sur scans propres')}</div>
          </div>
          <div className="l-stat-item">
            <div className="l-stat-num" data-target="50" data-plus>0</div>
            <div className="l-stat-label">{t('Languages supported', 'Langues prises en charge')}</div>
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="l-section">
        <div className="l-container">
          <h2 style={{ textAlign: 'center', marginBottom: '4rem' }}>{t('Simple, transparent pricing', 'Tarifs simples et transparents')}</h2>
          <div className="l-grid-3">

            {/* Starter */}
            <div className="l-pricing-card fade-up">
              <h3>{t('Starter', 'Démarrage')}</h3>
              <p>{t('Perfect for small teams testing the waters.', 'Idéal pour les petites équipes qui se lancent.')}</p>
              <div className="l-price">$0<span> / {t('month', 'mois')}</span></div>
              <ul className="l-features-list">
                {[
                  [t('50 invoices / month', '50 factures / mois'),    'Process up to 50 invoices completely free. Resets on the 1st of every month.'],
                  ['CSV & JSON Export',                                'Easily export your structured data in standard formats for analysis.'],
                  [t('50+ Languages', '50+ Langues'),                 'Our base AI model automatically recognizes and translates invoices in over 50 languages.'],
                  [t('Web interface only', 'Interface web uniquement'),'Access Factura through our beautiful, intuitive web dashboard.'],
                ].map(([label, tip]) => (
                  <li key={label} data-tooltip={tip}>
                    <CheckIcon /> {label} <InfoIcon />
                  </li>
                ))}
              </ul>
              <a href="/app" className="l-btn l-btn-outline" style={{ width: '100%' }} onClick={(e) => { e.preventDefault(); navigate('/app'); }}>
                {t('Start for free', 'Commencer gratuitement')}
              </a>
            </div>

            {/* Pro */}
            <div className="l-pricing-card popular fade-up" style={{ transitionDelay: '0.1s' }}>
              <div className="l-popular-badge">{t('Most Popular', 'Le Plus Populaire')}</div>
              <h3>Pro</h3>
              <p>{t('For growing finance departments.', 'Pour les départements financiers en croissance.')}</p>
              <div className="l-price">$199<span> / {t('month', 'mois')}</span></div>
              <ul className="l-features-list">
                {[
                  [t('2,000 invoices / month', '2 000 factures / mois'), 'A generous allowance of 2,000 invoices per month, covering mid-sized teams.'],
                  [t('Full API Access', 'Accès API complet'),             'Integrate Factura directly into your own tools using our REST or GraphQL API.'],
                  [t('ERP Integrations', 'Intégrations ERP'),            'Native sync with NetSuite, SAP, Quickbooks, and Xero.'],
                  [t('Priority Support', 'Support prioritaire'),          'Jump the queue. Get email support responses in under 2 hours.'],
                ].map(([label, tip]) => (
                  <li key={label} data-tooltip={tip}>
                    <CheckIcon /> {label} <InfoIcon />
                  </li>
                ))}
              </ul>
              <a href="/app" className="l-btn l-btn-primary" style={{ width: '100%' }} onClick={(e) => { e.preventDefault(); navigate('/app'); }}>
                {t('Start 14-day trial', 'Commencer l\'essai de 14j')}
              </a>
            </div>

            {/* Enterprise */}
            <div className="l-pricing-card fade-up" style={{ transitionDelay: '0.2s' }}>
              <h3>{t('Enterprise', 'Entreprise')}</h3>
              <p>{t('For large organizations with strict privacy needs.', 'Pour grandes organisations aux besoins stricts.')}</p>
              <div className="l-price">{t('Custom', 'Personnalisé')}</div>
              <ul className="l-features-list">
                {[
                  [t('Unlimited invoices', 'Factures illimitées'),          'No volume caps. We scale our extraction pipelines to match your needs.'],
                  [t('Private deployment', 'Déploiement privé'),            'Self-host Factura on your own AWS/GCP instances, or use a dedicated single-tenant cloud.'],
                  [t('Custom SLA', 'SLA personnalisé'),                    'Guaranteed 99.99% uptime with financial penalties if we miss our target.'],
                  [t('Dedicated account manager', 'Gestionnaire de compte'),'Direct Slack channel and phone line to a dedicated technical account manager.'],
                ].map(([label, tip]) => (
                  <li key={label} data-tooltip={tip}>
                    <CheckIcon /> {label} <InfoIcon />
                  </li>
                ))}
              </ul>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                {t('Run Factura on your own infrastructure, your data never leaves your network.', 'Factura sur votre infrastructure, vos données ne quittent jamais votre réseau.')}
              </div>
              <a href="#" className="l-btn l-btn-outline" style={{ width: '100%' }}
                onClick={(e) => e.preventDefault()}>
                {t('Contact Sales', 'Contacter les ventes')}
              </a>
            </div>

          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="l-section">
        <div className="l-container fade-up">
          <h2 style={{ textAlign: 'center' }}>{t('Frequently Asked Questions', 'Foire aux Questions')}</h2>
          <div className="l-faq-container">
            {FAQS.map((item, i) => (
              <div key={i} className={`l-faq-item${activeFaq === i ? ' active' : ''}`}>
                <button className="l-faq-btn" onClick={() => setActiveFaq(activeFaq === i ? null : i)}>
                  {item.q}
                  <svg className="l-faq-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </button>
                <div className="l-faq-content"><p>{item.a}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BAND ── */}
      <section className="l-section l-cta-band fade-up">
        <div className="l-container">
          <h2 style={{ fontSize: '3rem', marginBottom: '1rem' }}>{t('Stop re-typing invoices.', 'Arrêtez de retaper vos factures.')}</h2>
          <p style={{ fontSize: '1.25rem', marginBottom: '2.5rem' }}>{t('Join thousands of finance teams who let AI do the reading.', 'Rejoignez des milliers d\'équipes financières qui laissent l\'IA faire la lecture.')}</p>
          <a href="/app" className="l-btn l-btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }} onClick={(e) => { e.preventDefault(); navigate('/app'); }}>
            {t('Try Factura free', 'Essayer Factura gratuitement')}
          </a>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="l-footer">
        <div className="l-container l-footer-content">
          <a href="/" onClick={(e) => { e.preventDefault(); navigate('/'); }} className="l-logo">
            <img src="/logo.svg" alt="Factura Logo" />
            Factura
          </a>
          <div className="l-footer-links">
            <a href="#">{t('Product', 'Produit')}</a>
            <a href="#">{t('Company', 'Entreprise')}</a>
            <a href="#">{t('Legal', 'Légal')}</a>
          </div>
          <div className="l-copyright">&copy; 2026 Factura. {t('All rights reserved.', 'Tous droits réservés.')}</div>
        </div>
      </footer>

      {/* ── CHATBOT ── */}
      <button className="l-chat-toggle" onClick={() => setChatOpen((o) => !o)} aria-label="Open chat">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </button>

      <div className={`l-chat-window${chatOpen ? ' open' : ''}`}>
        <div className="l-chat-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }}>
              <path d="M12 8V4H8" /><rect width="16" height="12" x="4" y="8" rx="2" />
              <path d="M2 14h2" /><path d="M20 14h2" />
              <path d="M15 13v2" /><path d="M9 13v2" />
            </svg>
            <span>Factura Assistant</span>
          </div>
          <div className="l-chat-header-close" onClick={() => setChatOpen(false)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }}>
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </div>
        </div>

        <div className="l-chat-messages">
          {messages.map((msg, i) => (
            <div key={i} className={`l-chat-msg ${msg.sender}`}>{msg.text}</div>
          ))}
          <div ref={chatEndRef} />
        </div>

        <form className="l-chat-input" onSubmit={handleChat}>
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder={t('Ask about our features…', 'Posez une question…')}
            autoComplete="off"
          />
          <button type="submit" aria-label="Send">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}

/* ─── Small SVG helpers ─── */
function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--accent)', width: 20, height: 20, flexShrink: 0 }}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
function InfoIcon() {
  return (
    <svg className="l-info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}
