
import React, { useEffect, useState } from 'react';
import { Phone, ShieldAlert, X, ShieldCheck, User, MapPin, AlertTriangle, Zap, Mic, PhoneOff, MessageSquare, Waves, BrainCircuit, Activity } from 'lucide-react';

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
  const [isAiReplying, setIsAiReplying] = useState(false);
  const [aiThoughts, setAiThoughts] = useState<string[]>([]);
  
  const steps = [
    "Capturing Voice Fingerprint...",
    "Analyzing Linguistic Stress Patterns...",
    "Detecting Psychological Pressure Tactics...",
    "Cross-referencing 5.2M Threat Signatures...",
    "VERDICT: CRITICAL SCAM DETECTED"
  ];

  const simulatedContext = [
    "Deepfake Voice Artifact detected (98.4%)",
    "Social Engineering Signature: 'Immediate Arrest'",
    "Inconsistent Carrier Metadata found",
    "AI Sentiment: Aggressive/Manipulative"
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setAnalysisStep(prev => {
        if (prev < steps.length - 1) {
          if (prev < simulatedContext.length) {
            setAiThoughts(t => [...t, simulatedContext[prev]]);
          }
          return prev + 1;
        }
        return prev;
      });
    }, 1500);
    return () => clearInterval(timer);
  }, []);

  const handleAiFastReply = () => {
    setIsAiReplying(true);
    setTimeout(() => {
        setIsAiReplying(false);
        onClose();
    }, 4000);
  };

  return (
    <div className="fixed inset-0 z-[200] bg-slate-950 flex flex-col items-center justify-between p-8 animate-in fade-in duration-500 font-sans">
      <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[100px] animate-pulse ${call.isScam ? 'bg-red-600' : 'bg-green-600'}`} />
      </div>

      <div className="relative z-10 w-full flex flex-col items-center text-center space-y-6 mt-8">
        <div className="space-y-1">
          <div className="flex items-center justify-center gap-2 text-indigo-400 font-black text-[10px] uppercase tracking-[0.3em] mb-2">
            <Zap size={12} className="fill-indigo-400" /> Neural Context Shield Active
          </div>
          <h2 className="text-white text-4xl font-black tracking-tighter">{call.number}</h2>
          <div className="flex items-center justify-center gap-2 text-gray-400 font-bold text-xs uppercase tracking-widest">
            <MapPin size={12} /> {call.location} • ID: UNKNOWN
          </div>
        </div>

        <div className="w-full bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[48px] p-8 space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 rotate-12"><Waves size={100} className="text-indigo-400" /></div>
          
          <div className="flex flex-col items-center relative z-10">
             <div className={`w-28 h-28 rounded-full flex items-center justify-center mb-6 border-4 relative ${call.isScam ? 'bg-red-600/10 border-red-500 shadow-[0_0_40px_rgba(239,68,68,0.3)]' : 'bg-green-600/10 border-green-500 shadow-[0_0_40px_rgba(34,197,94,0.3)]'}`}>
               {isAiReplying ? (
                 <Activity size={56} className="text-indigo-400 animate-pulse" />
               ) : (
                 <div className="flex flex-col items-center">
                    {call.isScam ? <ShieldAlert size={56} className="text-red-500 animate-bounce" /> : <ShieldCheck size={56} className="text-green-500" />}
                 </div>
               )}
               <div className="absolute -bottom-2 bg-slate-900 border border-white/20 px-3 py-1 rounded-full flex items-center gap-1.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${call.isScam ? 'bg-red-500' : 'bg-green-500'} animate-pulse`} />
                  <span className="text-[8px] font-black text-white uppercase tracking-widest">AI Audit</span>
               </div>
             </div>
             
             <h3 className={`text-2xl font-black uppercase tracking-tighter ${isAiReplying ? 'text-indigo-400' : call.isScam ? 'text-red-500' : 'text-green-600'}`}>
                {isAiReplying ? 'AI Counter-Reply...' : call.isScam ? 'Psych-Threat Detected' : 'Safe Identity'}
             </h3>
             <p className="text-gray-400 text-[10px] font-bold mt-2 uppercase tracking-widest">{isAiReplying ? 'Transmitting Protective Shield Warning' : 'AI voice fingerprint & context analysis live'}</p>
          </div>

          <div className="h-px bg-white/10 w-full" />

          {/* AI Live Analysis Console */}
          <div className="space-y-4 text-left">
            <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-[0.2em] text-indigo-400">
              <span className="flex items-center gap-1.5"><BrainCircuit size={12} /> Neural Reasoning</span>
              <span>{Math.round(((analysisStep + 1) / steps.length) * 100)}%</span>
            </div>
            
            <div className="bg-black/40 rounded-3xl p-5 border border-white/5 font-mono text-[10px] space-y-2 min-h-[100px]">
               {aiThoughts.map((thought, i) => (
                 <div key={i} className="text-indigo-300 flex items-start gap-2 animate-in slide-in-from-left-2">
                    <span className="text-indigo-500 shrink-0">✓</span>
                    <span>{thought}</span>
                 </div>
               ))}
               <div className="text-white font-black animate-pulse flex items-center gap-2 mt-3">
                  <span className="w-1 h-1 bg-white rounded-full" />
                  {steps[analysisStep]}
               </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 w-full max-w-sm space-y-4 mb-6">
        {call.isScam ? (
          <>
            <button 
              onClick={handleAiFastReply}
              disabled={isAiReplying}
              className="w-full py-6 bg-indigo-600 text-white rounded-[32px] font-black text-sm uppercase tracking-[0.3em] shadow-[0_20px_50px_rgba(79,70,229,0.4)] active:scale-95 transition-all flex items-center justify-center gap-3 border-b-4 border-indigo-800"
            >
              <Zap size={20} className="fill-white" /> {isAiReplying ? 'AI INTERCEPTING...' : 'AI INTERCEPT & REJECT'}
            </button>
            <button 
              onClick={onClose}
              disabled={isAiReplying}
              className="w-full py-6 bg-red-600 text-white rounded-[32px] font-black text-sm uppercase tracking-[0.3em] shadow-[0_20px_50px_rgba(220,38,38,0.3)] active:scale-95 transition-all flex items-center justify-center gap-3 border-b-4 border-red-800"
            >
              <ShieldAlert size={20} /> BLOCK ATTACK
            </button>
            <button 
              onClick={onClose}
              className="w-full py-3 text-slate-500 font-black text-[9px] uppercase tracking-[0.4em] flex items-center justify-center gap-2 hover:text-white transition-colors"
            >
              <X size={14} /> Dismiss Threat Warning
            </button>
          </>
        ) : (
          <div className="grid grid-cols-2 gap-6 px-4">
             <button onClick={onClose} className="bg-red-500 text-white p-8 rounded-[40px] flex items-center justify-center shadow-2xl active:scale-90 transition-all border-b-8 border-red-700">
                <PhoneOff size={36} />
             </button>
             <button onClick={onClose} className="bg-green-500 text-white p-8 rounded-[40px] flex items-center justify-center shadow-2xl active:scale-90 transition-all border-b-8 border-green-700">
                <Phone size={36} />
             </button>
          </div>
        )}
      </div>

      <div className="relative z-10 flex items-center gap-3 text-[8px] font-black text-gray-700 uppercase tracking-[0.5em] pb-4">
        <ShieldCheck size={12} className="text-indigo-600" /> 
        <span>Suraksha Setu Engine v5.0 • Gemini AI Integrated</span>
      </div>
    </div>
  );
};
