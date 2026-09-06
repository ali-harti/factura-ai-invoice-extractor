import React from 'react';
import { Loader } from 'lucide-react';

export default function GlobalLoader() {
  return (
    <div 
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--bg-color, #F9F9F8)',
        zIndex: 9999
      }}
    >
      <div 
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
          animation: 'fadeIn 0.5s ease-in-out'
        }}
      >
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {/* Subtle pulse background */}
          <div 
            style={{
              position: 'absolute',
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              backgroundColor: 'var(--accent-color, #D47A5A)',
              opacity: 0.1,
              animation: 'pulse 2s infinite ease-in-out'
            }}
          />
          {/* Spinner */}
          <Loader 
            size={32} 
            color="var(--accent-color, #D47A5A)"
            style={{ animation: 'spin 1.5s linear infinite', position: 'relative', zIndex: 1 }}
          />
        </div>
        <p style={{ 
          fontSize: '14px', 
          fontWeight: 500, 
          color: 'var(--fg-color, #1E1E1E)',
          opacity: 0.7,
          letterSpacing: '0.05em',
          textTransform: 'uppercase'
        }}>
          Loading Factura...
        </p>
      </div>
      
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0% { transform: scale(0.8); opacity: 0.2; }
          50% { transform: scale(1.5); opacity: 0.05; }
          100% { transform: scale(0.8); opacity: 0.2; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
