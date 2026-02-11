import React, { useRef, useEffect, useState } from 'react';
import { 
  ShieldAlert, ShieldCheck, RefreshCw, Activity, Heart, 
  Zap, Video, History, Info, Sparkles, UserCheck, Eye,
  Camera, Loader2, AlertCircle, Scan, UserX, Cpu, Layers, HelpCircle, UserMinus,
  Upload, FileVideo, CheckCircle2, XCircle, Fingerprint, Search,
  BrainCircuit, Waves
} from 'lucide-react';
import { DeepfakeHistoryEntry } from '../types';
import { analyzeLiveness, analyzeVideoForensics, DeepfakeVideoResult } from '../services/geminiService';

export const DeepfakeScanner: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'VIDEO' | 'LIVE'>('VIDEO');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [liveResult, setLiveResult] = useState<any>(null);
  const [videoResult, setVideoResult] = useState<DeepfakeVideoResult | null>(null);
  const [statusMessage, setStatusMessage] = useState('System Ready');
  const [history, setHistory] = useState<DeepfakeHistoryEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (activeTab === 'LIVE') startCamera();
    else stopCamera();
    
    const saved = localStorage.getItem('suraksha_deepfake_history');
    if (saved) setHistory(JSON.parse(saved));
    
    return () => stopCamera();
  }, [activeTab]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } } 
      });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      setStatusMessage("Camera access blocked.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const runLiveAnalysis = async () => {
    if (!canvasRef.current || !videoRef.current) return;
    setIsScanning(true);
    setProgress(0);
    setStatusMessage("Locking Biometric Frame...");

    try {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d')?.drawImage(video, 0, 0);
      const base64Image = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
      
      const steps = ["Subject Validation...", "Pore Density Check...", "Neural Mapping...", "Verifying Liveness..."];
      for (let i = 0; i < steps.length; i++) {
        setProgress((i + 1) * 25);
        setStatusMessage(steps[i]);
        await new Promise(r => setTimeout(r, 600));
      }

      const livenessResult = await analyzeLiveness(base64Image);
      setLiveResult(livenessResult);
      
      if (livenessResult.type !== 'NONE') {
        const entry: DeepfakeHistoryEntry = {
          id: Date.now().toString(),
          timestamp: Date.now(),
          result: livenessResult.type as 'REAL' | 'FAKE',
          confidence: livenessResult.confidence,
          thumbnail: canvas.toDataURL('image/jpeg', 0.1)
        };
        const updated = [entry, ...history].slice(0, 10);
        setHistory(updated);
        localStorage.setItem('suraksha_deepfake_history', JSON.stringify(updated));
      }
    } catch (e) {
      setStatusMessage("Neural link interrupted.");
    } finally {
      setIsScanning(false);
    }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 20 * 1024 * 1024) {
        alert("Video too large. Please upload a clip under 20MB.");
        return;
      }
      setSelectedVideo(file);
      setVideoResult(null);
    }
  };

  const runVideoAnalysis = async () => {
    if (!selectedVideo) return;
    setIsScanning(true);
    setProgress(0);
    setStatusMessage("Extracting Forensic Frames...");

    try {
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.readAsDataURL(selectedVideo);
      });
      
      const base64Data = await base64Promise;
      
      const steps = [
        "Analyzing Lip-Sync Vectors...",
        "Scanning Face Morphing Artifacts...",
        "Identifying AI Synthesis Patterns...",
        "Generating Forensic Verdict..."
      ];

      for (let i = 0; i < steps.length; i++) {
        setProgress((i + 1) * 25);
        setStatusMessage(steps[i]);
        await new Promise(r => setTimeout(r, 1200));
      }

      const result = await analyzeVideoForensics(base64Data, selectedVideo.type);
      setVideoResult(result);
    } catch (e) {
      setStatusMessage("Forensic sync failed.");
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="flex flex-col p-5 space-y-6 pb-40 animate-in fade-in duration-700 font-sans min-h-screen bg-slate-50">
      <canvas ref={canvasRef} className="hidden" />
      
      <header className="w-full flex justify-between items-center px-1">
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter leading-none">Deep Audit</h2>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">Neural Intelligence Core v6.0</p>
          </div>
        </div>
        <button onClick={() => setShowHistory(!showHistory)} className="w-12 h-12 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center justify-center text-slate-400 active:scale-90 transition-transform">
          <History size={22} />
        </button>
      </header>

      {/* Tab Switcher */}
      <div className="flex bg-white p-1.5 rounded-[32px] border border-slate-100 shadow-sm">
        <button 
          onClick={() => { setActiveTab('VIDEO'); setLiveResult(null); }}
          className={`flex-1 py-4 rounded-[26px] text-[11px] font-black uppercase flex items-center justify-center gap-2 transition-all ${activeTab === 'VIDEO' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-800'}`}
        >
          <FileVideo size={16} /> Video Audit
        </button>
        <button 
          onClick={() => { setActiveTab('LIVE'); setVideoResult(null); setSelectedVideo(null); }}
          className={`flex-1 py-4 rounded-[26px] text-[11px] font-black uppercase flex items-center justify-center gap-2 transition-all ${activeTab === 'LIVE' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-800'}`}
        >
          <Camera size={16} /> Live Scan
        </button>
      </div>

      {showHistory ? (
        <div className="w-full space-y-4 animate-in slide-in-from-right-4 duration-300">
          <div className="flex justify-between px-2"><h3 className="text-[10px] font-black uppercase text-slate-400">Forensic Records</h3><button onClick={() => setHistory([])} className="text-[10px] font-black text-red-500">Wipe Hub</button></div>
          {history.length === 0 ? (
            <div className="bg-white p-16 rounded-[48px] text-center border border-slate-100 shadow-inner">
               <UserMinus size={48} className="mx-auto text-slate-200 mb-4" />
               <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No forensic data synced</p>
            </div>
          ) : history.map(entry => (
            <div key={entry.id} className="bg-white p-5 rounded-[32px] flex items-center gap-5 border border-slate-100 shadow-sm hover:border-indigo-200 transition-colors">
              <img src={entry.thumbnail} className="w-14 h-14 rounded-2xl object-cover grayscale opacity-80" alt="Audit" />
              <div className="flex-1">
                <p className={`text-[10px] font-black uppercase ${entry.result === 'REAL' ? 'text-green-600' : 'text-red-600'}`}>{entry.result === 'REAL' ? 'Verified Human' : 'Synthetic Target'}</p>
                <p className="text-xs font-bold text-slate-800">Confidence: {entry.confidence}%</p>
              </div>
            </div>
          ))}
          <button onClick={() => setShowHistory(false)} className="w-full py-6 bg-slate-900 text-white rounded-[32px] font-black text-[12px] uppercase tracking-[0.4em] active:scale-95 transition-all">Back to Terminal</button>
        </div>
      ) : (
        <>
          {activeTab === 'VIDEO' ? (
            <div className="space-y-6">
              {!selectedVideo && !videoResult && (
                <div 
                  onClick={() => videoInputRef.current?.click()}
                  className="w-full aspect-[4/5] bg-white border-4 border-dashed border-slate-200 rounded-[56px] flex flex-col items-center justify-center text-center space-y-6 cursor-pointer hover:border-indigo-400 transition-all group active:scale-95 shadow-inner"
                >
                   <input type="file" ref={videoInputRef} onChange={handleVideoUpload} accept="video/*" className="hidden" />
                   <div className="w-24 h-24 bg-indigo-50 rounded-[40px] flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform shadow-lg shadow-indigo-100/50">
                     <Upload size={40} />
                   </div>
                   <div className="space-y-2">
                     <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Upload Video</h3>
                     <p className="text-xs text-slate-400 font-bold uppercase tracking-widest max-w-[200px] mx-auto">Analyze WhatsApp or Instagram clips for AI manipulation</p>
                   </div>
                   <div className="bg-slate-100 px-5 py-2.5 rounded-2xl border border-slate-200">
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Max Size: 20MB • MP4/MOV</span>
                   </div>
                </div>
              )}

              {selectedVideo && !videoResult && (
                <div className="w-full bg-white rounded-[56px] p-10 shadow-2xl border border-indigo-50 space-y-10 animate-in zoom-in-95">
                  <div className="flex items-center gap-5 p-5 bg-slate-50 rounded-[32px] border border-slate-100 relative overflow-hidden">
                    <div className="p-4 bg-indigo-600 text-white rounded-2xl shadow-lg relative z-10">
                      <FileVideo size={28} />
                    </div>
                    <div className="flex-1 min-w-0 relative z-10">
                       <p className="text-sm font-black text-slate-900 truncate uppercase">{selectedVideo.name}</p>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{(selectedVideo.size / (1024 * 1024)).toFixed(2)} MB</p>
                    </div>
                    <button onClick={() => setSelectedVideo(null)} className="p-3 text-slate-300 hover:text-red-500 transition-colors relative z-10"><XCircle size={24} /></button>
                  </div>

                  {isScanning ? (
                    <div className="space-y-8">
                       <div className="flex flex-col items-center text-center space-y-5">
                          <div className="relative">
                            <RefreshCw size={64} className="text-indigo-600 animate-spin" />
                            <Search className="absolute inset-0 m-auto text-indigo-400" size={24} />
                          </div>
                          <p className="text-[11px] font-black uppercase text-indigo-600 tracking-[0.4em] animate-pulse">{statusMessage}</p>
                       </div>
                       <div className="space-y-2">
                          <div className="flex justify-between text-[10px] font-black uppercase text-indigo-300 tracking-widest">
                             <span>Neural Pipeline</span>
                             <span>{Math.round(progress)}%</span>
                          </div>
                          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                             <div className="h-full bg-indigo-600 transition-all duration-700 ease-out" style={{ width: `${progress}%` }} />
                          </div>
                       </div>
                    </div>
                  ) : (
                    <button 
                      onClick={runVideoAnalysis}
                      className="w-full py-7 bg-indigo-600 text-white rounded-[36px] font-black text-sm uppercase tracking-[0.3em] shadow-[0_20px_40px_rgba(79,70,229,0.3)] active:scale-95 transition-all flex items-center justify-center gap-4"
                    >
                      <BrainCircuit size={24} /> INITIATE DEEP AUDIT
                    </button>
                  )}
                </div>
              )}

              {videoResult && (
                <div className={`w-full p-8 rounded-[56px] border-4 shadow-2xl animate-in zoom-in-95 space-y-10 relative overflow-hidden ${
                  videoResult.isDeepfake ? 'bg-red-50 border-red-400' : 'bg-emerald-50 border-emerald-400'
                }`}>
                  <div className="absolute top-0 right-0 p-8 opacity-5 rotate-12 transition-transform scale-150">
                    {videoResult.isDeepfake ? <ShieldAlert size={160} /> : <ShieldCheck size={160} />}
                  </div>

                  <div className="flex items-center gap-6 relative z-10">
                     <div className={`p-6 rounded-[32px] shadow-xl text-white ${
                       videoResult.isDeepfake ? 'bg-red-600 animate-pulse' : 'bg-emerald-600'
                     }`}>
                       {videoResult.isDeepfake ? <XCircle size={48} /> : <CheckCircle2 size={48} />}
                     </div>
                     <div>
                       <h3 className={`text-3xl font-black uppercase tracking-tighter leading-none ${
                         videoResult.isDeepfake ? 'text-red-700' : 'text-emerald-700'
                       }`}>
                         {videoResult.verdict.replace('_', ' ')}
                       </h3>
                       <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-2 flex items-center gap-2">
                         <Fingerprint size={12} className={videoResult.isDeepfake ? 'text-red-600' : 'text-emerald-600'} />
                         Neural Confidence: {videoResult.confidence}%
                       </p>
                     </div>
                  </div>

                  {/* Multi-Vector Analysis Breakdown */}
                  <div className="grid grid-cols-1 gap-3 relative z-10">
                     {[
                       { label: 'Face Morphing', val: videoResult.findings.faceMorphing, icon: Layers },
                       { label: 'Lip-Sync Logic', val: videoResult.findings.lipSync, icon: Waves },
                       { label: 'AI Generation', val: videoResult.findings.generationArtifacts, icon: Zap }
                     ].map((f, i) => (
                       <div key={i} className="bg-white/80 backdrop-blur-md p-5 rounded-[28px] border border-black/5 flex items-center justify-between shadow-sm">
                          <div className="flex items-center gap-4">
                             <div className={`p-2.5 rounded-xl ${
                               f.val.includes('DETECTED') || f.val === 'MISMATCHED' ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'
                             }`}>
                                <f.icon size={18} />
                             </div>
                             <span className="text-[11px] font-black uppercase tracking-tight text-slate-700">{f.label}</span>
                          </div>
                          <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase ${
                            f.val.includes('DETECTED') || f.val === 'MISMATCHED' ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'
                          }`}>{f.val.replace('_', ' ')}</span>
                       </div>
                     ))}
                  </div>

                  <div className="bg-slate-950 p-7 rounded-[40px] text-white space-y-3 relative z-10 border border-white/5 shadow-2xl">
                      <div className="flex items-center gap-2 pb-2 border-b border-white/10">
                        <Sparkles size={14} className="text-indigo-400" />
                        <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">AI Forensic Summary</h4>
                      </div>
                      <p className="text-xs font-bold leading-relaxed italic opacity-90">"{videoResult.summary}"</p>
                  </div>

                  <button 
                    onClick={() => { setVideoResult(null); setSelectedVideo(null); }}
                    className={`w-full py-6 rounded-[36px] font-black text-[12px] uppercase tracking-[0.4em] shadow-xl active:scale-95 transition-all relative z-10 ${
                      videoResult.isDeepfake ? 'bg-red-600 text-white shadow-red-200' : 'bg-slate-900 text-white shadow-indigo-900/20'
                    }`}
                  >
                    Clear Forensic Report
                  </button>
                </div>
              )}

              <div className="bg-indigo-50 rounded-[40px] p-8 border border-indigo-100 flex items-start gap-5 shadow-sm">
                <ShieldCheck size={28} className="text-indigo-600 shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <h4 className="text-xs font-black text-indigo-900 uppercase tracking-tight">Advanced Frame Analysis</h4>
                  <p className="text-[10px] text-indigo-800/60 font-bold uppercase tracking-wider leading-relaxed">
                    SurakshaSetu audits frame consistency, pixel noise entropy, and biometric frequency to detect non-organic manipulation.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="relative w-full aspect-[4/5] rounded-[56px] overflow-hidden border-8 border-white shadow-2xl bg-slate-950">
                <video ref={videoRef} autoPlay playsInline muted className={`w-full h-full object-cover ${isScanning || liveResult ? 'opacity-30 blur-sm' : ''}`} />
                
                {isScanning && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-10 text-center z-10">
                    <Cpu size={56} className="text-indigo-400 animate-pulse mb-4" />
                    <h3 className="text-white font-black uppercase tracking-[0.3em] text-xs leading-relaxed">{statusMessage}</h3>
                    <div className="w-32 h-1.5 bg-white/10 rounded-full mt-6 overflow-hidden">
                       <div className="h-full bg-indigo-500 transition-all duration-500" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                )}

                {liveResult && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center px-10 text-center animate-in zoom-in duration-500 z-40 bg-slate-900/60 backdrop-blur-md">
                    <div className={`p-8 rounded-[48px] shadow-2xl mb-8 transform transition-transform scale-110 border-4 border-white/20 ${
                      liveResult.type === 'REAL' ? 'bg-green-500' : liveResult.type === 'FAKE' ? 'bg-red-500' : 'bg-amber-500'
                    }`}>
                      {liveResult.type === 'REAL' ? <ShieldCheck className="text-white" size={64} /> : 
                       liveResult.type === 'FAKE' ? <ShieldAlert className="text-white" size={64} /> : 
                       <UserMinus className="text-white" size={64} />}
                    </div>
                    
                    <h3 className="text-4xl font-black text-white uppercase tracking-tighter mb-2">
                      {liveResult.type === 'REAL' ? 'Organic' : liveResult.type === 'FAKE' ? 'Synthetic' : 'Incomplete'}
                    </h3>
                    
                    <p className="text-indigo-200 text-[10px] font-black uppercase tracking-[0.4em] mb-8">
                       Audit Accuracy: {liveResult.confidence}%
                    </p>
                    
                    <div className="bg-black/60 backdrop-blur-sm rounded-[32px] p-6 w-full border border-white/10">
                      <p className="text-sm text-white font-bold leading-relaxed italic opacity-90">"{liveResult.reason}"</p>
                    </div>

                    <button onClick={() => setLiveResult(null)} className="mt-12 bg-white text-slate-950 px-12 py-6 rounded-[32px] font-black text-[12px] uppercase tracking-[0.4em] shadow-2xl active:scale-95 transition-transform">New Liveness Audit</button>
                  </div>
                )}
              </div>

              <div className="w-full space-y-4">
                <button onClick={runLiveAnalysis} disabled={isScanning || !!liveResult} className="w-full py-7 bg-red-600 text-white rounded-[36px] font-black text-sm uppercase tracking-[0.3em] shadow-2xl shadow-red-200 active:scale-95 transition-all flex items-center justify-center gap-4 disabled:opacity-50">
                  {isScanning ? <Loader2 className="animate-spin" size={24} /> : <Scan size={24} />}
                  <span>Initialize Forensic Loop</span>
                </button>
                <div className="bg-white p-7 rounded-[40px] border border-slate-100 flex items-start gap-5 shadow-sm">
                  <div className="p-3 bg-indigo-50 rounded-2xl"><Info size={20} className="text-indigo-600" /></div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase leading-relaxed tracking-wider">
                    Face the camera directly in a well-lit area. Live scanning analyzes micro-textures and heartbeat-linked skin entropy.
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      <style>{`
        @keyframes pulse-ring {
          0% { transform: scale(0.95); opacity: 0.5; }
          50% { transform: scale(1.1); opacity: 0.1; }
          100% { transform: scale(0.95); opacity: 0.5; }
        }
        .animate-pulse-ring {
          animation: pulse-ring 2s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};