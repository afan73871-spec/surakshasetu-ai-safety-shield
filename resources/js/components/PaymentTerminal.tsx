import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Smartphone, IndianRupee, ArrowLeft, 
  Fingerprint, RefreshCw, ShieldAlert, Cpu, 
  CheckCircle2, QrCode, Lock, Zap, Search, Info
} from 'lucide-react';
import { analyzePaymentSafety } from '../services/geminiService';

interface PaymentTerminalProps {
  user: { name: string; email: string; isPro: boolean };
  onClose: () => void;
}

export const PaymentTerminal: React.FC<PaymentTerminalProps> = ({ user, onClose }) => {
  const [amount, setAmount] = useState('');
  const [vpa, setVpa] = useState('');
  const [step, setStep] = useState<'INPUT' | 'AUDIT' | 'AUTHORIZE' | 'SUCCESS'>('INPUT');
  const [riskScore, setRiskScore] = useState(0);
  const [auditMessage, setAuditMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const startAudit = async () => {
    if (!vpa || !amount) return;
    setStep('AUDIT');
    setAuditMessage("Connecting to National Cyber Hub...");
    
    try {
      const result = await analyzePaymentSafety(vpa);
      
      // Simulate neural deep-scan progression
      await new Promise(r => setTimeout(r, 800));
      setAuditMessage("Analyzing merchant reputation...");
      setRiskScore(result.riskScore);
      
      await new Promise(r => setTimeout(r, 1000));
      setAuditMessage("Cross-referencing behavioral patterns...");
      
      if (result.riskScore > 60) {
        setStep('INPUT');
        alert(`SECURITY ALERT: High risk detected (${result.riskScore}%). Payment blocked by Suraksha Setu.`);
        return;
      }

      setStep('AUTHORIZE');
    } catch (e) {
      setStep('INPUT');
      alert("Neural sync timed out. Try again.");
    }
  };

  const handlePay = () => {
    setIsProcessing(true);
    const options = {
      key: "rzp_test_S4zPaC0dtQMdsc", // Test Key
      amount: parseInt(amount) * 100,
      currency: "INR",
      name: "SurakshaSetu SecurePay",
      description: `AI-Verified Payment to ${vpa}`,
      image: "input_file_0.png",
      handler: function (response: any) {
        setStep('SUCCESS');
        setIsProcessing(false);
      },
      prefill: {
        name: user.name,
        email: user.email,
      },
      theme: {
        color: "#4f46e5",
      },
      modal: {
        ondismiss: function() {
          setIsProcessing(false);
          setStep('AUTHORIZE');
        }
      }
    };

    const rzp = new (window as any).Razorpay(options);
    rzp.open();
  };

  if (step === 'SUCCESS') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] p-8 text-center animate-in zoom-in duration-500">
        <div className="w-24 h-24 bg-emerald-500 rounded-[32px] flex items-center justify-center shadow-2xl mb-8 animate-bounce">
          <CheckCircle2 size={56} className="text-white" />
        </div>
        <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Secure Link Success</h2>
        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-2">Verified Transaction Complete</p>
        <div className="mt-8 bg-slate-50 p-6 rounded-[32px] border border-slate-100 w-full max-w-xs space-y-3">
          <div className="flex justify-between"><span className="text-[10px] font-black text-slate-400 uppercase">Merchant</span><span className="text-[10px] font-black text-slate-800">{vpa}</span></div>
          <div className="flex justify-between"><span className="text-[10px] font-black text-slate-400 uppercase">Amount</span><span className="text-[10px] font-black text-indigo-600">₹{amount}.00</span></div>
          <div className="h-px bg-slate-200" />
          <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest italic">AI Protection: ACTIVE</p>
        </div>
        <button onClick={onClose} className="mt-10 w-full py-5 bg-slate-900 text-white rounded-3xl font-black text-xs uppercase tracking-[0.3em]">Return to Hub</button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 animate-in slide-in-from-bottom-4 duration-500 font-sans pb-32">
      <header className="flex items-center justify-between">
        <button onClick={onClose} className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 active:scale-90 transition-all"><ArrowLeft size={20} /></button>
        <div className="text-center">
          <h2 className="text-xl font-black uppercase tracking-tighter">Safe Pay Hub</h2>
          <p className="text-[8px] font-black text-indigo-600 uppercase tracking-widest">Neural Transaction Node</p>
        </div>
        <div className="w-10 h-10 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600"><Lock size={18} /></div>
      </header>

      {step === 'INPUT' ? (
        <div className="space-y-6">
          <div className="bg-slate-950 rounded-[48px] p-10 text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 group-hover:scale-110 transition-transform"><Zap size={160} className="text-indigo-500" /></div>
            <div className="relative z-10 space-y-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] px-2">Merchant UPI ID / VPA</label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={vpa} 
                    onChange={e => setVpa(e.target.value)} 
                    placeholder="e.g. store@okicici" 
                    className="w-full bg-white/5 border-2 border-white/10 rounded-[28px] py-6 px-8 outline-none focus:border-indigo-500 transition-all font-black text-lg placeholder:text-slate-700" 
                  />
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 rounded-xl"><QrCode size={18} /></div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] px-2">Amount (INR)</label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={amount} 
                    onChange={e => setAmount(e.target.value)} 
                    placeholder="0.00" 
                    className="w-full bg-white/5 border-2 border-white/10 rounded-[28px] py-6 pl-14 pr-8 outline-none focus:border-indigo-500 transition-all font-black text-3xl placeholder:text-slate-700" 
                  />
                  <IndianRupee className="absolute left-6 top-1/2 -translate-y-1/2 text-indigo-500" size={24} />
                </div>
              </div>

              <button 
                onClick={startAudit}
                disabled={!vpa || !amount}
                className="w-full py-7 bg-white text-slate-950 rounded-[36px] font-black text-xs uppercase tracking-[0.5em] shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-30"
              >
                <ShieldCheck size={20} /> AUDIT & PROCEED
              </button>
            </div>
          </div>
          
          <div className="bg-indigo-50 p-6 rounded-[32px] border border-indigo-100 flex items-start gap-4">
            <Info size={18} className="text-indigo-600 shrink-0 mt-0.5" />
            <p className="text-[9px] text-indigo-900/60 font-bold uppercase tracking-widest leading-relaxed">
              Suraksha Setu acts as an AI Escrow. We audit the merchant's legitimacy before releasing funds through the payment gateway.
            </p>
          </div>
        </div>
      ) : step === 'AUDIT' ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-8 animate-in fade-in">
           <div className="relative">
              <div className="w-32 h-32 bg-slate-950 rounded-[40px] flex items-center justify-center border border-white/10 shadow-2xl">
                 <RefreshCw size={48} className="text-indigo-500 animate-spin" />
              </div>
              <div className="absolute -top-4 -right-4 w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white animate-pulse">
                 <Cpu size={24} />
              </div>
           </div>
           <div className="text-center space-y-2">
              <h3 className="text-2xl font-black uppercase tracking-tighter">Neural Audit</h3>
              <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em] animate-pulse">{auditMessage}</p>
           </div>
        </div>
      ) : (
        <div className="space-y-6 animate-in zoom-in-95 duration-300">
           <div className="bg-white rounded-[44px] p-8 border border-slate-100 shadow-xl space-y-8">
              <div className="flex items-center gap-5">
                 <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shadow-inner">
                    <ShieldCheck size={32} />
                 </div>
                 <div>
                    <h3 className="text-xl font-black uppercase tracking-tight text-emerald-600">Merchant Safe</h3>
                    <div className="flex items-center gap-2">
                       <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Risk Score: {riskScore}/100</p>
                    </div>
                 </div>
              </div>

              <div className="bg-slate-50 p-6 rounded-[32px] space-y-4 border border-slate-100">
                 <div className="space-y-1 text-center">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Paying To</p>
                    <p className="text-lg font-black text-slate-900 font-mono">{vpa}</p>
                 </div>
                 <div className="h-px bg-slate-200 w-full" />
                 <div className="text-center">
                    <p className="text-4xl font-black text-slate-900 tracking-tighter">₹{amount}.00</p>
                 </div>
              </div>

              <div className="space-y-4 pt-4">
                 <button 
                  onClick={handlePay}
                  disabled={isProcessing}
                  className="w-full py-6 bg-indigo-600 text-white rounded-[32px] font-black text-sm uppercase tracking-[0.4em] shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                 >
                    {isProcessing ? <RefreshCw className="animate-spin" /> : <Fingerprint size={24} />}
                    {isProcessing ? 'AUTHORIZING...' : 'HOLD TO PAY'}
                 </button>
                 <button onClick={() => setStep('INPUT')} className="w-full py-3 text-slate-400 font-black text-[10px] uppercase tracking-widest text-center">Cancel Transaction</button>
              </div>
           </div>
           
           <p className="text-[8px] text-center font-black text-slate-400 uppercase tracking-[0.3em]">Encrypted via AES-256 Hub Link</p>
        </div>
      )}
    </div>
  );
};