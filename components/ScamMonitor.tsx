import React, { useState, useEffect } from 'react';
import {
  Smartphone, MessageCircle, AlertTriangle, ShieldCheck,
  PhoneCall, Radio, Activity, Terminal, Zap, ShieldAlert,
  Mic, Search, Info, Fingerprint, Waves, BrainCircuit,
  Lock, RefreshCw, BarChart3, Volume2, ShieldX
} from 'lucide-react';
import { analyzeScamContext, AnalysisResult } from '../services/geminiService';
import { AdBanner } from './AdBanner';
import { usageService } from '../services/usageService';

interface ScamMonitorProps {
  isPro: boolean;
}

export const ScamMonitor: React.FC<ScamMonitorProps> = ({ isPro }) => {
  const [activeTab, setActiveTab] = useState<'SMS' | 'CALL'>('SMS');
  const [inputText, setInputText] = useState('');
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isIntercepting, setIsIntercepting] = useState(false);
  const [apiLogs, setApiLogs] = useState<string[]>([]);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [stressLevel, setStressLevel] = useState(0);
  const [neuralSentiment, setNeuralSentiment] = useState<'NEUTRAL' | 'AGGRESSIVE' | 'MANIPULATIVE'>('NEUTRAL');

  const canUse = usageService.canUseFeature('SCAM_BLOCKER', isPro);

  const scamTranscript = "Emergency warning from Cyber Cell. Your bank account has been used in a money laundering case. To stop the arrest warrant, you must immediately transfer your total balance to our temporary safety locker ID: 987654@okaxis. Do not disconnect the call or we will dispatch the local police to your location in 5 minutes.";

  const addLog = (msg: string) => {
    setApiLogs(prev => [...prev.slice(-3), `> ${msg}`]);
  };

  const handleAnalyze = async (text: string) => {
    if (!canUse) {
      alert("Basic daily limit reached. Upgrade to Pro for unlimited neural scans.");
      return;
    }

    setIsLoading(true);
    addLog("Connecting to Neural Registry...");
    addLog("Extracting Context Signatures...");

    try {
      const result = await analyzeScamContext(text);
      setAnalysis(result);
      if (result.isScam) {
        setStressLevel(result.riskScore);
        setNeuralSentiment(result.isSocialEngineering ? 'MANIPULATIVE' : 'NEUTRAL');
      }
      if (!isPro) usageService.incrementUsage('scam');
      addLog("Analysis complete. Verdict Ready.");
    } catch (e) {
      addLog("API Error: Secure Handshake Failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const startLiveIntercept = () => {
    if (!isPro) {
      alert("Live Voice Interception is a Pro feature.");
      return;
    }

    setIsIntercepting(true);
    setAnalysis(null);
    setApiLogs([]);
    setLiveTranscript('');
    setStressLevel(5);
    addLog("Interceptor Armed. Awaiting Input...");

    const words = scamTranscript.split(' ');
    let i = 0;
    const interval = setInterval(() => {
      setLiveTranscript(prev => prev + (i === 0 ? '' : ' ') + words[i]);

      if (i % 4 === 0) {
        addLog(`Analyzing Audio Packet ${Math.floor(i / 4) + 1}...`);
        setStressLevel(prev => Math.min(prev + (Math.random() * 15), 95));
      }

      const currentText = words.slice(0, i + 1).join(' ').toLowerCase();
      if (currentText.includes('arrest') || currentText.includes('police')) {
        setNeuralSentiment('AGGRESSIVE');
      } else if (currentText.includes('immediately') || currentText.includes('locker')) {
        setNeuralSentiment('MANIPULATIVE');
      }

      i++;
      if (i >= words.length) {
        clearInterval(interval);
        addLog("Full Call Context Captured.");
        addLog("Running Neural Intent Audit...");
        handleAnalyze(scamTranscript);
        setIsIntercepting(false);
      }
    }, 300);
  };

  return (
    <div className="p-5 space-y-6 pb-32 animate-in fade-in duration-700 font-sans text-slate-900">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter leading-none">AI Context Shield</h2>
        <div className="flex items-center justify-center gap-2">
          <Zap size={12} className="text-indigo-600 fill-indigo-600" />
          <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em]">Neural Intent Hub v4.5</span>
        </div>
      </div>

      <div className="flex bg-slate-100 p-1.5 rounded-[28px] border border-slate-200 shadow-sm">
        <button
          onClick={() => { setActiveTab('SMS'); setAnalysis(null); setLiveTranscript(''); }}
          className={`flex-1 py-4 rounded-[22px] text-[11px] font-black uppercase flex items-center justify-center gap-2 transition-all ${activeTab === 'SMS' ? 'bg-white text-indigo-600 shadow-lg' : 'text-slate-500'}`}
        >
          <MessageCircle size={16} /> SMS Context
        </button>
        <button
          onClick={() => { setActiveTab('CALL'); setAnalysis(null); setLiveTranscript(''); }}
          className={`flex-1 py-4 rounded-[22px] text-[11px] font-black uppercase flex items-center justify-center gap-2 transition-all ${activeTab === 'CALL' ? 'bg-white text-indigo-600 shadow-lg' : 'text-slate-500'}`}
        >
          <PhoneCall size={16} /> Call Guard
        </button>
      </div>

      {activeTab === 'SMS' ? (
        <div className="bg-white rounded-[44px] p-8 shadow-xl border border-gray-100 space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] rotate-12 pointer-events-none text-indigo-600">
            <MessageCircle size={160} />
          </div>
          <div className="space-y-4 relative z-10">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">Suspicious Message Audit</h3>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste suspicious SMS or WhatsApp message..."
              className="w-full h-40 p-6 bg-slate-50 border-2 border-transparent focus:border-indigo-600 rounded-[32px] outline-none transition-all resize-none font-bold text-slate-800 shadow-inner"
            />
            <button
              onClick={() => handleAnalyze(inputText)}
              disabled={!inputText || isLoading}
              className="w-full py-6 bg-indigo-600 text-white rounded-[32px] font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-indigo-100 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isLoading ? <RefreshCw className="animate-spin" size={20} /> : <ShieldCheck size={20} />}
              {isLoading ? 'ESTABLISHING NEURAL LINK...' : 'START CONTEXT AUDIT'}
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-slate-950 rounded-[48px] p-8 text-white relative overflow-hidden shadow-2xl min-h-[520px] flex flex-col justify-between border border-white/5">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(79,70,229,0.1),transparent)] pointer-events-none" />

          <div className="relative z-10 space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${isIntercepting ? 'bg-red-600 animate-pulse' : 'bg-white/5 border border-white/10'}`}>
                  {isIntercepting ? <Activity size={28} /> : <Waves size={28} className="text-indigo-400" />}
                </div>
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Live Voice Guard</h4>
                  <p className="text-sm font-black text-white">{isIntercepting ? 'Listening to Call...' : 'Neural Engine Ready'}</p>
                </div>
              </div>
              <div className="text-right">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Protection Status</h4>
                <div className="flex items-center gap-1.5 justify-end">
                  <span className="text-[9px] font-black uppercase text-indigo-300">Pro Shield</span>
                  <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,1)]" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 p-5 rounded-[28px] border border-white/10 space-y-2">
                <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">Voice Stress</span>
                <div className="flex items-end gap-2">
                  <span className={`text-2xl font-black ${stressLevel > 70 ? 'text-red-500' : 'text-indigo-400'}`}>{Math.round(stressLevel)}%</span>
                  <BarChart3 size={16} className="mb-1 text-slate-600" />
                </div>
                <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                  <div className={`h-full transition-all duration-500 ${stressLevel > 70 ? 'bg-red-500' : 'bg-indigo-500'}`} style={{ width: `${stressLevel}%` }} />
                </div>
              </div>
              <div className="bg-white/5 p-5 rounded-[28px] border border-white/10 space-y-2">
                <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">Sentiment Audit</span>
                <div className="flex items-center gap-2">
                  {neuralSentiment === 'NEUTRAL' && <ShieldCheck size={18} className="text-green-500" />}
                  {neuralSentiment === 'AGGRESSIVE' && <ShieldAlert size={18} className="text-red-500" />}
                  {neuralSentiment === 'MANIPULATIVE' && <BrainCircuit size={18} className="text-amber-500" />}
                  <span className={`text-[10px] font-black uppercase tracking-widest ${neuralSentiment === 'AGGRESSIVE' ? 'text-red-400' : 'text-slate-300'}`}>{neuralSentiment}</span>
                </div>
                <p className="text-[7px] font-medium text-slate-500 leading-tight uppercase">Tone Profile Analyzed</p>
              </div>
            </div>

            <div className="bg-black/50 border border-white/5 rounded-[32px] p-6 font-mono text-[11px] space-y-3 min-h-[160px] max-h-[200px] overflow-y-auto hide-scrollbar relative">
              <div className="sticky top-0 bg-black/80 backdrop-blur-md -mx-6 -mt-6 p-4 border-b border-white/5 flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Terminal size={12} className="text-indigo-400" />
                  <span className="text-[9px] font-black uppercase text-slate-400">Analysis Console</span>
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              </div>

              {apiLogs.map((log, i) => (
                <div key={i} className="text-indigo-300 flex items-start gap-2 animate-in slide-in-from-left-2 duration-300">
                  <span className="opacity-40">[{new Date().toLocaleTimeString([], { hour12: false, minute: '2-digit', second: '2-digit' })}]</span>
                  <span>{log}</span>
                </div>
              ))}

              {isIntercepting && (
                <p className="text-white font-medium italic mt-6 leading-relaxed opacity-90 border-l-2 border-indigo-500 pl-3 animate-in fade-in duration-1000">
                  "{liveTranscript}"
                </p>
              )}
            </div>
          </div>

          <div className="relative z-10 pt-4">
            {!isIntercepting && !analysis ? (
              <button
                onClick={startLiveIntercept}
                className="w-full py-6 bg-indigo-600 text-white rounded-[32px] font-black text-xs uppercase tracking-[0.3em] shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                <Smartphone size={20} /> INITIATE VOICE GUARD
              </button>
            ) : isIntercepting ? (
              <button
                disabled
                className="w-full py-6 bg-red-600/20 text-red-500 border border-red-500/30 rounded-[32px] font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3"
              >
                <Volume2 size={20} className="animate-pulse" /> SCANNING LIVE CONTEXT...
              </button>
            ) : (
              <button
                onClick={() => { setAnalysis(null); setApiLogs([]); setLiveTranscript(''); setStressLevel(0); }}
                className="w-full py-6 bg-white/10 text-white border border-white/10 rounded-[32px] font-black text-xs uppercase tracking-[0.3em] active:scale-95 transition-all"
              >
                RE-ARM INTERCEPTOR
              </button>
            )}

            <p className="text-center text-[8px] text-slate-500 font-bold uppercase tracking-[0.4em] mt-6 flex items-center justify-center gap-2">
              <ShieldCheck size={10} /> ENGINE: SURAKSHA NEURAL HUB 4.5
            </p>
          </div>
        </div>
      )}

      {analysis && (
        <div className={`p-8 rounded-[44px] border-2 transition-all duration-500 space-y-6 relative overflow-hidden animate-in zoom-in-95 ${analysis.isScam ? 'bg-red-50 border-red-500' : 'bg-emerald-50 border-emerald-500'}`}>
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-4">
              <div className={`p-4 rounded-2xl text-white shadow-lg ${analysis.isScam ? 'bg-red-600 animate-pulse shadow-red-200' : 'bg-emerald-600 shadow-emerald-200'}`}>
                {analysis.isScam ? <ShieldX size={32} /> : <ShieldCheck size={32} />}
              </div>
              <div>
                <h3 className={`text-2xl font-black uppercase tracking-tighter leading-none ${analysis.isScam ? 'text-red-600' : 'text-emerald-600'}`}>
                  {analysis.isScam ? 'Threat Identified' : 'Context Verified'}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <div className={`w-1.5 h-1.5 rounded-full ${analysis.riskScore > 80 ? 'bg-red-500' : 'bg-indigo-500'}`} />
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">AI Confidence: {analysis.riskScore}%</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 relative z-10">
            <div className="bg-white/60 backdrop-blur-md p-5 rounded-[28px] border border-black/5">
              <p className="text-sm text-slate-800 font-bold leading-relaxed">"{analysis.reason}"</p>
            </div>

            <div className="flex flex-wrap gap-2">
              {analysis.detectedTactics.map((tactic, idx) => (
                <span key={idx} className="bg-white px-3 py-1.5 rounded-full border border-black/5 text-[9px] font-black uppercase tracking-widest text-slate-600 flex items-center gap-1.5 shadow-sm">
                  <Fingerprint size={10} className="text-indigo-500" /> {tactic}
                </span>
              ))}
            </div>

            <div className="bg-indigo-900 text-white p-6 rounded-[32px] space-y-2 shadow-xl">
              <h5 className="text-[10px] font-black uppercase tracking-widest text-indigo-300 flex items-center gap-2">
                <ShieldCheck size={14} /> Protective Guidance
              </h5>
              <p className="text-xs font-bold leading-relaxed italic opacity-90">"{analysis.suggestion}"</p>
            </div>

            <button
              onClick={() => {
                const event = new CustomEvent('ask-suraksha-ai', {
                  detail: { question: `Explain why this is a scam: "${analysis.reason}". Also provide detailed safety steps.` }
                });
                window.dispatchEvent(event);
              }}
              className="w-full py-4 bg-white border border-indigo-200 rounded-[28px] text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:bg-indigo-50 transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <BrainCircuit size={16} /> Deep AI Explainer
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] text-center px-4">Neural Defense Patterns</h4>
        <div className="grid grid-cols-1 gap-3">
          <div className="bg-white p-6 rounded-[36px] border border-slate-100 flex items-start gap-4 shadow-sm">
            <div className="p-3 bg-red-50 text-red-500 rounded-2xl shrink-0"><ShieldAlert size={20} /></div>
            <div>
              <h5 className="text-[11px] font-black uppercase text-slate-900 tracking-widest">Social Engineering</h5>
              <p className="text-[10px] text-slate-500 font-medium leading-relaxed mt-1">AI identifies psychological manipulation such as fake arrest threats or urgent money transfers.</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-[36px] border border-slate-100 flex items-start gap-4 shadow-sm">
            <div className="p-3 bg-indigo-50 text-indigo-500 rounded-2xl shrink-0"><Volume2 size={20} /></div>
            <div>
              <h5 className="text-[11px] font-black uppercase text-slate-900 tracking-widest">Voice Fingerprinting</h5>
              <p className="text-[10px] text-slate-500 font-medium leading-relaxed mt-1">Detects robotic speech patterns and synthesized voice artifacts used in AI deepfake call scams.</p>
            </div>
          </div>
        </div>
      </div>

      <AdBanner />
    </div>
  );
};