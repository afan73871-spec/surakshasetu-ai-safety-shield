
import React, { useState, useEffect } from 'react';
import { Search, ShieldAlert, TrendingUp, MapPin, SearchCheck, Info, AlertTriangle, Users, PlusCircle, X, ShieldCheck, MessageSquare, Smartphone, CreditCard, Globe, PhoneCall, Server, RefreshCw } from 'lucide-react';
import { AdBanner } from './AdBanner';
import { apiClient } from '../services/apiService';

export const ScamDatabase: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [registryData, setRegistryData] = useState<any[]>([]);
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [reportForm, setReportForm] = useState({ type: 'Phone', value: '', description: '' });

  useEffect(() => {
    fetchRegistry();
  }, []);

  const fetchRegistry = async (query?: string) => {
    setIsSyncing(true);
    try {
      const data = await apiClient.get('/scams', query ? { query } : undefined);
      setRegistryData(data);
    } catch (e) {
      console.error("Registry fetch failed");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSyncing(true);
    try {
      const result = await apiClient.post('/scams/report', reportForm);
      if (result.success) {
        setReportSubmitted(true);
        fetchRegistry();
        setTimeout(() => {
          setIsReportModalOpen(false);
          setReportSubmitted(false);
          setReportForm({ type: 'Phone', value: '', description: '' });
        }, 2000);
      }
    } catch (e) {
      alert("Failed to post report to Supabase.");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="p-4 space-y-6 animate-in slide-in-from-right-4 duration-500 relative pb-20">
      <div className="text-center">
        <h2 className="text-2xl font-black text-black tracking-tight uppercase">Scam Databash</h2>
        <div className="flex items-center justify-center gap-2">
          <span className="text-[10px] text-indigo-600 font-black uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded">Supabase Pulse Active</span>
          {isSyncing && <RefreshCw size={10} className="text-indigo-600 animate-spin" />}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => setIsReportModalOpen(true)} className="bg-white border-2 border-indigo-600 text-indigo-600 rounded-[28px] p-5 shadow-lg flex flex-col items-center justify-center gap-2 group transition-all active:scale-95">
          <div className="bg-indigo-50 p-2 rounded-xl group-hover:scale-110 transition-transform"><PlusCircle size={24} /></div>
          <div className="text-center"><h4 className="font-black text-[10px] uppercase">Post Report</h4><p className="text-[7px] font-bold opacity-60 uppercase">Sync to Cloud</p></div>
        </button>
        <a href="tel:1930" className="bg-red-600 text-white rounded-[28px] p-5 shadow-lg flex flex-col items-center justify-center gap-2 group transition-all active:scale-95 border-b-4 border-red-800">
          <div className="bg-white/20 p-2 rounded-xl group-hover:scale-110 transition-transform"><PhoneCall size={24} /></div>
          <div className="text-center"><h4 className="font-black text-[10px] uppercase">Cyber Help</h4><p className="text-[7px] font-bold opacity-80 uppercase">Dial 1930</p></div>
        </a>
      </div>

      <div className="bg-black rounded-[40px] p-8 shadow-xl relative overflow-hidden border border-white/10">
        <div className="relative z-10 space-y-4">
          <h3 className="text-white font-black text-lg uppercase tracking-tight">Registry Search</h3>
          <div className="relative group">
            <input 
              type="text" 
              value={searchQuery} 
              onChange={(e) => { setSearchQuery(e.target.value); fetchRegistry(e.target.value); }} 
              placeholder="Search Number or VPA..." 
              className="w-full p-5 pr-14 rounded-[24px] bg-white/10 border border-white/20 text-white placeholder:text-gray-500 outline-none focus:bg-white/15 transition-all font-bold" 
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 text-white rounded-xl shadow-lg"><Search size={20} /></div>
          </div>
          <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Searching live records in CYBER AI database</p>
        </div>
      </div>

      <div className="bg-white rounded-[40px] p-6 border border-gray-100 shadow-sm">
        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-2"><Users size={14} className="text-indigo-600" /> Community Threat Feed</h4>
        <div className="space-y-4">
          {registryData.length === 0 ? (
            <div className="py-10 text-center space-y-2 opacity-30">
               <Globe className="mx-auto" size={32} />
               <p className="text-[10px] font-black uppercase">No records found</p>
            </div>
          ) : registryData.map(report => (
            <div key={report.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-[24px] border border-gray-100 group hover:bg-white hover:shadow-md transition-all">
              <div className="flex items-center gap-4">
                <div className="text-[9px] font-black bg-white border border-indigo-100 text-indigo-600 px-2 py-1 rounded-lg shadow-sm">{report.type}</div>
                <div>
                  <span className="text-sm font-black text-gray-800 font-mono block leading-none">{report.identifier}</span>
                  <span className="text-[8px] font-bold text-gray-400 uppercase mt-1 block tracking-wider">{new Date(report.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[9px] font-black text-red-500 uppercase tracking-tighter">{report.city}</div>
                <div className="text-[10px] font-black text-gray-900 mt-0.5">{report.reports_count || 1} Reports</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {isReportModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center px-4 pb-20">
          <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md" onClick={() => setIsReportModalOpen(false)}></div>
          <div className="bg-white rounded-[48px] p-10 w-full max-w-sm relative z-10 shadow-2xl animate-in slide-in-from-bottom duration-500">
            {reportSubmitted ? (
              <div className="py-12 flex flex-col items-center text-center space-y-4">
                <div className="w-24 h-24 bg-green-100 text-green-600 rounded-[32px] flex items-center justify-center animate-bounce shadow-xl shadow-green-100"><ShieldCheck size={56} /></div>
                <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">Sync Successful</h3>
                <p className="text-sm text-gray-500 font-medium">Your report has been added to the Supabase global registry.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReport} className="space-y-8">
                <div className="flex justify-between items-center"><h3 className="text-2xl font-black text-gray-900 tracking-tighter uppercase">New Report</h3><button type="button" onClick={() => setIsReportModalOpen(false)} className="p-2 bg-gray-100 rounded-full text-gray-500"><X size={20} /></button></div>
                <div className="space-y-5">
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-3 block">Subject Category</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['Phone', 'UPI', 'SMS', 'Web'].map(t => (
                        <button key={t} type="button" onClick={() => setReportForm({ ...reportForm, type: t })} className={`py-3 rounded-2xl text-xs font-black uppercase transition-all ${reportForm.type === t ? 'bg-indigo-600 text-white shadow-xl scale-105' : 'bg-gray-50 text-gray-500 border border-gray-100'}`}>{t}</button>
                      ))}
                    </div>
                  </div>
                  <div><label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-3 block">Target Identifier</label><input required type="text" placeholder="e.g. 98210XXXXX" value={reportForm.value} onChange={(e) => setReportForm({ ...reportForm, value: e.target.value })} className="w-full p-5 bg-gray-50 border-2 border-transparent rounded-[24px] outline-none focus:border-indigo-600 focus:bg-white transition-all font-black text-gray-800" /></div>
                  <div><label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-3 block">Modus Operandi</label><textarea required placeholder="Briefly describe the scam..." value={reportForm.description} onChange={(e) => setReportForm({ ...reportForm, description: e.target.value })} className="w-full h-28 p-5 bg-gray-50 border-2 border-transparent rounded-[24px] outline-none focus:border-indigo-600 focus:bg-white transition-all font-medium text-gray-700 resize-none" /></div>
                </div>
                <button type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-[28px] font-black text-xs uppercase tracking-[0.3em] shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all"><Server size={18} /> Update Registry</button>
              </form>
            )}
          </div>
        </div>
      )}
      <AdBanner />
    </div>
  );
};
