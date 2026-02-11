
import React, { useState, useEffect } from 'react';
import { Search, ShieldAlert, TrendingUp, MapPin, SearchCheck, Info, AlertTriangle, Users, PlusCircle, X, ShieldCheck, MessageSquare, Smartphone, CreditCard, Globe, PhoneCall, Server, Code, Copy, Check, RefreshCw } from 'lucide-react';
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
      alert("Failed to post report.");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="p-4 space-y-6 animate-in slide-in-from-right-4 duration-500 relative pb-20">
      <div className="text-center">
        <h2 className="text-2xl font-black text-black tracking-tight uppercase tracking-widest">Scam Databash</h2>
        <div className="flex items-center justify-center gap-2">
          <span className="text-sm text-indigo-600 font-bold uppercase tracking-widest text-[10px]">Cloud Sync Enabled</span>
          {isSyncing && <RefreshCw size={10} className="text-indigo-600 animate-spin" />}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => setIsReportModalOpen(true)} className="bg-white border-2 border-indigo-600 text-indigo-600 rounded-3xl p-4 shadow-lg flex flex-col items-center justify-center gap-2 group transition-all active:scale-95">
          <div className="bg-indigo-50 p-2 rounded-xl group-hover:scale-110 transition-transform"><PlusCircle size={24} /></div>
          <div className="text-center"><h4 className="font-black text-xs uppercase">Post Report</h4><p className="text-[8px] font-bold opacity-80 uppercase tracking-tighter">Sync to Community</p></div>
        </button>
        <a href="tel:1930" className="bg-red-600 text-white rounded-3xl p-4 shadow-lg flex flex-col items-center justify-center gap-2 group transition-all active:scale-95 border-b-4 border-red-800">
          <div className="bg-white/20 p-2 rounded-xl group-hover:scale-110 transition-transform"><PhoneCall size={24} /></div>
          <div className="text-center"><h4 className="font-black text-xs uppercase tracking-tight">Cyber Helpline</h4><p className="text-[8px] font-bold opacity-80 uppercase">Dial 1930 Now</p></div>
        </a>
      </div>

      <div className="bg-black rounded-3xl p-6 shadow-xl relative overflow-hidden border border-white/10">
        <div className="relative z-10 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-black text-lg">Registry Search</h3>
            <span className="text-[9px] bg-green-500 text-white px-2 py-0.5 rounded font-black">LIVE SYNC</span>
          </div>
          <div className="relative">
            <input type="text" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); fetchRegistry(e.target.value); }} placeholder="Search Phone, VPA, or Link..." className="w-full p-4 pr-12 rounded-2xl bg-white/10 border border-white/20 text-white placeholder:text-gray-500 outline-none focus:bg-white/15 transition-all font-bold" />
            <button className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 text-white rounded-xl shadow-lg"><Search size={20} /></button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
        <h4 className="text-xs font-black text-black uppercase tracking-widest mb-4 flex items-center gap-2"><Users size={14} className="text-indigo-600" /> Active Registry (Central Database)</h4>
        <div className="space-y-3">
          {registryData.map(report => (
            <div key={report.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-2xl border border-gray-100 group hover:bg-white hover:shadow-md transition-all">
              <div className="flex items-center gap-3">
                <div className="text-[10px] font-black bg-white border border-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded shadow-sm">{report.type}</div>
                <span className="text-xs font-bold text-gray-800 font-mono">{report.identifier}</span>
              </div>
              <div className="text-right">
                <div className="text-[10px] font-black text-red-500 uppercase tracking-tighter">{report.city}</div>
                <div className="text-[8px] font-bold text-gray-400">{report.reports} reports</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {isReportModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center px-4 pb-20">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsReportModalOpen(false)}></div>
          <div className="bg-white rounded-[40px] p-8 w-full max-w-sm relative z-10 shadow-2xl animate-in slide-in-from-bottom duration-500">
            {reportSubmitted ? (
              <div className="py-12 flex flex-col items-center text-center space-y-4">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center animate-bounce"><ShieldCheck size={48} /></div>
                <h3 className="text-2xl font-black text-black">Registry Updated!</h3>
                <p className="text-sm text-gray-500 font-medium">Synced to 5.2M records successfully.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReport} className="space-y-6">
                <div className="flex justify-between items-center"><h3 className="text-2xl font-black text-black">New Report</h3><button type="button" onClick={() => setIsReportModalOpen(false)} className="p-2 bg-gray-100 rounded-full"><X size={20} /></button></div>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-black text-gray-500 uppercase px-1 mb-2 block">Identity Type</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['Phone', 'UPI', 'SMS', 'Web'].map(t => (
                        <button key={t} type="button" onClick={() => setReportForm({ ...reportForm, type: t })} className={`py-2 rounded-xl text-sm font-bold border-2 transition-all ${reportForm.type === t ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-white border-gray-100 text-gray-600'}`}>{t}</button>
                      ))}
                    </div>
                  </div>
                  <div><label className="text-xs font-black text-gray-500 uppercase px-1 mb-2 block">Identifier</label><input required type="text" value={reportForm.value} onChange={(e) => setReportForm({ ...reportForm, value: e.target.value })} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none transition-all font-bold" /></div>
                  <div><label className="text-xs font-black text-gray-500 uppercase px-1 mb-2 block">Reason</label><textarea required value={reportForm.description} onChange={(e) => setReportForm({ ...reportForm, description: e.target.value })} className="w-full h-24 p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none transition-all font-medium resize-none" /></div>
                </div>
                <button type="submit" className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl flex items-center justify-center gap-2"><Server size={20} /> Update Databash</button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
