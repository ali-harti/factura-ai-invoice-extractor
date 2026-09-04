import React from 'react';
import { CheckCircle2, Loader2, AlertCircle } from 'lucide-react';

export default function StatusBadge({ status }) {
  const normalized = (status || '').toLowerCase();

  if (normalized === 'completed' || normalized === 'complété') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
        <CheckCircle2 size={13} className="text-emerald-600 dark:text-emerald-400" />
        Complété
      </span>
    );
  }

  if (normalized === 'processing' || normalized === 'en cours' || normalized === 'queued') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
        <Loader2 size={13} className="animate-spin text-amber-600 dark:text-amber-400" />
        En cours
      </span>
    );
  }

  // Failed / Échoué / default
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
      <AlertCircle size={13} className="text-red-600 dark:text-red-400" />
      Échoué
    </span>
  );
}
