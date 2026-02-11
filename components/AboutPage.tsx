import React from 'react';
import { 
  Instagram, Twitter, Linkedin, Globe, MapPin, Award, 
  Rocket, Sparkles, Shield, ChevronLeft, Github, ExternalLink,
  Zap, Heart, ShieldCheck, Star, Camera
} from 'lucide-react';
import { SOCIAL_HANDLES } from '../constants';
import { BrandLogo } from './BrandLogo';

export const AboutPage: React.FC = () => {
  return (
    <div className="flex flex-col bg-white min-h-screen pb-40 animate-in fade-in duration-1000 font-sans">
      {/* Immersive Hero Section */}
      <div className="relative w-full overflow-hidden bg-slate-950 pt-16 pb-28 px-6 rounded-b-[72px] shadow-2xl text-center">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 blur-[150px] rounded-full -mr-40 -mt-40" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-600/10 blur-[120px] rounded-full -ml-20 -mb-20" />
        
        <div className="relative z-10 flex flex-col items-center space-y-8">
          <div className="mb-4">
            <BrandLogo size={180} hideText />
          </div>

          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 bg-indigo-500/20 backdrop-blur-xl px-5 py-2 rounded-full border border-indigo-500/30">
              <Sparkles size={14} className="text-yellow-400" />
              <span className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.3em]">AI Safety Initiative</span>
            </div>
            <h1 className="text-5xl font-black text-white tracking-tighter uppercase leading-none">Our Mission</h1>
            <p className="text-indigo-400 font-bold text-sm uppercase tracking-[0.4em]">Bridging AI and Digital Safety</p>
          </div>

          <div className="flex items-center gap-6 text-white/50 font-black text-[10px] uppercase tracking-widest">
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-indigo-500" />
              <span>West Bengal, India</span>
            </div>
            <div className="w-1 h-1 bg-white/20 rounded-full" />
            <div className="flex items-center gap-2">
              <Shield size={14} className="text-indigo-500" />
              <span>Cyber AI Network</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="px-6 -mt-12 relative z-20 space-y-12">
        
        {/* Founder Context */}
        <div className="bg-white rounded-[48px] p-10 shadow-2xl border border-slate-50 space-y-8">
          <div className="space-y-6 text-center md:text-left">
            <div className="flex items-center gap-4 justify-center md:justify-start">
               <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                  <ShieldCheck size={28} />
               </div>
               <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter text-left">The Visionary</h3>
            </div>
            
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 border-4 border-white shadow-lg shrink-0">
                <Sparkles size={40} className="text-indigo-600 animate-pulse" />
              </div>
              <div className="space-y-3">
                <p className="text-slate-600 font-medium leading-relaxed">
                  Founded by <strong>Afan Ali</strong>, Suraksha Setu aims to protect citizens from AI-driven fraud. 
                  By utilizing advanced neural context analysis, we identify threats that traditional blockers miss.
                </p>
              </div>
            </div>

            <div className="p-6 bg-slate-950 rounded-[32px] text-indigo-100 shadow-xl relative overflow-hidden text-left">
               <div className="absolute top-0 right-0 p-4 opacity-10"><Zap size={80} /></div>
               <p className="text-sm font-bold italic leading-relaxed relative z-10">
                "We aren't just blocking numbers; we are decoding intent. Our mission is to make the digital space a safe zone for every Indian student and senior citizen."
               </p>
               <p className="text-[10px] font-black uppercase tracking-widest mt-4 text-indigo-400">— Founder, Afan Ali</p>
            </div>
          </div>
        </div>

        {/* Featured Showcase */}
        <div className="space-y-6">
           <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] text-center">Ecosystem Recognition</h4>
           <div className="group relative bg-slate-900 rounded-[48px] overflow-hidden shadow-2xl border-8 border-white transform transition-all duration-700 hover:rotate-1">
            <img 
              src="input_file_1.png" 
              alt="Startups of India" 
              className="w-full h-auto object-cover opacity-90 group-hover:opacity-100 transition-opacity"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
          </div>
        </div>

        {/* Tech Stack */}
        <div className="grid grid-cols-2 gap-4">
           {[
             { label: 'Deepfake Detection', icon: Camera, color: 'bg-red-50 text-red-600' },
             { label: 'Neural Context', icon: Zap, color: 'bg-amber-50 text-amber-600' },
             { label: 'Cloud Identity', icon: Globe, color: 'bg-blue-50 text-blue-600' },
             { label: 'Citizen Safety', icon: Heart, color: 'bg-pink-50 text-pink-600' }
           ].map((tech, i) => (
             <div key={i} className="bg-white p-6 rounded-[36px] border border-slate-100 shadow-sm flex flex-col items-center text-center space-y-3">
                <div className={`w-12 h-12 ${tech.color} rounded-2xl flex items-center justify-center`}>
                  <tech.icon size={24} />
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-900">{tech.label}</p>
             </div>
           ))}
        </div>

        {/* Action Hub */}
        <div className="bg-indigo-600 rounded-[56px] p-12 text-white shadow-2xl relative overflow-hidden text-center space-y-10 group">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.2),transparent)] pointer-events-none" />
          <div className="relative z-10 space-y-4">
            <h3 className="text-4xl font-black uppercase tracking-tighter">Get In Touch</h3>
            <p className="text-indigo-100 font-medium opacity-80 max-w-[240px] mx-auto text-sm">Join the movement to secure our digital future.</p>
          </div>
          
          <div className="flex justify-center gap-6 relative z-10">
            {SOCIAL_HANDLES.map(social => (
              <a 
                key={social.id} 
                href={social.url} 
                target="_blank" 
                rel="noreferrer"
                className="w-16 h-16 bg-white/10 hover:bg-white hover:text-indigo-600 text-white rounded-[24px] flex items-center justify-center backdrop-blur-md border border-white/20 transition-all active:scale-90 shadow-xl"
              >
                {React.cloneElement(social.icon as any, { size: 28 })}
              </a>
            ))}
          </div>

          <button 
            onClick={() => window.location.href = "mailto:afan73871@gmail.com"}
            className="w-full bg-white text-indigo-600 py-6 rounded-[32px] font-black text-sm uppercase tracking-[0.3em] shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3 relative z-10 group-hover:bg-indigo-50"
          >
            <ExternalLink size={20} /> Partner / Collaborate
          </button>
        </div>

        <div className="text-center py-10 opacity-30">
          <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.4em] leading-relaxed">
            Suraksha Setu AI Technologies Private Limited<br/>
            Founder: Afan Ali | 2024-2025
          </p>
        </div>
      </div>
    </div>
  );
};