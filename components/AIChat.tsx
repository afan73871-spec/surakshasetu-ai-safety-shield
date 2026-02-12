import React, { useEffect, useRef, useState } from 'react';
import {
  Mic, Send, Sparkles, X, Zap, RefreshCw,
  Activity, Shield, LogOut, ChevronLeft,
  BrainCircuit, Volume2, Clock, VolumeX, MessageSquare, Waves
} from 'lucide-react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { createPcmBlob, decode, decodeAudioData } from '../services/audioUtils';
import { chatWithSurakshaAI } from '../services/geminiService';
import { usageService } from '../services/usageService';

interface Message {
  id: string;
  role: 'user' | 'ai';
  text: string;
  timestamp: number;
}

const SUGGESTIONS = [
  "Hindi mein baat karo",
  "How to stop scam calls?",
  "Is this link safe?",
  "Safety for parents"
];

export const AIChat: React.FC<{ languageName: string; isPro: boolean; onLogout?: () => void }> = ({ languageName, isPro, onLogout }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState<'IDLE' | 'CONNECTING' | 'ACTIVE'>('IDLE');
  const [transcription, setTranscription] = useState('');
  const [credits, setCredits] = useState<number | string>(usageService.getRemainingCredits(isPro).chat);
  const [isMuted, setIsMuted] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const voiceScrollRef = useRef<HTMLDivElement>(null);
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    if (voiceScrollRef.current) voiceScrollRef.current.scrollTop = voiceScrollRef.current.scrollHeight;
  }, [transcription]);

  useEffect(() => {
    const updateCredits = () => setCredits(usageService.getRemainingCredits(isPro).chat);
    window.addEventListener('usage-updated', updateCredits);
    return () => {
      stopVoiceSession();
      window.removeEventListener('usage-updated', updateCredits);
    };
  }, [isPro]);

  useEffect(() => {
    const handleAskAi = (e: any) => {
      if (e.detail?.question) {
        handleSend(e.detail.question);
        window.dispatchEvent(new CustomEvent('nav-to-chat'));
      }
    };
    window.addEventListener('ask-suraksha-ai', handleAskAi);
    return () => window.removeEventListener('ask-suraksha-ai', handleAskAi);
  }, []);

  const toggleVoice = async () => {
    if (isVoiceMode) {
      stopVoiceSession();
    } else {
      if (!usageService.canUseFeature('AI_ASSISTANT_MINS', isPro)) {
        alert("Daily Voice Limit Reached. Upgrade to Pro for unlimited AI Assistant mins.");
        window.dispatchEvent(new CustomEvent('nav-to-subscription'));
        return;
      }
      startVoiceSession();
    }
  };

  const startVoiceSession = async () => {
    setIsVoiceMode(true);
    setVoiceStatus('CONNECTING');
    setTranscription('');

    try {
      streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setVoiceStatus('ACTIVE');
            if (!isPro) usageService.incrementUsage('assistantMins');

            if (!audioContextRef.current || !streamRef.current) return;

            const source = audioContextRef.current.createMediaStreamSource(streamRef.current);
            const scriptProcessor = audioContextRef.current.createScriptProcessor(2048, 1, 1);

            scriptProcessor.onaudioprocess = (e) => {
              if (voiceStatus !== 'ACTIVE') return;
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createPcmBlob(inputData);
              sessionPromise.then(s => {
                if (s && voiceStatus === 'ACTIVE') {
                  s.sendRealtimeInput({ media: pcmBlob });
                }
              });
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(audioContextRef.current.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.outputTranscription) {
              setTranscription(prev => (prev + ' ' + message.serverContent!.outputTranscription!.text).slice(-150));
            }

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
              sourcesRef.current.forEach(s => { try { s.stop(); } catch (e) { } });
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onclose: () => stopVoiceSession(),
          onerror: () => stopVoiceSession(),
        },
        config: {
          responseModalities: [Modality.AUDIO],
          outputAudioTranscription: {},
          systemInstruction: `You are the SurakshaSetu AI Voice Assistant. 
          Respond briefly and helpfuly in the user's preferred language: ${languageName}. 
          Your mission is digital safety guidance.`
        }
      });
      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error("Voice Session Init Failed:", err);
      stopVoiceSession();
    }
  };

  const stopVoiceSession = () => {
    setIsVoiceMode(false);
    setVoiceStatus('IDLE');
    if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') { audioContextRef.current.close().catch(() => { }); }
    audioContextRef.current = null;
    if (outputContextRef.current && outputContextRef.current.state !== 'closed') { outputContextRef.current.close().catch(() => { }); }
    outputContextRef.current = null;
    if (sessionRef.current) { try { sessionRef.current.close(); } catch (e) { } sessionRef.current = null; }
    sourcesRef.current.forEach(s => { try { s.stop(); } catch (e) { } });
    sourcesRef.current.clear();
    nextStartTimeRef.current = 0;
  };

  const handleSend = async (textOverride?: string) => {
    const currentInput = textOverride || inputText.trim();
    if (!currentInput || isTyping) return;

    if (!usageService.canUseFeature('AI_CHAT_MINS', isPro)) {
      alert("Daily Chat Limit Reached. Upgrade to Pro for unlimited chatting.");
      window.dispatchEvent(new CustomEvent('nav-to-subscription'));
      return;
    }

    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', text: currentInput, timestamp: Date.now() }]);
    setInputText('');
    setIsTyping(true);
    if (!isPro) usageService.incrementUsage('chatMins');

    try {
      const response = await chatWithSurakshaAI(currentInput);
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'ai', text: response, timestamp: Date.now() }]);
    } catch (e) {
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'ai', text: "Sorry, I am having trouble connecting. Kripya dubara koshish karein.", timestamp: Date.now() }]);
    } finally { setIsTyping(false); }
  };

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-white animate-in slide-in-from-bottom duration-500 font-sans overflow-hidden">
      {/* Immersive Header */}
      <div className="px-6 py-5 flex items-center justify-between border-b border-gray-100 bg-white/80 backdrop-blur-2xl sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <button onClick={() => window.dispatchEvent(new CustomEvent('nav-to-dashboard'))} className="p-2 -ml-2 text-gray-400 hover:text-indigo-600 transition-colors"><ChevronLeft size={28} /></button>
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100"><BrainCircuit size={20} /></div>
          <div>
            <h3 className="font-black text-gray-900 text-sm uppercase tracking-tighter leading-none">Security Board</h3>
            <div className="flex items-center gap-1.5 mt-1">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[8px] font-black uppercase text-gray-400 tracking-[0.2em]">
                {isPro ? 'PRO HUB UNLIMITED' : `${credits} Units Left`}
              </span>
            </div>
          </div>
        </div>
        <button onClick={onLogout} className="p-2.5 bg-gray-50 text-gray-400 rounded-xl hover:text-red-500 transition-all border border-gray-100 shadow-sm active:scale-95"><LogOut size={20} /></button>
      </div>

      {/* Chat Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 hide-scrollbar bg-slate-50/30">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in duration-700">
            <div className="w-20 h-20 bg-white rounded-[32px] flex items-center justify-center relative shadow-xl border border-gray-100">
              <Shield size={40} className="text-indigo-200" />
              <Sparkles size={20} className="absolute top-2 right-2 text-indigo-600" />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-black tracking-tighter text-gray-900 uppercase leading-none">Neural Link</h1>
              <p className="text-xs text-gray-400 font-bold max-w-[260px] mx-auto leading-relaxed uppercase tracking-widest mt-2">
                Fast Response Safety AI
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 w-full max-w-sm px-4">
              {SUGGESTIONS.map((s, i) => (
                <button key={i} onClick={() => handleSend(s)} className="p-4 bg-white border border-gray-100 rounded-[24px] text-[10px] font-black uppercase tracking-widest text-gray-600 hover:border-indigo-600 hover:text-indigo-600 transition-all shadow-sm active:scale-95">
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
              <div className={`max-w-[85%] px-5 py-4 rounded-[26px] text-[14px] font-medium leading-relaxed shadow-sm ${msg.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-tr-none'
                  : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
                }`}>
                <p className="whitespace-pre-wrap">{msg.text}</p>
                <p className={`text-[8px] mt-2 font-black uppercase tracking-widest opacity-40 ${msg.role === 'user' ? 'text-white' : 'text-gray-400'}`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))
        )}
        {isTyping && (
          <div className="flex justify-start animate-in fade-in">
            <div className="bg-white px-5 py-3 rounded-2xl flex items-center gap-2 border border-gray-100 shadow-sm">
              <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0s]" />
              <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]" />
              <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}
      </div>

      {/* Modern Control Bar */}
      <div className="bg-white border-t border-gray-100 pb-10 px-6 pt-4">
        <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-[32px] border border-gray-200 focus-within:border-indigo-600 focus-within:bg-white transition-all shadow-inner group">
          <button
            onClick={toggleVoice}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-sm active:scale-90 shrink-0 ${isVoiceMode ? 'bg-red-600 text-white animate-pulse' : 'bg-white border border-gray-200 text-indigo-600 hover:bg-indigo-50'
              }`}
          >
            {isVoiceMode ? <X size={20} /> : <Mic size={20} />}
          </button>
          <input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Talk or type safety queries..."
            className="flex-1 bg-transparent px-2 py-3 outline-none font-bold text-gray-800 text-sm"
          />
          <button
            onClick={() => handleSend()}
            disabled={!inputText.trim() || isTyping}
            className="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center active:scale-90 transition-all disabled:opacity-30 shrink-0 shadow-lg"
          >
            <Send size={20} />
          </button>
        </div>
      </div>

      {/* Immersive Voice Mode Overlay */}
      {isVoiceMode && (
        <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-between p-10 animate-in zoom-in duration-500">
          <div className="absolute inset-0 opacity-10">
            <div className="w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500 via-transparent to-transparent animate-pulse" />
          </div>

          <div className="relative z-10 w-full flex justify-between items-center text-white/50">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em]">Live Conversation</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`p-3 rounded-full transition-all ${isMuted ? 'bg-red-500/20 text-red-400' : 'bg-white/5 text-white'}`}
              >
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
              <button onClick={stopVoiceSession} className="p-3 bg-white/5 rounded-full hover:bg-red-500 transition-colors active:scale-90"><X size={24} /></button>
            </div>
          </div>

          <div className="relative z-10 flex flex-col items-center gap-8">
            <div className="w-52 h-52 rounded-[64px] bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center shadow-[0_0_100px_rgba(99,102,241,0.4)] relative overflow-hidden group">
              <div className="absolute inset-0 rounded-[64px] border-4 border-white/10 animate-ping opacity-20" />
              <div className="absolute inset-0 bg-white/5 opacity-50 group-hover:opacity-100 transition-opacity" />

              {voiceStatus === 'ACTIVE' ? (
                <div className="flex items-end gap-1.5 h-16 relative z-10">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
                    <div key={i} className="w-2 bg-white rounded-full animate-waveform shadow-lg" style={{ height: `${20 + Math.random() * 80}%`, animationDelay: `${i * 0.08}s` }} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4 text-white/50">
                  <RefreshCw size={56} className="animate-spin" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Handshaking...</span>
                </div>
              )}
            </div>
            <div className="space-y-1 text-center">
              <h2 className="text-4xl font-black tracking-tighter text-white uppercase leading-none">
                {voiceStatus === 'CONNECTING' ? 'Linking Core' : 'Voice Assistant'}
              </h2>
              <p className="text-indigo-400 font-black text-[10px] uppercase tracking-[0.4em]">{voiceStatus === 'ACTIVE' ? 'Sentinel Active' : 'Establishing Secure Pulse'}</p>
            </div>
          </div>

          <div
            ref={voiceScrollRef}
            className="relative z-10 w-full max-w-sm bg-white/5 border border-white/10 rounded-[48px] p-10 max-h-[220px] overflow-y-auto backdrop-blur-3xl text-white text-center hide-scrollbar shadow-2xl"
          >
            <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 opacity-20">
              <Activity size={12} />
              <span className="text-[8px] font-black uppercase tracking-widest">Linguistic Decipher Hub</span>
            </div>
            <p className="italic text-xl leading-relaxed break-words font-medium opacity-90 mt-2">
              {transcription ? `"${transcription}"` : 'Awaiting audio input...'}
            </p>
          </div>

          <button
            onClick={stopVoiceSession}
            className="relative z-10 w-full max-w-xs py-7 bg-white text-slate-950 rounded-[36px] font-black text-xs uppercase tracking-[0.4em] active:scale-95 transition-transform shadow-[0_20px_50px_rgba(255,255,255,0.15)] flex items-center justify-center gap-3"
          >
            <Shield size={18} className="text-indigo-600" /> End Voice Protocol
          </button>
        </div>
      )}

      <style>{`
        @keyframes waveform { 
          0%, 100% { transform: scaleY(0.4); opacity: 0.7; } 
          50% { transform: scaleY(1.4); opacity: 1; } 
        } 
        .animate-waveform { 
          animation: waveform 0.4s infinite ease-in-out; 
          transform-origin: center; 
        }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};