import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { Moon, Sun, UploadCloud, History } from 'lucide-react';

export default function Navbar() {
  const { language, toggleLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const isUploadActive = location.pathname === '/';
  const isHistoryActive = location.pathname.startsWith('/history');

  return (
    <nav className="fixed top-0 left-0 right-0 w-full border-b border-border bg-background/90 backdrop-blur-md py-3 px-4 sm:px-6 flex items-center justify-between z-50 transition-colors duration-300">
      {/* Brand logo & name */}
      <Link to="/" className="font-mukta font-bold text-2xl tracking-tight text-foreground flex items-center gap-1.5 hover:opacity-90 transition-opacity">
        <img src="/logo.svg" alt="Factura Logo" className="w-8 h-8" />
        <span>Factura</span>
      </Link>

      {/* Navigation links */}
      <div className="flex items-center gap-1 sm:gap-2 bg-foreground/5 p-1 rounded-xl border border-border">
        <Link
          to="/"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
            isUploadActive
              ? 'bg-[#E8724A] text-white font-semibold shadow-sm'
              : 'text-foreground/60 hover:text-foreground hover:bg-foreground/5'
          }`}
        >
          <UploadCloud size={15} />
          <span>{language === 'en' ? 'Upload' : 'Extraction'}</span>
        </Link>

        <Link
          to="/history"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
            isHistoryActive
              ? 'bg-[#E8724A] text-white font-semibold shadow-sm'
              : 'text-foreground/60 hover:text-foreground hover:bg-foreground/5'
          }`}
        >
          <History size={15} />
          <span>{language === 'en' ? 'History' : 'Historique'}</span>
        </Link>
      </div>
      
      {/* Right controls */}
      <div className="flex items-center gap-2">
        <button 
          onClick={toggleLanguage}
          className="p-1.5 min-w-[32px] rounded-md transition-colors text-foreground/70 hover:text-foreground hover:bg-foreground/5 text-xs font-bold uppercase tracking-wider flex items-center justify-center"
          aria-label="Toggle Language"
        >
          {language}
        </button>
        <button 
          onClick={toggleTheme}
          className="p-1.5 rounded-md transition-colors text-foreground/70 hover:text-foreground hover:bg-foreground/5"
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>
    </nav>
  );
}
