import React from 'react';

export default function ConfidenceBadge({ score }) {
  if (score === null || score === undefined) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-foreground/5 text-foreground/50 border border-border">
        -
      </span>
    );
  }

  // Handle score either as decimal (0.95) or percentage (95)
  const numericScore = score <= 1 ? Math.round(score * 100) : Math.round(score);

  let badgeColor = "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20";
  if (numericScore >= 90) {
    badgeColor = "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
  } else if (numericScore >= 70) {
    badgeColor = "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${badgeColor}`}>
      {numericScore}%
    </span>
  );
}
