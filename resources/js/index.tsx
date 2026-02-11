import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { AppView, Language, User as UserType } from './types';
import { NAV_ITEMS, LANGUAGES, SOCIAL_HANDLES } from './constants';
import { DeepfakeScanner } from './components/DeepfakeScanner';
import { ScamMonitor } from './components/ScamMonitor';
import { PaymentGuard } from './components/PaymentGuard';
import { URLShield } from './components/URLShield';
import { APKScanner } from './components/APKScanner';
import { AIChat } from './components/AIChat';
import { AdBanner } from './components/AdBanner';
import { ScamDatabase } from './components/ScamDatabase';
import { Auth } from './components/Auth';
import { BrandLogo } from './components/BrandLogo';
import { AboutPage } from './components/AboutPage';
import { SupportPage } from './components/SupportPage';
import { PrivacyPolicyPage } from './components/PrivacyPolicyPage';
import { AutomaticThreatDetector } from './components/AutomaticThreatDetector';
import { 
  Shield, ChevronRight, Database, Video, Smartphone, 
  Zap, LogOut, User, Sparkles, ShieldCheck, 
  BadgeCheck, Info, Waves, Flag, Rocket, Star, ShieldAlert, Activity, Cpu, Radar
} from 'lucide-react';

const DEFAULT_GUEST_USER: UserType = {
  id: 'guest_' + Math.random().toString(36).substr(2, 9),
  name: 'Digital Citizen',
  email: 'guest@suraksha.setu',
  isVerified: true,
  securityLevel: 'Maximum',
  isPro: true,
  planSelected: true
};

const IndianFlagIcon: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`inline-flex overflow-hidden rounded-[2px] border border-gray-200 shadow-sm ${className}`} style={{ width: '20px', height: '13px' }}>
    <svg viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="900" height="200" fill="#FF9933" />
      <rect y="200" width="900" height="200" fill="#FFFFFF" />
      <rect y="400" width="900" height="200" fill="#128807" />
      <g transform="translate(450,300)">
        <circle r="92" fill="none" stroke="#000080" strokeWidth="10" />
        <circle r="15" fill="#000080" />
        {Array.from({ length: 24 }).map((_, i) => (
          <line
            key={i}
            x1="0"
            y1="0"
            x2="0"
            y2="-92"
            stroke="#000080"
            strokeWidth="4"
            transform={`rotate(${i * 15})`}
          />
        ))}
      </g>
    </svg>
  </div>
);

const Footer: React.FC<{ setView: (v: AppView) => void }> = ({ setView }) => (
  <footer className="bg-slate-950 text-white p-12 rounded-t-[56px] mt-12 space-y-10 border-t border-white/5 shadow-2xl relative overflow-hidden">
    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#FF9933] via-white to-[#128807]" />
    
    <div className="flex flex-col items-center text-center space-y-4">
      <BrandLogo size={90} hideText className="brightness-125" />
      <div>
        <h3 className="text-2xl font-black tracking-tighter uppercase leading-none">Suraksha Setu</h3>
        <p className="text-[10px] font-black text-[#FF9933] uppercase tracking-[0.5em] mt-1">National AI Safety Shield</p>
      </div>
    </div>

    <div className="flex flex-wrap justify-center gap-8">
      <button onClick={() => setView(AppView.PRIVACY_POLICY)} className="text-[11px] font-black text-gray-500 uppercase tracking-widest hover:text-white transition-colors">Privacy Policy</button>
      <button onClick={() => setView(AppView.SUPPORT)} className="text-[11px] font-black text-gray-500 uppercase tracking-widest hover:text-white transition-colors">Support Hub</button>
    </div>

    <div className="flex justify-center gap-5">
      {SOCIAL_HANDLES.map((social) => (
        <a key={social.id} href={social.url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/5 hover:bg-[#128807] rounded-xl flex items-center justify-center border border-white/10 transition-all active:scale-90">
          {social.icon}
        </a>
      ))}
    </div>

    <div className="flex flex-col items-center gap-6 pt-6 border-t border-white/5 opacity-50">
      <p className="text-[9px] text-gray-600 font-bold uppercase tracking-[0.3em] text-center">
        © {new Date().getFullYear()} SURAKSHA SETU TECHNOLOGIES PVT LTD.<br/>
        <span className="text-[#FF9933]">JAI</span> HIND
      </p>
    </div>
  </footer>
);

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserType | null>(() => {
    const saved = localStorage.getItem('suraksha_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [language, setLanguage] = useState<Language>(LANGUAGES[0]);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const handleNavDashboard = () => setCurrentView(AppView.DASHBOARD);
    window.addEventListener('nav-to-dashboard', handleNavDashboard);
    return () => window.removeEventListener('nav-to-dashboard', handleNavDashboard);
  }, []);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('suraksha_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('suraksha_user');
    }
  }, [currentUser]);

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView(AppView.DASHBOARD);
    setShowUserMenu(false);
  };

  const handleGuestLogin = () => setCurrentUser(DEFAULT_GUEST_USER);

  if (!currentUser) {
    return <Auth onLogin={setCurrentUser} onGuestLogin={handleGuestLogin} />;
  }

  const renderView = () => {
    switch (currentView) {
      case AppView.CHAT: return <AIChat languageName={language.name} isPro={true} onLogout={handleLogout} />;
      case AppView.DEEPFAKE_SCAN: return <DeepfakeScanner />;
      case AppView.SCAM_MONITOR: return <ScamMonitor isPro={true} />;
      case AppView.PAYMENT_GUARD: return <PaymentGuard isPro={true} />;
      case AppView.URL_SHIELD: return <URLShield />;
      case AppView.APK_SCANNER: return <APKScanner />;
      case AppView.SCAM_DATABASE: return <ScamDatabase />;
      case AppView.ABOUT: return <AboutPage />;
      case AppView.SUPPORT: return <SupportPage isPro={currentUser.isPro || false} />;
      case AppView.PRIVACY_POLICY: return <PrivacyPolicyPage />;
      case AppView.ATDS: return <AutomaticThreatDetector />;
      case AppView.DASHBOARD:
      default:
        return (
          <div className="p-5 space-y-6 animate-in fade-in duration-500 pb-24 text-black relative">
             <div className="bg-white rounded-[44px] p-8 text-slate-900 shadow-xl border border-gray-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF9933]/5 rounded-full -mr-16 -mt-16" />
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-tr from-[#FF9933] via-white to-[#128807] rounded-[22px] blur-sm opacity-40 animate-pulse" />
                      <div className="w-16 h-16 bg-white rounded-[22px] flex items-center justify-center shadow-lg text-slate-800 font-black text-xl relative z-10 border border-slate-50">
                        {currentUser.name.charAt(0)}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-2xl font-black tracking-tighter leading-none">{currentUser.name}</h2>
                        <BadgeCheck size={20} className="text-indigo-600" />
                      </div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Certified Identity Hub</p>
                    </div>
                  </div>
                </div>
             </div>

             <div className="bg-gradient-to-br from-[#128807] via-emerald-800 to-slate-900 rounded-[44px] p-10 text-white shadow-2xl flex items-center justify-between border border-emerald-400/20 relative overflow-hidden group">
               <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.05),transparent)]" />
               <div className="flex items-center gap-5 relative z-10">
                 <div className="p-4 bg-white/10 rounded-[28px] backdrop-blur-md relative border border-white/10">
                   <div className="absolute inset-0 bg-[#FF9933] rounded-[28px] blur-lg opacity-20 animate-pulse" />
                   <ShieldCheck size={40} className="relative z-10" />
                 </div>
                 <div>
                   <p className="text-xl font-black tracking-tight leading-none uppercase">Neural Shield Live</p>
                   <p className="text-[10px] font-black uppercase tracking-widest text-[#FF9933] mt-1">Maximum Cyber Protection</p>
                 </div>
               </div>
               <Star className="text-yellow-300 animate-pulse relative z-10" size={32} fill="currentColor" />
             </div>

            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => setCurrentView(AppView.DEEPFAKE_SCAN)} className="bg-white p-6 rounded-[36px] border border-gray-100 shadow-sm hover:border-indigo-200 transition-all active:scale-95 text-left group border-t-4 border-t-[#FF9933]">
                <div className="p-4 bg-red-50 text-red-600 rounded-2xl w-fit mb-5 group-hover:bg-red-600 group-hover:text-white transition-all shadow-inner"><Video size={32} /></div>
                <h3 className="font-black text-gray-800 text-lg leading-tight mb-1">Human Audit</h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Verify Liveness</p>
              </button>

              <button onClick={() => setCurrentView(AppView.SCAM_MONITOR)} className="bg-white p-6 rounded-[36px] border border-gray-100 shadow-sm hover:border-indigo-200 transition-all active:scale-95 text-left group border-t-4 border-t-[#128807]">
                <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl w-fit mb-5 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner"><Smartphone size={32} /></div>
                <h3 className="font-black text-gray-800 text-lg leading-tight mb-1">Scam Shield</h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Intent Audit</p>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => setCurrentView(AppView.APK_SCANNER)} className="bg-slate-900 p-6 rounded-[36px] shadow-xl shadow-slate-200 active:scale-95 text-left group border border-slate-700 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12"><Cpu size={80} className="text-indigo-400" /></div>
                <div className="p-4 bg-white/10 text-indigo-400 rounded-2xl w-fit mb-5"><Cpu size={32} /></div>
                <h3 className="font-black text-white text-lg leading-tight mb-1">APK Shield</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Malware Audit</p>
              </button>
              
              <button onClick={() => setCurrentView(AppView.ATDS)} className="bg-white p-6 rounded-[36px] border border-gray-100 shadow-sm hover:border-indigo-200 transition-all active:scale-95 text-left group relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-[0.03] rotate-12 group-hover:scale-110 transition-transform"><Radar size={80} className="text-indigo-600" /></div>
                <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl w-fit mb-5 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-inner"><Activity size={32} /></div>
                <h3 className="font-black text-gray-800 text-lg leading-tight mb-1">Auto Detect</h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Threat Radar</p>
              </button>
            </div>

            <button onClick={() => setCurrentView(AppView.SCAM_DATABASE)} className="w-full bg-slate-950 rounded-[40px] p-8 text-white flex items-center justify-between shadow-2xl active:scale-95 transition-all group overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-[#FF9933]/5 via-transparent to-[#128807]/5" />
              <div className="flex items-center gap-6 relative z-10">
                <div className="p-5 bg-indigo-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform"><Database size={28} className="text-white" /></div>
                <div className="text-left"><h3 className="font-black text-2xl tracking-tighter uppercase leading-none">Registry Hub</h3><p className="text-[10px] text-[#FF9933] font-bold uppercase tracking-widest mt-2">5.2M Scammer Profiles Indexed</p></div>
              </div>
              <ChevronRight className="text-indigo-400 relative z-10 group-hover:translate-x-2 transition-transform" />
            </button>
            
            <AdBanner />
            
            <div className="pt-8 flex flex-col items-center gap-4 opacity-40">
               <div className="flex items-center gap-4">
                  <Flag size={14} className="text-[#FF9933]" />
                  <div className="h-px w-8 bg-slate-300" />
                  <Rocket size={14} className="text-[#128807]" />
               </div>
               <p className="text-[8px] font-black uppercase tracking-[0.4em] text-slate-500">Proudly Developed in India</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen max-w-md mx-auto bg-slate-50 flex flex-col shadow-2xl overflow-hidden relative font-sans">
      <div className="bg-white px-6 py-5 flex items-center justify-between border-b border-gray-100 sticky top-0 z-40 backdrop-blur-md bg-white/80">
        <div className="flex items-center gap-2.5">
          <button onClick={() => setCurrentView(AppView.DASHBOARD)} className="w-10 h-10 active:scale-90 transition-transform">
             <BrandLogo size={42} hideText />
          </button>
          <div className="flex flex-col">
            <span className="font-black text-gray-900 text-lg tracking-tighter leading-none">SurakshaSetu</span>
            <span className="text-[7px] font-black uppercase tracking-[0.4em] text-[#FF9933] mt-1">National Cyber Guard</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <IndianFlagIcon />
          
          <button onClick={() => setShowLanguageMenu(!showLanguageMenu)} className="bg-gray-50 px-4 py-2 rounded-full border border-gray-200 text-[10px] font-black text-gray-600 uppercase">
            {language.name.split(' ')[0]}
          </button>
          {showLanguageMenu && (
            <div className="absolute right-16 mt-32 w-44 bg-white border border-gray-100 shadow-2xl rounded-[24px] overflow-hidden z-50">
              {LANGUAGES.map(lang => (
                <button key={lang.code} onClick={() => { setLanguage(lang); setShowLanguageMenu(false); }} className={`w-full text-left px-5 py-4 text-xs hover:bg-indigo-50 ${language.code === lang.code ? 'text-indigo-600 font-black' : 'text-gray-600'}`}>{lang.name}</button>
              ))}
            </div>
          )}
          <button onClick={() => setShowUserMenu(!showUserMenu)} className="w-11 h-11 bg-indigo-50 rounded-2xl flex items-center justify-center border border-indigo-100 text-indigo-600"><User size={20} /></button>
          {showUserMenu && (
            <div className="absolute right-6 mt-48 w-56 bg-white border border-gray-100 shadow-2xl rounded-[28px] overflow-hidden z-50">
              <div className="p-5 bg-gray-50/50 border-b border-gray-100">
                <p className="text-sm font-black text-gray-900 truncate">{currentUser.name}</p>
                <p className="text-[10px] text-gray-500 font-bold truncate uppercase">{currentUser.email}</p>
              </div>
              <div className="p-2 space-y-1">
                <button onClick={() => { setCurrentView(AppView.ABOUT); setShowUserMenu(false); }} className="w-full text-left px-4 py-3 text-xs text-slate-600 hover:bg-slate-50 rounded-xl font-black flex items-center gap-3 transition-colors"><Info size={16} />Our Mission</button>
                <button onClick={handleLogout} className="w-full text-left px-4 py-3 text-xs text-red-600 hover:bg-red-50 rounded-xl font-black flex items-center gap-3 transition-colors"><LogOut size={16} />Logout</button>
              </div>
            </div>
          )}
        </div>
      </div>

      <main className="flex-1 overflow-y-auto">
        {renderView()}
      </main>
      
      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[92%] max-w-sm bg-white/80 backdrop-blur-2xl border border-white/50 shadow-[0_25px_60px_rgba(0,0,0,0.18)] rounded-[36px] flex justify-around p-3 z-40">
        {NAV_ITEMS.map(item => (
          <button key={item.id} onClick={() => setCurrentView(item.id as AppView)} className={`flex flex-col items-center p-3.5 rounded-[22px] transition-all duration-300 ${currentView === item.id ? 'text-indigo-600 scale-110 bg-indigo-50/50 shadow-inner' : 'text-gray-400 hover:text-gray-600'}`}>
            {item.icon}
          </button>
        ))}
      </nav>
      
      <Footer setView={setCurrentView} />
    </div>
  );
};

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(<App />);