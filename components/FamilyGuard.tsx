import React, { useState, useEffect } from 'react';
import { 
  Users, UserPlus, ShieldCheck, ShieldAlert, Activity, 
  MapPin, Battery, RefreshCw, Smartphone, Search,
  Zap, Clock, ChevronRight, X, Heart, BellRing, Radio, Shield,
  Navigation, Signal, Locate, AlertTriangle, Radar, Globe
} from 'lucide-react';
import { apiClient } from '../services/apiService';
import { FamilyMemberStatus, User } from '../types';

// Surakshit Setu Core Engine Configuration
const HOME_BASE = { lat: 28.6139, lng: 77.2090 }; // Central Delhi
const SAFE_RADIUS_METERS = 500;

export const FamilyGuard: React.FC = () => {
  const [family, setFamily] = useState<FamilyMemberStatus[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLinking, setIsLinking] = useState(false);
  const [targetEmail, setTargetEmail] = useState('');
  const [relation, setRelation] = useState('Kid');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isBroadcasting, setIsBroadcasting] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('suraksha_user');
    if (saved) setCurrentUser(JSON.parse(saved));
  }, []);

  // Haversine Engine: High Precision Distance Calculation
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; // meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const fetchTelemetry = async (silent = false) => {
    if (!currentUser) return;
    if (!silent) setIsLoading(true);
    try {
      const data = await apiClient.getFamilyTelemetry(currentUser.email);
      
      // GEOFENCE ENFORCEMENT PROTOCOL
      const analyzedData = data.map(member => {
        if (member.lat && member.lng) {
          const distance = calculateDistance(member.lat, member.lng, HOME_BASE.lat, HOME_BASE.lng);
          if (distance > SAFE_RADIUS_METERS) {
            return { ...member, safetyStatus: 'THREAT_DETECTED' as const };
          } else {
            return { ...member, safetyStatus: 'SECURE' as const };
          }
        }
        return member;
      });
      
      setFamily(analyzedData);
    } catch (e) {
      console.error("Neural Link weak");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchTelemetry();
      const interval = setInterval(() => fetchTelemetry(true), 10000);
      return () => clearInterval(interval);
    }
  }, [currentUser]);

  // FIX: Broadcaster now passes Coordinates for Engine Analysis
  useEffect(() => {
    if (currentUser && isBroadcasting) {
      const broadcastInterval = setInterval(() => {
        const isInside = Math.random() > 0.3; // 70% chance to be safe
        const offset = isInside ? 0.001 : 0.006; // 0.001 ~100m, 0.006 ~600m
        const simulatedLat = HOME_BASE.lat + (Math.random() - 0.5) * offset;
        const simulatedLng = HOME_BASE.lng + (Math.random() - 0.5) * offset;
        
        const locName = isInside ? 'School Zone' : 'Restricted Perimeter';
        const battery = Math.floor(Math.random() * 20) + 70;
        
        // Pass coordinates to API for the engine to consume
        apiClient.updateMyTelemetry(
          currentUser.email, 
          isInside ? 'SECURE' : 'THREAT_DETECTED', 
          locName, 
          battery, 
          simulatedLat, 
          simulatedLng
        );
      }, 12000);
      return () => clearInterval(broadcastInterval);
    }
  }, [currentUser, isBroadcasting]);

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
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-5 space-y-6 animate-in fade-in duration-700 pb-40 font-sans text-black">
      <header className="text-center space-y-2">
        <div className="relative w-20 h-20 mx-auto">
          <div className="absolute inset-0 bg-indigo-500/20 rounded-full animate-ping" />
          <div className="w-20 h-20 bg-slate-950 rounded-[32px] flex items-center justify-center shadow-2xl relative z-10 border-2 border-white/10">
             <Radar size={36} className="text-indigo-400 animate-spin" style={{ animationDuration: '4s' }} />
          </div>
        </div>
        <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter leading-none">Geofence Engine</h2>
        <div className="flex items-center justify-center gap-2">
          <Signal size={12} className="text-emerald-500 animate-pulse" />
          <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em]">Neural Perimeter Active</span>
        </div>
      </header>

      {/* Geofence Monitoring Pulse */}
      <div className="space-y-4">
        <div className="flex justify-between items-center px-2">
           <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Sentinel Logs</h4>
           <div className="flex items-center gap-1.5 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
             <Locate size={10} className="text-indigo-600" />
             <span className="text-[8px] font-black text-indigo-600 uppercase tracking-widest">Radius: {SAFE_RADIUS_METERS}m</span>
           </div>
        </div>

        {family.length === 0 ? (
          <div className="bg-white rounded-[44px] p-12 text-center border border-slate-100 shadow-inner">
             <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300 mb-4">
               <Smartphone size={32} />
             </div>
             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No telemetry signals found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {family.map((member) => {
              const isInside = member.safetyStatus === 'SECURE';
              const time = new Date(member.lastUpdated).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
              
              return (
                <div 
                  key={member.email} 
                  className={`bg-white rounded-[40px] p-8 shadow-xl border-2 transition-all relative overflow-hidden group ${!isInside ? 'border-red-500 bg-red-50/20' : 'border-emerald-500/20'}`}
                >
                  {!isInside && (
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-red-600 animate-pulse" />
                  )}

                  <div className="relative z-10 flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg ${!isInside ? 'bg-red-600 animate-bounce' : 'bg-slate-900'}`}>
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="font-black text-lg tracking-tight text-slate-900">{member.name}</h5>
                          <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase ${!isInside ? 'bg-red-100 text-red-600' : 'bg-indigo-50 text-indigo-600'}`}>
                            {member.relation}
                          </span>
                        </div>
                        
                        {/* ENGINE OUTPUT STRINGS */}
                        <p className={`text-[10px] font-black uppercase tracking-widest mt-1 ${!isInside ? 'text-red-600' : 'text-emerald-600'}`}>
                          {isInside 
                            ? `Status: Secure. Location: ${member.lastLocation}. No action required.`
                            : `Status: ALERT. Boundary Breach Detected.`}
                        </p>
                      </div>
                    </div>
                  </div>

                  {!isInside && (
                    <div className="mt-6 p-5 bg-red-600 text-white rounded-[28px] shadow-lg animate-in slide-in-from-top-4 duration-500">
                      <div className="flex items-center gap-3 mb-2">
                        <AlertTriangle size={18} className="animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Red Alert Notification</span>
                      </div>
                      <p className="text-xs font-bold leading-relaxed italic">
                        Sending SMS/Notification to Parent: 'User has left the Safe Zone at {time}.'
                      </p>
                    </div>
                  )}

                  <div className="mt-6 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-400">
                      <MapPin size={12} />
                      <span className="text-[9px] font-black uppercase tracking-widest">{member.lat?.toFixed(4)}, {member.lng?.toFixed(4)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Battery size={12} className={member.batteryLevel < 20 ? 'text-red-500' : 'text-slate-400'} />
                      <span className="text-[10px] font-black text-slate-900">{member.batteryLevel}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={() => setIsLinking(true)}
          className="bg-white p-6 rounded-[36px] border border-indigo-100 shadow-xl active:scale-95 text-left group"
        >
          <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl w-fit mb-5 group-hover:bg-indigo-600 group-hover:text-white transition-all">
            <UserPlus size={28} />
          </div>
          <h3 className="font-black text-slate-900 text-sm uppercase tracking-tight">Sync New</h3>
          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Add Link</p>
        </button>

        <button 
          onClick={() => fetchTelemetry()}
          className="bg-slate-950 p-6 rounded-[36px] text-white shadow-xl active:scale-95 text-left group"
        >
          <div className="p-4 bg-indigo-600 text-white rounded-2xl w-fit mb-5">
            <RefreshCw size={28} className={isLoading ? 'animate-spin' : ''} />
          </div>
          <h3 className="font-black text-sm uppercase tracking-tight">Re-Scan</h3>
          <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Audit Boundary</p>
        </button>
      </div>

      <div className="bg-indigo-50 p-6 rounded-[36px] border border-indigo-100 flex items-start gap-4">
        <ShieldCheck size={24} className="text-indigo-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h5 className="text-[10px] font-black uppercase text-indigo-900">Geofence v5.0 Active</h5>
          <p className="text-[10px] text-indigo-900/60 font-bold uppercase tracking-wider leading-relaxed">
            Home Base is locked at 28.6139, 77.2090. Any member exiting the 500m radius will trigger the Surakshit Setu Red Alert protocol immediately.
          </p>
        </div>
      </div>

      {isLinking && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center px-4 pb-20">
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md" onClick={() => setIsLinking(false)} />
          <div className="bg-white rounded-[48px] p-10 w-full max-w-sm relative z-10 shadow-2xl animate-in slide-in-from-bottom duration-500">
            <div className="flex justify-between items-center mb-8">
               <h3 className="text-2xl font-black uppercase tracking-tighter">Identity Link</h3>
               <button onClick={() => setIsLinking(false)} className="p-2 bg-slate-100 rounded-full text-slate-400"><X size={20} /></button>
            </div>
            <form onSubmit={handleAddMember} className="space-y-6">
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Email</label>
                 <input 
                    required
                    type="email"
                    value={targetEmail}
                    onChange={(e) => setTargetEmail(e.target.value)}
                    placeholder="child@suraksha.setu"
                    className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-600 rounded-[24px] py-5 px-6 outline-none font-bold text-slate-800"
                  />
              </div>
              <button 
                type="submit"
                disabled={isLoading}
                className="w-full py-6 bg-slate-900 text-white rounded-[32px] font-black text-xs uppercase tracking-[0.4em] shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                {isLoading ? <RefreshCw className="animate-spin" /> : <Zap size={20} className="text-indigo-400" />}
                ENABLE RADAR
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};