import React, { useEffect, useRef, useState } from 'react';
import { ShieldAlert, X, Zap, Activity, Shield, Radio, ShieldCheck, Waves, Clock, Volume2, VolumeX, Mic, RefreshCw } from 'lucide-react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { decode, decodeAudioData, createPcmBlob } from '../services/audioUtils';

interface LiveAssistantProps {
  onClose: () => void;
  languageName: string;
  isPro: boolean;
}

export const LiveAssistant: React.FC<LiveAssistantProps> = ({ onClose, languageName, isPro }) => {
  const [isInitializing, setIsInitializing] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [threatLevel, setThreatLevel] = useState(0);
  const [verdict, setVerdict] = useState<'SCANNING' | 'REAL' | 'THREAT'>('SCANNING');
  const [isMuted, setIsMuted] = useState(false);

  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => stopAudit();
  }, []);

  const startLiveAudit = async () => {
    if (isInitializing || isActive) return;
    setIsInitializing(true);
    setTranscription('');
    setThreatLevel(0);
    setVerdict('SCANNING');

    try {
      streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

      // Initialize AI with the environment key directly
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setIsActive(true);
            setIsInitializing(false);
            if (!audioContextRef.current || !streamRef.current) return;
            
            const source = audioContextRef.current.createMediaStreamSource(streamRef.current);
            const scriptProcessor = audioContextRef.current.createScriptProcessor(4096, 1, 1);
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
            if (message.serverContent?.outputTranscription) {
              const text = message.serverContent.outputTranscription.text;
              setTranscription(prev => (prev + ' ' + text).slice(-200));
              
              const lower = text.toLowerCase();
              if (lower.includes('bank') || lower.includes('arrest') || lower.includes('money') || lower.includes('urgent')) {
                setThreatLevel(prev => Math.min(prev + 25, 98));
                setVerdict('THREAT');
              }
            }
            
            const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData && outputContextRef.current && !isMuted) {
              const ctx = outputContextRef.current;
              if (ctx.state !== 'closed') {
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
              sourcesRef.current.forEach(s => {
                try { s.stop(); } catch(e) {}
              });
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onclose: () => stopAudit(),
          onerror: (e: any) => {
            console.error("Voice Audit Hub Error:", e);
            stopAudit();
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          outputAudioTranscription: {},
          systemInstruction: "You are the SurakshaSetu Voice Sentinel. Listen to the conversation and provide security analysis. If you detect a scam, speak a warning and flag it."
        }
      });
      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error("Neural Handshake Failure:", err);
      setIsInitializing(false);
      stopAudit();
    }
  };

  const stopAudit = () => {
    setIsActive(false);
    setIsInitializing(false);
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }

    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
    }
    audioContextRef.current = null;

    if (outputContextRef.current && outputContextRef.current.state !== 'closed') {
      outputContextRef.current.close().catch(() => {});
    }
    outputContextRef.current = null;

    if (sessionRef.current) {
      try {
        sessionRef.current.close();
      } catch (e) {}
      sessionRef.current = null;
    }

    sourcesRef.current.forEach(s => {
      try { s.stop(); } catch(e) {}
    });
    sourcesRef.current.clear();
    nextStartTimeRef.current = 0;
  };

  return (
    <div className={`fixed inset-0 z-[100] backdrop-blur-3xl flex flex-col items-center justify-center p-6 text-white animate-in fade-in duration-300 transition-colors duration-1000 ${verdict === 'THREAT' ? 'bg-red-950/95' : verdict === 'REAL' ? 'bg-emerald-950/95' : 'bg-indigo-950/95'}`}>
      
      <div className="absolute top-6 right-6 flex items-center gap-3">
        <button 
          onClick={() => setIsMuted(!isMuted)} 
          className={`p-3 rounded-full transition-all ${isMuted ? 'bg-red-500/20 text-red-400' : 'bg-white/10 text-white'}`}
        >
          {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
        <button onClick={() => { stopAudit(); onClose(); }} className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-all"><X size={20} /></button>
      </div>

      <div className="relative mb-12">
        {!isActive ? (
          <button 
            onClick={startLiveAudit}
            disabled={isInitializing}
            className="w-32 h-32 bg-indigo-600 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(99,102,241,0.5)] active:scale-95 transition-transform disabled:opacity-50"
          >
            {isInitializing ? <RefreshCw className="animate-spin text-white" size={40} /> : <Mic size={48} className="text-white" />}
          </button>
        ) : (
          <div className="relative flex items-center justify-center">
            <div className={`w-32 h-32 rounded-full flex items-center justify-center z-10 transition-all duration-700 ${verdict === 'THREAT' ? 'bg-red-600 shadow-[0_0_60px_rgba(220,38,38,0.8)]' : 'bg-indigo-600 shadow-[0_0_60px_rgba(99,102,241,0.6)]'}`}>
              <Waves size={56} className="animate-pulse" />
            </div>
            {[1, 2, 3].map(i => (
              <div key={i} className={`absolute inset-0 rounded-full animate-ping opacity-20 bg-indigo-400`} style={{ animationDelay: `${i * 0.4}s` }} />
            ))}
          </div>
        )}
      </div>

      <div className="text-center space-y-4 mb-10">
        <div className={`px-8 py-3 rounded-full border-4 shadow-2xl flex items-center gap-3 transform transition-all duration-500 scale-110 ${verdict === 'THREAT' ? 'bg-red-600 border-red-400' : 'bg-indigo-600 border-indigo-400'}`}>
          <span className="text-sm font-black uppercase tracking-[0.2em]">
            {!isActive ? 'INITIATE NEURAL AUDIT' : verdict === 'THREAT' ? 'THREAT DETECTED' : 'AUDITING LIVE VOICE'}
          </span>
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">{isActive ? 'Session Active' : 'Neural Hub Standby'}</p>
      </div>

      <div className="w-full max-w-sm bg-black/40 border border-white/10 rounded-[40px] p-8 space-y-6 shadow-2xl relative overflow-hidden backdrop-blur-xl">
        <div className="flex justify-between items-center px-2">
           <div className="flex items-center gap-2">
             <Radio size={14} className={isActive ? "text-indigo-400 animate-pulse" : "text-gray-500"} />
             <span className="text-[9px] font-black uppercase text-indigo-300">Analysis Console</span>
           </div>
           <div className="flex items-center gap-2">
             <div className={`w-1.5 h-1.5 rounded-full ${threatLevel > 50 ? 'bg-red-500' : 'bg-green-500'} animate-pulse`} />
             <span className="text-[9px] font-black uppercase text-white/50">{threatLevel}% Risk</span>
           </div>
        </div>
        
        <div className="max-h-[160px] min-h-[80px] overflow-y-auto px-2 py-1 hide-scrollbar">
          <p className="text-center italic text-white font-bold opacity-80 leading-relaxed break-words text-sm">
            {transcription ? `"${transcription}..."` : isActive ? 'Listening for voice signals...' : 'Ready to analyze audio context...'}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
           <div className="space-y-1">
              <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Sentiment</p>
              <p className="text-xl font-black text-indigo-400 uppercase text-[10px]">Neural-Safe</p>
           </div>
           <div className="space-y-1 text-right">
              <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Protocol</p>
              <p className="text-xl font-black text-emerald-400 uppercase text-[10px]">Biometric</p>
           </div>
        </div>
      </div>

      <p className="mt-auto text-[8px] font-black uppercase tracking-[0.4em] text-indigo-400/50 pb-6">SurakshaSetu Neural Guard v4.5</p>
    </div>
  );
};