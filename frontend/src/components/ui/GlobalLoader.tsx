import React from 'react';

export default function GlobalLoader() {
  return (
    <div 
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background"
    >
      <div className="flex flex-col items-center gap-6 animate-in fade-in duration-700">
        <div className="relative flex items-center justify-center w-16 h-16">
          {/* Outer rotating ring */}
          <div className="absolute inset-0 rounded-full border-[3px] border-border border-t-[#FF6B00] animate-spin" style={{ animationDuration: '1.5s' }} />
          {/* Inner pulse */}
          <div className="absolute w-10 h-10 rounded-full bg-[#FF6B00]/20 animate-pulse" />
          {/* Logo icon (Placeholder for actual logo) */}
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF6B00" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="relative z-10">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10 9 9 9 8 9"/>
          </svg>
        </div>
        
        <div className="flex flex-col items-center gap-2">
          <h2 className="text-sm font-semibold tracking-widest text-foreground/80 uppercase">Factura</h2>
          <div className="flex gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-[#FF6B00] animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-1.5 h-1.5 rounded-full bg-[#FF6B00] animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-1.5 h-1.5 rounded-full bg-[#FF6B00] animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
