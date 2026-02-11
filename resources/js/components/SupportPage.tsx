import React, { useState, useMemo, useEffect } from 'react';
import { 
  Phone, ShieldCheck, ChevronRight, MessageCircle, Search, 
  HelpCircle, Zap, Activity, ChevronDown, Lock, 
  BadgeCheck, Smartphone, Mail, MapPin, Globe, ExternalLink, LifeBuoy, Server, Clock, ShieldAlert, Cpu, Heart, ArrowRight, Send, CheckCircle2, Ticket, RefreshCw, Star, Sparkles
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { apiClient } from '../services/apiService';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: 'SECURITY' | 'ACCOUNT' | 'API' | 'LOCALIZATION';
}

const FAQS: FAQ[] = [
  {
    id: '1',
    category: 'SECURITY',
    question: "How does the AI identify a 'Psych-Threat'?",
    answer: "Our engine uses Gemini-3 Flash to analyze 'Intent Signatures'. It looks for urgency markers (e.g., 'immediate arrest'), linguistic manipulation, and financial pressure patterns that deviate from normal banking behavior."
  },
  {
    id: '2',
    category: 'SECURITY',
    question: "Is my personal data sent to the cloud?",
    answer: "Suraksha Setu uses a 'Neural Sandbox'. While metadata is analyzed via Google GenAI for safety, we never store recordings, SMS contents, or biometric fingerprints on our persistent servers."
  },
  {
    id: '3',
    category: 'API',
    question: "Why do I need a Google AI Project Key?",
    answer: "To provide real-time voice and high-accuracy deepfake detection, the app requires high-tier neural compute. Using your own key ensures the analysis happens within your own secure cloud perimeter."
  },
  {
    id: '4',
    category: 'LOCALIZATION',
    question: "Does it support regional Indian languages?",
    answer: "Yes, our Neural Hub currently audits context in English, Hindi, and Marathi, with support for more regional dialects coming in the next pulse update."
  },
  {
    id: '5',
    category: 'ACCOUNT',
    question: "What is the 'Golden Hour' in cyber fraud?",
    answer: "The first 2 hours after a scam occurs. Dialing 1930 immediately during this period allows the Cyber Cell to potentially freeze the amount in the scammer's bank account."
  }
];

interface SupportPageProps {
  isPro: boolean;
}

export const SupportPage: React.FC<SupportPageProps> = ({ isPro }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // Form State
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionToken, setSubmissionToken] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('suraksha_user');
    if (saved) setCurrentUser(JSON.parse(saved));
  }, []);

  const filteredFaqs = useMemo(() => {
    return FAQS.filter(f => 
      f.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.answer.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      alert("Please login to submit a support request.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const result = await apiClient.submitSupportRequest({
        email: currentUser.email,
        name: currentUser.name,
        subject,
        message
      });
      
      if (result.success && result.token) {
        setSubmissionToken(result.token);
        setSubject('');
        setMessage('');
      }
    } catch (e) {
      alert("Hub signal lost. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpgradeRedirect = () => {
    window.dispatchEvent(new CustomEvent('nav-to-subscription'));
  };

  return (
    <div className="flex flex-col bg-slate-50 min-h-screen pb-40 animate-in fade-in duration-700 font-sans">
      {/* Immersive Header */}
      <div className="p-10 bg-slate-950 text-white rounded-b-[64px] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/10 blur-[100px] rounded-full -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/10 blur-[80px] rounded-full -ml-10 -mb-10" />
        
        <div className="relative z-10 flex flex-col items-center text-center space-y-6">
          <div className="p-5 bg-white/5 rounded-[32px] border border-white/10 backdrop-blur-md shadow-2xl animate-pulse">
            <LifeBuoy size={40} className="text-indigo-400" />
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-black tracking-tighter uppercase leading-none">Command Support</h1>
            <p className="text-indigo-300/60 font-black text-[10px] uppercase tracking-[0.4em]">24/7 National AI Safety Hub</p>
          </div>
          
          <div className="w-full relative group max-w-sm">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Search threat protocols..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border-2 border-white/10 rounded-[28px] py-5 pl-14 pr-6 outline-none focus:border-indigo-500 focus:bg-white/10 transition-all font-bold text-white placeholder:text-slate-600 shadow-inner"
            />
          </div>
        </div>
      </div>

      <div className="px-6 -mt-10 space-y-8 relative z-10">
        
        {/* ACCESS RESTRICTION LOGIC */}
        {!isPro ? (
          <div className="bg-white rounded-[48px] p-12 shadow-2xl border border-gray-100 relative overflow-hidden flex flex-col items-center text-center space-y-8">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-400 via-indigo-600 to-amber-400" />
            
            <div className="w-24 h-24 bg-indigo-50 rounded-[32px] flex items-center justify-center text-indigo-600 relative">
               <Lock size={40} />
               <div className="absolute -top-2 -right-2 bg-amber-500 text-white p-2 rounded-xl border-4 border-white">
                  <Star size={18} fill="white" />
               </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Premium Support Desk</h3>
              <p className="text-sm text-slate-500 font-bold leading-relaxed max-w-[280px] mx-auto">
                Human-led AI verification and direct commander assistance are reserved for <strong>Pro Shield</strong> users.
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-[32px] border border-slate-100 w-full space-y-4">
               {[
                 'Direct Ticket to AI Command Hub',
                 'Unique Token ID tracking',
                 '24-Hour Guaranteed Reply',
                 'Manual Forensics Analysis'
               ].map((item, i) => (
                 <div key={i} className="flex items-center gap-3">
                    <div className="p-1 bg-white rounded-full border border-slate-200"><ChevronRight size={12} className="text-indigo-400" /></div>
                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{item}</span>
                 </div>
               ))}
            </div>

            <button 
              onClick={handleUpgradeRedirect}
              className="w-full py-6 bg-indigo-600 text-white rounded-[32px] font-black text-xs uppercase tracking-[0.4em] shadow-xl shadow-indigo-200 active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              <Zap size={18} fill="white" /> Upgrade to Pro
            </button>
            
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">One-time lifetime payment for ₹199</p>
          </div>
        ) : (
          /* Premium Support Form - ONLY FOR PAID USERS */
          <div className="bg-white rounded-[48px] p-10 shadow-2xl border border-gray-100 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] rotate-12 group-hover:scale-110 transition-transform">
              <BadgeCheck size={160} className="text-indigo-600" />
            </div>
            
            {submissionToken ? (
              <div className="relative z-10 text-center space-y-8 py-10 animate-in zoom-in duration-500">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-xl shadow-green-100/50">
                  <CheckCircle2 size={44} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Signal Transmitted</h3>
                  <p className="text-sm font-bold text-slate-500">The Command Center has logged your request.</p>
                </div>
                <div className="bg-indigo-50 p-6 rounded-[32px] border border-indigo-100 space-y-3">
                  <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest leading-none">Your Unique Token ID</p>
                  <p className="text-3xl font-black text-indigo-900 tracking-tighter uppercase">{submissionToken}</p>
                  <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Reply guaranteed in 24 hours</p>
                </div>
                <button onClick={() => setSubmissionToken(null)} className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-300">Submit New Ticket</button>
              </div>
            ) : (
              <div className="relative z-10 space-y-8">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Premium Desk</h3>
                    <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Commander Assistance Hub</p>
                  </div>
                  <div className="bg-slate-900 text-white p-3 rounded-2xl shadow-xl">
                    <Ticket size={24} className="text-indigo-400" />
                  </div>
                </div>

                <form onSubmit={handleSubmitRequest} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Subject Protocol</label>
                    <input 
                      required
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="e.g., Deepfake Scan Issue"
                      className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-600 rounded-[24px] py-4 px-6 outline-none transition-all font-bold text-slate-800 shadow-inner"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Context Message</label>
                    <textarea 
                      required
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Detailed description of your security concern..."
                      className="w-full h-32 bg-slate-50 border-2 border-transparent focus:border-indigo-600 rounded-[24px] py-4 px-6 outline-none transition-all font-bold text-slate-800 shadow-inner resize-none"
                    />
                  </div>
                  <div className="flex items-center gap-3 bg-indigo-50 p-4 rounded-3xl border border-indigo-100">
                    <Clock size={16} className="text-indigo-600 shrink-0" />
                    <p className="text-[9px] font-bold text-indigo-900/60 uppercase leading-tight tracking-widest">
                      Commander Response Guaranteed within 24 Hours via Verified Registry Channel.
                    </p>
                  </div>
                  <button 
                    type="submit"
                    disabled={isSubmitting || !subject || !message}
                    className="w-full py-6 bg-slate-950 text-white rounded-[32px] font-black text-xs uppercase tracking-[0.4em] shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {isSubmitting ? <RefreshCw className="animate-spin" /> : <Send size={18} />}
                    {isSubmitting ? 'TRANSMITTING...' : 'INITIALIZE REQUEST'}
                  </button>
                </form>
              </div>
            )}
          </div>
        )}

        {/* Emergency SOS Grid */}
        <div className="grid grid-cols-1 gap-4">
          <a href="tel:1930" className="bg-white p-6 rounded-[36px] border border-gray-100 shadow-xl flex items-center gap-5 active:scale-95 transition-all group relative overflow-hidden border-l-4 border-l-red-500">
            <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-all shadow-inner">
              <Phone size={28} />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5 leading-none">National Hotline</p>
              <h3 className="text-xl font-black text-slate-900 tracking-tight leading-none">Dial 1930</h3>
              <p className="text-[9px] text-red-500 font-bold uppercase mt-1">Report Financial Fraud (MHA)</p>
            </div>
            <div className="bg-red-50 px-3 py-1.5 rounded-xl">
               <ExternalLink size={20} className="text-red-500" />
            </div>
          </a>

          <a href="https://wa.me/918967778556" target="_blank" rel="noreferrer" className="bg-white p-6 rounded-[36px] border border-gray-100 shadow-xl flex items-center gap-5 active:scale-95 transition-all group relative overflow-hidden border-l-4 border-l-emerald-500">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-inner">
              <MessageCircle size={28} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">WhatsApp Support</p>
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight leading-none">Suraksha Chat</h3>
              <p className="text-[9px] text-emerald-600 font-bold uppercase mt-1">Manual Identity Verification</p>
            </div>
            <div className="bg-emerald-50 px-3 py-1.5 rounded-xl">
               <ChevronRight size={20} className="text-emerald-500" />
            </div>
          </a>
        </div>

        {/* Knowledge Base (FAQ) */}
        <div className="space-y-5">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                <HelpCircle size={20} />
              </div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">Knowledge Base</h3>
            </div>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{filteredFaqs.length} Protocols Loaded</span>
          </div>
          
          <div className="space-y-3">
            {filteredFaqs.length > 0 ? filteredFaqs.map((faq) => (
              <div key={faq.id} className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden transition-all group hover:border-indigo-200">
                <button 
                  onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                  className="w-full p-6 flex items-center justify-between text-left active:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      faq.category === 'SECURITY' ? 'bg-red-50 text-red-600' :
                      faq.category === 'ACCOUNT' ? 'bg-indigo-50 text-indigo-500' :
                      faq.category === 'API' ? 'bg-amber-50 text-amber-500' :
                      'bg-slate-50 text-slate-500'
                    }`}>
                      {faq.category === 'SECURITY' ? <Lock size={16} /> : 
                       faq.category === 'API' ? <Zap size={16} /> : <BadgeCheck size={16} />}
                    </div>
                    <span className="text-sm font-black text-slate-900 pr-4 leading-tight">{faq.question}</span>
                  </div>
                  <ChevronDown size={18} className={`text-slate-300 transition-transform duration-300 ${expandedFaq === faq.id ? 'rotate-180 text-indigo-600' : ''}`} />
                </button>
                {expandedFaq === faq.id && (
                  <div className="px-6 pb-6 animate-in slide-in-from-top-2 duration-300">
                    <div className="h-px bg-slate-100 w-full mb-4" />
                    <p className="text-xs text-slate-600 font-medium leading-relaxed italic border-l-4 border-indigo-500 pl-4 py-1">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            )) : (
              <div className="bg-white p-12 rounded-[40px] border-2 border-dashed border-slate-200 text-center space-y-4">
                <Search size={48} className="mx-auto text-slate-200" />
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No matching security insights</p>
              </div>
            )}
          </div>
        </div>

        {/* Support Node Contact */}
        <div className="bg-white rounded-[44px] p-8 shadow-xl border border-gray-100 space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] rotate-12">
            <Globe size={160} />
          </div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="p-4 bg-slate-950 text-indigo-400 rounded-2xl shadow-xl">
              <Mail size={24} />
            </div>
            <div>
               <h3 className="text-lg font-black text-slate-900 tracking-tighter uppercase leading-none">Citizen Outreach</h3>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Direct Line to Innovation Team</p>
            </div>
          </div>
          <div className="space-y-4 relative z-10">
            <button 
              onClick={() => window.location.href = 'mailto:afan73871@gmail.com'}
              className="w-full py-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between px-6 hover:bg-indigo-50 hover:border-indigo-200 transition-all active:scale-95"
            >
               <span className="text-sm font-black text-slate-700">afan73871@gmail.com</span>
               <ArrowRight size={16} className="text-indigo-500" />
            </button>
            <div className="flex items-center gap-4 text-[9px] font-black uppercase text-slate-400 tracking-widest px-1">
               <span className="flex items-center gap-1.5"><ShieldCheck size={12} className="text-indigo-600" /> ISO Verified</span>
               <span className="flex items-center gap-1.5"><Lock size={12} className="text-indigo-600" /> Encryption Standard</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-6 py-10 opacity-30">
          <BrandLogo size={60} hideText className="grayscale" />
          <p className="text-[9px] text-gray-500 font-bold uppercase tracking-[0.3em] text-center max-w-[200px] leading-relaxed">
            SURAKSHA SETU TECHNOLOGIES<br/>AI SAFETY COMPLIANCE UNIT
          </p>
        </div>
      </div>
    </div>
  );
};
