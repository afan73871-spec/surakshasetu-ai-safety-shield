import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, Lock, Mail, User as UserIcon, ArrowRight, 
  ShieldCheck, Eye, EyeOff, RefreshCw, AlertTriangle, 
  Fingerprint, LogIn, UserPlus, Globe, Sparkles, Zap, ShieldAlert, Info, Bell, ExternalLink
} from 'lucide-react';
import { AuthView, User as UserType, AppView } from '../types';
import { apiClient } from '../services/apiService';
import { BrandLogo } from './BrandLogo';

interface AuthProps {
  onLogin: (user: UserType) => void;
  onGuestLogin?: () => void;
}

export const Auth: React.FC<AuthProps> = ({ onLogin, onGuestLogin }) => {
  const [view, setView] = useState<AuthView>(AuthView.LOGIN);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const googleButtonRef = useRef<HTMLDivElement>(null);
  const CLIENT_ID = "135243081709-nk8oe25slhsbppgma7luo1vetttogaii.apps.googleusercontent.com";

  useEffect(() => {
    const initializeGoogle = () => {
      try {
        if ((window as any).google && CLIENT_ID) {
          (window as any).google.accounts.id.initialize({
            client_id: CLIENT_ID,
            callback: handleGoogleResponse,
            auto_select: false,
            ux_mode: 'popup'
          });
          
          if (googleButtonRef.current) {
            (window as any).google.accounts.id.renderButton(googleButtonRef.current, {
              theme: 'filled_black',
              size: 'large',
              width: googleButtonRef.current.offsetWidth || 340,
              text: 'continue_with',
              shape: 'pill'
            });
          }
        }
      } catch (e) {
        console.warn("Google Auth Link Pulse Weak.");
      }
    };

    const interval = setInterval(() => {
      if ((window as any).google) {
        initializeGoogle();
        clearInterval(interval);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [view]);

  const handleGoogleResponse = async (response: any) => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const base64Url = response.credential.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      const payload = JSON.parse(jsonPayload);
      
      const result = await apiClient.post('/auth/login', { 
        email: payload.email, 
        isSocial: true,
        name: payload.name
      });
      
      if (result.success && result.user) {
        setIsSuccess(true);
        setTimeout(() => onLogin(result.user), 1500);
      } else {
        setErrorMessage("Identity Hub: Synchronization Failed.");
      }
    } catch (err) {
      setErrorMessage("Secure Handshake Interrupted.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      const endpoint = view === AuthView.SIGNUP ? '/auth/register' : '/auth/login';
      const payload = view === AuthView.SIGNUP ? { name, email, password } : { email, password };
      const result = await apiClient.post(endpoint, payload);
      
      if (result.success && result.user) {
        setIsSuccess(true);
        setTimeout(() => onLogin(result.user), 1500);
      } else {
        setErrorMessage(result.message || "Invalid Security Credentials.");
      }
    } catch (err: any) {
      setErrorMessage("Registry Hub Offline. Check Connection.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-8 text-white font-sans">
        <div className="w-24 h-24 bg-indigo-600 rounded-[32px] flex items-center justify-center mb-8 shadow-[0_0_60px_rgba(79,102,241,0.4)]">
          <ShieldCheck size={56} className="text-white animate-pulse" />
        </div>
        <h2 className="text-3xl font-black mb-2 uppercase tracking-tighter text-center text-white">Neural Link Active</h2>
        <p className="text-indigo-400 font-black text-[10px] uppercase tracking-[0.4em]">Establishing Secure Hub...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-indigo-950 flex flex-col p-8 font-sans relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/20 blur-[150px] rounded-full -mr-40 -mt-40 animate-pulse" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-600/20 blur-[100px] rounded-full -ml-20 -mb-20" />
      
      <div className="relative z-10 flex flex-col h-full max-w-sm mx-auto w-full pt-12">
        <div className="flex flex-col items-center mb-16">
           <div className="bg-white/10 p-4 rounded-[40px] backdrop-blur-xl border border-white/20 shadow-2xl">
             <BrandLogo size={80} hideText />
           </div>
           <div className="mt-4 text-center">
              <h1 className="text-2xl font-black tracking-tighter uppercase leading-none text-white">Suraksha <span className="text-indigo-400">Setu</span></h1>
              <p className="text-[8px] font-black text-indigo-300 uppercase tracking-[0.5em] mt-1.5">National Cyber AI</p>
           </div>
        </div>

        <div className="flex bg-white/5 p-1.5 rounded-[28px] border border-white/10 backdrop-blur-md mb-8">
           <button 
             onClick={() => setView(AuthView.LOGIN)} 
             className={`flex-1 py-4 rounded-[22px] text-[10px] font-black uppercase transition-all duration-300 ${view === AuthView.LOGIN ? 'bg-white text-indigo-900 shadow-xl' : 'text-white/60'}`}
           >
             Login
           </button>
           <button 
             onClick={() => setView(AuthView.SIGNUP)} 
             className={`flex-1 py-4 rounded-[22px] text-[10px] font-black uppercase transition-all duration-300 ${view === AuthView.SIGNUP ? 'bg-white text-indigo-900 shadow-xl' : 'text-white/60'}`}
           >
             Signup
           </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
           {view === AuthView.SIGNUP && (
             <div className="relative group">
               <UserIcon className="absolute left-6 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-indigo-400 transition-colors" size={18} />
               <input 
                 required 
                 type="text" 
                 placeholder="Citizen Name" 
                 value={name} 
                 onChange={(e) => setName(e.target.value)} 
                 className="w-full bg-white/5 border-2 border-white/10 rounded-[24px] py-5 pl-14 pr-6 outline-none focus:border-indigo-400 focus:bg-white/10 transition-all font-bold text-white placeholder:text-white/30" 
               />
             </div>
           )}
           <div className="relative group">
             <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-indigo-400 transition-colors" size={18} />
             <input 
               required 
               type="email" 
               placeholder="Identity Email" 
               value={email} 
               onChange={(e) => setEmail(e.target.value)} 
               className="w-full bg-white/5 border-2 border-white/10 rounded-[24px] py-5 pl-14 pr-6 outline-none focus:border-indigo-400 focus:bg-white/10 transition-all font-bold text-white placeholder:text-white/30" 
             />
           </div>
           <div className="relative group">
             <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-indigo-400 transition-colors" size={18} />
             <input 
               required 
               type={showPassword ? "text" : "password"} 
               placeholder="Access Key" 
               value={password} 
               onChange={(e) => setPassword(e.target.value)} 
               className="w-full bg-white/5 border-2 border-white/10 rounded-[24px] py-5 pl-14 pr-14 outline-none focus:border-indigo-400 focus:bg-white/10 transition-all font-bold text-white placeholder:text-white/30" 
             />
             <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-6 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
           </div>

           {errorMessage && (
             <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-[20px] text-red-400 text-[9px] font-black uppercase tracking-widest text-center flex items-center justify-center gap-2">
               <AlertTriangle size={14} />
               {errorMessage}
             </div>
           )}

           <button 
             type="submit" 
             disabled={isLoading} 
             className="w-full py-6 bg-white text-indigo-900 rounded-[32px] font-black text-xs uppercase tracking-[0.4em] shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3 hover:bg-indigo-50"
           >
              {isLoading ? <RefreshCw className="animate-spin" size={18} /> : <span>Authorize Access</span>}
           </button>
        </form>

        <div className="mt-8">
           <div ref={googleButtonRef} className="w-full flex justify-center grayscale hover:grayscale-0 transition-all" />
        </div>

        {onGuestLogin && (
          <button 
            onClick={onGuestLogin} 
            className="mt-6 w-full py-3 text-[9px] font-black uppercase text-white/40 tracking-[0.3em] hover:text-white transition-colors"
          >
            Access Identity Sandbox
          </button>
        )}

        <footer className="mt-auto py-10 opacity-30 text-center">
           <p className="text-[8px] font-black uppercase tracking-[0.4em] text-white">Identity Protection Node #4.0</p>
        </footer>
      </div>
    </div>
  );
};