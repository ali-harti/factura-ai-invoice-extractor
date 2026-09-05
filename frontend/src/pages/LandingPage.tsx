import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CanvasBackground from '../components/CanvasBackground';

const LandingPage = () => {
  return (
    <>
      <div id="landing-view">
  {/*  Hero  */}
  <section className="hero">
    <div className="hero-bg"></div>
    <div className="container hero-content fade-up">
      <h1 className="hero-headline">Any invoice. Any language. Seconds.</h1>
      <p className="hero-sub">One AI that reads Arabic, French, English, Japanese, and 50+ more languages. PDFs, photos, scans. Factura turns any invoice from anywhere in the world into clean, exportable data. In under 30 seconds.</p>
      <div className="hero-ctas">
        <Link to="/signup" className="btn btn-primary">Start for free</Link>
        <a href="#features" className="btn btn-outline">See it in action</a>
      </div>
      <div className="flags-row">
        <div className="flags">🇺🇸 🇫🇷 🇸🇦 🇦🇪 🇪🇬 🇩🇪 🇯🇵 🇧🇷 🇮🇳 🇨🇳</div>
        <div className="flags-label">Invoices from 50+ countries supported</div>
      </div>
    </div>
  </section>

  {/*  Testimonials Carousel  */}
  <section className="testimonials-section fade-up">
    <h2>Trusted by finance and operations teams worldwide</h2>
    <div className="marquee">
      <div className="marquee-content">
        {/*  Set 1  */}
        <div className="testimonial-card">
          <p className="testimonial-quote">"Factura cut our invoice processing time by 90%. It's like magic."</p>
          <div className="testimonial-author">
            <div className="testimonial-avatar">JD</div>
            <div className="testimonial-meta">
              <h4>Jane Doe</h4>
              <p>CFO at TechFlow</p>
            </div>
          </div>
        </div>
        <div className="testimonial-card">
          <p className="testimonial-quote">"We process invoices in 15 languages. Factura handles them all without a hiccup."</p>
          <div className="testimonial-author">
            <div className="testimonial-avatar">AK</div>
            <div className="testimonial-meta">
              <h4>Ahmed Khan</h4>
              <p>VP Finance, GlobalTrade</p>
            </div>
          </div>
        </div>
        <div className="testimonial-card">
          <p className="testimonial-quote">"The best AI tool we've integrated this year. Simple, fast, and incredibly accurate."</p>
          <div className="testimonial-author">
            <div className="testimonial-avatar">SD</div>
            <div className="testimonial-meta">
              <h4>Sarah Dubois</h4>
              <p>Accounting Director, Luxe</p>
            </div>
          </div>
        </div>
        <div className="testimonial-card">
          <p className="testimonial-quote">"No more manual entry. Our team can finally focus on strategic work."</p>
          <div className="testimonial-author">
            <div className="testimonial-avatar">YT</div>
            <div className="testimonial-meta">
              <h4>Yosuke Tanaka</h4>
              <p>Operations Lead, K.K. Nexus</p>
            </div>
          </div>
        </div>
        {/*  Set 2 (Duplicate for infinite scroll)  */}
        <div className="testimonial-card">
          <p className="testimonial-quote">"Factura cut our invoice processing time by 90%. It's like magic."</p>
          <div className="testimonial-author">
            <div className="testimonial-avatar">JD</div>
            <div className="testimonial-meta">
              <h4>Jane Doe</h4>
              <p>CFO at TechFlow</p>
            </div>
          </div>
        </div>
        <div className="testimonial-card">
          <p className="testimonial-quote">"We process invoices in 15 languages. Factura handles them all without a hiccup."</p>
          <div className="testimonial-author">
            <div className="testimonial-avatar">AK</div>
            <div className="testimonial-meta">
              <h4>Ahmed Khan</h4>
              <p>VP Finance, GlobalTrade</p>
            </div>
          </div>
        </div>
        <div className="testimonial-card">
          <p className="testimonial-quote">"The best AI tool we've integrated this year. Simple, fast, and incredibly accurate."</p>
          <div className="testimonial-author">
            <div className="testimonial-avatar">SD</div>
            <div className="testimonial-meta">
              <h4>Sarah Dubois</h4>
              <p>Accounting Director, Luxe</p>
            </div>
          </div>
        </div>
        <div className="testimonial-card">
          <p className="testimonial-quote">"No more manual entry. Our team can finally focus on strategic work."</p>
          <div className="testimonial-author">
            <div className="testimonial-avatar">YT</div>
            <div className="testimonial-meta">
              <h4>Yosuke Tanaka</h4>
              <p>Operations Lead, K.K. Nexus</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  {/*  Problem  */}
  <section className="section">
    <div className="container">
      <div className="grid-3">
        <div className="problem-card fade-up">
          <div className="problem-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          </div>
          <h3>Hours wasted daily</h3>
          <p>Manual data entry wastes hours every day, pulling your team away from actual analysis and strategy.</p>
        </div>
        <div className="problem-card fade-up" style={{ transitionDelay: '0.1s' }}>
          <div className="problem-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
          </div>
          <h3>Costly errors</h3>
          <p>One typo in an invoice means payment disputes, delayed reconciliations, and damaged vendor relationships.</p>
        </div>
        <div className="problem-card fade-up" style={{ transitionDelay: '0.2s' }}>
          <div className="problem-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
          </div>
          <h3>Global chaos</h3>
          <p>Your invoices arrive in 5 languages and 3 formats, your team handles none of them efficiently.</p>
        </div>
      </div>
    </div>
  </section>

  {/*  Features  */}
  <section id="features" className="section" style={{ paddingTop: '2rem' }}>
    <div className="container">
      
      {/*  Feature 1  */}
      <div className="feature-block fade-up">
        <div className="feature-content">
          <span className="feature-label">Seamless Ingestion</span>
          <h2>Upload anything</h2>
          <p>Drag &amp; drop, email forwarding, or API. We accept PDF, JPG, PNG, and multi-page documents up to 20MB. Factura normalizes the input instantly.</p>
        </div>
        <div className="feature-visual">
          <div style={{ textAlign: 'center', border: '2px dashed var(--border)', padding: '3rem', borderRadius: '1rem', width: '80%', background: 'var(--bg)' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" style={{ marginBottom: '1rem' }}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
            <p style={{ color: 'var(--text)', fontWeight: '500' }}>Drag and drop invoice</p>
            <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>PDF, PNG, JPG (max 20MB)</p>
          </div>
        </div>
      </div>

      {/*  Feature 2  */}
      <div className="feature-block fade-up">
        <div className="feature-content">
          <span className="feature-label">Global Intelligence</span>
          <h2>AI reads every language</h2>
          <p>Powered by a state-of-the-art vision model, Factura extracts structured data from Latin, Arabic, CJK, Cyrillic, Devanagari scripts and more. Always returns a confidence score and detected language.</p>
        </div>
        <div className="feature-visual">
          <div style={{ width: '80%', background: '#0f0f0f', borderRadius: '0.5rem', padding: '1.5rem', fontFamily: 'monospace', fontSize: '0.85rem', color: '#a0a0a0', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
            <div style={{ color: '#4ade80' }}>{"{"}</div>
            <div style={{ paddingLeft: '1rem' }}>
              "vendor": <span style={{ color: '#fca5a5' }}>"TechCorp K.K."</span>,<br />
              "language_detected": <span style={{ color: '#fca5a5' }}>"Japanese"</span>,<br />
              "total_amount": <span style={{ color: '#93c5fd' }}>245000</span>,<br />
              "currency": <span style={{ color: '#fca5a5' }}>"JPY"</span>,<br />
              "confidence_score": <span style={{ color: '#93c5fd' }}>0.98</span>
            </div>
            <div style={{ color: '#4ade80' }}>{"}"}</div>
          </div>
        </div>
      </div>

      {/*  Feature 3  */}
      <div className="feature-block fade-up">
        <div className="feature-content">
          <span className="feature-label">Workflow Ready</span>
          <h2>Correct, export, integrate</h2>
          <p>Review data in our intuitive inline JSON editor for human corrections. Export to CSV and JSON, search your history, or push directly to your ERP via API.</p>
        </div>
        <div className="feature-visual">
          <div style={{ width: '80%', height: '60%', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '0.5rem', display: 'flex', flexDirection: 'column' }}>
            <div style={{ borderBottom: '1px solid var(--border)', padding: '0.75rem', display: 'flex', gap: '0.5rem' }}>
              <div className="btn btn-primary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}>Export CSV</div>
              <div className="btn btn-outline" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}>Sync to ERP</div>
            </div>
            <div style={{ padding: '1rem', flex: '1' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text)', fontSize: '0.85rem' }}>Invoice #INV-2026</span>
                <span style={{ color: '#4ade80', fontSize: '0.85rem' }}>Verified</span>
              </div>
              <div className="mock-line" style={{ width: '100%', marginBottom: '0.5rem' }}></div>
              <div className="mock-line" style={{ width: '80%', marginBottom: '0.5rem' }}></div>
              <div className="mock-line" style={{ width: '60%' }}></div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </section>

  {/*  Language Showcase  */}
  <section className="section lang-showcase fade-up">
    <div className="container">
      <h2>One tool. Every language.</h2>
      <p style={{ maxWidth: '700px', margin: '0 auto', marginBottom: '3rem' }}>From Latin scripts to Arabic RTL, CJK characters to Devanagari, Factura's AI vision model handles them all natively, with no configuration needed.</p>
      
      <div className="lang-cards">
        <div className="lang-card">
          <div className="lang-card-header">
            <span>English</span>
            <span style={{ color: '#4ade80' }}>99%</span>
          </div>
          <div className="lang-mockup">
            <div className="mock-line" style={{ width: '40%', background: 'var(--accent)' }}></div>
            <div className="mock-line" style={{ width: '100%', marginTop: '1rem' }}></div>
            <div className="mock-line" style={{ width: '80%' }}></div>
            <div className="mock-line" style={{ width: '30%', marginTop: 'auto', alignSelf: 'flex-end', background: 'var(--text)' }}></div>
          </div>
        </div>
        <div className="lang-card">
          <div className="lang-card-header">
            <span>Arabic (RTL)</span>
            <span style={{ color: '#4ade80' }}>97%</span>
          </div>
          <div className="lang-mockup" style={{ alignItems: 'flex-end' }}>
            <div className="mock-line" style={{ width: '40%', background: 'var(--accent)' }}></div>
            <div className="mock-line" style={{ width: '100%', marginTop: '1rem' }}></div>
            <div className="mock-line" style={{ width: '80%' }}></div>
            <div className="mock-line" style={{ width: '30%', marginTop: 'auto', alignSelf: 'flex-start', background: 'var(--text)' }}></div>
          </div>
        </div>
        <div className="lang-card">
          <div className="lang-card-header">
            <span>Japanese (CJK)</span>
            <span style={{ color: '#4ade80' }}>98%</span>
          </div>
          <div className="lang-mockup">
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
              <div className="mock-line" style={{ width: '20%', background: 'var(--accent)', height: '40px', borderRadius: '4px' }}></div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '60%', alignItems: 'flex-end' }}>
                <div className="mock-line" style={{ width: '100%' }}></div>
                <div className="mock-line" style={{ width: '80%' }}></div>
              </div>
            </div>
            <div className="mock-line" style={{ width: '30%', marginTop: 'auto', background: 'var(--text)' }}></div>
          </div>
        </div>
        <div className="lang-card">
          <div className="lang-card-header">
            <span>French</span>
            <span style={{ color: '#4ade80' }}>99%</span>
          </div>
          <div className="lang-mockup">
            <div className="mock-line" style={{ width: '50%', background: 'var(--accent)' }}></div>
            <div className="mock-line" style={{ width: '100%', marginTop: '1rem' }}></div>
            <div className="mock-line" style={{ width: '70%' }}></div>
            <div className="mock-line" style={{ width: '30%', marginTop: 'auto', alignSelf: 'flex-end', background: 'var(--text)' }}></div>
          </div>
        </div>
      </div>
    </div>
  </section>

  {/*  How It Works  */}
  <section id="how-it-works" className="section">
    <div className="container fade-up">
      <h2 style={{ textAlign: 'center' }}>How it works</h2>
      <div className="timeline">
        <div className="step">
          <div className="step-num">1</div>
          <h3>Upload your invoice</h3>
          <p>Upload any format (PDF, JPG, PNG) in any language. Drag &amp; drop or use our API.</p>
        </div>
        <div className="step">
          <div className="step-num">2</div>
          <h3>AI extracts in seconds</h3>
          <p>Our model returns structured JSON data, language detected, and a confidence score instantly.</p>
        </div>
        <div className="step">
          <div className="step-num">3</div>
          <h3>Export and move on</h3>
          <p>Review, correct if needed, and export to CSV, JSON, or sync directly to your ERP.</p>
        </div>
      </div>
    </div>
  </section>

  {/*  Stats Bar  */}
  <section className="stats fade-up">
    <div className="container grid-3" style={{ gap: '4rem' }}>
      <div className="stat-item">
        <div className="stat-num" data-target="30" data-seconds>0</div>
        <div className="stat-label">Average processing time</div>
      </div>
      <div className="stat-item">
        <div className="stat-num" data-target="95" data-percent>0</div>
        <div className="stat-label">Accuracy on clean scans</div>
      </div>
      <div className="stat-item">
        <div className="stat-num" data-target="50" data-plus>0</div>
        <div className="stat-label">Languages supported</div>
      </div>
    </div>
  </section>

  {/*  Pricing  */}
  <section id="pricing" className="section">
    <div className="container">
      <h2 style={{ textAlign: 'center', marginBottom: '4rem' }}>Simple, transparent pricing</h2>
      <div className="grid-3">
        {/*  Starter  */}
        <div className="pricing-card fade-up">
          <h3>Starter</h3>
          <p>Perfect for small teams testing the waters.</p>
          <div className="price">$0<span> / month</span></div>
          <ul className="features-list">
            <li data-tooltip="Process up to 50 invoices completely free. Resets on the 1st of every month."><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> 50 invoices / month <svg className="info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></li>
            <li data-tooltip="Easily export your structured data in standard formats for analysis."><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> CSV &amp; JSON Export <svg className="info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></li>
            <li data-tooltip="Our base AI model automatically recognizes and translates invoices in over 50 languages."><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> 50+ Languages <svg className="info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></li>
            <li data-tooltip="Access Factura through our beautiful, intuitive web dashboard."><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Web interface only <svg className="info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></li>
          </ul>
          <Link to="/signup" className="btn btn-outline" style={{ width: '100%' }}>Start for free</Link>
        </div>
        
        {/*  Pro  */}
        <div className="pricing-card popular fade-up" style={{ transitionDelay: '0.1s' }}>
          <div className="popular-badge">Most Popular</div>
          <h3>Pro</h3>
          <p>For growing finance departments.</p>
          <div className="price">$199<span> / month</span></div>
          <ul className="features-list">
            <li data-tooltip="A generous allowance of 2,000 invoices per month, covering mid-sized teams."><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> 2,000 invoices / month <svg className="info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></li>
            <li data-tooltip="Integrate Factura directly into your own tools using our REST or GraphQL API."><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Full API Access <svg className="info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></li>
            <li data-tooltip="Native sync with NetSuite, SAP, Quickbooks, and Xero."><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> ERP Integrations <svg className="info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></li>
            <li data-tooltip="Jump the queue. Get email support responses in under 2 hours."><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Priority Support <svg className="info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></li>
          </ul>
          <Link to="/signup" className="btn btn-primary" style={{ width: '100%' }}>Start 14-day trial</Link>
        </div>

        {/*  Enterprise  */}
        <div className="pricing-card fade-up" style={{ transitionDelay: '0.2s' }}>
          <h3>Enterprise</h3>
          <p>For large organizations with strict privacy needs.</p>
          <div className="price">Custom</div>
          <ul className="features-list">
            <li data-tooltip="No volume caps. We scale our extraction pipelines to match your needs."><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Unlimited invoices <svg className="info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></li>
            <li data-tooltip="Self-host Factura on your own AWS/GCP instances, or use a dedicated single-tenant cloud."><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Private deployment <svg className="info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></li>
            <li data-tooltip="Guaranteed 99.99% uptime with financial penalties if we miss our target."><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Custom SLA <svg className="info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></li>
            <li data-tooltip="Direct Slack channel and phone line to a dedicated technical account manager."><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Dedicated account manager <svg className="info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></li>
          </ul>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Run Factura on your own infrastructure, your data never leaves your network.</div>
          <Link to="/signup" className="btn btn-outline" style={{ width: '100%' }}>Contact Sales</Link>
        </div>
      </div>
    </div>
  </section>

  {/*  FAQ  */}
  <section id="faq" className="section">
    <div className="container fade-up">
      <h2 style={{ textAlign: 'center' }}>Frequently Asked Questions</h2>
      <div className="faq-container">
        
        <div className="faq-item">
          <button className="faq-btn">
            What languages does Factura support?
            <svg className="faq-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          </button>
          <div className="faq-content">
            <p>Factura supports over 50 languages globally. Our AI vision model is trained to recognize Latin, Arabic, Cyrillic, Devanagari, and CJK (Chinese, Japanese, Korean) scripts seamlessly without any manual pre-configuration.</p>
          </div>
        </div>

        <div className="faq-item">
          <button className="faq-btn">
            How accurate is the extraction?
            <svg className="faq-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          </button>
          <div className="faq-content">
            <p>On clean, digital PDFs and high-quality scans, Factura achieves 95%+ accuracy. For every extraction, we provide a confidence score so your team knows exactly which invoices might require a quick human review.</p>
          </div>
        </div>

        <div className="faq-item">
          <button className="faq-btn">
            Is my invoice data secure?
            <svg className="faq-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          </button>
          <div className="faq-content">
            <p>Absolutely. Data is encrypted in transit and at rest. We are SOC2 compliant, and we do not use your invoice data to train our foundational models. For maximum security, see our Enterprise private deployment option.</p>
          </div>
        </div>

        <div className="faq-item">
          <button className="faq-btn">
            What file formats are accepted?
            <svg className="faq-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          </button>
          <div className="faq-content">
            <p>We accept PDF (both native text and scanned), JPG, and PNG formats. Multi-page documents are fully supported up to a file size of 20MB per upload.</p>
          </div>
        </div>

        <div className="faq-item">
          <button className="faq-btn">
            Can I self-host Factura for full data privacy?
            <svg className="faq-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          </button>
          <div className="faq-content">
            <p>Yes, our Enterprise plan includes an option for VPC or on-premise deployment. This ensures that your sensitive financial data never leaves your internal corporate network.</p>
          </div>
        </div>

      </div>
    </div>
  </section>

  {/*  Final CTA Band  */}
  <section className="section cta-band fade-up">
    <div className="container">
      <h2 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Stop re-typing invoices.</h2>
      <p style={{ fontSize: '1.25rem', marginBottom: '2.5rem' }}>Join thousands of finance teams who let AI do the reading.</p>
      <a href="#pricing" className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>Try Factura free</a>
    </div>
  </section>

  {/*  Footer  */}
  <footer>
    <div className="container footer-content">
      <div className="logo">
        <img src="/logo.png" alt="Factura Logo" />
        Factura
      </div>
      <div className="footer-links">
        <a href="#">Product</a>
        <a href="#">Company</a>
        <a href="#">Legal</a>
      </div>
      <div className="copyright">
        &amp;copy; 2026 Factura. All rights reserved.
      </div>
    </div>
  </footer>
  </div> {/*  End landing-view  */}

  
    </>
  );
};

export default LandingPage;
