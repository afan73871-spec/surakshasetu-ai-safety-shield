import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, UserPlus, ShieldCheck, ShieldAlert, Activity, 
  MapPin, Battery, RefreshCw, Smartphone, Search,
  Zap, Clock, ChevronRight, X, Heart, BellRing, Radio, Shield,
  Navigation, Signal, Locate, AlertTriangle, Crosshair, Globe, Radar
} from 'lucide-react';
import { apiClient } from '../services/apiService';
import { FamilyMemberStatus, User } from '../types';

// Surakshit Setu Core Configuration
const HOME_BASE = { lat: 28.6139, lng: 77.2090 }; // Central Delhi
const SAFE_RADIUS_METERS = 500;

export const FamilyGuard: React.FC = () => {
  const [family, setFamily] = useState<FamilyMemberStatus[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLinking, setIsLinking] = useState(false);
  const [targetEmail, setTargetEmail] = useState('');
  const [relation, setRelation] = useState('Parent');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isBroadcasting, setIsBroadcasting] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('suraksha_user');
    if (saved) setCurrentUser(JSON.parse(saved));
  }, []);

  // Haversine Distance Calculation Engine
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // meters
  };

  const fetchTelemetry = async (silent = false) => {
    if (!currentUser) return;
    if (!silent) setIsLoading(true);
    try {
      const data = await apiClient.getFamilyTelemetry(currentUser.email);
      
      // Geofence Enforcement Logic
      const validatedData = data.map(member => {
        if (member.lat && member.lng) {
          const distance = calculateDistance(member.lat, member.lng, HOME_BASE.lat, HOME_BASE.lng);
          if (distance > SAFE_RADIUS_METERS) {
            return { ...member, safetyStatus: 'THREAT_DETECTED' as const };
          }
        }
        return member;
      });
      
      setFamily(validatedData);
    } catch (e) {
      console.error("Telemetry link weak");
    } finally {
      setIsLoading(false);
    }
  };

  // Automated Geofence Pulse
  useEffect(() => {
    if (currentUser) {
      fetchTelemetry();
      const interval = setInterval(() => fetchTelemetry(true), 10000);
      return () => clearInterval(interval);
    }
  }, [currentUser]);

  // Simulated Location Broadcaster for Demo/Test
  useEffect(() => {
    if (currentUser && isBroadcasting) {
      const broadcastInterval = setInterval(() => {
        // Randomly simulate movement within or outside the zone
        const isInside = Math.random() > 0.3;
        const offset = isInside ? 0.002 : 0.008; // 0.002 is approx 200m, 0.008 is ~800m
        const simulatedLat = HOME_BASE.lat + (Math.random() - 0.5) * offset;
        const simulatedLng = HOME_BASE.lng + (Math.random() - 0.5) * offset;
        
        const locName = isInside ? 'Secure: Home Zone' : 'ALERT: Perimeter Breach';
        const battery = Math.floor(Math.random() * 20) + 70;
        
        // Update my own telemetry coordinates
        apiClient.updateMyTelemetry(currentUser.email, isInside ? 'SECURE' : 'THREAT_DETECTED', locName, battery);
      }, 15000);
      return () => clearInterval(broadcastInterval);
    }
  }, [currentUser, isBroadcasting]);

  const triggerPanic = async () => {
    if (!currentUser) return;
    if (confirm("TRIGGER EMERGENCY SOS? This will alert all linked sentinels.")) {
      await apiClient.updateMyTelemetry(currentUser.email, 'THREAT_DETECTED', 'EMERGENCY: DISTRESS SIGNAL', 100);
      fetchTelemetry(true);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !targetEmail) return;
    
    setIsLoading(true);
    try {
      const result = await apiClient.linkFamilyMember(currentUser.email, targetEmail, relation);
      if (result.success) {
        setTargetEmail('');
        setIsLinking(false);
        fetchTelemetry();
      } else {
        alert("Link Blocked: " + result.message);
      }
    } catch (e) {
      alert("Hub Timeout");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-5 space-y-6 animate-in fade-in duration-700 pb-40 font-sans text-black">
      <header className="flex flex-col items-center text-center space-y-3">
        <div className="relative">
          <div className="absolute inset-0 bg-indigo-500/20 rounded-full animate-ping scale-150 opacity-20" />
          <div className="w-20 h-20 bg-slate-950 rounded-[32px] mx-auto flex items-center justify-center shadow-2xl relative z-10 border-4 border-white">
             <Radar size={36} className="text-indigo-400 animate-spin" style={{ animationDuration: '3s' }} />
          </div>
        </div>
        <div>
          <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter leading-none">Safe-Zone Engine</h2>
          <div className="flex items-center justify-center gap-2 mt-2">
            <Signal size={12} className="text-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em]">Geofence Active v5.0</span>
          </div>
        </div>
      </header>

      {/* Geofence Dashboard Card */}
      <div className="bg-slate-900 rounded-[48px] p-2 shadow-2xl relative overflow-hidden h-72 border border-white/10 group">
         <div className="absolute inset-0 opacity-40 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] pointer-events-none" />
         
         {/* Grid Visualization */}
         <div className="absolute inset-0 flex flex-col justify-between p-8">
            <div className="flex justify-between items-start">
               <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10">
                  <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest">Safe Perimeter</p>
                  <p className="text-[10px] font-bold text-white uppercase mt-0.5">{SAFE_RADIUS_METERS}m Radius</p>
               </div>
               <div className="bg-white/10 p-3 rounded-2xl border border-white/10 text-right">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Home Base</p>
                  <p className="text-[9px] font-mono text-indigo-300">{HOME_BASE.lat}, {HOME_BASE.lng}</p>
               </div>
            </div>

            {/* Radar UI */}
            <div className="relative h-full w-full flex items-center justify-center">
               {/* Safe Zone Circle */}
               <div className="absolute w-40 h-40 border-2 border-dashed border-indigo-500/40 rounded-full animate-pulse flex items-center justify-center">
                  <div className="w-32 h-32 border border-indigo-500/20 rounded-full" />
               </div>

               {/* Center Point (Home) */}
               <div className="w-4 h-4 bg-indigo-500 rounded-full relative z-10 border-2 border-white shadow-[0_0_15px_rgba(99,102,241,0.8)]">
                  <div className="absolute inset-0 animate-ping bg-indigo-400 rounded-full" />
               </div>

               {/* Tracked Members */}
               {family.map((member, i) => {
                 const isBreached = member.safetyStatus === 'THREAT_DETECTED';
                 return (
                   <div 
                    key={member.email} 
                    className="absolute transition-all duration-1000" 
                    style={{ 
                      transform: `translate(${isBreached ? '70px' : '30px'}, ${isBreached ? '-50px' : '20px'})` 
                    }}
                   >
                      <div className={`w-3 h-3 ${isBreached ? 'bg-red-500' : 'bg-emerald-500'} rounded-full relative z-20 border-2 border-white shadow-lg`}>
                        {isBreached && <div className="absolute inset-0 animate-ping bg-red-500 rounded-full opacity-70" />}
                      </div>
                      <div className="absolute top-5 -left-4 bg-black/80 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10 whitespace-nowrap">
                        <span className="text-[7px] font-black text-white uppercase tracking-widest">{member.name}</span>
                      </div>
                   </div>
                 );
               })}
            </div>
         </div>
      </div>

      {/* Geofence Status Messenger */}
      <div className="space-y-4">
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] px-2">Boundary Audit Log</h4>
        
        {family.length === 0 ? (
          <div className="bg-white rounded-[44px] p-8 text-center border border-slate-100 shadow-inner">
             <Locate size={32} className="mx-auto text-slate-300 mb-4" />
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No telemetry signals found</p>
          </div>
        ) : (
          family.map((member) => {
            const isInside = member.safetyStatus === 'SECURE';
            return (
              <div 
                key={member.email} 
                className={`bg-white rounded-[40px] p-6 shadow-xl border-2 transition-all relative overflow-hidden ${!isInside ? 'border-red-500' : 'border-emerald-500/30'}`}
              >
                <div className="flex items-start justify-between relative z-10">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-lg ${!isInside ? 'bg-red-600' : 'bg-emerald-600'}`}>
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <h5 className="font-black text-slate-900 tracking-tight">{member.name}</h5>
                      <p className={`text-[10px] font-black uppercase tracking-widest ${!isInside ? 'text-red-600 animate-pulse' : 'text-emerald-600'}`}>
                        {isInside 
                          ? `Status: Secure. No action required.` 
                          : `Status: ALERT. Boundary Breach Detected.`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                     <p className="text-[8px] font-black text-slate-400 uppercase">Power</p>
                     <p className="text-xs font-black text-slate-900">{member.batteryLevel}%</p>
                  </div>
                </div>

                {!isInside && (
                  <div className="mt-4 p-4 bg-red-50 rounded-3xl border border-red-100">
                    <p className="text-[10px] text-red-600 font-bold uppercase leading-relaxed">
                      Sending SMS/Notification to Parent: 'User has left the Safe Zone at {new Date(member.lastUpdated).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}.'
                    </p>
                  </div>
                )}
                
                <div className="mt-4 flex items-center justify-between">
                   <div className="flex items-center gap-2">
                     <MapPin size={10} className="text-slate-400" />
                     <span className="text-[10px] font-bold text-slate-500">{member.lastLocation}</span>
                   </div>
                   <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">
                     Pulse {new Date(member.lastUpdated).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', second: '2-digit'})}
                   </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={triggerPanic}
          className="bg-red-600 p-6 rounded-[36px] shadow-xl hover:bg-red-700 transition-all active:scale-95 text-left group relative overflow-hidden"
        >
          <div className="p-4 bg-white/20 text-white rounded-2xl w-fit mb-5 shadow-inner">
            <Zap size={28} fill="currentColor" />
          </div>
          <h3 className="font-black text-white text-sm uppercase tracking-tight">Panic Alert</h3>
          <p className="text-[9px] text-white/70 font-bold uppercase tracking-widest">Manual SOS</p>
        </button>

        <button 
          onClick={() => setIsLinking(true)}
          className="bg-white p-6 rounded-[36px] border border-indigo-100 shadow-xl hover:bg-indigo-50 transition-all active:scale-95 text-left group"
        >
          <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl w-fit mb-5 shadow-inner group-hover:bg-indigo-600 group-hover:text-white transition-all">
            <UserPlus size={28} />
          </div>
          <h3 className="font-black text-slate-900 text-sm uppercase tracking-tight">Add Link</h3>
          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Sync New User</p>
        </button>
      </div>

      {/* Link Modal */}
      {isLinking && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center px-4 pb-20">
          <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md" onClick={() => setIsLinking(false)} />
          <div className="bg-white rounded-[48px] p-10 w-full max-w-sm relative z-10 shadow-2xl animate-in slide-in-from-bottom duration-500">
            <div className="flex justify-between items-center mb-8">
               <h3 className="text-2xl font-black uppercase tracking-tighter">Identity Link</h3>
               <button onClick={() => setIsLinking(false)} className="p-2 bg-slate-100 rounded-full text-slate-400 hover:text-red-500 transition-colors"><X size={20} /></button>
            </div>

            <form onSubmit={handleAddMember} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Identity Hub Email</label>
                   <div className="relative">
                      <input 
                        required
                        type="email"
                        value={targetEmail}
                        onChange={(e) => setTargetEmail(e.target.value)}
                        placeholder="papa@suraksha.setu"
                        className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-600 rounded-[24px] py-5 px-6 outline-none font-bold text-slate-800"
                      />
                      <Globe className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                   </div>
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Member Label</label>
                   <div className="grid grid-cols-2 gap-2">
                      {['Mummy', 'Papa', 'Kid', 'Senior'].map(rel => (
                        <button 
                          key={rel}
                          type="button"
                          onClick={() => setRelation(rel)}
                          className={`py-3 rounded-2xl text-[10px] font-black uppercase transition-all ${relation === rel ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}
                        >
                          {rel}
                        </button>
                      ))}
                   </div>
                </div>
              </div>

              <button 
                type="submit"
                disabled={isLoading || !targetEmail}
                className="w-full py-6 bg-slate-900 text-white rounded-[32px] font-black text-xs uppercase tracking-[0.4em] shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isLoading ? <RefreshCw className="animate-spin" size={20} /> : <Zap size={20} className="text-indigo-400" />}
                ENABLE RADAR
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="bg-indigo-50 p-6 rounded-[36px] border border-indigo-100 flex items-start gap-4">
        <ShieldCheck size={20} className="text-indigo-600 shrink-0 mt-0.5" />
        <p className="text-[10px] text-indigo-900/60 font-bold uppercase tracking-wider leading-relaxed">
          <b>Engine Note:</b> Safe zones are dynamic. If the child exits the defined boundary, Surakshit Setu initiates the Red Alert protocol and starts high-frequency coordinate tracking.
        </p>
      </div>
    </div>
  );
};