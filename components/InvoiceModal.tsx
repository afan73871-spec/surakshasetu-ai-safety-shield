import React from 'react';
import { X, Printer, ShieldCheck, Globe, MapPin, Mail, IndianRupee, FileText } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

interface InvoiceData {
  orderId: string;
  date: string;
  clientName: string;
  clientEmail: string;
  planName: string;
  amount: string;
  status: string;
  transactionId: string;
}

interface InvoiceModalProps {
  data: InvoiceData;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ data, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 print:p-0">
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm print:hidden" onClick={onClose} />

      <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh] print:max-h-none print:w-full print:shadow-none print:rounded-none">

        {/* Modal Header */}
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <FileText size={20} />
            </div>
            <h3 className="text-lg font-black uppercase tracking-tight">Tax Invoice</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all active:scale-95 flex items-center gap-2 px-6"
            >
              <Printer size={18} />
              <span className="text-[10px] font-black uppercase tracking-widest">Print / PDF</span>
            </button>
            <button onClick={onClose} className="p-3 bg-slate-100 text-slate-400 rounded-2xl hover:text-red-500 transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Invoice Body */}
        <div className="flex-1 overflow-y-auto p-12 space-y-12 print:overflow-visible print:p-8" id="invoice-content">

          {/* Brand & Address */}
          <div className="flex justify-between items-start">
            <div className="space-y-4">
              <BrandLogo size={64} hideText className="!items-start" />
              <div className="space-y-1">
                <h2 className="text-2xl font-black tracking-tighter uppercase text-slate-900">Suraksha Setu</h2>
                <p className="text-[9px] font-black text-indigo-600 uppercase tracking-[0.4em]">National Cyber AI Unit</p>
              </div>
            </div>
            <div className="text-right space-y-2">
              <div className="bg-slate-900 text-white px-4 py-1.5 rounded-lg inline-block">
                <p className="text-[10px] font-black uppercase tracking-widest">Official Receipt</p>
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest"># {data.orderId.substring(0, 12)}</p>
              <p className="text-xs font-bold text-slate-800">{data.date}</p>
            </div>
          </div>

          <div className="h-px bg-slate-100 w-full" />

          {/* Client & Billing Info */}
          <div className="grid grid-cols-2 gap-12">
            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Billed To</h4>
              <div className="space-y-1">
                <p className="text-lg font-black text-slate-900">{data.clientName}</p>
                <p className="text-sm font-bold text-slate-500">{data.clientEmail}</p>
                <div className="flex items-center gap-2 text-[10px] text-indigo-600 font-black mt-2 uppercase">
                  <Globe size={12} />
                  Verified Identity Node
                </div>
              </div>
            </div>
            <div className="space-y-4 text-right">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Provider Node</h4>
              <div className="space-y-1">
                <p className="text-sm font-black text-slate-900">Suraksha Setu Technologies</p>
                <p className="text-[10px] font-medium text-slate-500 leading-relaxed uppercase">
                  SULKAPARA, NAGRAKATA<br />
                  DIST: JALPAIGURI, WB, 735225<br />
                  GSTIN: 19AAXCS1023D1Z9 (SIMULATED)
                </p>
              </div>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="space-y-6">
            <div className="bg-slate-50 rounded-[32px] overflow-hidden border border-slate-100">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-900 text-white">
                    <th className="p-5 text-[10px] font-black uppercase tracking-widest">Security Service</th>
                    <th className="p-5 text-[10px] font-black uppercase tracking-widest text-center">Period</th>
                    <th className="p-5 text-[10px] font-black uppercase tracking-widest text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="p-6">
                      <p className="text-sm font-black text-slate-900">{data.planName}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Unlimited Neural Audits & Geofence Radar</p>
                    </td>
                    <td className="p-6 text-center text-xs font-bold text-slate-600">Lifetime Upgrade</td>
                    <td className="p-6 text-right text-sm font-black text-slate-900">₹{data.amount}.00</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pr-6">
              <div className="w-64 space-y-3">
                <div className="flex justify-between items-center text-xs font-bold text-slate-500">
                  <span className="uppercase tracking-widest">Subtotal</span>
                  <span>₹{data.amount}.00</span>
                </div>
                <div className="flex justify-between items-center text-xs font-bold text-slate-500">
                  <span className="uppercase tracking-widest">GST (0% Zero Rated)</span>
                  <span>₹0.00</span>
                </div>
                <div className="h-px bg-slate-200" />
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">Total Amount</span>
                  <span className="text-xl font-black text-indigo-600 tracking-tighter">₹{data.amount}.00</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Proof */}
          <div className="bg-emerald-50 rounded-[32px] p-6 border border-emerald-100 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-600 text-white rounded-2xl shadow-lg">
                <ShieldCheck size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black text-emerald-800 uppercase tracking-widest leading-none">Payment Authenticated</p>
                <p className="text-xs font-bold text-emerald-600 mt-1 uppercase tracking-tighter">Signal: {data.transactionId}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[8px] font-black text-slate-400 uppercase">Verification Hub</p>
              <p className="text-[10px] font-black text-slate-900 uppercase">EDWIN-ACTIVE-NODE-1</p>
            </div>
          </div>

          {/* Footer Info */}
          <div className="pt-10 flex flex-col items-center text-center space-y-4 opacity-50">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <MapPin size={10} />
                <span className="text-[8px] font-black uppercase tracking-widest">India Origin</span>
              </div>
              <div className="w-1 h-1 bg-slate-300 rounded-full" />
              <div className="flex items-center gap-1.5">
                <Mail size={10} />
                <span className="text-[8px] font-black uppercase tracking-widest">support@suraksha.setu</span>
              </div>
            </div>
            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.2em] max-w-sm">
              This is a computer-generated neural document. No physical signature is required. Project of SurakshaSetu AI Technologies.
            </p>
          </div>

        </div>
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          #invoice-content, #invoice-content * { visibility: visible; }
          #invoice-content { 
            position: absolute; 
            left: 0; 
            top: 0; 
            width: 100%;
            height: auto;
          }
          .print\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  );
};
