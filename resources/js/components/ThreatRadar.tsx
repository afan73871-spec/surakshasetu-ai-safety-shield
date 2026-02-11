import React, { useState, useEffect } from 'react';
import { 
  Radar, ShieldAlert, Activity, Globe, Zap, 
  Terminal, ShieldCheck, RefreshCw, AlertTriangle,
  Radio, Cpu, Layers, ChevronRight, Lock
} from 'lucide-react';
import { analyzeThreatCluster, ThreatRadarResult } from '../services/geminiService';
import { apiClient } from '../services/apiService';

export const ThreatRadar: React.FC = () => {
  const [result, setResult] = useState<ThreatRadarResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [scanRotation, setScanRotation] = useState(0);

  const addLog = (msg: string) => {
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 4)]);
  };

  const startAutomatedAudit = async () => {
    setIsScanning(true);
    addLog("Neural Hub Handshake...");
    addLog("Querying 5.2M Global Identifiers...");

    try {
      const registry = await apiClient.get('/scams');
      const analysis = await analyzeThreatCluster(registry);
      setResult(analysis);
      addLog("Predictive Forecast Ready.");
    } catch (e) {
      addLog("Handshake Failed. Retry.");
    } finally {
      setIsScanning(false);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setScanRotation(prev => (prev + 2) % 360);
    }, 20);
    startAutomatedAudit();
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-5 space-y-6 pb-32 animate-in fade-in duration-700 font-sans text-slate-900">
      <header className="text-center space-y-2">
        <h2 className="text-3xl font-black uppercase tracking-tighter leading-none">Threat Radar</h2>
        <div className="flex items-center justify-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600">Predictive Neural ATDS v5.0</span>
        </div>
      </header>

      {/* Circular Radar HUD */}
      <div className="relative w-full aspect-square max-w-sm mx-auto bg-slate-950 rounded-[48px] border-8 border-white shadow-2xl overflow-hidden group">
         <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
         
         {/* The Sweeper */}
         <div 
           className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-1 bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent z-10"
           style={{ transform: `translate(-50%, -50%) rotate(${scanRotation}deg)` }}
         />

         {/* Hotspots */}
         {result?.activeClusters.map((cluster, i) => (
            <div 
              key={i}
              className="absolute w-4 h-4 bg-red-500 rounded-full blur-[2px] animate-pulse z-20"
              style={{ 
                top: `${20 + (i * 25)}%`, 
                left: `${30 + (i * 15)}%`,
                opacity: isScanning ? 0.2 : 1
              }}
            />
         ))}

         <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4">
            <div className="w-48 h-48 border-2 border-white/5 rounded-full flex items-center justify-center">
               <div className="w-32 h-32 border border-white/10 rounded-full flex items-center justify-center">
                  <div className={`w-16 h-16 rounded-3xl flex items-center justify-center shadow-2xl transition-all duration-700 ${isScanning ? 'bg-indigo-600 scale-110' : 'bg-slate-900'}`}>
                    {isScanning ? <RefreshCw className="animate-spin text-white" /> : <Radar size={32} className="text-indigo-400" />}
                  </div>
               </div>
            </div>
         </div>

         {/* HUD Text */}
         <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end z-30">
            <div className="space-y-1">
               <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Risk Index</p>
               <h4 className="text-2xl font-black text-white">{result?.globalRiskLevel || 0}%</h4>
            </div>
            <div className="text-right space-y-1">
               <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Protocol</p>
               <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Adaptive-Pro</h4>
            </div>
         </div>
      </div>

      {/* Console Feed */}
      <div className="bg-slate-900 rounded-[32px] p-6 font-mono text-[10px] text-indigo-300 space-y-2 border border-white/5 shadow-xl">
         {logs.map((log, i) => <div key={i} className="animate-in slide-in-from-left duration-300 opacity-80">{log}</div>)}
         {isScanning && <div className="animate-pulse">_Neural Sweep in Progress...</div>}
      </div>

      {/* Predictive Insights */}
      {result && (
        <div className="space-y-4 animate-in slide-in-from-bottom duration-500">
           <div className="flex items-center justify-between px-2">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Emerging Vectors</h4>
              {result.isZeroDayDetected && (
                <div className="bg-red-600 px-3 py-1 rounded-full animate-bounce flex items-center gap-1.5 shadow-lg shadow-red-200">
                  <AlertTriangle size={10} className="text-white" />
                  <span className="text-[8px] font-black text-white uppercase">Zero-Day Identified</span>
                </div>
              )}
           </div>

           <div className="grid grid-cols-1 gap-3">
              {result.predictedVectors.map((v, i) => (
                <div key={i} className="bg-white p-6 rounded-[36px] border border-slate-100 shadow-sm flex items-start gap-4 hover:border-indigo-200 transition-all">
                   <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl shrink-0"><Cpu size={20} /></div>
                   <div className="flex-1 space-y-1">
                      <div className="flex justify-between items-center">
                         <h5 className="text-[11px] font-black uppercase text-slate-900">{v.type}</h5>
                         <span className="text-[8px] font-black text-red-500">{v.risk}% Risk</span>
                      </div>
                      <p className="text-[10px] text-slate-500 font-medium leading-relaxed italic pr-4">"{v.description}"</p>
                   </div>
                </div>
              ))}
           </div>

           <div className="bg-indigo-600 rounded-[44px] p-8 text-white space-y-6 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 transition-transform group-hover:scale-110"><ShieldCheck size={120} /></div>
              <div className="relative z-10 space-y-4">
                 <h4 className="text-xl font-black uppercase tracking-tight leading-none">Automated Response</h4>
                 <div className="space-y-3">
                    {result.mitigationSteps.map((step, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="p-1 bg-white/10 rounded-full border border-white/20"><Lock size={10} /></div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-100">{step}</p>
                      </div>
                    ))}
                 </div>
                 <button 
                   onClick={startAutomatedAudit}
                   className="w-full py-5 bg-white text-indigo-600 rounded-[28px] font-black text-xs uppercase tracking-[0.4em] shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 mt-4"
                 >
                    <Zap size={16} fill="currentColor" /> Refresh Shielding
                 </button>
              </div>
           </div>
        </div>
      )}

      <div className="bg-white p-8 rounded-[44px] border border-gray-100 shadow-sm flex items-start gap-4">
         <div className="p-4 bg-amber-50 text-amber-600 rounded-3xl"><Activity size={24} /></div>
         <div className="space-y-1">
            <h5 className="text-sm font-black uppercase text-slate-900 leading-none">System Integrity</h5>
            <p className="text-[10px] text-slate-500 font-medium leading-relaxed">The ATDS creates a "Neural Bubble" around your digital identity, isolating Zero-Day attacks in a volatile RAM sandbox before they execute.</p>
         </div>
      </div>
    </div>
  );
};
