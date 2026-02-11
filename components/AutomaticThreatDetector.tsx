import React, { useState, useEffect, useMemo } from 'react';
import {
  Shield, Activity, Zap,
  RefreshCw, Terminal, Cpu, Radar,
  Power, Biohazard, Wifi, Ghost, AlertCircle,
  FileSearch, ShieldCheck, ShieldX, Play, ShieldEllipsis, ChevronLeft
} from 'lucide-react';
import { performNeuralSystemAudit, SystemAuditResult } from '../services/geminiService';

interface RadarBlip {
  id: string;
  type: string;
  x: number;
  y: number;
  risk: 'LOW' | 'MEDIUM' | 'HIGH';
  icon: any;
}

export const AutomaticThreatDetector: React.FC = () => {
  const [isActive, setIsActive] = useState(() => {
    const saved = localStorage.getItem('suraksha_atds_active');
    return saved === 'true';
  });
  const [isAuditing, setIsAuditing] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [auditResult, setAuditResult] = useState<SystemAuditResult | null>(null);
  const [scanRotation, setScanRotation] = useState(0);

  const addLog = (msg: string) => {
    setLogs(prev => [`[${new Date().toLocaleTimeString([], { hour12: false, minute: '2-digit', second: '2-digit' })}] ${msg}`, ...prev.slice(0, 8)]);
  };

  const blips = useMemo(() => {
    if (!auditResult || auditResult.threatsFound === 0) return [];

    return auditResult.detectedAnomalies.map((anomaly, i) => {
      let angle = 0;
      let icon = AlertCircle;
      const type = anomaly.type.toLowerCase();

      if (type.includes('network') || type.includes('wifi')) {
        angle = 45;
        icon = Wifi;
      } else if (type.includes('apk') || type.includes('malware') || type.includes('binary')) {
        angle = 135;
        icon = Biohazard;
      } else if (type.includes('bot') || type.includes('ui') || type.includes('input')) {
        angle = 225;
        icon = Ghost;
      } else {
        angle = 315;
        icon = Cpu;
      }

      const radius = anomaly.risk === 'HIGH' ? 30 : anomaly.risk === 'MEDIUM' ? 55 : 80;
      const jitter = (Math.random() - 0.5) * 20;

      const rad = (angle + jitter) * (Math.PI / 180);
      return {
        id: `${i}-${anomaly.type}`,
        type: anomaly.type,
        x: 50 + Math.cos(rad) * radius * 0.42,
        y: 50 + Math.sin(rad) * radius * 0.42,
        risk: anomaly.risk,
        icon
      } as RadarBlip;
    });
  }, [auditResult]);

  useEffect(() => {
    localStorage.setItem('suraksha_atds_active', isActive.toString());
    if (isActive) {
      runRealtimeAudit();
    } else {
      setLogs([]);
      setAuditResult(null);
    }
  }, [isActive]);

  useEffect(() => {
    let frame: any;
    if (isActive) {
      const animate = () => {
        setScanRotation(prev => (prev + 2.2) % 360);
        frame = requestAnimationFrame(animate);
      };
      frame = requestAnimationFrame(animate);
    }
    return () => cancelAnimationFrame(frame);
  }, [isActive]);

  const runRealtimeAudit = async (customLogs?: string) => {
    if (!isActive) return;
    setIsAuditing(true);
    addLog("Initiating Heuristic Pulse...");
    addLog("Mapping Binary Signatures...");

    try {
      const telemetryData = customLogs || `DEVICE: ANDROID_ARM64, PERM_GRID: ACTIVE, APK_SENTINEL: ENABLED`;
      const result = await performNeuralSystemAudit(telemetryData);
      setAuditResult(result);
      addLog(`Audit Sync: ${result.threatsFound} anomalies isolated.`);
    } catch (e) {
      addLog("Sync Error: Link Pulse Weak.");
    } finally {
      setIsAuditing(false);
    }
  };

  const handleToggle = () => {
    const newState = !isActive;
    setIsActive(newState);
    if (newState) {
      addLog("SYSTEM MASTER ARM: TRIGGERED");
    } else {
      addLog("SYSTEM DISARMED");
    }
  };

  return (
    <div className="p-5 space-y-6 pb-40 animate-in fade-in duration-700 font-sans text-slate-900 bg-slate-50 min-h-screen">
      <header className="flex flex-col items-center relative text-center space-y-4">
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('nav-to-dashboard'))}
          className="absolute left-0 top-0 p-3 bg-white border border-slate-100 rounded-2xl text-gray-400 shadow-sm active:scale-90 transition-all z-20"
        >
          <ChevronLeft size={20} />
        </button>

        <div className="relative group">
          <div className={`absolute inset-0 bg-indigo-500/20 rounded-[32px] blur-2xl transition-all duration-700 ${isActive ? 'opacity-100 animate-pulse' : 'opacity-0'}`} />
          <div className="w-20 h-20 bg-slate-950 rounded-[32px] flex items-center justify-center shadow-2xl relative border-4 border-white overflow-hidden group-hover:scale-105 transition-transform">
            <Shield size={36} className={`${isActive ? 'text-indigo-400' : 'text-slate-700'} relative z-10 transition-colors`} />
            {isActive && <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/15 to-transparent animate-pulse" />}
          </div>
        </div>

        <div className="space-y-1">
          <h2 className="text-3xl font-black uppercase tracking-tighter text-slate-900 leading-none">Security Core</h2>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-500">Neural Threat Detection Hub</p>
        </div>
      </header>

      <div className="bg-white rounded-[56px] p-8 shadow-2xl border border-slate-100 space-y-8 relative overflow-hidden">
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${isActive ? 'bg-indigo-600 shadow-lg shadow-indigo-100' : 'bg-slate-100'}`}>
              {isActive ? <Activity size={24} className="text-white animate-pulse" /> : <Activity size={24} className="text-slate-400" />}
            </div>
            <div>
              <h3 className="text-lg font-black uppercase tracking-tight text-slate-900 leading-none">Global Arm Status</h3>
              <p className={`text-[9px] font-black uppercase tracking-widest mt-1.5 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`}>
                {isActive ? 'Neural Perimeter Active' : 'Shield Disarmed'}
              </p>
            </div>
          </div>
          <button
            onClick={handleToggle}
            className={`w-20 h-10 rounded-full p-1 transition-all duration-500 flex items-center ${isActive ? 'bg-indigo-600 shadow-lg shadow-indigo-100' : 'bg-slate-200'}`}
          >
            <div className={`w-8 h-8 rounded-full bg-white shadow-xl transition-transform duration-500 flex items-center justify-center ${isActive ? 'translate-x-10' : 'translate-x-0'}`}>
              <Power size={14} className={isActive ? 'text-indigo-600' : 'text-slate-400'} />
            </div>
          </button>
        </div>

        {isActive && (
          <div className="space-y-8 animate-in zoom-in duration-500">
            <div className="relative w-full aspect-square max-w-[280px] mx-auto bg-slate-950 rounded-[64px] border-8 border-white shadow-2xl overflow-hidden">
              <div className="absolute inset-0 opacity-[0.1] bg-[linear-gradient(rgba(79,70,229,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(79,70,229,0.3)_1px,transparent_1px)] [background-size:20px_20px]" />

              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] origin-center pointer-events-none"
                style={{ transform: `translate(-50%, -50%) rotate(${scanRotation}deg)` }}
              >
                <div className="absolute top-0 left-1/2 w-[40%] h-1/2 bg-gradient-to-r from-indigo-500/20 via-indigo-500/5 to-transparent skew-x-[-15deg]" />
                <div className="absolute top-0 left-1/2 w-[1px] h-1/2 bg-indigo-400 shadow-[0_0_15px_rgba(129,140,248,0.8)]" />
              </div>

              {blips.map((blip) => (
                <div
                  key={blip.id}
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-20 group/blip"
                  style={{ left: `${blip.x}%`, top: `${blip.y}%` }}
                >
                  <div className={`absolute inset-[-10px] rounded-full animate-ping opacity-30 ${blip.risk === 'HIGH' ? 'bg-red-500' : 'bg-indigo-500'}`} />
                  <div className={`relative w-8 h-8 rounded-2xl border-2 border-white shadow-xl flex items-center justify-center transition-all hover:scale-125 ${blip.risk === 'HIGH' ? 'bg-red-600' : 'bg-indigo-600'
                    }`}>
                    <blip.icon size={14} className="text-white" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] px-2 flex items-center justify-between">
          <span>APK Malware Logic</span>
        </h4>

        <div className={`bg-white rounded-[44px] p-8 border-2 transition-all duration-500 shadow-xl overflow-hidden relative group ${isActive ? 'border-indigo-100' : 'border-slate-100 opacity-80 grayscale'}`}>
          <div className="absolute top-0 right-0 p-6 opacity-[0.03] rotate-12 transition-transform group-hover:scale-110"><Cpu size={140} /></div>

          <div className="flex flex-col space-y-6 relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-4 rounded-2xl shadow-lg transition-colors ${isActive ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-400'}`}>
                  <FileSearch size={28} className={isActive ? 'animate-pulse' : ''} />
                </div>
                <div>
                  <h3 className="text-xl font-black uppercase text-slate-900 leading-none">APK Sentinel</h3>
                  <p className="text-[9px] font-bold text-slate-400 uppercase mt-1.5 tracking-widest">Automatic Background Scan</p>
                </div>
              </div>
              <button
                onClick={() => runRealtimeAudit()}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all active:scale-90 ${isActive ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' : 'bg-indigo-600 text-white shadow-indigo-200'
                  }`}
              >
                {isActive ? <RefreshCw size={20} className={isAuditing ? 'animate-spin' : ''} /> : <Play size={20} fill="white" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {isActive && (
        <div className="bg-slate-950 rounded-[44px] p-8 font-mono text-[10px] space-y-4 border border-white/5 shadow-2xl relative overflow-hidden">
          <div className="flex justify-between items-center border-b border-white/10 pb-4">
            <div className="flex items-center gap-2 text-indigo-400">
              <Terminal size={14} />
              <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Live Neural Audit</span>
            </div>
          </div>
          <div className="h-32 overflow-y-auto hide-scrollbar space-y-2">
            {logs.map((log, i) => (
              <div key={i} className="text-indigo-300/70">
                <span className="opacity-40 mr-2">{'>'}</span> {log}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white/80 backdrop-blur-3xl border-t border-slate-100 p-6 z-50 flex items-center justify-between shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${isActive ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
            <ShieldEllipsis size={20} className={isActive ? 'animate-pulse' : ''} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-slate-900 tracking-tight leading-none">Security Loop</p>
            <p className={`text-[8px] font-bold uppercase mt-1 ${isActive ? 'text-green-600' : 'text-slate-400'}`}>
              {isActive ? 'System Protected' : 'Standby Mode'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};