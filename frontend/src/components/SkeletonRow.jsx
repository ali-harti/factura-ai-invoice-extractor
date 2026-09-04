import React from 'react';

export default function SkeletonRow() {
  return (
    <tr className="border-b border-border animate-pulse">
      {/* Facture */}
      <td className="py-4 px-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-foreground/10 shrink-0" />
          <div className="space-y-2 flex-1">
            <div className="h-3.5 bg-foreground/10 rounded w-36" />
            <div className="h-3 bg-foreground/5 rounded w-20" />
          </div>
        </div>
      </td>

      {/* Fournisseur */}
      <td className="py-4 px-4">
        <div className="space-y-2">
          <div className="h-3.5 bg-foreground/10 rounded w-28" />
          <div className="h-3 bg-foreground/5 rounded w-44" />
        </div>
      </td>

      {/* Date */}
      <td className="py-4 px-4">
        <div className="h-3.5 bg-foreground/10 rounded w-20" />
      </td>

      {/* Montant */}
      <td className="py-4 px-4">
        <div className="h-3.5 bg-foreground/10 rounded w-16" />
      </td>

      {/* Confiance */}
      <td className="py-4 px-4">
        <div className="h-6 bg-foreground/10 rounded-full w-14" />
      </td>

      {/* Statut */}
      <td className="py-4 px-4">
        <div className="h-6 bg-foreground/10 rounded-full w-20" />
      </td>

      {/* Actions */}
      <td className="py-4 px-4 text-right">
        <div className="flex items-center justify-end gap-2">
          <div className="w-8 h-8 rounded-lg bg-foreground/10" />
          <div className="w-8 h-8 rounded-lg bg-foreground/10" />
        </div>
      </td>
    </tr>
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-card border border-border rounded-xl p-4 space-y-3 animate-pulse shadow-sm">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <div className="h-4 bg-foreground/10 rounded w-40" />
          <div className="h-3 bg-foreground/5 rounded w-24" />
        </div>
        <div className="h-6 bg-foreground/10 rounded-full w-16" />
      </div>
      <div className="flex justify-between items-center py-2 border-y border-border">
        <div className="h-3.5 bg-foreground/10 rounded w-20" />
        <div className="h-3.5 bg-foreground/10 rounded w-16" />
      </div>
      <div className="h-9 bg-foreground/10 rounded-lg w-full" />
    </div>
  );
}
