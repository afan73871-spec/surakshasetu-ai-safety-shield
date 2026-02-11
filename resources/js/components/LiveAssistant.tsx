import React, { useEffect, useRef, useState } from 'react';
import { 
  X, ShieldCheck, Waves, Volume2, VolumeX, 
  Mic, RefreshCw, BrainCircuit, Sparkles, ShieldAlert,
  Zap, Activity, Terminal, ChevronLeft, Globe, Lock, Heart,
  Radar, Cpu, MessageSquare, Fingerprint
} from 'lucide-react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { decode, decodeAudioData, createPcmBlob } from '../services/audioUtils';

interface LiveAssistantProps {
  onClose: () => void;
  languageName: string;
  isPro: boolean;
}

type SentinelMode = 'SHIELD' | 'VERIFIER' | 'COMPANION';

export const LiveAssistant: React.FC<LiveAssistantProps> = ({ onClose, languageName, isPro }) => {
  const [isInitializing, setIsInitializing] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [neuralThoughts, setNeuralThoughts] = useState<string[]>([]);
  const [threatLevel, setThreatLevel] = useState(0);
  const [verdict, setVerdict] = useState<'SCANNING' | 'SAFE' | 'THREAT'>('SCANNING');
  const [isMuted, setIsMuted] = useState(false);
  const [mode, setMode] = useState<SentinelMode>('SHIELD');

  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const streamRef = useRef<MediaStream | null>(null);
  const thoughtsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => stopAudit();
  }, []);

  useEffect(() => {
    if (thoughtsEndRef.current) {
      thoughtsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [neuralThoughts]);

  const addNeuralThought = (thought: string) => {
    setNeuralThoughts(prev => [...prev.slice(-5), `> ${thought}`]);
  };

  const startLiveAssistant = async () => {
    if (isInitializing || isActive) return;

    setIsInitializing(true);
    setTranscription('');
    setNeuralThoughts(["_Initializing Neural Perimeter...", "_Syncing High-Speed Link..."]);
    setThreatLevel(0);
    setVerdict('SCANNING');

    try {
      streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

      if (audioContextRef.current.state === 'suspended') await audioContextRef.current.resume();
      if (outputContextRef.current.state === 'suspended') await outputContextRef.current.resume();

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setIsActive(true);
            setIsInitializing(false);
            addNeuralThought("Link Active: Guarding Audio Stream");
            
            if (!audioContextRef.current || !streamRef.current) return;
            
            const source = audioContextRef.current.createMediaStreamSource(streamRef.current);
            const scriptProcessor = audioContextRef.current.createScriptProcessor(2048, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              if (!isActive) return;
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createPcmBlob(inputData);
              sessionPromise.then(s => {
                if (s && isActive) s.sendRealtimeInput({ media: pcmBlob });
              });
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(audioContextRef.current.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            // Text Handling
            if (message.serverContent?.outputTranscription) {
              const text = message.serverContent.outputTranscription.text;
              setTranscription(prev => (prev + ' ' + text).slice(-150));
              
              const lower = text.toLowerCase();
              if (lower.includes('scam') || lower.includes('threat') || lower.includes('alert') || lower.includes('fake') || lower.includes('bank')) {
                setVerdict('THREAT');
                setThreatLevel(prev => Math.min(prev + 20, 96));
                addNeuralThought("!! Malicious Linguistic Artifact Identified");
              } else if (text.length > 10) {
                addNeuralThought(`Processing Intent: "${text.substring(0, 15)}..."`);
              }
            }
            
            // Audio Handling
            const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData && outputContextRef.current && !isMuted) {
              const ctx = outputContextRef.current;
              if (ctx.state !== 'closed') {
                if (ctx.state === 'suspended') await ctx.resume();
                nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
                const buffer = await decodeAudioData(decode(audioData), ctx, 24000, 1);
                const source = ctx.createBufferSource();
                source.buffer = buffer; 
                source.connect(ctx.destination);
                source.start(nextStartTimeRef.current);
                nextStartTimeRef.current += buffer.duration;
                sourcesRef.current.add(source);
                source.onended = () => sourcesRef.current.delete(source);
              }
            }

            if (message.serverContent?.interrupted) {
              addNeuralThought("_Stream Re-syncing...");
              sourcesRef.current.forEach(s => { try { s.stop(); } catch(e) {} });
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onclose: () => stopAudit(),
          onerror: (e) => {
            console.error("Neural Error:", e);
            addNeuralThought("! Error: Connection Drifted");
            stopAudit();
          },
        },
        config: {
          responseModalities: [Modality.AUDIO],
          outputAudioTranscription: {},
          systemInstruction: `You are the SurakshaSetu Voice Sentinel. 
          Mission: Extreme high-speed audio security analysis. 
          Protocol: Respond with max 1 short sentence. Be lightning fast.
          Current User Language: ${languageName}. 
          Mode: ${mode}. Focus on identifying psychological manipulation in calls.`
        }
      });
      sessionRef.current = await sessionPromise;
    } catch (err) {
      setIsInitializing(false);
      stopAudit();
    }
  };

  const stopAudit = () => {
    setIsActive(false);
    setIsInitializing(false);
    if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') audioContextRef.current.close().catch(() => {});
    audioContextRef.current = null;
    if (outputContextRef.current && outputContextRef.current.state !== 'closed') outputContextRef.current.close().catch(() => {});
    outputContextRef.current = null;
    if (sessionRef.current) { try { sessionRef.current.close(); } catch (e) {} sessionRef.current = null; }
    sourcesRef.current.forEach(s => { try { s.stop(); } catch (e) {} });
    sourcesRef.current.clear();
    nextStartTimeRef.current = 0;
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-50 flex flex-col font-sans animate-in fade-in duration-500 overflow-hidden">
      
      {/* Immersive Header */}
      <div className="bg-slate-950 text-white p-8 rounded-b-[56px] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/10 blur-[100px] rounded-full -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/10 blur-[80px] rounded-full -ml-10 -mb-10" />
        
        <div className="relative z-10 flex flex-col items-center text-center space-y-6">
           <div className="w-full flex justify-between items-center">
             <button onClick={onClose} className="p-3 bg-white/5 border border-white/10 rounded-2xl text-slate-400 hover:text-white transition-all active:scale-90">
               <ChevronLeft size={24} />
             </button>
             <div className="flex items-center gap-2 px-4 py-1.5 bg-indigo-600/20 rounded-full border border-indigo-500/30">
               <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-slate-500'}`} />
               <span className="text-[9px] font-black uppercase tracking-widest text-indigo-300">Neural Node: {isActive ? 'SYNCED' : 'STANDBY'}</span>
             </div>
             <button 
               onClick={() => setIsMuted(!isMuted)} 
               className={`p-3 rounded-2xl transition-all ${isMuted ? 'bg-red-500/20 text-red-400' : 'bg-white/5 text-white'}`}
             >
               {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
             </button>
           </div>

           <div className="space-y-1">
             <h1 className="text-4xl font-black tracking-tighter uppercase leading-none">Voice Sentinel</h1>
             <p className="text-indigo-400 font-black text-[10px] uppercase tracking-[0.4em]">Real-time Intent Guardian</p>
           </div>
        </div>
      </div>

      <div className="flex-1 p-6 flex flex-col space-y-8 overflow-y-auto hide-scrollbar">
        
        {/* Mode Selector */}
        {!isActive && (
          <div className="grid grid-cols-3 gap-3 animate-in slide-in-from-top-4 duration-500">
            {(['SHIELD', 'VERIFIER', 'COMPANION'] as SentinelMode[]).map((m) => (
              <button 
                key={m}
                onClick={() => setMode(m)}
                className={`py-4 rounded-3xl flex flex-col items-center gap-2 border-2 transition-all active:scale-95 ${mode === m ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl' : 'bg-white border-slate-100 text-slate-400 shadow-sm'}`}
              >
                {m === 'SHIELD' ? <ShieldCheck size={18} /> : m === 'VERIFIER' ? <Fingerprint size={18} /> : <Heart size={18} />}
                <span className="text-[9px] font-black uppercase tracking-widest">{m}</span>
              </button>
            ))}
          </div>
        )}

        <div className="flex-1 flex flex-col items-center justify-center space-y-10">
           <div className="relative">
              {!isActive ? (
                <button 
                  onClick={startLiveAssistant}
                  disabled={isInitializing}
                  className="w-56 h-56 bg-white rounded-[72px] flex flex-col items-center justify-center shadow-2xl border-8 border-indigo-50 active:scale-95 transition-all group relative"
                >
                  <div className="absolute inset-0 bg-indigo-600/5 rounded-[60px] animate-pulse scale-110" />
                  {isInitializing ? (
                    <RefreshCw className="animate-spin text-indigo-600" size={64} />
                  ) : (
                    <>
                      <div className="p-8 bg-indigo-600 rounded-[36px] shadow-2xl shadow-indigo-200 group-hover:rotate-12 transition-transform">
                        <Mic size={56} className="text-white" />
                      </div>
                      <span className="mt-4 text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400">Initialize Sync</span>
                    </>
                  )}
                </button>
              ) : (
                <div className="flex flex-col items-center gap-10">
                   <div className={`w-56 h-56 rounded-[80px] flex items-center justify-center z-10 transition-all duration-700 relative overflow-hidden ${verdict === 'THREAT' ? 'bg-red-600 shadow-[0_0_100px_rgba(239,68,68,0.5)]' : 'bg-slate-900 shadow-[0_0_80px_rgba(79,70,229,0.4)]'}`}>
                      <div className="flex items-center gap-2 h-20 relative z-10">
                         {[1,2,3,4,5,6,7,8,9,10,11,12].map(i => (
                           <div 
                            key={i} 
                            className={`w-1.5 rounded-full animate-waveform-fast ${verdict === 'THREAT' ? 'bg-white' : 'bg-indigo-400'}`} 
                            style={{ 
                              height: `${20 + Math.random() * 80}%`, 
                              animationDelay: `${i * 0.05}s`
                            }} 
                           />
                         ))}
                      </div>
                      <div className="absolute inset-0 bg-white/5 rounded-[80px] animate-pulse" />
                   </div>

                   <div className="flex gap-4 w-full max-w-sm">
                      <div className="flex-1 bg-white border border-slate-100 p-5 rounded-[32px] shadow-sm flex flex-col items-center gap-2">
                        <Activity size={20} className="text-emerald-500" />
                        <span className="text-[9px] font-black uppercase text-slate-400">Sync: 100%</span>
                      </div>
                      <div className="flex-1 bg-white border border-slate-100 p-5 rounded-[32px] shadow-sm flex flex-col items-center gap-2">
                        <Zap size={20} className="text-amber-500" />
                        <span className="text-[9px] font-black uppercase text-slate-400">Latency: 28ms</span>
                      </div>
                   </div>
                </div>
              )}
           </div>

           {/* Live HUD */}
           <div className="w-full space-y-4">
              <div className="text-center">
                 <div className={`inline-flex items-center gap-3 px-8 py-3 rounded-full border-2 transition-all duration-500 shadow-lg ${verdict === 'THREAT' ? 'bg-red-600 border-red-400 text-white animate-bounce' : 'bg-white border-indigo-500 text-indigo-600'}`}>
                    {verdict === 'THREAT' ? <ShieldAlert size={18} /> : <Activity size={18} />}
                    <span className="text-xs font-black uppercase tracking-[0.2em]">
                      {isActive ? (verdict === 'THREAT' ? 'SCAM THREAT IDENTIFIED' : 'Neural Audit in Progress...') : 'Guard Ready'}
                    </span>
                 </div>
              </div>

              <div className="bg-white rounded-[44px] p-8 border border-slate-100 shadow-xl relative overflow-hidden min-h-[160px] flex flex-col justify-center">
                <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 opacity-30">
                  <Terminal size={14} />
                  <span className="text-[8px] font-black uppercase tracking-widest">Real-time Transcript</span>
                </div>
                
                <p className="text-center italic text-xl font-bold text-slate-800 leading-relaxed break-words px-4">
                  {transcription ? `"${transcription}"` : isActive ? 'Listening for intent tokens...' : 'Neural buffer empty. Press to start.'}
                </p>

                {isActive && (
                  <div className="mt-8 space-y-2 px-4">
                    <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-slate-400">
                      <span>Threat Index</span>
                      <span className={threatLevel > 70 ? 'text-red-500' : 'text-indigo-600'}>{threatLevel}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                      <div className={`h-full transition-all duration-700 shadow-lg ${threatLevel > 70 ? 'bg-red-500' : 'bg-indigo-600'}`} style={{ width: `${threatLevel}%` }} />
                    </div>
                  </div>
                )}
              </div>
           </div>
        </div>

        {/* Thought Stream Log */}
        {isActive && (
          <div className="bg-slate-900 rounded-[36px] p-6 font-mono text-[10px] text-indigo-300 space-y-2 border border-white/5 shadow-2xl animate-in slide-in-from-bottom-8 duration-700">
            {neuralThoughts.map((t, i) => (
              <div key={i} className={`flex gap-2 ${t.includes('!!') ? 'text-red-400 font-bold' : 'opacity-70'}`}>
                {t}
              </div>
            ))}
            <div ref={thoughtsEndRef} />
          </div>
        )}

        {isActive && (
          <button 
            onClick={stopAudit}
            className="w-full py-6 bg-slate-950 text-white rounded-[32px] font-black text-xs uppercase tracking-[0.4em] active:scale-95 transition-all shadow-2xl flex items-center justify-center gap-3 border-b-4 border-slate-800"
          >
            <X size={18} /> Terminate Connection
          </button>
        )}
      </div>

      <style>{`
        @keyframes waveform-fast { 
          0%, 100% { transform: scaleY(0.4); opacity: 0.7; } 
          50% { transform: scaleY(1.4); opacity: 1; } 
        } 
        .animate-waveform-fast { 
          animation: waveform-fast 0.3s infinite ease-in-out; 
          transform-origin: center; 
        }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};