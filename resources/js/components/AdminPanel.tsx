import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, Search, 
  Terminal, RefreshCw, ChevronLeft, 
  Fingerprint, Zap, Database,
  Trash2, Activity, Globe, Receipt, Ticket, User, Mail, MessageSquare, Clock, ShieldCheck
} from 'lucide-react';
import { VerificationRequest, SupportRequest } from '../types';
import { apiClient } from '../services/apiService';
import { InvoiceModal } from './InvoiceModal';

interface AdminPanelProps {
  onExit: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onExit }) => {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [supportTickets, setSupportTickets] = useState<SupportRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [activeTab, setActiveTab] = useState<'QUEUE' | 'LEDGER' | 'SUPPORT'>('QUEUE');
  const [filter, setFilter] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [transmittingId, setTransmittingId] = useState<string | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);

  const loadData = async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const [pendingData, tickets] = await Promise.all([
        apiClient.getPendingRequests(),
        apiClient.getSupportRequests()
      ]);
      setRequests(pendingData);
      setSupportTickets(tickets);
      setIsConnected(true);
    } catch (e) {
      setIsConnected(false);
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  useEffect(() => {
    let interval: any;
    if (isAuthorized) {
      loadData();
      interval = setInterval(() => loadData(true), 10000); // 10s pulse
    }
    return () => clearInterval(interval);
  }, [isAuthorized]);

  const handleAdminAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminUsername === 'Afan@123' && adminPassword === 'Afan@123') {
      setIsAuthorized(true);
    } else {
      setErrorMessage("COMMANDER IDENTITY REJECTED");
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  const handleApprove = async (id: string) => {
    setTransmittingId(id);
    const result = await apiClient.approveRequest(id);
    if (result.success) {
      await loadData(true);
    }
    setTransmittingId(null);
  };

  const handleReject = async (id: string) => {
    if (confirm("Permanently reject this signal?")) {
      await apiClient.rejectRequest(id);
      await loadData(true);
    }
  };

  const handleResolveTicket = async (id: string) => {
    setTransmittingId(id);
    const success = await apiClient.resolveSupportRequest(id);
    if (success) {
      await loadData(true);
    }
    setTransmittingId(null);
  };

  const handleGenerateInvoice = (req: VerificationRequest) => {
    setSelectedInvoice({
      orderId: req.id,
      date: new Date(req.timestamp).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }),
      clientName: req.name,
      clientEmail: req.email,
      planName: 'Neural Pro Shield - Lifetime',
      amount: '199',
      status: 'PAID',
      transactionId: req.utr
    });
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-8 text-white font-sans">
        <div className="relative z-10 w-full max-w-sm space-y-10 animate-in zoom-in duration-500">
           <header className="text-center space-y-6">
              <div className="mx-auto w-24 h-24 bg-indigo-600 rounded-[32px] flex items-center justify-center shadow-[0_0_50px_rgba(79,102,241,0.3)]">
                <Terminal size={48} className="text-white" />
              </div>
              <div>
                <h2 className="text-4xl font-black uppercase tracking-tighter">Edwin Hub</h2>
                <p className="text-indigo-400 font-black text-[10px] uppercase tracking-[0.5em] mt-2">Activation Command</p>
              </div>
           </header>
           <form onSubmit={handleAdminAuth} className="space-y-4">
              <input type="text" placeholder="Commander Handle" value={adminUsername} onChange={(e) => setAdminUsername(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 outline-none focus:border-indigo-600 font-bold text-white" />
              <input type="password" placeholder="Access Key" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 outline-none focus:border-indigo-600 font-bold text-white" />
              {errorMessage && <p className="text-[10px] font-black text-red-500 text-center uppercase">{errorMessage}</p>}
              <button type="submit" className="w-full py-6 bg-indigo-600 rounded-2xl font-black text-xs uppercase tracking-[0.4em] active:scale-95 transition-all">Authorize Hub</button>
              <button type="button" onClick={onExit} className="w-full py-3 text-slate-600 font-black text-[10px] uppercase text-center">Return</button>
           </form>
        </div>
      </div>
    );
  }

  const filteredRequests = requests.filter(r => {
    const matchesFilter = r.email.toLowerCase().includes(filter.toLowerCase()) || r.name.toLowerCase().includes(filter.toLowerCase());
    if (activeTab === 'QUEUE') return r.status === 'PENDING' && matchesFilter;
    return matchesFilter;
  });

  const filteredTickets = supportTickets.filter(t => {
    return t.user_email.toLowerCase().includes(filter.toLowerCase()) || t.token_id.toLowerCase().includes(filter.toLowerCase());
  });

  const pendingCount = requests.filter(r => r.status === 'PENDING').length;
  const pendingTicketsCount = supportTickets.filter(t => t.status === 'PENDING').length;

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans flex flex-col">
      {selectedInvoice && (
        <InvoiceModal data={selectedInvoice} onClose={() => setSelectedInvoice(null)} />
      )}

      {/* Header */}
      <div className="bg-slate-900/40 backdrop-blur-3xl border-b border-white/5 px-8 py-6 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <button onClick={onExit} className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 border border-white/5 text-slate-400">
            <ChevronLeft size={24} />
          </button>
          <div className="hidden md:block">
            <h2 className="text-xl font-black uppercase tracking-tighter leading-none">Signal Dashboard</h2>
            <div className="flex items-center gap-2 mt-1">
              <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
              <p className="text-[8px] font-black text-indigo-400 uppercase tracking-[0.3em]">Neural Connection: {isConnected ? 'Active' : 'Offline'}</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setActiveTab('QUEUE')} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'QUEUE' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white/5 text-slate-500'}`}>Queue ({pendingCount})</button>
          <button onClick={() => setActiveTab('SUPPORT')} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'SUPPORT' ? 'bg-amber-600 text-white shadow-lg' : 'bg-white/5 text-slate-500'}`}>Support ({pendingTicketsCount})</button>
          <button onClick={() => setActiveTab('LEDGER')} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'LEDGER' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white/5 text-slate-500'}`}>Ledger</button>
        </div>
      </div>

      <div className="flex-1 p-8 max-w-5xl mx-auto w-full pb-40">
        <div className="space-y-8">
           <div className="bg-slate-900 border border-white/10 rounded-[40px] p-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-indigo-600/20 rounded-2xl flex items-center justify-center text-indigo-400">
                    {activeTab === 'QUEUE' ? <Activity size={24} /> : activeTab === 'SUPPORT' ? <Ticket size={24} /> : <Database size={24} />}
                 </div>
                 <div>
                    <h3 className="text-xl font-black uppercase tracking-tight">
                       {activeTab === 'QUEUE' ? 'Activation Queue' : activeTab === 'SUPPORT' ? 'Support Desk' : 'Central Registry'}
                    </h3>
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                       {activeTab === 'SUPPORT' ? `${filteredTickets.length} Tickets Identifed` : `${filteredRequests.length} Signals Synced`}
                    </p>
                 </div>
              </div>
              <div className="relative w-full md:w-64">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                 <input type="text" placeholder="Filter context..." value={filter} onChange={(e) => setFilter(e.target.value)} className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-6 outline-none focus:border-indigo-600 font-bold text-xs" />
              </div>
           </div>

           <div className="grid grid-cols-1 gap-4">
              {activeTab === 'SUPPORT' ? (
                filteredTickets.length === 0 ? (
                   <div className="text-center py-20 opacity-20 space-y-4">
                      <Ticket size={64} className="mx-auto" />
                      <p className="font-black uppercase tracking-[0.5em] text-xs">Support Queue Empty</p>
                   </div>
                ) : filteredTickets.map(ticket => (
                  <div key={ticket.id} className="bg-slate-900/60 border border-white/10 rounded-[32px] p-8 relative overflow-hidden group hover:bg-slate-900 transition-all">
                     {transmittingId === ticket.id && (
                        <div className="absolute inset-0 z-20 bg-amber-600/90 backdrop-blur-md flex items-center justify-center gap-4 animate-in fade-in duration-200">
                           <RefreshCw size={24} className="animate-spin text-white" />
                           <h4 className="font-black uppercase tracking-tighter">Resolving Protocol...</h4>
                        </div>
                     )}
                     <div className="flex flex-col md:flex-row gap-8">
                        <div className="flex-1 space-y-6">
                           <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                 <div className="p-3 bg-white/5 rounded-2xl border border-white/10 text-amber-400">
                                    <MessageSquare size={24} />
                                 </div>
                                 <div>
                                    <h4 className="text-lg font-black tracking-tight">{ticket.subject}</h4>
                                    <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest">{ticket.token_id}</p>
                                 </div>
                              </div>
                              <span className={`text-[8px] font-black px-2 py-0.5 rounded-full border ${
                                 ticket.status === 'PENDING' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-green-500/10 text-green-500 border-green-500/20'
                              }`}>{ticket.status}</span>
                           </div>
                           <div className="bg-black/20 p-5 rounded-3xl border border-white/5">
                              <p className="text-sm font-medium text-slate-300 leading-relaxed italic">"{ticket.message}"</p>
                           </div>
                           <div className="flex flex-wrap gap-4 pt-2">
                              <div className="flex items-center gap-2 text-[9px] font-black uppercase text-slate-500">
                                 <User size={12} /> {ticket.user_name}
                              </div>
                              <div className="flex items-center gap-2 text-[9px] font-black uppercase text-slate-500">
                                 <Mail size={12} /> {ticket.user_email}
                              </div>
                              <div className="flex items-center gap-2 text-[9px] font-black uppercase text-slate-500">
                                 <Clock size={12} /> {new Date(ticket.created_at).toLocaleTimeString()}
                              </div>
                           </div>
                        </div>
                        <div className="flex md:flex-col justify-end gap-3">
                           {ticket.status === 'PENDING' && (
                              <button onClick={() => handleResolveTicket(ticket.id)} className="flex-1 md:flex-none py-4 px-8 bg-amber-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl active:scale-95 hover:bg-amber-500 transition-all flex items-center justify-center gap-2">
                                 <ShieldCheck size={16} /> RESOLVE
                              </button>
                           )}
                           <button className="p-4 bg-white/5 text-slate-500 border border-white/10 rounded-2xl hover:bg-red-600/20 hover:text-red-500 transition-all">
                              <Trash2 size={20} />
                           </button>
                        </div>
                     </div>
                  </div>
                ))
              ) : (
                filteredRequests.length === 0 ? (
                  <div className="text-center py-20 opacity-20 space-y-4">
                     <Globe size={64} className="mx-auto" />
                     <p className="font-black uppercase tracking-[0.5em] text-xs">No Signal Data</p>
                  </div>
                ) : filteredRequests.map(req => (
                  <div key={req.id} className="bg-slate-900/60 border border-white/10 rounded-[32px] p-6 relative overflow-hidden group hover:bg-slate-900 transition-all">
                    {transmittingId === req.id && (
                      <div className="absolute inset-0 z-20 bg-indigo-600/90 backdrop-blur-md flex items-center justify-center gap-4 animate-in fade-in duration-200">
                         <RefreshCw size={24} className="animate-spin text-white" />
                         <h4 className="font-black uppercase tracking-tighter">Syncing Identity...</h4>
                      </div>
                    )}

                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                      <div className="flex items-center gap-5 text-center md:text-left flex-col md:flex-row">
                        <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 text-indigo-400">
                          <Fingerprint size={28} />
                        </div>
                        <div>
                          <div className="flex items-center gap-3 justify-center md:justify-start">
                            <h3 className="text-lg font-black tracking-tight">{req.name}</h3>
                            <span className={`text-[8px] font-black px-2 py-0.5 rounded-full border ${
                              req.status === 'PENDING' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 
                              req.status === 'APPROVED' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                              'bg-red-500/10 text-red-500 border-red-500/20'
                            }`}>{req.status}</span>
                          </div>
                          <p className="text-[11px] font-bold text-slate-500 uppercase mt-1">{req.email}</p>
                          <p className="text-[8px] text-slate-600 font-bold uppercase mt-0.5 tracking-widest">UTR: {req.utr}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 w-full md:w-auto">
                         {req.status === 'APPROVED' && (
                           <button 
                              onClick={() => handleGenerateInvoice(req)}
                              className="p-4 bg-white/5 text-indigo-400 border border-white/5 rounded-2xl hover:bg-white/10 transition-all flex items-center gap-2"
                           >
                              <Receipt size={20} />
                              <span className="text-[9px] font-black uppercase tracking-widest">Invoice</span>
                           </button>
                         )}
                         {req.status === 'PENDING' && (
                           <button onClick={() => handleApprove(req.id)} className="flex-1 md:flex-none py-4 px-8 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg active:scale-95 transition-all">AUTHORIZE</button>
                         )}
                         <button onClick={() => handleReject(req.id)} className="p-4 bg-red-600/10 text-red-500 border border-red-500/20 rounded-2xl hover:bg-red-600 hover:text-white transition-all"><Trash2 size={18} /></button>
                      </div>
                    </div>
                  </div>
                ))
              )}
           </div>
        </div>
      </div>
    </div>
  );
};