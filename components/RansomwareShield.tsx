import React, { useState, useEffect } from 'react';
import {
    ShieldAlert, Activity, Lock, Unlock,
    Terminal, Zap, AlertCircle, RefreshCw,
    ShieldCheck, HardDrive, Cpu, Search,
    XCircle, Power, WifiOff, BrainCircuit, ChevronLeft
} from 'lucide-react';
import { apiClient } from '../services/apiService';

interface RansomwareShieldProps {
    onBack: () => void;
}

export const RansomwareShield: React.FC<RansomwareShieldProps> = ({ onBack }) => {
    const [isScanning, setIsScanning] = useState(true);
    const [threatData, setThreatData] = useState<any>(null);
    const [isIsolated, setIsIsolated] = useState(false);
    const [showLogs, setShowLogs] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);
    const [entropyHistory, setEntropyHistory] = useState<number[]>([]);

    const addLog = (msg: string) => {
        setLogs(prev => [msg, ...prev].slice(0, 10));
    };

    const performScan = async () => {
        setIsScanning(true);
        addLog("Initializing Safety Watch Engine...");

        try {
            const result = await apiClient.analyzeRansomwareThreat();
            setThreatData(result);
            setEntropyHistory(prev => [...prev, result.entropy].slice(-20));

            if (result.threatLevel === 'CRITICAL' || result.threatLevel === 'HIGH') {
                addLog(`ACTIVITY SPIKE: ${result.threatLevel}`);
                result.detectedPatterns.forEach((p: string) => addLog(`Warning: ${p}`));
            } else {
                addLog("Safety Watch Clear: Normal Activity");
            }
        } catch (e) {
            addLog("Checking status...");
        } finally {
            setIsScanning(false);
        }
    };

    useEffect(() => {
        performScan();
        const interval = setInterval(performScan, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleIsolate = () => {
        setIsIsolated(!isIsolated);
        addLog(isIsolated ? "Restoring Connection..." : "EMERGENCY: SYSTEM SECURED");
    };

    const getStatusInfo = () => {
        if (isIsolated) return { label: 'PANIC MODE ACTIVE', sub: 'Your data is now locked and safe from all external access.', color: 'text-indigo-400', bg: 'bg-indigo-600' };
        if (threatData?.threatLevel === 'CRITICAL') return { label: 'ATTACK DETECTED!', sub: 'AI has spotted suspicious file activity. Press Panic Mode now!', color: 'text-red-500', bg: 'bg-red-600' };
        if (threatData?.threatLevel === 'HIGH') return { label: 'HIGH ACTIVITY', sub: 'Unusual patterns detected. Monitoring closely.', color: 'text-amber-500', bg: 'bg-amber-600' };
        return { label: 'SYSTEM SAFE', sub: 'Suraksha AI is watching your files. No threats found.', color: 'text-green-500', bg: 'bg-green-600' };
    };

    const status = getStatusInfo();

    return (
        <div className="min-h-screen bg-slate-950 text-white font-sans flex flex-col p-6 pb-32 overflow-hidden">
            {/* Background Glow */}
            <div className={`absolute top-0 right-0 w-[500px] h-[500px] blur-[150px] rounded-full -mr-40 -mt-40 transition-colors duration-1000 ${isIsolated ? 'bg-indigo-600/30' :
                threatData?.threatLevel === 'CRITICAL' ? 'bg-red-600/40' :
                    threatData?.threatLevel === 'HIGH' ? 'bg-amber-600/30' : 'bg-green-600/20'
                }`} />

            {/* Simple Status Bar */}
            <div className={`relative z-10 mb-6 p-4 rounded-2xl flex items-center justify-between border ${isIsolated ? 'bg-indigo-900/40 border-indigo-500/50' : threatData?.threatLevel === 'CRITICAL' ? 'bg-red-900/40 border-red-500/50' : 'bg-white/5 border-white/10'}`}>
                <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${isScanning ? 'animate-ping' : ''} ${status.bg}`} />
                    <span className={`text-[11px] font-black uppercase tracking-widest ${status.color}`}>{status.label}</span>
                </div>
                <span className="text-[10px] font-bold text-white/40 uppercase">Guard Active</span>
            </div>

            {/* Header */}
            <div className="relative z-10 flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 border border-white/5 text-slate-400">
                        <ChevronLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black uppercase tracking-tighter">AI Guard</h1>
                        <div className="flex items-center gap-2 mt-1">
                            <p className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.2em]">Safety Watch: {isScanning ? 'Checking Files...' : 'Watching'}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="relative z-10 space-y-6">
                {/* Main Action Card */}
                <div className={`bg-slate-900/60 border rounded-[48px] p-8 flex flex-col items-center justify-center text-center gap-6 transition-all duration-500 ${threatData?.threatLevel === 'CRITICAL' ? 'border-red-500/50 shadow-[0_0_50px_rgba(239,68,68,0.2)]' : 'border-white/10'}`}>
                    <div className="relative">
                        <div className={`w-32 h-32 rounded-[48px] flex items-center justify-center transition-all duration-500 ${isIsolated ? 'bg-indigo-600 shadow-[0_0_60px_rgba(79,102,241,0.5)] scale-110' :
                            threatData?.threatLevel === 'CRITICAL' ? 'bg-red-600 shadow-[0_0_60px_rgba(239,68,68,0.5)] animate-bounce' :
                                'bg-slate-800'
                            }`}>
                            {isIsolated ? <ShieldCheck size={64} className="text-white" /> :
                                threatData?.threatLevel === 'CRITICAL' ? <AlertCircle size={64} className="text-white" /> :
                                    <ShieldCheck size={64} className={threatData?.threatLevel === 'HIGH' ? 'text-amber-500' : 'text-green-500'} />
                            }
                        </div>
                    </div>
                    <div>
                        <h2 className="text-4xl font-black tracking-tighter uppercase leading-none">
                            {isIsolated ? 'Protected' : (threatData?.threatLevel === 'CRITICAL' ? 'Threat!' : 'Active')}
                        </h2>
                        <p className="text-xs text-slate-400 font-bold mt-3 px-4 leading-relaxed uppercase">
                            {status.sub}
                        </p>
                    </div>

                    <div className="w-full space-y-4">
                        <button
                            onClick={handleIsolate}
                            className={`w-full py-7 rounded-[36px] font-black text-sm uppercase tracking-[0.3em] transition-all active:scale-95 flex flex-col items-center justify-center gap-1 shadow-2xl ${isIsolated ? 'bg-white text-indigo-900' : 'bg-red-600 text-white shadow-red-600/30'}`}
                        >
                            <span>{isIsolated ? 'Turn Off Panic Mode' : 'Panic Mode: Secure Now'}</span>
                            <span className="text-[8px] opacity-70 tracking-[0.2em]">{isIsolated ? 'Click to resume normal use' : 'Use only during an attack!'}</span>
                        </button>

                        {threatData && (
                            <button
                                onClick={() => {
                                    const event = new CustomEvent('ask-suraksha-ai', {
                                        detail: { question: `Explain the ransomware threat heuristics: "${threatData.detectedPatterns?.join(', ') || 'Scanning...'}". Activity Level: ${threatData.entropy}. Is my data at risk?` }
                                    });
                                    window.dispatchEvent(event);
                                }}
                                className="w-full py-4 bg-white/5 border border-white/10 rounded-[28px] text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:bg-white/10 transition-all flex items-center justify-center gap-2 shadow-sm"
                            >
                                <BrainCircuit size={16} /> Deep AI Explainer
                            </button>
                        )}
                    </div>
                </div>

                {/* Simplified Activity Meter */}
                <div className="bg-slate-900 border border-white/10 rounded-[40px] p-8 space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Activity size={20} className="text-indigo-400" />
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-300">File Activity Level</h3>
                        </div>
                        <span className={`text-xl font-black ${threatData?.entropy > 0.7 ? 'text-red-500' : 'text-green-500'}`}>
                            {threatData?.entropy > 0.7 ? 'DANGER' : 'SAFE'}
                        </span>
                    </div>

                    <div className="relative h-4 bg-slate-800 rounded-full overflow-hidden border border-white/5">
                        <div
                            className={`h-full transition-all duration-1000 ${threatData?.entropy > 0.7 ? 'bg-red-500' : 'bg-green-500'}`}
                            style={{ width: `${(threatData?.entropy || 0) * 100}%` }}
                        />
                        <div className="absolute top-0 left-0 w-full h-full flex justify-between px-4">
                            {[1, 2, 3, 4, 5].map(i => <div key={i} className="w-px h-full bg-white/10" />)}
                        </div>
                    </div>

                    <div className="flex justify-between text-[10px] font-black uppercase text-slate-500 tracking-widest">
                        <span>Low Activity</span>
                        <span>High Activity</span>
                    </div>
                </div>

                {/* Simplified Live Info */}
                <div className="bg-white/5 border border-white/10 rounded-[32px] p-6 flex items-center gap-4 shadow-sm">
                    <div className="p-3 bg-indigo-600/20 rounded-2xl text-indigo-400">
                        <ShieldCheck size={24} />
                    </div>
                    <div>
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-white">Continuous AI Shield</h4>
                        <p className="text-[9px] text-slate-500 font-bold uppercase mt-1 leading-relaxed">
                            System is watching for any secret attempts to lock your photos or documents.
                        </p>
                    </div>
                </div>

                {/* Collapsible Technical Logs */}
                <div className="space-y-4">
                    <button
                        onClick={() => setShowLogs(!showLogs)}
                        className="w-full py-4 text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 hover:text-indigo-400 transition-colors flex items-center justify-center gap-2"
                    >
                        {showLogs ? 'Hide Technical Details' : 'Show Technical Scan Logs'}
                    </button>

                    {showLogs && (
                        <div className="bg-black/40 border border-white/5 rounded-[32px] p-6 font-mono animate-in slide-in-from-bottom-2 duration-300">
                            <div className="flex items-center gap-3 mb-4 border-b border-white/5 pb-4">
                                <Terminal size={14} className="text-indigo-400" />
                                <h3 className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-500">Node Command Flow</h3>
                            </div>
                            <div className="space-y-1 max-h-32 overflow-y-auto hide-scrollbar">
                                {logs.map((log, i) => (
                                    <p key={i} className={`text-[10px] ${log.includes('CRITICAL') || log.includes('THREAT') ? 'text-red-400 font-bold' : 'text-slate-400'}`}>
                                        <span className="opacity-30 mr-2">[{new Date().toLocaleTimeString([], { hour12: false })}]</span>
                                        {log}
                                    </p>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
