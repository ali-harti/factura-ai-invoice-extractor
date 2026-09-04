import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Moon, Sun, UploadCloud, History, LogOut, User as UserIcon, ChevronDown } from 'lucide-react';

export default function Navbar() {
  const { language, toggleLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const isUploadActive = location.pathname === '/';
  const isHistoryActive = location.pathname.startsWith('/history');

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
    navigate('/login');
  };

  const getInitials = () => {
    if (!user) return 'U';
    if (user.full_name) {
      const parts = user.full_name.trim().split(/\s+/);
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      }
      return user.full_name.slice(0, 2).toUpperCase();
    }
    return (user.email || 'U').slice(0, 2).toUpperCase();
  };

  const displayName = user?.full_name || user?.email?.split('@')[0] || '';

  return (
    <nav className="fixed top-0 left-0 right-0 w-full border-b border-border bg-background/90 backdrop-blur-md py-3 px-4 sm:px-6 flex items-center justify-between z-50 transition-colors duration-300">
      {/* Brand logo & name */}
      <Link to="/" className="font-mukta font-bold text-2xl tracking-tight text-foreground flex items-center gap-1.5 hover:opacity-90 transition-opacity">
        <img src="/logo.svg" alt="Factura logo" className="w-7 h-7" />
        <span>Factura</span>
      </Link>

      {/* Navigation links (if user is authenticated) */}
      {user && (
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
      )}
      
      {/* Right controls */}
      <div className="flex items-center gap-2 sm:gap-3">
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

        {/* User profile dropdown or Login button */}
        {user ? (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 py-1 px-1.5 rounded-xl hover:bg-foreground/5 transition border border-transparent hover:border-border"
            >
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={displayName}
                  className="w-7 h-7 rounded-full object-cover border border-white/20"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-[#E8724A] text-white text-xs font-semibold flex items-center justify-center shadow-sm">
                  {getInitials()}
                </div>
              )}
              <span className="hidden sm:inline-block text-xs font-medium text-foreground max-w-[120px] truncate">
                {displayName}
              </span>
              <ChevronDown size={14} className="text-foreground/50" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-xl shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 text-xs">
                <div className="px-3 py-2 border-b border-border/50">
                  <p className="font-semibold text-foreground truncate">{user.full_name || 'Utilisateur'}</p>
                  <p className="text-muted-foreground truncate">{user.email}</p>
                </div>
                
                <button
                  onClick={() => setDropdownOpen(false)}
                  className="w-full text-left px-3 py-2 flex items-center gap-2 text-foreground/80 hover:text-foreground hover:bg-foreground/5 transition"
                >
                  <UserIcon size={14} />
                  <span>Mon profil</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 flex items-center gap-2 text-red-500 hover:text-red-400 hover:bg-red-500/10 transition"
                >
                  <LogOut size={14} />
                  <span>Se déconnecter</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          location.pathname !== '/login' && (
            <Link
              to="/login"
              className="py-1.5 px-3 bg-[#E8724A] hover:bg-[#d4623c] text-white text-xs font-medium rounded-lg transition shadow-sm"
            >
              Se connecter
            </Link>
          )
        )}
      </div>
    </nav>
  );
}
