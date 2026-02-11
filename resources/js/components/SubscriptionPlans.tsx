import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Zap, Check, RefreshCw, 
  ArrowRight, Shield, BadgeCheck, 
  Wallet, Lock, Star, Radio, Clock, Loader2, 
  QrCode, Send, Copy, Info, IndianRupee,
  Smartphone, Cpu, Receipt, Sparkles, X, UserCheck, ChevronRight,
  Activity
} from 'lucide-react';
import { apiClient } from '../services/apiService';
import { supabase } from '../services/supabaseClient';
import { InvoiceModal } from './InvoiceModal';

interface SubscriptionPlansProps {
  onSelectPlan: (type: 'BASIC' | 'PRO') => void;
}

export const SubscriptionPlans: React.FC<SubscriptionPlansProps> = ({ onSelectPlan }) => {
  const [step, setStep] = useState<'PLANS' | 'GATEWAY' | 'PENDING' | 'SUCCESS'>('PLANS');
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [copied, setCopied] = useState(false);
  const [isQrLoading, setIsQrLoading] = useState(true);
  const [clientData, setClientData] = useState<any | null>(null);
  const [showInvoice, setShowInvoice] = useState(false);

  const UPI_ID = "9547770097@fam";
  const AMOUNT = "199";

  useEffect(() => {
    const savedUser = localStorage.getItem('suraksha_user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setClientData(user);
      if (user.isPro === true || user.proStatus === 'ACTIVE') {
        setStep('SUCCESS');
      } else if (user.proStatus === 'PENDING') {
        setStep('PENDING');
      }
    }
  }, []);

  useEffect(() => {
    let interval: any;
    if (step === 'PENDING') {
      interval = setInterval(async () => {
        const savedUser = JSON.parse(localStorage.getItem('suraksha_user') || '{}');
        if (!savedUser.email) return;

        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('is_pro')
            .eq('email', savedUser.email)
            .single();
          
          if (!error && data && data.is_pro) {
            const { data: orderData } = await supabase
              .from('orders')
              .select('razorpay_payment_id, id, created_at')
              .eq('user_email', savedUser.email)
              .eq('status', 'APPROVED')
              .order('created_at', { ascending: false })
              .limit(1)
              .single();

            const updatedUser = { 
              ...savedUser, 
              isPro: true, 
              proStatus: 'ACTIVE',
              planSelected: true,
              transactionId: orderData?.razorpay_payment_id || 'HUB_SYNC_OK',
              orderId: orderData?.id || 'INV_' + Date.now(),
              orderDate: new Date(orderData?.created_at || Date.now()).toLocaleDateString('en-IN', { 
                day: '2-digit', 
                month: 'long', 
                year: 'numeric' 
              })
            };
            
            localStorage.setItem('suraksha_user', JSON.stringify(updatedUser));
            setClientData(updatedUser);
            setStep('SUCCESS');
          }
        } catch (e) {}
      }, 10000);
    }
    return () => clearInterval(interval);
  }, [step]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(UPI_ID);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleBroadcastSignal = async () => {
    setIsBroadcasting(true);
    setPaymentError('');
    
    if (!clientData) {
      setPaymentError("Identity hub lost. Re-login required.");
      setIsBroadcasting(false);
      return;
    }
    
    try {
      const signalToken = `SS_HUB_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      const result = await apiClient.submitUtrForApproval(clientData.email, clientData.name, signalToken);
      
      if (result.success) {
        const updatedUser = { ...clientData, proStatus: 'PENDING', planSelected: true };
        localStorage.setItem('suraksha_user', JSON.stringify(updatedUser));
        setStep('PENDING');
      } else {
        setPaymentError(result.message || "Registry handshake failed.");
      }
    } catch (e) {
      setPaymentError("Neural link timeout. Try again.");
    } finally {
      setIsBroadcasting(false);
    }
  };

  const upiUri = `upi://pay?pa=${UPI_ID}&pn=SurakshaSetu&am=${AMOUNT}&cu=INR`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(upiUri)}`;

  if (step === 'PLANS') {
    return (
      <div className="p-6 space-y-10 animate-in fade-in duration-700 pb-32 font-sans text-slate-900">
        <header className="text-center space-y-3">
           <div className="mx-auto w-20 h-20 bg-indigo-600 rounded-[32px] flex items-center justify-center shadow-[0_0_50px_rgba(79,102,241,0.3)]">
             <Star size={40} className="text-white fill-white animate-pulse" />
           </div>
           <div>
             <h2 className="text-4xl font-black uppercase tracking-tighter">Pro Membership</h2>
             <p className="text-indigo-600 font-black text-[10px] uppercase tracking-[0.4em] mt-2">Elite Neural Protection</p>
           </div>
        </header>

        <div className="space-y-6">
           <div className="bg-white rounded-[44px] p-10 border-4 border-slate-900 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] rotate-12 group-hover:scale-110 transition-transform"><Cpu size={160} /></div>
              <div className="relative z-10 space-y-8">
                 <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <h3 className="text-3xl font-black tracking-tight leading-none text-slate-900 uppercase">Pro Shield</h3>
                      <p className="text-indigo-600 font-black text-[10px] uppercase tracking-widest">Lifetime Neural Guard</p>
                    </div>
                    <div className="bg-slate-900 text-white px-4 py-2 rounded-2xl">
                       <span className="text-xl font-black">₹{AMOUNT}</span>
                    </div>
                 </div>

                 <div className="space-y-4">
                    {[
                      'Unlimited Deepfake forensic scans',
                      'Real-time voice and call monitoring',
                      'Premium Command Center support',
                      'Advanced APK malware logic sandbox',
                      'Global threat database priority link'
                    ].map((feature, i) => (
                      <div key={i} className="flex items-center gap-3">
                         <div className="p-1 bg-indigo-100 text-indigo-600 rounded-full"><Check size={12} strokeWidth={4} /></div>
                         <p className="text-xs font-bold text-slate-600">{feature}</p>
                      </div>
                    ))}
                 </div>

                 <button 
                  onClick={() => setStep('GATEWAY')}
                  className="w-full py-6 bg-indigo-600 text-white rounded-[28px] font-black text-sm uppercase tracking-[0.4em] shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3 hover:bg-indigo-500"
                 >
                   Activate Pro <ChevronRight size={20} />
                 </button>
              </div>
           </div>
           
           <div className="p-4 text-center">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">
               One-time payment for lifetime neural updates. No hidden renewals.
             </p>
           </div>
        </div>
      </div>
    );
  }

  if (step === 'GATEWAY') {
    return (
      <div className="p-6 space-y-8 animate-in slide-in-from-bottom duration-500 pb-32">
        <div className="text-center space-y-2">
           <h3 className="text-2xl font-black uppercase tracking-tighter">Secure Handshake</h3>
           <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Connect to Payment Node</p>
        </div>

        <div className="bg-white rounded-[48px] p-10 shadow-2xl border border-slate-100 flex flex-col items-center space-y-8 relative overflow-hidden">
           {isQrLoading && (
             <div className="absolute inset-0 z-20 bg-white/80 backdrop-blur-sm flex items-center justify-center">
               <Loader2 size={48} className="animate-spin text-indigo-600" />
             </div>
           )}
           <img 
            src={qrCodeUrl} 
            alt="UPI QR Code" 
            onLoad={() => setIsQrLoading(false)}
            className="w-64 h-64 rounded-[40px] shadow-lg border-8 border-slate-50" 
           />
           <div className="text-center space-y-2">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Activation Fee</p>
              <h4 className="text-5xl font-black text-slate-900 tracking-tighter">₹{AMOUNT}</h4>
           </div>
           
           <div className="w-full space-y-4">
              <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                 <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl"><Wallet size={18} /></div>
                 <div className="flex-1 min-w-0">
                    <p className="text-[8px] font-black text-slate-400 uppercase">Registry UPI Handle</p>
                    <p className="text-xs font-black text-slate-800 truncate uppercase">{UPI_ID}</p>
                 </div>
                 <button onClick={copyToClipboard} className="p-2.5 bg-white text-slate-400 rounded-xl active:scale-90 transition-all border border-slate-100">
                    {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                 </button>
              </div>
           </div>

           <div className="w-full space-y-4 pt-4">
              <button 
                onClick={handleBroadcastSignal}
                disabled={isBroadcasting}
                className="w-full py-6 bg-slate-900 text-white rounded-[32px] font-black text-sm uppercase tracking-[0.4em] shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                {isBroadcasting ? <RefreshCw size={20} className="animate-spin" /> : <Send size={20} />}
                {isBroadcasting ? 'TRANSMITTING...' : 'SIGNAL PAID'}
              </button>
              {paymentError && <p className="text-[10px] font-black text-red-500 text-center uppercase tracking-widest">{paymentError}</p>}
           </div>
        </div>

        <div className="bg-indigo-50 p-8 rounded-[40px] border border-indigo-100 flex items-start gap-4">
           <Info size={24} className="text-indigo-600 shrink-0" />
           <p className="text-[10px] text-indigo-900/60 font-bold uppercase tracking-wider leading-relaxed">
             <b>Handshake Protocol:</b> Transfer via UPI and tap "Signal Paid". The command center verifies and activates your Pro Shield within minutes.
           </p>
        </div>
      </div>
    );
  }

  if (step === 'PENDING') {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] text-center space-y-10 animate-in zoom-in-95">
         <div className="relative">
            <div className="w-40 h-40 bg-slate-900 rounded-[56px] flex items-center justify-center border-4 border-white shadow-2xl relative z-10 overflow-hidden">
               <Activity size={80} className="text-indigo-400 animate-pulse" />
               <div className="absolute inset-0 bg-gradient-to-t from-indigo-600/20 to-transparent" />
            </div>
            <div className="absolute -top-4 -right-4 w-16 h-16 bg-amber-500 rounded-3xl flex items-center justify-center text-white border-4 border-white animate-bounce shadow-xl">
               <Clock size={28} />
            </div>
         </div>
         <div className="space-y-4">
            <h2 className="text-3xl font-black uppercase tracking-tighter">Signal Broadcasted</h2>
            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.4em] animate-pulse">Awaiting Manual Audit</p>
            <div className="max-w-[240px] mx-auto bg-white/50 backdrop-blur-md p-6 rounded-[32px] border border-slate-100 shadow-sm mt-8">
               <p className="text-xs font-bold text-slate-500 leading-relaxed italic">
                 "Our Command Hub is auditing your payment signal. Your Neural Pro Shield will activate automatically once verified."
               </p>
            </div>
         </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 animate-in zoom-in duration-500 pb-32">
      {showInvoice && clientData && (
        <InvoiceModal 
          data={{
            orderId: clientData.orderId || 'SS_AUTO_' + Date.now(),
            date: clientData.orderDate || new Date().toLocaleDateString(),
            clientName: clientData.name,
            clientEmail: clientData.email,
            planName: 'Neural Pro Shield - Lifetime',
            amount: AMOUNT,
            status: 'PAID',
            transactionId: clientData.transactionId || 'SIGNAL_OK'
          }} 
          onClose={() => setShowInvoice(false)} 
        />
      )}

      <header className="text-center space-y-4">
         <div className="mx-auto w-24 h-24 bg-green-500 rounded-[32px] flex items-center justify-center shadow-[0_0_60px_rgba(34,197,94,0.4)] border-4 border-white relative group">
            <BadgeCheck size={56} className="text-white fill-white animate-in zoom-in-50 duration-500" />
            <div className="absolute inset-0 bg-white/20 rounded-[32px] scale-125 animate-pulse-ring" />
         </div>
         <div>
            <h2 className="text-3xl font-black tracking-tighter uppercase leading-none">Neural Link Active</h2>
            <div className="inline-flex items-center gap-2 mt-2 px-3 py-1 bg-green-50 rounded-full border border-green-100">
               <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
               <p className="text-[9px] font-black text-green-600 uppercase tracking-widest">Verified Pro Identity</p>
            </div>
         </div>
      </header>

      <div className="bg-slate-900 rounded-[48px] p-10 text-white shadow-2xl relative overflow-hidden group">
         <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 group-hover:scale-110 transition-transform"><Cpu size={140} /></div>
         <div className="relative z-10 space-y-8">
            <div className="space-y-2">
               <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em]">Current Level</h4>
               <p className="text-2xl font-black uppercase tracking-tight">Neural Pro Shield</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Capacity</p>
                  <p className="text-lg font-black text-indigo-400 uppercase">Unlimited</p>
               </div>
               <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Hub Status</p>
                  <p className="text-lg font-black text-emerald-400 uppercase">Active</p>
               </div>
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={() => setShowInvoice(true)}
                className="flex-1 py-5 bg-white text-slate-900 rounded-[28px] font-black text-[10px] uppercase tracking-[0.3em] shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Receipt size={16} /> Get Invoice
              </button>
              <button 
                onClick={() => window.dispatchEvent(new CustomEvent('nav-to-dashboard'))}
                className="flex-1 py-5 bg-white/10 text-white border border-white/10 rounded-[28px] font-black text-[10px] uppercase tracking-[0.3em] active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                Go Home <ArrowRight size={16} />
              </button>
            </div>
         </div>
      </div>

      <div className="flex flex-col items-center gap-4 py-6 opacity-30">
        <Sparkles size={24} className="text-indigo-400" />
        <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.5em] text-center leading-relaxed">
          National Cyber AI Network • Mission Control Secure
        </p>
      </div>
    </div>
  );
};