/**
 * Maps Firebase Auth error codes to user-friendly messages.
 * Returns { en, fr } so the caller can pick the right language.
 */
const ERROR_MAP = {
  'auth/invalid-credential':        { en: 'Incorrect email or password.',            fr: 'E-mail ou mot de passe incorrect.' },
  'auth/user-not-found':            { en: 'No account found with this email.',       fr: 'Aucun compte trouv\u00e9 pour cet e-mail.' },
  'auth/wrong-password':            { en: 'Incorrect password. Please try again.',   fr: 'Mot de passe incorrect. Veuillez r\u00e9essayer.' },
  'auth/invalid-email':             { en: 'Please enter a valid email address.',      fr: 'Veuillez entrer une adresse e-mail valide.' },
  'auth/user-disabled':             { en: 'This account has been disabled.',         fr: 'Ce compte a \u00e9t\u00e9 d\u00e9sactiv\u00e9.' },
  'auth/too-many-requests':         { en: 'Too many attempts. Please try again later.', fr: 'Trop de tentatives. Veuillez r\u00e9essayer plus tard.' },
  'auth/email-already-in-use':      { en: 'An account with this email already exists.', fr: 'Un compte avec cet e-mail existe d\u00e9j\u00e0.' },
  'auth/weak-password':             { en: 'Password must be at least 6 characters.', fr: 'Le mot de passe doit contenir au moins 6 caract\u00e8res.' },
  'auth/operation-not-allowed':     { en: 'Email/password sign-in is not enabled.',  fr: 'La connexion e-mail/mot de passe n'\''est pas activ\u00e9e.' },
  'auth/popup-closed-by-user':      { en: 'Sign-in popup was closed. Please try again.', fr: 'La fen\u00eatre de connexion a \u00e9t\u00e9 ferm\u00e9e. R\u00e9essayez.' },
  'auth/popup-blocked':             { en: 'Sign-in popup was blocked by your browser.', fr: 'La fen\u00eatre de connexion a \u00e9t\u00e9 bloqu\u00e9e par votre navigateur.' },
  'auth/cancelled-popup-request':   { en: 'Only one sign-in window can be open at a time.', fr: 'Une seule fen\u00eatre de connexion peut \u00eatre ouverte \u00e0 la fois.' },
  'auth/account-exists-with-different-credential': { en: 'An account already exists with a different sign-in method.', fr: 'Un compte existe d\u00e9j\u00e0 avec une m\u00e9thode de connexion diff\u00e9rente.' },
  'auth/network-request-failed':    { en: 'Network error. Please check your connection.', fr: 'Erreur r\u00e9seau. V\u00e9rifiez votre connexion.' },
};

const FALLBACK = {
  en: 'An unexpected error occurred. Please try again.',
  fr: 'Une erreur inattendue s'\''est produite. Veuillez r\u00e9essayer.',
};

/**
 * @param {Error} error  - The error thrown by Firebase
 * @param {'en'|'fr'} lang
 * @returns {string}
 */
export function getAuthErrorMessage(error, lang = 'en') {
  const code = error?.code ?? '';
  const entry = ERROR_MAP[code] ?? FALLBACK;
  return entry[lang] ?? entry.en;
}
