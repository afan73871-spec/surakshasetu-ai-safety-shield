import React from 'react';
import { 
  Shield, Lock, CreditCard, RefreshCw, AlertCircle, 
  ChevronLeft, FileText, Scale, ShieldCheck, Zap, 
  Database, EyeOff, UserCheck, Globe
} from 'lucide-react';

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="flex flex-col bg-slate-50 min-h-screen pb-40 animate-in fade-in duration-700 font-sans">
      {/* Header */}
      <div className="p-12 bg-indigo-600 text-white rounded-b-[64px] shadow-2xl relative overflow-hidden text-center">
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <Shield size={220} className="absolute -top-12 -left-12" />
        </div>
        <div className="relative z-10 flex flex-col items-center space-y-4">
          <div className="p-4 bg-white/20 rounded-[32px] backdrop-blur-md shadow-xl">
            <Scale size={36} className="text-white" />
          </div>
          <div className="space-y-1">
            <h1 className="text-4xl font-black tracking-tighter uppercase leading-none">Privacy & Terms</h1>
            <p className="text-indigo-100/70 text-[10px] font-black uppercase tracking-[0.4em]">Master Framework v4.2</p>
          </div>
        </div>
      </div>

      <div className="px-6 -mt-10 relative z-10 space-y-6">
        
        {/* Subscription Strict Policy */}
        <div className="bg-white rounded-[44px] p-8 shadow-xl border border-gray-100 space-y-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] rotate-12">
            <CreditCard size={120} />
          </div>
          
          <div className="flex items-center gap-4 relative z-10">
            <div className="p-3 bg-red-50 text-red-600 rounded-2xl shadow-sm">
              <AlertCircle size={28} />
            </div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">Billing & Refunds</h3>
          </div>

          <div className="space-y-6 relative z-10">
            <div className="flex gap-5">
              <div className="mt-1 p-1.5 bg-indigo-50 rounded-xl shrink-0">
                <ShieldCheck size={20} className="text-indigo-600" />
              </div>
              <div className="space-y-1">
                <h4 className="font-black text-sm uppercase text-slate-800">Instant Activation</h4>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  Suraksha Pro features are synchronized with your identity link immediately upon payment success. No waiting period required.
                </p>
              </div>
            </div>

            <div className="flex gap-5">
              <div className="mt-1 p-1.5 bg-indigo-50 rounded-xl shrink-0">
                <RefreshCw size={20} className="text-indigo-600" />
              </div>
              <div className="space-y-1">
                <h4 className="font-black text-sm uppercase text-slate-800">Renewal Cycle</h4>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  Subscriptions follow a 30-day billing cycle. Automatic renewals ensure your neural shield remains online without interruption.
                </p>
              </div>
            </div>

            <div className="p-6 bg-red-50 rounded-[32px] border border-red-100 flex gap-4">
              <Lock size={20} className="text-red-600 shrink-0 mt-1" />
              <div className="space-y-1">
                <h4 className="font-black text-[10px] uppercase text-red-600 tracking-widest">Strict No-Refund Policy</h4>
                <p className="text-[11px] text-red-900/70 font-bold leading-relaxed italic">
                  "All digital transactions are final. Once a shield level is activated or renewed, the fee is non-refundable. Please ensure your choice of plan is correct before authorizing payment."
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Data Privacy & AI Protocols */}
        <div className="bg-slate-900 rounded-[44px] p-8 shadow-2xl border border-white/5 space-y-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-[0.05] rotate-12">
            <Database size={160} />
          </div>
          
          <div className="flex items-center gap-4 relative z-10">
             <div className="p-3 bg-white/5 border border-white/10 rounded-2xl">
               <EyeOff size={28} className="text-indigo-400" />
             </div>
             <h3 className="text-xl font-black uppercase tracking-tight">Neural Privacy</h3>
          </div>

          <div className="space-y-6 relative z-10">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 p-5 rounded-[28px] border border-white/10 space-y-2">
                <Zap size={20} className="text-amber-400" />
                <h5 className="text-[10px] font-black uppercase tracking-widest">Volatile Analysis</h5>
                <p className="text-[9px] text-slate-400 font-medium leading-relaxed">Context is processed in RAM and purged instantly after threat audit.</p>
              </div>
              <div className="bg-white/5 p-5 rounded-[28px] border border-white/10 space-y-2">
                <Lock size={20} className="text-blue-400" />
                <h5 className="text-[10px] font-black uppercase tracking-widest">Zero Storage</h5>
                <p className="text-[9px] text-slate-400 font-medium leading-relaxed">We do not log calls, SMS text, or biometric scans on our cloud servers.</p>
              </div>
            </div>

            <div className="p-5 bg-indigo-600/20 border border-indigo-500/30 rounded-[32px] flex items-start gap-4">
              <UserCheck size={20} className="text-indigo-300 shrink-0" />
              <p className="text-[11px] text-indigo-100 font-medium leading-relaxed">
                Your Project API Key remains client-side. Suraksha Setu does not have access to your private Google Cloud credentials.
              </p>
            </div>
          </div>
        </div>

        {/* Compliance Footer */}
        <div className="text-center space-y-8 py-10">
          <div className="flex justify-center gap-10 opacity-30">
            <div className="flex items-center gap-2">
               <Globe size={16} />
               <span className="text-[9px] font-black uppercase tracking-widest">Global Standards</span>
            </div>
            <div className="flex items-center gap-2">
               <Shield size={16} />
               <span className="text-[9px] font-black uppercase tracking-widest">AES-256 GCM</span>
            </div>
          </div>
          
          <div className="space-y-4">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed px-10">
              By initializing the Neural Hub, you consent to our safety protocols and digital terms of service.
            </p>
            <button 
               onClick={() => window.dispatchEvent(new CustomEvent('nav-to-dashboard'))}
               className="inline-flex items-center gap-2 text-indigo-600 font-black text-xs uppercase tracking-[0.2em] hover:underline bg-indigo-50 px-6 py-3 rounded-full transition-all active:scale-95"
            >
              <ChevronLeft size={16} /> Return to Terminal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};