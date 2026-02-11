import React, { useEffect, useRef, useState } from 'react';
import { 
  Mic, Send, Sparkles, X, Zap, RefreshCw, 
  Activity, Shield, LogOut, ChevronLeft, 
  BrainCircuit, Volume2, VolumeX, MessageSquare, Waves,
  ShieldCheck, Terminal, Signal, Radar, Smartphone, Fingerprint
} from 'lucide-react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { createPcmBlob, decode, decodeAudioData, encode } from '../services/audioUtils';
import { chatWithSurakshaAI } from '../services/geminiService';
import { usageService } from '../services/usageService';

interface Message {
  id: string;
  role: 'user' | 'ai';
  text: string;
  timestamp: number;
}

const SUGGESTIONS = [
  "Check this call for scam",
  "How to protect my bank account?",
  "Hindi mein baat karo",
  "Is this link safe?"
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
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const streamRef = useRef<MediaStream | null>(null);

  // Buffers for real-time transcription sync
  const inputBuffer = useRef('');
  const outputBuffer = useRef('');

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    const updateCredits = () => setCredits(usageService.getRemainingCredits(isPro).chat);
    window.addEventListener('usage-updated', updateCredits);
    return () => {
      stopVoiceSession();
      window.removeEventListener('usage-updated', updateCredits);
    };
  }, [isPro]);

  const toggleVoice = async () => {
    if (isVoiceMode) {
      stopVoiceSession();
    } else {
      if (!usageService.canUseFeature('AI_ASSISTANT_MINS', isPro)) {
        alert("Daily Voice Limit Reached. Upgrade to Pro for unlimited INTERCEPTION.");
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
    inputBuffer.current = '';
    outputBuffer.current = '';
    
    try {
      // Audio Hardware Prep
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      if (audioContextRef.current.state === 'suspended') await audioContextRef.current.resume();
      if (outputContextRef.current.state === 'suspended') await outputContextRef.current.resume();

      streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setVoiceStatus('ACTIVE');
            if (!isPro) usageService.incrementUsage('assistantMins'); 
            
            if (!audioContextRef.current || !streamRef.current) return;

            const source = audioContextRef.current.createMediaStreamSource(streamRef.current);
            const scriptProcessor = audioContextRef.current.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createPcmBlob(inputData);
              // CRITICAL: Purely rely on promise resolve
              sessionPromise.then(s => {
                s.sendRealtimeInput({ media: pcmBlob });
              });
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(audioContextRef.current.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            // Live Transcription Handling
            if (message.serverContent?.inputTranscription) {
              const text = message.serverContent.inputTranscription.text;
              inputBuffer.current += text;
              setTranscription(inputBuffer.current);
            }
            if (message.serverContent?.outputTranscription) {
              const text = message.serverContent.outputTranscription.text;
              outputBuffer.current += text;
              setTranscription(outputBuffer.current);
            }

            // End of turn: Sync to persistent history
            if (message.serverContent?.turnComplete) {
              if (inputBuffer.current || outputBuffer.current) {
                setMessages(prev => [
                  ...prev,
                  ...(inputBuffer.current ? [{ id: Date.now() + '-u', role: 'user' as const, text: inputBuffer.current, timestamp: Date.now() }] : []),
                  ...(outputBuffer.current ? [{ id: Date.now() + 1 + '-a', role: 'ai' as const, text: outputBuffer.current, timestamp: Date.now() }] : [])
                ]);
                inputBuffer.current = '';
                outputBuffer.current = '';
              }
            }
            
            // Audio Logic
            const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData && outputContextRef.current && !isMuted) {
              setIsAiSpeaking(true);
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
                source.onended = () => {
                  sourcesRef.current.delete(source);
                  if (sourcesRef.current.size === 0) setIsAiSpeaking(false);
                };
              }
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => { try { s.stop(); } catch(e) {} });
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
              setIsAiSpeaking(false);
            }
          },
          onclose: () => stopVoiceSession(),
          onerror: (e) => {
            console.error("Neural Node Desync:", e);
            stopVoiceSession();
          },
        },
        config: { 
          responseModalities: [Modality.AUDIO], 
          outputAudioTranscription: {},
          inputAudioTranscription: {},
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } }
          },
          systemInstruction: `You are the SurakshaSetu AI Voice Sentinel. 
          CORE PROTOCOL: Real-time Voice Intent Interception and Cyber Fraud prevention.
          IDENTITY: You are a professional digital guardian of the National Cyber Guard of India.
          CONSTRAINT: Only answer security, scam, fraud, and digital safety queries. 
          Respond in the user's language (Hindi, English, Marathi, or Hinglish). 
          Keep responses concise (under 15 words) for voice efficiency.` 
        }
      });
      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error("Sentinel Hub Handshake Failed:", err);
      stopVoiceSession();
    }
  };

  const stopVoiceSession = () => {
    setIsVoiceMode(false);
    setVoiceStatus('IDLE');
    setIsAiSpeaking(false);
    if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') { audioContextRef.current.close().catch(() => {}); }
    audioContextRef.current = null;
    if (outputContextRef.current && outputContextRef.current.state !== 'closed') { outputContextRef.current.close().catch(() => {}); }
    outputContextRef.current = null;
    if (sessionRef.current) { try { sessionRef.current.close(); } catch (e) {} sessionRef.current = null; }
    sourcesRef.current.forEach(s => { try { s.stop(); } catch (e) {} });
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
      setMessages(prev => [...prev, { id: (Date.now()+1).toString(), role: 'ai', text: response, timestamp: Date.now() }]);
    } catch (e) {
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'ai', text: "Neural link lost. Kripya dobara koshish karein.", timestamp: Date.now() }]);
    } finally { setIsTyping(false); }
  };

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-white animate-in slide-in-from-bottom duration-500 font-sans overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 flex items-center justify-between border-b border-gray-100 bg-white/80 backdrop-blur-2xl sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => window.dispatchEvent(new CustomEvent('nav-to-dashboard'))} className="p-2 -ml-2 text-gray-400 hover:text-indigo-600 transition-colors"><ChevronLeft size={28} /></button>
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100"><BrainCircuit size={20} /></div>
          <div>
            <h3 className="font-black text-gray-900 text-sm uppercase tracking-tighter leading-none">Security Board</h3>
            <div className="flex items-center gap-1.5 mt-1">
              <div className={`w-1.5 h-1.5 rounded-full ${voiceStatus === 'ACTIVE' ? 'bg-indigo-500 animate-pulse' : 'bg-amber-400'}`} />
              <span className="text-[8px] font-black uppercase text-gray-400 tracking-[0.2em]">
                {isPro ? 'PRO HUB UNLIMITED' : `${credits} Units Left`}
              </span>
            </div>
          </div>
        </div>
        <button onClick={onLogout} className="p-2.5 bg-gray-50 text-gray-400 rounded-xl hover:text-red-500 transition-all border border-gray-100 shadow-sm active:scale-95"><LogOut size={20} /></button>
      </div>

      {/* Main Chat Display */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 hide-scrollbar bg-slate-50/30">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in duration-700">
            <div className="w-20 h-20 bg-white rounded-[32px] flex items-center justify-center relative shadow-xl border border-gray-100">
               <Shield size={40} className="text-indigo-200" />
               <Sparkles size={20} className="absolute top-2 right-2 text-indigo-600 animate-pulse" />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-black tracking-tighter text-gray-900 uppercase leading-none">Neural Link</h1>
              <p className="text-[10px] text-gray-400 font-bold max-w-[260px] mx-auto leading-relaxed uppercase tracking-[0.2em] mt-2">
                Fast Response Safety AI
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 w-full max-w-sm px-4">
               {SUGGESTIONS.map((s, i) => (
                 <button key={i} onClick={() => handleSend(s)} className="p-4 bg-white border border-gray-100 rounded-[24px] text-[9px] font-black uppercase tracking-widest text-gray-600 hover:border-indigo-600 hover:text-indigo-600 transition-all shadow-sm active:scale-95">
                   {s}
                 </button>
               ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
              <div className={`max-w-[85%] px-5 py-4 rounded-[26px] text-[14px] font-medium leading-relaxed shadow-sm ${
                msg.role === 'user' 
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

      {/* Input Hub */}
      <div className="bg-white border-t border-gray-100 pb-10 px-6 pt-4">
        <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-[32px] border border-gray-200 focus-within:border-indigo-600 focus-within:bg-white transition-all shadow-inner group">
          <button 
            onClick={toggleVoice} 
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-sm active:scale-90 shrink-0 ${
              isVoiceMode ? 'bg-red-600 text-white animate-pulse' : 'bg-white border border-gray-200 text-indigo-600 hover:bg-indigo-50'
            }`}
          >
             {isVoiceMode ? <X size={20} /> : <Mic size={20} />}
          </button>
          <input 
            value={inputText} 
            onChange={(e) => setInputText(e.target.value)} 
            onKeyPress={(e) => e.key === 'Enter' && handleSend()} 
            placeholder="Talk or type safety queries..." 
            className="flex-1 bg-transparent px-3 py-3 outline-none font-bold text-gray-800 text-sm" 
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

      {/* Immersive Holographic Voice Assistant Overlay */}
      {isVoiceMode && (
        <div className="fixed inset-0 z-[100] bg-[#0A0D14] flex flex-col items-center justify-between p-10 animate-in zoom-in duration-500">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
             <div className="w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500 via-transparent to-transparent animate-pulse" />
          </div>
          
          <div className="relative z-10 w-full flex justify-between items-center text-white/70">
             <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${voiceStatus === 'ACTIVE' ? 'bg-indigo-500 animate-pulse' : 'bg-red-500'}`} />
                <span className="text-[11px] font-black uppercase tracking-[0.3em]">Live Conversation</span>
             </div>
             <div className="flex items-center gap-3">
                <button 
                  onClick={() => setIsMuted(!isMuted)} 
                  className={`p-3 rounded-2xl transition-all ${isMuted ? 'bg-red-500/20 text-red-400' : 'bg-white/5 text-white'}`}
                >
                  {isMuted ? <VolumeX size={22} /> : <Volume2 size={22} />}
                </button>
                <button onClick={stopVoiceSession} className="p-3 bg-white/5 rounded-2xl hover:bg-red-500 transition-colors active:scale-90"><X size={26} /></button>
             </div>
          </div>

          <div className="relative z-10 flex flex-col items-center gap-10 mt-[-40px]">
            <div className="w-64 h-64 rounded-[70px] bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center shadow-[0_0_120px_rgba(79,102,241,0.4)] relative overflow-hidden group">
               <div className="absolute inset-0 rounded-[70px] border-4 border-white/10 animate-pulse opacity-40" />
               <div className="absolute inset-0 bg-white/5" />
              
              {voiceStatus === 'ACTIVE' ? (
                <div className="flex items-end gap-2 h-20 relative z-10">
                   {[1,2,3,4,5,6,7,8,9,10,11,12].map(i => (
                     <div 
                        key={i} 
                        className={`w-2.5 bg-white rounded-full ${isAiSpeaking ? 'animate-waveform-intense' : 'animate-waveform'} shadow-lg`} 
                        style={{ height: `${20+Math.random()*80}%`, animationDelay: `${i*0.06}s` }} 
                     />
                   ))}
                </div>
              ) : (
                <div className="flex flex-col items-center gap-5 text-white/50">
                   <RefreshCw size={64} className="animate-spin" />
                   <span className="text-[10px] font-black uppercase tracking-[0.3em]">Linking Core...</span>
                </div>
              )}
            </div>
            <div className="space-y-2 text-center">
               <h2 className="text-[44px] font-black tracking-tighter text-white uppercase leading-none">
                 Voice Assistant
               </h2>
               <p className="text-indigo-400 font-black text-[11px] uppercase tracking-[0.6em] ml-2">
                 Sentinel Active
               </p>
            </div>
          </div>
          
          <div 
            className="relative z-10 w-full max-w-sm bg-white/5 border border-white/10 rounded-[48px] p-12 min-h-[160px] flex flex-col items-center justify-center backdrop-blur-3xl text-white text-center shadow-2xl"
          >
             <div className="absolute top-5 left-1/2 -translate-x-1/2 flex items-center gap-2 opacity-30">
                <Activity size={14} />
                <span className="text-[9px] font-black uppercase tracking-[0.2em]">Linguistic Decipher Hub</span>
             </div>
             <p className="italic text-2xl leading-relaxed break-words font-medium opacity-90 mt-4 px-2">
               {transcription ? transcription : 'Awaiting audio input...'}
             </p>
          </div>

          <button 
            onClick={stopVoiceSession} 
            className="relative z-10 w-full max-w-xs py-7 bg-white text-slate-950 rounded-[40px] font-black text-xs uppercase tracking-[0.5em] active:scale-95 transition-transform shadow-[0_20px_60px_rgba(255,255,255,0.1)] flex items-center justify-center gap-3"
          >
            <Shield size={20} className="text-indigo-600" /> End Voice Protocol
          </button>
        </div>
      )}

      <style>{`
        @keyframes waveform { 
          0%, 100% { transform: scaleY(0.4); opacity: 0.7; } 
          50% { transform: scaleY(1.2); opacity: 1; } 
        } 
        @keyframes waveform-intense { 
          0%, 100% { transform: scaleY(0.6); opacity: 0.8; } 
          50% { transform: scaleY(1.8); opacity: 1; } 
        } 
        .animate-waveform { 
          animation: waveform 0.6s infinite ease-in-out; 
          transform-origin: center; 
        }
        .animate-waveform-intense { 
          animation: waveform-intense 0.3s infinite ease-in-out; 
          transform-origin: center; 
        }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};