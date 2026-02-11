import React, { useState } from 'react';
import { Shield } from 'lucide-react';

interface BrandLogoProps {
  className?: string;
  size?: number;
  hideText?: boolean;
}

/**
 * Suraksha Setu Official Brand Logo Component
 * Optimized for the high-fidelity circular Cyber Security AI logo.
 */
export const BrandLogo: React.FC<BrandLogoProps> = ({ className = '', size = 100, hideText = false }) => {
  const [hasError, setHasError] = useState(false);

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div 
        style={{ width: size, height: size }} 
        className="relative group transition-all duration-700 ease-out"
      >
        {/* Ambient Neural Glow */}
        <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-2xl group-hover:bg-indigo-500/30 group-hover:blur-3xl transition-all duration-700 animate-pulse" />
        
        {/* Protective Outer Ring */}
        <div className="absolute -inset-1 bg-gradient-to-tr from-indigo-600/40 via-white/50 to-blue-600/40 rounded-full opacity-60 group-hover:opacity-100 transition-opacity blur-[1px]" />

        {/* Logo Container */}
        <div className="w-full h-full relative z-10 flex items-center justify-center bg-white rounded-full overflow-hidden shadow-2xl group-hover:scale-105 transition-transform duration-500 border border-slate-100">
          {!hasError ? (
            <img 
              src="input_file_0.png" 
              alt="Suraksha Setu Official Logo" 
              className="w-full h-full object-cover p-0"
              onError={() => setHasError(true)}
              loading="eager"
              style={{ 
                imageRendering: 'auto'
              }}
            />
          ) : (
            <div className="w-full h-full bg-slate-900 flex items-center justify-center text-indigo-400">
              <Shield size={size * 0.5} strokeWidth={2.5} />
            </div>
          )}
        </div>

        {/* Glossy Protection Overlay */}
        <div className="absolute inset-0 z-20 rounded-full bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none" />
      </div>
      
      {!hideText && (
        <div className="mt-4 text-center animate-in fade-in slide-in-from-top-2 duration-700">
          <h1 className="text-xl font-black tracking-tighter uppercase leading-none text-slate-900">
            SURAKSHA <span className="text-indigo-600">SETU</span>
          </h1>
          <p className="text-[7px] font-black text-slate-400 uppercase tracking-[0.4em] mt-1.5 whitespace-nowrap">
            National Cyber AI Guard
          </p>
        </div>
      )}
    </div>
  );
};