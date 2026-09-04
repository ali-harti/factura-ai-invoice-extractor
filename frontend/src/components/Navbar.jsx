import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { Moon, Sun } from 'lucide-react';

export default function Navbar() {
  const { language, toggleLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="w-full border-b border-border bg-background py-3 px-6 flex items-center justify-between z-50">
      <div className="font-mukta font-bold text-2xl tracking-tight text-foreground flex items-center gap-1.5">
        <img src="/logo.svg" alt="Factura Logo" className="w-8 h-8" />
        Factura
      </div>
      
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
