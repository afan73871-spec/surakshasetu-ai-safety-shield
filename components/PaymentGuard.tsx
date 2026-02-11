import React, { useState } from 'react';
import { 
  QrCode, ShieldCheck, AlertCircle, RefreshCw, 
  Search, ShieldAlert, Info, Smartphone, User, CheckCircle2
} from 'lucide-react';
import { analyzePaymentSafety, PaymentAnalysisResult } from '../services/geminiService';
import { AdBanner } from './AdBanner';

interface PaymentGuardProps {
  isPro: boolean;
}

export const PaymentGuard: React.FC<PaymentGuardProps> = ({ isPro }) => {
  const [merchantInput, setMerchantInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<PaymentAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAudit = async () => {
    if (!merchantInput.trim()) return;
    setIsLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const result = await analyzePaymentSafety(merchantInput);
      setAnalysis(result);
    } catch (err) {
      setError("Unable to reach neural registry. Please check your network.");
    } finally {
      setIsLoading(false);
    }
  };

  const quickVerify = (id: string) => {
    setMerchantInput(id);
  };

  return (
    <div className="p-5 space-y-6 animate-in fade-in duration-700 pb-32 font-sans text-black">
      <header className="text-center space-y-1">
        <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter leading-none">Safe Pay Audit</h2>
        <div className="flex items-center justify-center gap-2">
          <ShieldCheck size={12} className="text-indigo-600" />
          <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em]">National AI Verification Hub</span>
        </div>
      </header>

      <div className="bg-white rounded-[44px] p-8 shadow-xl border border-gray-100 space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] rotate-12 pointer-events-none">
          <QrCode size={160} className="text-indigo-600" />
        </div>
        
        <div className="space-y-4 relative z-10">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] px-1">UPI ID or Merchant Name</label>
            <div className="relative group">
              <input 
                type="text"
                value={merchantInput}
                onChange={(e) => setMerchantInput(e.target.value)}
                placeholder="e.g., store@okicici"
                className="w-full bg-gray-50 border-2 border-transparent focus:border-indigo-600 rounded-[24px] py-5 pl-14 pr-6 outline-none transition-all font-bold text-slate-800"
              />
              <User className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
            </div>
          </div>

          <button 
            onClick={handleAudit}
            disabled={isLoading || !merchantInput}
            className="w-full py-5 bg-indigo-600 text-white rounded-[28px] font-black text-xs uppercase tracking-[0.3em] shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {isLoading ? <RefreshCw className="animate-spin" /> : <Search size={18} />}
            {isLoading ? 'AUDITING REGISTRY...' : 'START SAFETY AUDIT'}
          </button>
        </div>

        {analysis && (
          <div className={`p-8 rounded-[40px] border-2 animate-in zoom-in duration-300 ${!analysis.isSafe || analysis.riskScore > 50 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
            <div className="flex flex-col items-center text-center space-y-5">
              <div className={`p-5 rounded-[28px] shadow-lg ${!analysis.isSafe || analysis.riskScore > 50 ? 'bg-red-600 text-white' : 'bg-green-600 text-white'}`}>
                {!analysis.isSafe || analysis.riskScore > 50 ? <ShieldAlert size={40} /> : <CheckCircle2 size={40} />}
              </div>
              <div className="space-y-1">
                <h4 className={`text-2xl font-black uppercase tracking-tighter ${!analysis.isSafe || analysis.riskScore > 50 ? 'text-red-600' : 'text-green-600'}`}>
                  {analysis.vendorName}
                </h4>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Risk Score: {analysis.riskScore}/100</p>
              </div>
              <p className="text-sm font-bold text-slate-800 leading-relaxed italic">"{analysis.reason}"</p>
              <div className="w-full h-px bg-slate-200" />
              <div className="flex items-center gap-4 text-[9px] font-black uppercase text-slate-500 tracking-widest">
                <span>Reports: {analysis.reportsCount}</span>
                <div className="w-1 h-1 bg-slate-300 rounded-full" />
                <span>Status: {analysis.isSafe ? 'Secure' : 'Caution'}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] px-2">Quick Verify Hub</h4>
        <div className="flex flex-wrap gap-2">
          {['9547770097@fam', 'googlepay@axis', 'sbi_official@upi', 'lottery_winner@paytm'].map(id => (
            <button 
              key={id} 
              onClick={() => quickVerify(id)}
              className="px-4 py-2 bg-white border border-gray-100 rounded-full text-[9px] font-black uppercase tracking-widest text-slate-500 hover:border-indigo-600 hover:text-indigo-600 transition-all shadow-sm"
            >
              {id}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-indigo-50 p-6 rounded-[32px] border border-indigo-100 flex items-start gap-4">
        <Info size={18} className="text-indigo-600 shrink-0 mt-0.5" />
        <p className="text-[10px] text-indigo-900/60 font-bold uppercase tracking-wider leading-relaxed">
          SurakshaSetu AI auditing engine cross-references 5M+ records to ensure your UPI transactions are sent to legitimate vendors only.
        </p>
      </div>

      <AdBanner />
    </div>
  );
};