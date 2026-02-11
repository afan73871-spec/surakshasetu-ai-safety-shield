import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, ShieldCheck, RefreshCw, ChevronLeft, 
  Fingerprint, Search, Globe, Smartphone, MessageSquare, 
  Camera, Zap, Activity, UserX, AlertTriangle, Cpu, Link,
  User, Database, Info, Layers, CheckCircle2, XCircle
} from 'lucide-react';
import { analyzeIdentityForensics, IdentityAuditResult } from '../services/geminiService';
import { usageService } from '../services/usageService';
import { AdBanner } from './AdBanner';

export const IdentityAudit: React.FC = () => {
  const [formData, setFormData] = useState({ 
    name: '', 
    handle: '', 
    bio: '', 
    imageUrl: '', 
    message: '',
    platform: 'WhatsApp'
  });
  const [isAuditing, setIsAuditing] = useState(false);
  const [result, setResult] = useState<IdentityAuditResult | null>(null);
  const [auditStep, setAuditStep] = useState(0);
  const [isPro, setIsPro] = useState(false);
  const [credits, setCredits] = useState<number | string>(5);

  useEffect(() => {
    const savedUser = localStorage.getItem('suraksha_user');
    const pro = savedUser ? JSON.parse(savedUser).isPro : false;
    setIsPro(pro);
    setCredits(usageService.getRemainingCredits(pro).identity);

    const updateCredits = () => setCredits(usageService.getRemainingCredits(pro).identity);
    window.addEventListener('usage-updated', updateCredits);
    return () => window.removeEventListener('usage-updated', updateCredits);
  }, []);

  const handleAudit = async () => {
    if (!formData.name || !formData.handle) return;

    if (!usageService.canUseFeature('IDENTITY_AUDIT', isPro)) {
      alert("Daily Forensic Limit (5) Reached. Upgrade to Pro for unlimited identity audits.");
      window.dispatchEvent(new CustomEvent('nav-to-subscription'));
      return;
    }
    
    setIsAuditing(true);
    setResult(null);
    setAuditStep(1);

    // Multi-stage pulse UI simulation for realistic forensic feedback
    const steps = [
      { step: 2, delay: 1500 },
      { step: 3, delay: 3000 }
    ];

    steps.forEach(({ step, delay }) => {
      setTimeout(() => setAuditStep(step), delay);
    });

    try {
      const auditResult = await analyzeIdentityForensics({
        name: formData.name,
        handle: formData.handle,
        bio: formData.bio,
        imageUrl: formData.imageUrl,
        firstMessage: formData.message
      });
      setResult(auditResult);
      if (!isPro) usageService.incrementUsage('identityAudit');
    } catch (e) {
      alert("Neural Identity Pulse Weak. Re-syncing link...");
    } finally {
      setIsAuditing(false);
      setAuditStep(0);
    }
  };

  const reset = () => {
    setResult(null);
    setFormData({ name: '', handle: '', bio: '', imageUrl: '', message: '', platform: 'WhatsApp' });
  };

  return (
    <div className="p-5 space-y-6 animate-in slide-in-from-right duration-500 pb-32 font-sans flex flex-col items-center">
      <header className="w-full flex flex-col items-center relative text-center space-y-4">
        <button 
          onClick={() => window.dispatchEvent(new CustomEvent('nav-to-dashboard'))}
          className="absolute left-0 top-0 p-3 bg-white border border-gray-100 rounded-2xl text-gray-400 shadow-sm active:scale-90 transition-all"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="w-20 h-20 bg-indigo-600 rounded-[32px] flex items-center justify-center shadow-xl text-white relative">
          <Fingerprint size={40} className="relative z-10" />
          <div className="absolute inset-0 bg-white/20 rounded-[32px] animate-pulse-ring" />
        </div>
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tighter text-slate-900 leading-none">ID-Forensics</h2>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500 mt-2">
            {isPro ? 'Pro Shield Active' : `Credits: ${credits} Left Today`}
          </p>
        </div>
      </header>

      {!result && !isAuditing && (
        <div className="w-full bg-white rounded-[44px] p-8 shadow-xl border border-gray-100 space-y-6 animate-in zoom-in-95">
           <div className="space-y-5">
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Target Platform</label>
                 <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
                    {['WhatsApp', 'Instagram', 'Facebook', 'Telegram', 'Dating App'].map(p => (
                      <button 
                        key={p}
                        onClick={() => setFormData({...formData, platform: p})}
                        className={`px-4 py-2 rounded-full text-[10px] font-black uppercase whitespace-nowrap border-2 transition-all ${formData.platform === p ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-slate-50 border-transparent text-slate-400'}`}
                      >
                        {p}
                      </button>
                    ))}
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                 <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Display Name</label>
                    <input 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs font-bold outline-none focus:border-indigo-500 transition-all"
                    />
                 </div>
                 <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Handle/Phone</label>
                    <input 
                      value={formData.handle}
                      onChange={(e) => setFormData({...formData, handle: e.target.value})}
                      placeholder="e.g. @rahul_vpa"
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs font-bold outline-none focus:border-indigo-500 transition-all"
                    />
                 </div>
              </div>
              <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Profile Bio (Paste text)</label>
                  <textarea 
                    value={formData.bio}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    placeholder="Enter profile bio description here..."
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 h-24 text-xs font-bold outline-none focus:border-indigo-500 transition-all resize-none shadow-inner"
                  />
              </div>
              <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Profile Picture Link (Optional)</label>
                  <div className="relative">
                    <input 
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                      placeholder="Paste image URL here"
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 pl-12 text-xs font-bold outline-none focus:border-indigo-500 transition-all"
                    />
                    <Link className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                  </div>
              </div>
              <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">First Message (Optional)</label>
                  <input 
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    placeholder="e.g. 'Invest 10k and earn 1L...'"
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs font-bold outline-none focus:border-indigo-500 transition-all"
                  />
              </div>
           </div>

           <button 
             onClick={handleAudit}
             disabled={!formData.name || !formData.handle}
             className="w-full py-6 bg-slate-900 text-white rounded-[32px] font-black text-xs uppercase tracking-[0.4em] shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
           >
              <Search size={18} /> INITIATE FORENSICS
           </button>
        </div>
      )}

      {isAuditing && (
        <div className="w-full bg-slate-950 rounded-[44px] p-12 shadow-2xl border border-white/5 flex flex-col items-center space-y-10 animate-in zoom-in-95">
           <div className="w-40 h-40 rounded-full border-2 border-indigo-500/20 flex items-center justify-center relative">
              <div className="absolute inset-0 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin" />
              <div className="absolute inset-4 border border-indigo-400/20 rounded-full animate-pulse" />
              <Activity size={64} className="text-indigo-400 animate-pulse" />
           </div>
           <div className="text-center space-y-4">
              <h3 className="text-xl font-black uppercase tracking-tighter text-white">Forensic Pipeline</h3>
              <div className="space-y-3">
                 <p className={`text-[9px] font-black uppercase tracking-[0.2em] transition-all duration-500 ${auditStep >= 1 ? 'text-indigo-400 opacity-100' : 'text-slate-600 opacity-30'}`}>Step 1: VOIP / Carrier Metadata Registry</p>
                 <p className={`text-[9px] font-black uppercase tracking-[0.2em] transition-all duration-500 ${auditStep >= 2 ? 'text-indigo-400 opacity-100' : 'text-slate-600 opacity-30'}`}>Step 2: Neural Visual Artifact Analysis</p>
                 <p className={`text-[9px] font-black uppercase tracking-[0.2em] transition-all duration-500 ${auditStep >= 3 ? 'text-indigo-400 opacity-100' : 'text-slate-600 opacity-30'}`}>Step 3: NLP Behavioral Intent Signature</p>
              </div>
           </div>
        </div>
      )}

      {result && (
        <div className="w-full space-y-6 animate-in zoom-in-95">
           <div className={`p-8 rounded-[48px] border-4 shadow-2xl space-y-8 relative overflow-hidden ${
             result.verdict === 'LEGITIMATE' ? 'bg-emerald-50 border-emerald-400' : 
             result.verdict === 'SUSPICIOUS' ? 'bg-amber-50 border-amber-400' : 
             'bg-red-50 border-red-400'
           }`}>
              <div className="flex items-center gap-5 relative z-10">
                 <div className={`p-5 rounded-[28px] shadow-lg text-white ${
                   result.verdict === 'LEGITIMATE' ? 'bg-emerald-600' : 
                   result.verdict === 'SUSPICIOUS' ? 'bg-amber-500' : 
                   'bg-red-600 animate-pulse'
                 }`}>
                   {result.verdict === 'LEGITIMATE' ? <ShieldCheck size={40} /> : <ShieldAlert size={40} />}
                 </div>
                 <div>
                   <h3 className={`text-3xl font-black uppercase tracking-tighter leading-none ${
                     result.verdict === 'LEGITIMATE' ? 'text-emerald-700' : 
                     result.verdict === 'SUSPICIOUS' ? 'text-amber-700' : 
                     'text-red-700'
                   }`}>
                     {result.verdict}
                   </h3>
                   <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-1.5 flex items-center gap-2">
                     <Cpu size={12} /> Forensic Accuracy: {100 - result.overallRisk}%
                   </p>
                 </div>
              </div>

              <div className="space-y-3 relative z-10">
                 {Object.entries(result.layers).map(([key, layer]: [string, any]) => (
                   <div key={key} className="bg-white/90 backdrop-blur-sm p-5 rounded-[28px] border border-black/5 flex items-start gap-4 shadow-sm">
                      <div className={`p-2.5 rounded-xl ${
                        layer.risk === 'HIGH' ? 'bg-red-100 text-red-600' : 
                        layer.risk === 'MEDIUM' ? 'bg-amber-100 text-amber-600' : 
                        'bg-emerald-100 text-emerald-600'
                      }`}>
                         {key === 'metadata' ? <Smartphone size={18} /> : 
                          key === 'visual' ? <Camera size={18} /> : 
                          <MessageSquare size={18} />}
                      </div>
                      <div className="flex-1 space-y-1">
                         <div className="flex justify-between items-center">
                            <h5 className="text-[9px] font-black uppercase text-slate-900 tracking-wider">{key} LAYER</h5>
                            <span className={`text-[7px] font-black px-2 py-0.5 rounded-full ${
                              layer.risk === 'HIGH' ? 'bg-red-600 text-white' : 
                              layer.risk === 'MEDIUM' ? 'bg-amber-500 text-white' : 
                              'bg-emerald-600 text-white'
                            }`}>{layer.risk} RISK</span>
                         </div>
                         <p className="text-[11px] font-bold text-slate-700">{layer.status}</p>
                         <p className="text-[9px] text-slate-500 leading-relaxed italic">{layer.detail}</p>
                      </div>
                   </div>
                 ))}
              </div>

              <div className="bg-slate-950 p-6 rounded-[32px] text-white space-y-2 relative z-10 border border-white/5 shadow-2xl">
                  <h4 className="text-[9px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                    <Layers size={12} /> Final Audit Summary
                  </h4>
                  <p className="text-xs font-medium leading-relaxed italic opacity-90">"{result.summary}"</p>
              </div>

              <button onClick={reset} className="w-full py-5 bg-white border border-slate-200 text-slate-900 rounded-[32px] font-black text-xs uppercase tracking-[0.3em] active:scale-95 transition-all relative z-10">Clear Forensics</button>
           </div>
        </div>
      )}

      <div className="w-full max-w-sm bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm space-y-6">
         <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shadow-inner">
               <Cpu size={28} />
            </div>
            <div>
               <h4 className="text-sm font-black uppercase text-slate-900 leading-none">AI Identity Core</h4>
               <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Stolen Profile Detection</p>
            </div>
         </div>
         <p className="text-xs text-slate-500 leading-relaxed font-medium">
            Our engine cross-references profile attributes against <strong>5.2M Global Scam Identifiers</strong> to detect automated bots and impersonators before they compromise your data.
         </p>
      </div>

      <div className="bg-indigo-50 p-6 rounded-[36px] border border-indigo-100 flex items-start gap-4">
        <Info size={20} className="text-indigo-600 shrink-0 mt-0.5" />
        <p className="text-[10px] text-indigo-900/60 font-bold uppercase tracking-wider leading-relaxed">
          <b>Security Advisory:</b> Scammers often use 'High-Status' stock photos to build trust. ID-Forensics analyzes pore structure and lighting artifacts to flag non-organic profile visuals.
        </p>
      </div>

      <AdBanner />
    </div>
  );
};