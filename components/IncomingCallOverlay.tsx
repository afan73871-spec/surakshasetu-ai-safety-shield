import React, { useEffect, useState } from 'react';
import { Phone, ShieldAlert, X, ShieldCheck, User, MapPin, AlertTriangle, Zap, Mic, PhoneOff } from 'lucide-react';

interface IncomingCallOverlayProps {
  call: {
    number: string;
    name: string;
    location: string;
    isScam: boolean;
    truecallerScore: number;
  };
  onClose: () => void;
}

export const IncomingCallOverlay: React.FC<IncomingCallOverlayProps> = ({ call, onClose }) => {
  const [analysisStep, setAnalysisStep] = useState(0);
  const steps = [
    "Contacting Global Databash...",
    "Scanning Social Engineering Patterns...",
    "Context Behavioral Check...",
    "THREAT IDENTIFIED: SCAM"
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setAnalysisStep(prev => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 1200);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-[200] bg-slate-950 flex flex-col items-center justify-between p-8 animate-in fade-in duration-500">
      <div className={`absolute inset-0 opacity-20 pointer-events-none overflow-hidden`}>
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[100px] animate-pulse ${call.isScam ? 'bg-red-600' : 'bg-green-600'}`} />
      </div>

      <div className="relative z-10 w-full flex flex-col items-center text-center space-y-8 mt-12">
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2 text-indigo-400 font-black text-[10px] uppercase tracking-[0.2em] mb-2">
            <Zap size={12} className="fill-indigo-400" /> Advanced Context Shield Active
          </div>
          <h2 className="text-white text-4xl font-black tracking-tight">{call.number}</h2>
          <div className="flex items-center justify-center gap-2 text-gray-400 font-bold text-sm">
            <MapPin size={14} /> {call.location}
          </div>
        </div>

        <div className="w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-[40px] p-8 space-y-6">
          <div className="flex flex-col items-center">
             <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-4 border-4 ${call.isScam ? 'bg-red-600/20 border-red-500 animate-pulse' : 'bg-green-600/20 border-green-500'}`}>
               {call.isScam ? <ShieldAlert size={48} className="text-red-500" /> : <ShieldCheck size={48} className="text-green-500" />}
             </div>
             <h3 className={`text-2xl font-black uppercase tracking-tight ${call.isScam ? 'text-red-500' : 'text-green-600'}`}>
                {call.isScam ? 'Psych-Threat Found' : 'Safe Caller'}
             </h3>
             <p className="text-gray-400 text-xs font-bold mt-1">AI detected psychological manipulation tactics</p>
          </div>

          <div className="h-px bg-white/10 w-full" />

          <div className="space-y-4">
            <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-gray-500">
              <span>Behavioral Analysis</span>
              <span className="text-indigo-400">{Math.round((analysisStep + 1) / steps.length * 100)}%</span>
            </div>
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-1000 ${call.isScam ? 'bg-red-600' : 'bg-indigo-600'}`}
                style={{ width: `${((analysisStep + 1) / steps.length) * 100}%` }}
              />
            </div>
            <p className={`text-sm font-black italic ${analysisStep === steps.length - 1 ? 'text-red-400 animate-bounce' : 'text-white'}`}>
              "{steps[analysisStep]}"
            </p>
          </div>
        </div>
      </div>

      <div className="relative z-10 w-full max-w-sm space-y-4 mb-8">
        {call.isScam ? (
          <>
            <button 
              onClick={onClose}
              className="w-full py-5 bg-red-600 text-white rounded-[24px] font-black text-lg shadow-2xl shadow-red-900/40 active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              <ShieldAlert size={24} /> BLOCK ATTACK
            </button>
            <button 
              onClick={onClose}
              className="w-full py-5 bg-white/10 text-white rounded-[24px] font-black text-lg hover:bg-white/20 active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              <X size={24} /> DISMISS
            </button>
          </>
        ) : (
          <div className="grid grid-cols-2 gap-4">
             <button className="bg-red-500 text-white p-6 rounded-full flex items-center justify-center shadow-xl active:scale-90 transition-all">
                <PhoneOff size={32} />
             </button>
             <button className="bg-green-500 text-white p-6 rounded-full flex items-center justify-center shadow-xl active:scale-90 transition-all">
                <Phone size={32} />
             </button>
          </div>
        )}
      </div>

      <div className="relative z-10 flex items-center gap-2 text-[8px] font-black text-gray-600 uppercase tracking-[0.3em]">
        <ShieldCheck size={10} /> ENGINE: SURAKSHASETU 3.0 (3 FLASH)
      </div>
    </div>
  );
};