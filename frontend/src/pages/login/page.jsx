import React, { useState } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, login, register, loginWithGoogle, loading: authLoading } = useAuth();

  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // If already logged in, redirect to home
  if (!authLoading && user) {
    const from = location.state?.from?.pathname || '/';
    return <Navigate to={from} replace />;
  }

  const validate = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.email.trim()) {
      newErrors.email = "L'adresse email est requise.";
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = "Format d'email invalide.";
    }

    if (!formData.password) {
      newErrors.password = "Le mot de passe est requis.";
    } else if (formData.password.length < 8) {
      newErrors.password = "Le mot de passe doit contenir au moins 8 caractères.";
    }

    if (isRegister && !formData.fullName.trim()) {
      newErrors.fullName = "Le nom complet est requis.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    if (!validate()) return;

    setIsLoading(true);
    try {
      if (isRegister) {
        await register({
          email: formData.email.trim(),
          password: formData.password,
          full_name: formData.fullName.trim(),
        });
      } else {
        await login({
          email: formData.email.trim(),
          password: formData.password,
        });
      }
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    } catch (err) {
      setApiError(err.message || "Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setApiError('');
    if (!credentialResponse?.credential) {
      setApiError("Identifiant Google manquant.");
      return;
    }
    setIsLoading(true);
    try {
      await loginWithGoogle(credentialResponse.credential);
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    } catch (err) {
      setApiError(err.message || "Connexion Google échouée.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    setApiError("Échec de l'authentification Google.");
  };

  const toggleMode = () => {
    setIsRegister(!isRegister);
    setErrors({});
    setApiError('');
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white flex items-center justify-center p-4 selection:bg-[#E8724A] selection:text-white">
      {/* Background radial glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
        <div className="w-[600px] h-[600px] bg-[#E8724A]/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-[420px] bg-[#1a1a1a] rounded-2xl shadow-2xl border border-white/5 p-10 z-10">
        {/* Top Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-2.5 mb-5">
            <img src="/logo.svg" alt="Factura logo" className="w-10 h-10" />
            <span className="text-2xl font-bold tracking-tight text-white">
              Factura
            </span>
          </div>
          <h1 className="text-xl font-semibold text-center text-white tracking-tight">
            {isRegister ? "Créez votre compte Factura" : "Connectez-vous à Factura"}
          </h1>
          <p className="text-sm text-neutral-400 text-center mt-1">
            Gérez vos factures intelligemment
          </p>
        </div>

        {/* API Error Banner */}
        {apiError && (
          <div className="mb-6 p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-red-400 text-sm animate-in fade-in duration-200">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-400" />
            <span className="leading-snug">{apiError}</span>
          </div>
        )}

        {/* Google Login Section (Primary) */}
        <div className="mb-6">
          <div className="w-full flex justify-center overflow-hidden rounded-xl border border-white/10 hover:border-white/20 transition shadow-sm hover:shadow-md">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              theme="outline"
              size="large"
              width="340"
              text={isRegister ? "signup_with" : "continue_with"}
              shape="rectangular"
            />
          </div>
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-neutral-800" />
          </div>
          <span className="relative px-3 bg-[#1a1a1a] text-xs uppercase tracking-wider text-neutral-500">
            ou
          </span>
        </div>

        {/* Email/Password Form (Secondary) */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                Nom complet
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => {
                  setFormData({ ...formData, fullName: e.target.value });
                  if (errors.fullName) setErrors({ ...errors, fullName: null });
                }}
                placeholder="Jean Dupont"
                className={`w-full px-3.5 py-2.5 bg-[#121212] border ${
                  errors.fullName ? 'border-red-500/80 focus:border-red-500' : 'border-neutral-800 focus:border-[#E8724A]'
                } rounded-xl text-sm text-white placeholder-neutral-500 outline-none transition`}
                disabled={isLoading}
              />
              {errors.fullName && (
                <p className="mt-1 text-xs text-red-400">{errors.fullName}</p>
              )}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1.5">
              Adresse email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => {
                setFormData({ ...formData, email: e.target.value });
                if (errors.email) setErrors({ ...errors, email: null });
              }}
              placeholder="vous@exemple.com"
              className={`w-full px-3.5 py-2.5 bg-[#121212] border ${
                errors.email ? 'border-red-500/80 focus:border-red-500' : 'border-neutral-800 focus:border-[#E8724A]'
              } rounded-xl text-sm text-white placeholder-neutral-500 outline-none transition`}
              disabled={isLoading}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-400">{errors.email}</p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-neutral-300">
                Mot de passe
              </label>
              {!isRegister && (
                <span className="text-xs text-neutral-500 hover:text-neutral-400 cursor-pointer transition">
                  Mot de passe oublié ?
                </span>
              )}
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => {
                  setFormData({ ...formData, password: e.target.value });
                  if (errors.password) setErrors({ ...errors, password: null });
                }}
                placeholder="••••••••"
                className={`w-full px-3.5 py-2.5 pr-10 bg-[#121212] border ${
                  errors.password ? 'border-red-500/80 focus:border-red-500' : 'border-neutral-800 focus:border-[#E8724A]'
                } rounded-xl text-sm text-white placeholder-neutral-500 outline-none transition`}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-xs text-red-400">{errors.password}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-2.5 px-4 bg-[#E8724A] hover:bg-[#d4623c] text-white font-medium text-sm rounded-xl transition duration-200 shadow-md shadow-[#E8724A]/20 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Chargement...</span>
              </>
            ) : isRegister ? (
              "Créer mon compte"
            ) : (
              "Se connecter"
            )}
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={toggleMode}
            className="text-xs text-neutral-400 hover:text-white transition"
          >
            {isRegister ? (
              <>
                Déjà un compte ? <span className="text-[#E8724A] font-medium">Se connecter</span>
              </>
            ) : (
              <>
                Pas encore de compte ? <span className="text-[#E8724A] font-medium">Créer un compte</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
