import React, { useState, useRef } from 'react';
import { 
  ChevronLeft, Cpu, Clock, Zap, Shield, Sparkles, BrainCircuit, 
  Activity, Upload, FileArchive, RefreshCw, AlertTriangle, 
  CheckCircle2, XCircle, Info, Loader2, Trash2
} from 'lucide-react';
import { AdBanner } from './AdBanner';
import { analyzeApkSafety, ApkSafetyResult } from '../services/geminiService';

export const APKScanner: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ApkSafetyResult | null>(null);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBack = () => {
    window.dispatchEvent(new CustomEvent('nav-to-dashboard'));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (selected.name.toLowerCase().endsWith('.apk')) {
        setFile(selected);
        setScanResult(null);
      } else {
        alert("Invalid format. Please upload a .apk file.");
      }
    }
  };

  const startAnalysis = async () => {
    if (!file) return;
    
    setIsScanning(true);
    setProgress(0);
    setScanResult(null);
    
    const steps = [
      "Extracting Android Manifest...",
      "Decompiling DEX bytecode...",
      "Mapping Permission Nodes...",
      "Syncing with Global Threat Hub...",
      "Running Neural Heuristics..."
    ];

    for (let i = 0; i < steps.length; i++) {
      setStatusMessage(steps[i]);
      setProgress(((i + 1) / steps.length) * 100);
      await new Promise(r => setTimeout(r, 800));
    }

    try {
      const result = await analyzeApkSafety(file.name, file.size);
      setScanResult(result);
    } catch (e) {
      console.error("Analysis Failed");
    } finally {
      setIsScanning(false);
    }
  };

  const resetScanner = () => {
    setFile(null);
    setScanResult(null);
    setIsScanning(false);
    setProgress(0);
  };

  return (
    <div className="p-5 space-y-6 animate-in slide-in-from-right duration-500 pb-32 font-sans flex flex-col items-center">
      <header className="w-full flex flex-col items-center relative text-center space-y-4">
        <button 
          onClick={handleBack}
          className="absolute left-0 top-0 p-3 bg-white border border-gray-100 rounded-2xl text-gray-400 shadow-sm active:scale-90 transition-all"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="w-20 h-20 bg-slate-900 rounded-[32px] flex items-center justify-center shadow-xl text-white relative">
          <div className={`absolute inset-0 bg-indigo-500/20 rounded-[32px] ${isScanning ? 'animate-ping' : ''}`} />
          <Cpu size={40} className="text-indigo-400 relative z-10" />
        </div>
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tighter text-slate-900 leading-none">APK Shield</h2>
          <div className="flex items-center justify-center gap-2 mt-2">
            <Zap size={12} className="text-indigo-600 fill-indigo-600" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600">Neural Malware Audit v5.0</p>
          </div>
        </div>
      </header>

      {!file && !scanResult && (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="w-full bg-white border-4 border-dashed border-slate-100 rounded-[48px] p-12 flex flex-col items-center justify-center text-center space-y-6 cursor-pointer hover:border-indigo-200 transition-all group active:scale-95 shadow-sm"
        >
           <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".apk" className="hidden" />
           <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
             <Upload size={32} />
           </div>
           <div className="space-y-1">
             <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Upload APK</h3>
             <p className="text-xs text-slate-400 font-bold uppercase tracking-widest leading-relaxed">Drop binary file for analysis</p>
           </div>
           <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100">
              <FileArchive size={14} className="text-slate-400" />
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Supports Android Package (.apk)</span>
           </div>
        </div>
      )}

      {file && !scanResult && (
        <div className="w-full bg-white rounded-[44px] p-8 shadow-xl border border-gray-100 space-y-8 animate-in zoom-in-95">
          <div className="flex items-center justify-between bg-slate-50 p-4 rounded-[28px] border border-slate-100">
             <div className="flex items-center gap-4">
               <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
                 <FileArchive size={24} />
               </div>
               <div className="max-w-[140px]">
                 <p className="text-xs font-black text-slate-900 truncate uppercase">{file.name}</p>
                 <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
               </div>
             </div>
             {!isScanning && (
               <button onClick={resetScanner} className="p-3 bg-red-50 text-red-500 rounded-xl active:scale-90 transition-all">
                 <Trash2 size={18} />
               </button>
             )}
          </div>

          {isScanning ? (
            <div className="space-y-6">
              <div className="flex flex-col items-center text-center space-y-3">
                 <Loader2 size={32} className="text-indigo-600 animate-spin" />
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">{statusMessage}</p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-[8px] font-black uppercase text-indigo-400 tracking-widest">
                   <span>Neural Pipeline</span>
                   <span>{Math.round(progress)}%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                   <div className="h-full bg-indigo-600 transition-all duration-300" style={{ width: `${progress}%` }} />
                </div>
              </div>
            </div>
          ) : (
            <button 
              onClick={startAnalysis}
              className="w-full py-6 bg-indigo-600 text-white rounded-[32px] font-black text-sm uppercase tracking-[0.3em] shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              <BrainCircuit size={20} /> INITIATE NEURAL SCAN
            </button>
          )}
        </div>
      )}

      {scanResult && (
        <div className={`w-full p-8 rounded-[48px] border-4 shadow-2xl animate-in zoom-in-95 space-y-8 relative overflow-hidden ${
          scanResult.isSecure ? 'bg-emerald-50 border-emerald-400' : 'bg-red-50 border-red-400'
        }`}>
          <div className="absolute top-0 right-0 p-8 opacity-[0.05] rotate-12">
            {scanResult.isSecure ? <Shield size={160} /> : <AlertTriangle size={160} />}
          </div>

          <div className="flex items-center gap-5 relative z-10">
             <div className={`p-5 rounded-[28px] shadow-lg text-white ${
               scanResult.isSecure ? 'bg-emerald-600' : 'bg-red-600 animate-pulse'
             }`}>
               {scanResult.isSecure ? <CheckCircle2 size={40} /> : <XCircle size={40} />}
             </div>
             <div>
               <h3 className={`text-3xl font-black uppercase tracking-tighter leading-none ${
                 scanResult.isSecure ? 'text-emerald-700' : 'text-red-700'
               }`}>
                 {scanResult.threatLevel}
               </h3>
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-1.5 flex items-center gap-2">
                 <Shield size={12} className={scanResult.isSecure ? 'text-emerald-600' : 'text-red-600'} />
                 {scanResult.isSecure ? 'Binary Integrity Verified' : 'Threat Signature Detected'}
               </p>
             </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-[32px] border border-black/5 space-y-4 relative z-10">
             <div className="space-y-1">
               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Heuristic Verdict</p>
               <p className="text-sm font-bold text-slate-800 leading-relaxed italic">"{scanResult.verdict}"</p>
             </div>
             
             <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-1">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Permissions Risk</p>
                  <p className={`text-[10px] font-black uppercase ${scanResult.isSecure ? 'text-emerald-600' : 'text-amber-600'}`}>{scanResult.permissionsRisk}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">App Integrity</p>
                  <p className="text-[10px] font-black text-indigo-600 uppercase">Neural Handshake OK</p>
                </div>
             </div>

             {scanResult.detectedMalware.length > 0 && (
               <div className="pt-4 border-t border-slate-100">
                  <p className="text-[9px] font-black text-red-500 uppercase tracking-widest mb-2">Detected Artifacts</p>
                  <div className="flex flex-wrap gap-2">
                    {scanResult.detectedMalware.map((m, i) => (
                      <span key={i} className="bg-red-100 text-red-600 px-2.5 py-1 rounded-full text-[8px] font-black uppercase border border-red-200">
                        {m}
                      </span>
                    ))}
                  </div>
               </div>
             )}
          </div>

          <button 
            onClick={resetScanner}
            className={`w-full py-5 rounded-[32px] font-black text-xs uppercase tracking-[0.3em] shadow-xl active:scale-95 transition-all ${
              scanResult.isSecure ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-white'
            }`}
          >
            Start New Scan
          </button>
        </div>
      )}

      <div className="w-full max-w-sm bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm space-y-6">
         <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
               <BrainCircuit size={28} />
            </div>
            <div>
               <h4 className="text-sm font-black uppercase text-slate-900 leading-none">AI Sandbox Scan</h4>
               <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Deep Bytecode Logic Audit</p>
            </div>
         </div>
         <p className="text-xs text-slate-500 leading-relaxed font-medium">
            APK Shield executes suspicious apps in a <strong>Secure Neural Sandbox</strong> to analyze their behavior before you install them on your primary identity handle.
         </p>
      </div>

      <div className="bg-amber-50 p-6 rounded-[36px] border border-amber-100 flex items-start gap-4">
        <Info size={20} className="text-amber-600 shrink-0 mt-0.5" />
        <p className="text-[10px] text-amber-900/60 font-bold uppercase tracking-wider leading-relaxed">
          <b>Heuristic Note:</b> APK binary analysis is an estimation. Never install apps from untrusted sources or links provided in SMS messages.
        </p>
      </div>

      <AdBanner className="w-full max-w-sm" />
    </div>
  );
};