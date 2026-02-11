
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Phone, Shield, ShieldCheck, ChevronRight, ChevronLeft, MessageCircle, Search, 
  HelpCircle, Zap, Activity, ChevronDown, Lock, 
  BadgeCheck, Smartphone, Mail, MapPin, Globe, ExternalLink, LifeBuoy, Server, Clock, ShieldAlert, Cpu, Heart, ArrowRight, Send, CheckCircle2, Ticket, RefreshCw, Star, Sparkles, UserX
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
            <h1 className="text-4xl font-black tracking-tighter uppercase leading-none">Support Hub</h1>
            <p className="text-indigo-300/60 font-black text-[10px] uppercase tracking-[0.4em]">National AI Safety Pulse</p>
          </div>
          
          <div className="w-full relative group max-w-sm">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Search security protocols..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border-2 border-white/10 rounded-[28px] py-5 pl-14 pr-6 outline-none focus:border-indigo-500 focus:bg-white/10 transition-all font-bold text-white placeholder:text-slate-600 shadow-inner"
            />
          </div>
        </div>
      </div>

      <div className="px-6 -mt-10 space-y-8 relative z-10">
        
        {/* ACCESS RESTRICTION LOGIC: Show upgrade prompt for free users */}
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
                Direct access to the <strong>AI Command Center</strong> and manual human forensic audits are reserved for Pro Shield users.
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-[32px] border border-slate-100 w-full space-y-4 text-left">
               {[
                 'Direct Priority Ticket System',
                 'Unique Token ID tracking',
                 '24-Hour Guaranteed Hub Response',
                 'Manual Social Engineering Analysis'
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
            
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">Unlimited forensic support for ₹199</p>
          </div>
        ) : (
          /* Premium Support Form: ONLY FOR PAID USERS */
          <div className="bg-white rounded-[48px] p-10 shadow-2xl border border-gray-100 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] rotate-12 group-hover:scale-110 transition-transform">
              <BadgeCheck size={160} className="text-indigo-600" />
            </div>
            
            {submissionToken ? (
              <div className="relative z-10 text-center space-y-8 py-10 animate-in zoom-in duration-500">
                <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-xl shadow-green-100/50">
                  <CheckCircle2 size={48} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Protocol Transmitted</h3>
                  <p className="text-sm font-bold text-slate-500">Your security concern has reached the hub.</p>
                </div>
                <div className="bg-indigo-50 p-6 rounded-[32px] border border-indigo-100 space-y-3">
                  <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest leading-none">Reference Token ID</p>
                  <p className="text-3xl font-black text-indigo-900 tracking-tighter uppercase">{submissionToken}</p>
                  <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Audit complete within 24 hours</p>
                </div>
                <button onClick={() => setSubmissionToken(null)} className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-300">Submit New Protocol</button>
              </div>
            ) : (
              <div className="relative z-10 space-y-8">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Command Desk</h3>
                    <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Priority Security Dispatch</p>
                  </div>
                  <div className="bg-slate-900 text-white p-3 rounded-2xl shadow-xl">
                    <Ticket size={24} className="text-indigo-400" />
                  </div>
                </div>

                <form onSubmit={handleSubmitRequest} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Audit Subject</label>
                    <input 
                      required
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="e.g., Suspicious APK behavior"
                      className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-600 rounded-[24px] py-4 px-6 outline-none transition-all font-bold text-slate-800 shadow-inner"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Detailed Message</label>
                    <textarea 
                      required
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Describe the technical or social threat you observed..."
                      className="w-full h-32 bg-slate-50 border-2 border-transparent focus:border-indigo-600 rounded-[24px] py-4 px-6 outline-none transition-all font-bold text-slate-800 shadow-inner resize-none"
                    />
                  </div>
                  <div className="flex items-center gap-3 bg-indigo-50 p-4 rounded-3xl border border-indigo-100">
                    <Clock size={16} className="text-indigo-600 shrink-0" />
                    <p className="text-[9px] font-bold text-indigo-900/60 uppercase leading-tight tracking-widest">
                      Commander response guaranteed within 24 hours for Pro identity handles.
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

        {/* Universal SOS Grid: Still visible to all for public safety */}
        <div className="grid grid-cols-1 gap-4">
          <a href="tel:1930" className="bg-white p-6 rounded-[36px] border border-gray-100 shadow-xl flex items-center gap-5 active:scale-95 transition-all group relative overflow-hidden border-l-4 border-l-red-500">
            <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-all shadow-inner">
              <Phone size={28} />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5 leading-none">Government Hotline</p>
              <h3 className="text-xl font-black text-slate-900 tracking-tight leading-none">Dial 1930</h3>
              <p className="text-[9px] text-red-500 font-bold uppercase mt-1">Report Cyber Crimes Instantly</p>
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
                      faq.category === 'SECURITY' ? 'bg-red-50 text-red-600' : 'bg-indigo-50 text-indigo-600'
                    }`}>
                      {/* Fixed: Use Shield icon which was missing from imports */}
                      <Shield size={16} />
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
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No matching insights found</p>
              </div>
            )}
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
               {/* Fixed: Use Shield icon which was missing from imports */}
               <Shield size={16} />
               <span className="text-[9px] font-black uppercase tracking-widest">AES-256 GCM</span>
            </div>
          </div>
          
          <div className="space-y-4">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed px-10">
              By initializing the Neural Hub, you consent to our safety protocols and digital terms of service.
            </p>
            {/* Added comment above fix: Added missing ChevronLeft icon for the return button */}
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
