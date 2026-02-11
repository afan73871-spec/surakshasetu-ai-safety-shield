import React, { useState } from 'react';
import { Globe, RefreshCw, Zap, CheckCircle2, XCircle, ChevronLeft, Info, ShieldAlert, ExternalLink, Search, Lock, ShieldX } from 'lucide-react';
import { analyzeWebsiteSafety, WebsiteSafetyResult } from '../services/geminiService';
import { AdBanner } from './AdBanner';

export const URLShield: React.FC = () => {
  const [urlInput, setUrlInput] = useState('');
  const [urlResult, setUrlResult] = useState<WebsiteSafetyResult | null>(null);
  const [isScanningUrl, setIsScanningUrl] = useState(false);
  const [auditLogs, setAuditLogs] = useState<string[]>([]);

  const addLog = (msg: string) => {
    setAuditLogs(prev => [...prev.slice(-3), `> ${msg}`]);
  };

  const handleUrlScan = async () => {
    if (!urlInput) return;
    setIsScanningUrl(true);
    setUrlResult(null);
    setAuditLogs([]);
    
    addLog("Connecting to DNS Registry...");
    addLog("Extracting WHOIS Metadata...");

    try {
      const result = await analyzeWebsiteSafety(urlInput);
      addLog("Running Neural Phishing Audit...");
      setUrlResult(result);
    } catch (e) {
      addLog("Neural Audit Failed.");
    } finally {
      setIsScanningUrl(false);
    }
  };

  const handleBack = () => {
    window.dispatchEvent(new CustomEvent('nav-to-dashboard'));
  };

  return (
    <div className="p-5 space-y-6 animate-in slide-in-from-right duration-500 pb-32 font-sans">
      <header className="flex flex-col items-center relative text-center space-y-4">
        <button 
          onClick={handleBack}
          className="absolute left-0 top-0 p-3 bg-white border border-gray-100 rounded-2xl text-gray-400 shadow-sm active:scale-90 transition-all"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="w-16 h-16 bg-slate-900 rounded-[24px] flex items-center justify-center shadow-xl text-white">
          <Globe size={32} className="text-indigo-400" />
        </div>
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tighter text-slate-900 leading-none">Web Shield</h2>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500 mt-2">Phishing Defense Node</p>
        </div>
      </header>

      <div className="bg-white rounded-[44px] p-8 border border-gray-100 shadow-xl space-y-6 relative overflow-hidden group">
        <div className="absolute -top-4 -right-4 p-8 opacity-[0.03] rotate-12 group-hover:scale-110 transition-transform">
          <Globe size={160} />
        </div>
        
        <div className="space-y-4 relative z-10">
          <div className="space-y-2">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Link Verifier</h3>
            <div className="relative">
              <input 
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="Paste suspicious link (e.g. login-sbi.top)"
                className="w-full bg-gray-50 border-2 border-transparent focus:border-indigo-600 rounded-[24px] py-5 px-6 outline-none transition-all font-bold text-slate-800 placeholder:text-slate-400 shadow-inner"
              />
              <div className="absolute right-6 top-1/2 -translate-y-1/2">
                {urlInput && !isScanningUrl && <Lock size={18} className={urlInput.includes('https') ? 'text-green-500' : 'text-slate-300'} />}
              </div>
            </div>
          </div>

          <button 
            onClick={handleUrlScan}
            disabled={isScanningUrl || !urlInput}
            className="w-full py-5 bg-slate-900 text-white rounded-[28px] font-black text-xs uppercase tracking-[0.3em] shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {isScanningUrl ? <RefreshCw className="animate-spin" /> : <Search size={18} />}
            {isScanningUrl ? 'ANALYZING DOMAIN...' : 'START LINK AUDIT'}
          </button>
        </div>

        {isScanningUrl && (
          <div className="bg-black/5 rounded-[24px] p-4 font-mono text-[10px] text-slate-500 space-y-1 animate-pulse">
            {auditLogs.map((log, i) => <div key={i}>{log}</div>)}
          </div>
        )}

        {urlResult && (
          <div className={`p-7 rounded-[40px] border-2 animate-in zoom-in duration-300 ${urlResult.riskLevel === 'HIGH' ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
            <div className="flex flex-col items-center text-center space-y-4">
              <div className={`p-4 rounded-[28px] shadow-lg ${urlResult.riskLevel === 'HIGH' ? 'bg-red-600 text-white animate-bounce' : 'bg-green-600 text-white'}`}>
                {urlResult.isSecure && urlResult.riskLevel !== 'HIGH' ? <CheckCircle2 size={32} /> : <ShieldX size={32} />}
              </div>
              <div className="space-y-1">
                <h4 className={`text-2xl font-black uppercase tracking-tighter ${urlResult.riskLevel === 'HIGH' ? 'text-red-600' : 'text-green-600'}`}>
                  {urlResult.riskLevel === 'HIGH' ? 'Threat Identified' : 'Clean Link'}
                </h4>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-[9px] font-black uppercase bg-white/50 px-2 py-0.5 rounded-full text-slate-600">Level: {urlResult.riskLevel}</span>
                  <span className="text-[9px] font-black uppercase bg-white/50 px-2 py-0.5 rounded-full text-slate-600">{urlResult.protocol}</span>
                </div>
              </div>
              <p className="text-sm font-bold text-slate-800 leading-snug">{urlResult.domainReputation}</p>
              <div className="w-full h-px bg-slate-200" />
              <div className="bg-white/80 p-4 rounded-2xl border border-black/5">
                <p className="text-[10px] text-slate-500 font-bold leading-relaxed italic uppercase">"{urlResult.warning}"</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-indigo-50 rounded-[40px] p-8 border border-indigo-100 flex items-start gap-4 shadow-sm">
        <Info size={24} className="text-indigo-600 shrink-0" />
        <div className="space-y-2">
          <h4 className="text-[10px] font-black text-indigo-900 uppercase">Look-alike Domains</h4>
          <p className="text-[10px] text-indigo-800/60 font-bold leading-relaxed">
            Scammers often use URLs like <span className="text-red-500">paytm-kyc.com</span> instead of the official domain. Web Shield uses AI to detect these homograph and typosquatting attacks.
          </p>
        </div>
      </div>

      <AdBanner />
    </div>
  );
};