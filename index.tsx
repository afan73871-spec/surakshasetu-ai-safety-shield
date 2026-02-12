import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';

// Global Error Handler for Visual Feedback
window.onerror = function (message, source, lineno, colno, error) {
  const errorDiv = document.createElement('div');
  errorDiv.style.cssText = 'position:fixed;top:0;left:0;width:100%;background:red;color:white;padding:20px;z-index:9999;font-family:monospace;white-space:pre-wrap;';
  errorDiv.textContent = 'NEURAL LINK ERROR: ' + message + '\nAt: ' + source + ':' + lineno;
  document.body.appendChild(errorDiv);
  return false;
};

window.onunhandledrejection = function (event) {
  const errorDiv = document.createElement('div');
  errorDiv.style.cssText = 'position:fixed;top:50px;left:0;width:100%;background:orange;color:black;padding:20px;z-index:9999;font-family:monospace;white-space:pre-wrap;';
  errorDiv.textContent = 'UNHANDLED PROMISE REJECTION: ' + (event.reason?.message || event.reason);
  document.body.appendChild(errorDiv);
};
import { AppView, Language, User as UserType } from './types';
import { NAV_ITEMS, LANGUAGES, SOCIAL_HANDLES } from './constants';
import { DeepfakeScanner } from './components/DeepfakeScanner';
import { ScamMonitor } from './components/ScamMonitor';
import { PaymentGuard } from './components/PaymentGuard';
import { URLShield } from './components/URLShield';
import { AIChat } from './components/AIChat';
import { AdBanner } from './components/AdBanner';
import { ScamDatabase } from './components/ScamDatabase';
import { Auth } from './components/Auth';
import { BrandLogo } from './components/BrandLogo';
import { AboutPage } from './components/AboutPage';
import { SupportPage } from './components/SupportPage';
import { PrivacyPolicyPage } from './components/PrivacyPolicyPage';
import { AdminPanel } from './components/AdminPanel';
import { FamilyGuard } from './components/FamilyGuard';
import { SubscriptionPlans } from './components/SubscriptionPlans';
import { APKScanner } from './components/APKScanner';
import { AutomaticThreatDetector } from './components/AutomaticThreatDetector';
import { RansomwareShield } from './components/RansomwareShield';
import { apiClient } from './services/apiService';
import { supabase } from './services/supabaseClient';
import {
  ChevronRight, Database, Video, Smartphone,
  LogOut, User, BadgeCheck, Info, Waves, Rocket, Star, Zap, CreditCard, LifeBuoy, Sparkles, ArrowUpRight, ShieldAlert, Activity, Cpu, Globe, Terminal, ShieldCheck, Lock, BrainCircuit, RefreshCw
} from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [currentUser, setCurrentUser] = useState<UserType | null>(() => {
    const saved = localStorage.getItem('suraksha_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [language, setLanguage] = useState<Language>(LANGUAGES[0]);
  const [neuralPulse, setNeuralPulse] = useState<any | null>(null);
  const [isPulseLoading, setIsPulseLoading] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    if (!currentUser || !currentUser.email) return;

    const syncPulse = async () => {
      try {
        const { data } = await supabase.from('profiles').select('is_pro, plan_selected').eq('email', currentUser.email).single();
        if (data && (data.is_pro !== currentUser.isPro || data.plan_selected !== currentUser.planSelected)) {
          const updated = { ...currentUser, isPro: data.is_pro, planSelected: data.plan_selected };
          setCurrentUser(updated);
          localStorage.setItem('suraksha_user', JSON.stringify(updated));
        }
        const battery = Math.floor(Math.random() * 20) + 80;
        await apiClient.updateMyTelemetry(currentUser.email, 'SECURE', 'Neural Node Active', battery);
      } catch (e) { }
    };

    const interval = setInterval(syncPulse, 20000);
    syncPulse();
    return () => clearInterval(interval);
  }, [currentUser]);

  useEffect(() => {
    const handleNavDashboard = () => setCurrentView(AppView.DASHBOARD);
    const handleNavSubscription = () => setCurrentView(AppView.SUBSCRIPTION);
    const handleNavChat = () => setCurrentView(AppView.CHAT);

    window.addEventListener('nav-to-dashboard', handleNavDashboard);
    window.addEventListener('nav-to-subscription', handleNavSubscription);
    window.addEventListener('nav-to-chat', handleNavChat);

    return () => {
      window.removeEventListener('nav-to-dashboard', handleNavDashboard);
      window.removeEventListener('nav-to-subscription', handleNavSubscription);
      window.removeEventListener('nav-to-chat', handleNavChat);
    };
  }, []);

  useEffect(() => {
    if (currentUser?.email) {
      fetchNeuralPulse();
    }
  }, [currentUser]);

  const fetchNeuralPulse = async () => {
    if (!currentUser?.email) return;
    setIsPulseLoading(true);
    try {
      const pulse = await apiClient.getNeuralSafetyPulse(currentUser.email);
      setNeuralPulse(pulse);
    } catch (e) {
      console.error("Neural link timeout.");
    } finally {
      setIsPulseLoading(false);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView(AppView.DASHBOARD);
    localStorage.removeItem('suraksha_user');
  };

  const handlePlanSelection = (type: 'BASIC' | 'PRO') => {
    if (currentUser) {
      const updated = { ...currentUser, planSelected: true, isPro: type === 'PRO' };
      setCurrentUser(updated);
      localStorage.setItem('suraksha_user', JSON.stringify(updated));
      setCurrentView(AppView.DASHBOARD);
    }
  };

  if (currentView === AppView.ADMIN_PANEL) return <AdminPanel onExit={() => setCurrentView(AppView.DASHBOARD)} />;
  if (!currentUser) return <Auth onLogin={setCurrentUser} />;

  const renderView = () => {
    const isPro = currentUser.isPro || false;
    switch (currentView) {
      case AppView.CHAT: return <AIChat languageName={language.name} isPro={isPro} onLogout={handleLogout} />;
      case AppView.DEEPFAKE_SCAN: return <DeepfakeScanner />;
      case AppView.SCAM_MONITOR: return <ScamMonitor isPro={isPro} />;
      case AppView.PAYMENT_GUARD: return <PaymentGuard isPro={isPro} />;
      case AppView.URL_SHIELD: return <URLShield />;
      case AppView.APK_SCANNER: return <APKScanner />;
      case AppView.SCAM_DATABASE: return <ScamDatabase />;
      case AppView.FAMILY_GUARD: return <FamilyGuard />;
      case AppView.ABOUT: return <AboutPage />;
      case AppView.SUPPORT: return <SupportPage isPro={isPro} />;
      case AppView.PRIVACY_POLICY: return <PrivacyPolicyPage />;
      case AppView.SUBSCRIPTION: return <SubscriptionPlans onSelectPlan={handlePlanSelection} />;
      case AppView.ATDS: return <AutomaticThreatDetector />;
      case AppView.RANSOMWARE_SHIELD: return <RansomwareShield onBack={() => setCurrentView(AppView.DASHBOARD)} />;
      case AppView.DASHBOARD:
      default:
        return (
          <div className="p-6 space-y-8 animate-in fade-in duration-500 pb-32">
            <div className="bg-white rounded-[40px] p-8 text-slate-900 shadow-xl border border-indigo-50 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 opacity-50" />
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 bg-indigo-600 rounded-[22px] flex items-center justify-center shadow-lg text-white font-black text-2xl">
                    {currentUser.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-black tracking-tight text-slate-900">{currentUser.name}</h2>
                    <div className="mt-1 flex items-center gap-2">
                      {isPro ? (
                        <div className="bg-indigo-100 px-3 py-1 rounded-full flex items-center gap-1.5 border border-indigo-200">
                          <BadgeCheck size={12} className="text-indigo-600" />
                          <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Neural Pro Active</span>
                        </div>
                      ) : (
                        <button onClick={() => setCurrentView(AppView.SUBSCRIPTION)} className="bg-slate-100 px-3 py-1 rounded-full flex items-center gap-1.5 hover:bg-indigo-50 transition-colors group">
                          <Zap size={12} className="text-indigo-400 group-hover:text-indigo-600 transition-colors" />
                          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest group-hover:text-indigo-600">Standard Tier</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                {isPro && <Star size={24} className="text-amber-400 fill-amber-400 animate-pulse" />}
              </div>
            </div>

            {!isPro && (
              <div className="bg-slate-950 rounded-[44px] p-8 text-white shadow-2xl relative overflow-hidden border border-white/10 group cursor-pointer active:scale-95 transition-all" onClick={() => setCurrentView(AppView.SUBSCRIPTION)}>
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/20 blur-[80px] -mr-32 -mt-32 animate-pulse" />
                <div className="relative z-10 flex flex-col gap-4">
                  <div className="flex justify-between items-start">
                    <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg">
                      <Zap size={24} className="text-white fill-white" />
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-full border border-white/10">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Secure Node</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-black tracking-tighter uppercase leading-tight">Neural Pro Upgrade</h3>
                    <p className="text-xs text-slate-400 font-bold mt-1 opacity-80">Unlimited Deepfake Audits & Real-time Interception</p>
                  </div>
                  <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-400 group-hover:text-white transition-colors">
                    Explore Membership <ArrowUpRight size={14} />
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div className="flex justify-between items-center px-2">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Neural Core Tools</h4>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setCurrentView(AppView.DEEPFAKE_SCAN)} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-md transition-all active:scale-95 text-left group">
                  <div className="p-4 bg-red-50 text-red-600 rounded-2xl w-fit mb-5 group-hover:bg-red-600 group-hover:text-white transition-all shadow-inner"><Video size={28} /></div>
                  <h3 className="font-black text-slate-800">Deep Audit</h3>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">Video Forensic</p>
                </button>
                <button onClick={() => setCurrentView(AppView.SCAM_MONITOR)} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-md transition-all active:scale-95 text-left group">
                  <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl w-fit mb-5 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner"><Smartphone size={28} /></div>
                  <h3 className="font-black text-slate-800">Scam Shield</h3>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">Intent Analysis</p>
                </button>
                <button onClick={() => setCurrentView(AppView.URL_SHIELD)} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:border-indigo-200 transition-all active:scale-95 text-left group">
                  <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl w-fit mb-5 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-inner"><Globe size={28} /></div>
                  <h3 className="font-black text-slate-800">Web Shield</h3>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">Link Verifier</p>
                </button>
                <button onClick={() => setCurrentView(AppView.PAYMENT_GUARD)} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:border-indigo-200 transition-all active:scale-95 text-left group">
                  <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl w-fit mb-5 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-inner"><CreditCard size={28} /></div>
                  <h3 className="font-black text-slate-800">Safe Pay</h3>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">UPI Auditor</p>
                </button>
                <button onClick={() => setCurrentView(AppView.APK_SCANNER)} className="bg-slate-900 p-6 rounded-[32px] shadow-xl shadow-slate-200 active:scale-95 text-left group border border-slate-700 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12"><Cpu size={80} className="text-indigo-400" /></div>
                  <div className="p-4 bg-white/10 text-indigo-400 rounded-2xl w-fit mb-5"><Cpu size={28} /></div>
                  <h3 className="font-black text-white">APK Shield</h3>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">Malware Audit</p>
                </button>
                <button onClick={() => setCurrentView(AppView.ATDS)} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-md transition-all active:scale-95 text-left group border-t-4 border-t-indigo-600 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-[0.03] rotate-12 group-hover:scale-110 transition-transform"><Activity size={80} className="text-indigo-600" /></div>
                  <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl w-fit mb-5 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-inner"><ShieldAlert size={28} /></div>
                  <h3 className="font-black text-slate-800">Auto Detect</h3>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">Neural Threat Logic</p>
                </button>
                <button onClick={() => setCurrentView(AppView.RANSOMWARE_SHIELD)} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-md transition-all active:scale-95 text-left group border-t-4 border-t-red-600 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-[0.03] rotate-12 group-hover:scale-110 transition-transform"><Lock size={80} className="text-red-600" /></div>
                  <div className="p-4 bg-red-50 text-red-600 rounded-2xl w-fit mb-5 group-hover:bg-red-600 group-hover:text-white transition-all shadow-inner"><Activity size={28} /></div>
                  <h3 className="font-black text-slate-800">Ransom Shield</h3>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">Entropy Guard</p>
                </button>
              </div>
            </div>

            <button onClick={() => setCurrentView(AppView.SCAM_DATABASE)} className="w-full bg-slate-950 rounded-[40px] p-8 text-white flex items-center justify-between shadow-2xl active:scale-95 transition-all group overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/20 to-transparent" />
              <div className="flex items-center gap-6 relative z-10">
                <div className="p-5 bg-indigo-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform"><Database size={28} /></div>
                <div className="text-left">
                  <h3 className="font-black text-2xl uppercase tracking-tighter leading-none">Registry Hub</h3>
                  <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest mt-2">5.2M Scammer Profiles Indexed</p>
                </div>
              </div>
              <ChevronRight className="relative z-10 text-indigo-400 group-hover:translate-x-2 transition-transform" />
            </button>

            <AdBanner />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen max-w-md mx-auto bg-slate-50 flex flex-col shadow-2xl overflow-hidden relative font-sans">
      <div className="bg-white/80 backdrop-blur-md px-6 py-5 flex items-center justify-between border-b border-indigo-50 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button onClick={() => setCurrentView(AppView.DASHBOARD)} className="w-10 h-10 active:scale-90 transition-transform"><BrandLogo size={42} hideText /></button>
          <div className="flex flex-col">
            <span className="font-black text-slate-900 text-lg tracking-tight leading-none">SurakshaSetu</span>
            <span className="text-[7px] font-black uppercase tracking-[0.4em] text-indigo-600 mt-1">National Cyber Guard</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => setShowUserMenu(!showUserMenu)} className="w-11 h-11 bg-indigo-50 rounded-2xl flex items-center justify-center border border-indigo-100 text-indigo-600 active:scale-90 transition-all"><User size={20} /></button>
          {showUserMenu && (
            <div className="absolute right-6 top-full mt-3 w-56 bg-white border border-slate-100 shadow-2xl rounded-[28px] overflow-hidden z-50 animate-in slide-in-from-top-4 duration-300">
              <div className="p-5 bg-indigo-50/30 border-b border-indigo-50">
                <p className="text-sm font-black text-slate-900 truncate">{currentUser.name}</p>
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">{currentUser.email}</p>
              </div>
              <div className="p-2 space-y-1">
                <button onClick={() => { setCurrentView(AppView.ADMIN_PANEL); setShowUserMenu(false); }} className="w-full text-left px-4 py-3 text-xs text-slate-600 hover:bg-indigo-50 rounded-xl font-black flex items-center gap-3 transition-colors"><Terminal size={16} />Command Center</button>
                <button onClick={() => { setCurrentView(AppView.SUPPORT); setShowUserMenu(false); }} className="w-full text-left px-4 py-3 text-xs text-slate-600 hover:bg-indigo-50 rounded-xl font-black flex items-center gap-3 transition-colors"><LifeBuoy size={16} />Support Hub</button>
                <button onClick={() => { setCurrentView(AppView.ABOUT); setShowUserMenu(false); }} className="w-full text-left px-4 py-3 text-xs text-slate-600 hover:bg-indigo-50 rounded-xl font-black flex items-center gap-3 transition-colors"><Info size={16} />Our Mission</button>
                <div className="h-px bg-slate-100 mx-2 my-1" />
                <button onClick={handleLogout} className="w-full text-left px-4 py-3 text-xs text-red-600 hover:bg-red-50 rounded-xl font-black flex items-center gap-3 transition-colors"><LogOut size={16} />Logout</button>
              </div>
            </div>
          )}
        </div>
      </div>

      <main className="flex-1 overflow-y-auto hide-scrollbar">
        {renderView()}
      </main>

      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[92%] max-w-sm bg-white/90 backdrop-blur-2xl border border-indigo-100 shadow-2xl rounded-[32px] flex justify-around p-3 z-40">
        {NAV_ITEMS.map(item => {
          const isSelected = currentView === item.id;
          const isSubscription = item.id === AppView.SUBSCRIPTION;
          const needsAttention = isSubscription && !currentUser?.isPro;

          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id as AppView)}
              className={`flex flex-col items-center p-3.5 rounded-[20px] transition-all duration-500 relative ${isSelected ? 'text-indigo-600 bg-indigo-50 shadow-inner' : 'text-slate-400 hover:text-slate-500'}`}
            >
              {needsAttention && !isSelected && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-600 rounded-full animate-ping" />
              )}
              {item.icon}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(<App />);