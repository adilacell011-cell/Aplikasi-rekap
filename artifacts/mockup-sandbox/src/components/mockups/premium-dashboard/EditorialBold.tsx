import React from 'react';
import { 
  Bell, 
  MapPin, 
  TrendingUp, 
  ArrowRightLeft, 
  Download, 
  Upload, 
  CreditCard,
  Wallet,
  PiggyBank,
  FileText,
  BookOpen,
  Users,
  Settings,
  Receipt,
  Building2,
  ChevronRight
} from 'lucide-react';

export function EditorialBold() {
  return (
    <div className="min-h-screen bg-neutral-100 flex items-center justify-center p-0 md:p-6 font-sans">
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap');
        
        .font-editorial {
          font-family: 'Bricolage Grotesque', sans-serif;
        }
        .font-ui {
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .font-mono-num {
          font-family: 'Space Mono', monospace;
        }
        
        /* Custom scrollbar for webkit */
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />

      <div className="w-full max-w-[440px] bg-white md:rounded-[2.5rem] shadow-2xl overflow-hidden relative border border-neutral-200 flex flex-col font-ui h-[100dvh] md:h-[90vh]">
        
        {/* TOP BAR */}
        <div className="px-6 pt-12 pb-4 flex items-center justify-between bg-white sticky top-0 z-10 border-b border-neutral-100">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <div className="w-2 h-2 rounded-full bg-black"></div>
              <h1 className="text-sm font-bold tracking-tight uppercase text-black">AlfathPulsa</h1>
            </div>
            <p className="text-[11px] font-medium text-neutral-500 uppercase tracking-widest">
              Sabtu, 27 Jun · 09:14
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs font-semibold text-black">Budi Santoso</p>
              <div className="flex items-center justify-end gap-1">
                <MapPin className="w-3 h-3 text-neutral-400" />
                <p className="text-[10px] text-neutral-500 font-medium">Mandor · Pusat</p>
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center border border-neutral-200">
              <Bell className="w-4 h-4 text-black" />
            </div>
          </div>
        </div>

        {/* MARQUEE */}
        <div className="bg-black text-white text-[11px] font-medium tracking-wide py-2.5 px-6 overflow-hidden uppercase">
          <div className="whitespace-nowrap animate-[marquee_20s_linear_infinite]">
            <span className="mr-8">⚠️ SETORAN WAJIB SEBELUM JAM 16.00 — JANGAN LUPA REKAP VOUCHER HARIAN.</span>
            <span>⚠️ SETORAN WAJIB SEBELUM JAM 16.00 — JANGAN LUPA REKAP VOUCHER HARIAN.</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto hide-scrollbar pb-20">
          {/* HERO BALANCE */}
          <div className="px-6 py-10 bg-white">
            <p className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-4">Total Dana Terkelola</p>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-xl font-bold text-black font-editorial">Rp</span>
              <h2 className="text-5xl font-extrabold text-black tracking-tighter font-editorial">47.850<span className="text-neutral-300">.000</span></h2>
            </div>
            
            <div className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 px-2.5 py-1 rounded-md mb-8">
              <TrendingUp className="w-3.5 h-3.5" />
              <span className="text-[11px] font-bold tracking-wide">+3,2% HARI INI</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="border-l-2 border-black pl-3 py-1">
                <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1">Saldo Digital</p>
                <p className="text-lg font-bold text-black font-mono-num tracking-tight">Rp 28.300k</p>
              </div>
              <div className="border-l-2 border-neutral-200 pl-3 py-1">
                <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1">Saldo Tunai</p>
                <p className="text-lg font-bold text-neutral-400 font-mono-num tracking-tight">Rp 19.550k</p>
              </div>
            </div>
          </div>

          {/* QUICK ACTIONS */}
          <div className="px-6 mb-10">
            <div className="grid grid-cols-3 gap-3">
              <button className="flex flex-col items-center justify-center gap-2 bg-neutral-900 text-white rounded-xl py-4 transition-transform active:scale-95">
                <ArrowRightLeft className="w-5 h-5" />
                <span className="text-[10px] font-bold tracking-wide uppercase">Geser Dana</span>
              </button>
              <button className="flex flex-col items-center justify-center gap-2 bg-neutral-100 text-black rounded-xl py-4 transition-transform active:scale-95 border border-neutral-200">
                <Download className="w-5 h-5" />
                <span className="text-[10px] font-bold tracking-wide uppercase">Tarik Tunai</span>
              </button>
              <button className="flex flex-col items-center justify-center gap-2 bg-neutral-100 text-black rounded-xl py-4 transition-transform active:scale-95 border border-neutral-200">
                <Upload className="w-5 h-5" />
                <span className="text-[10px] font-bold tracking-wide uppercase">Setor</span>
              </button>
            </div>
          </div>

          {/* MENU GRID */}
          <div className="px-6 mb-12">
            <h3 className="text-xs font-bold uppercase tracking-widest text-black mb-5 pb-2 border-b-2 border-black inline-block">Layanan Utama</h3>
            <div className="grid grid-cols-4 gap-x-2 gap-y-6">
              {[
                { icon: Receipt, label: 'Hutang', color: 'bg-red-50 text-red-600' },
                { icon: PiggyBank, label: 'Tabungan', color: 'bg-blue-50 text-blue-600' },
                { icon: Wallet, label: 'Setoran', color: 'bg-green-50 text-green-600' },
                { icon: FileText, label: 'Rekap', color: 'bg-purple-50 text-purple-600' },
                { icon: CreditCard, label: 'Slip Gaji', color: 'bg-orange-50 text-orange-600' },
                { icon: BookOpen, label: 'Info SOP', color: 'bg-yellow-50 text-yellow-600' },
                { icon: Users, label: 'Tim', color: 'bg-pink-50 text-pink-600' },
                { icon: Settings, label: 'Atur', color: 'bg-neutral-100 text-neutral-600' },
              ].map((item, idx) => (
                <div key={idx} className="flex flex-col items-center gap-2 cursor-pointer group">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${item.color} group-active:scale-90 transition-transform`}>
                    <item.icon className="w-5 h-5" strokeWidth={2.5} />
                  </div>
                  <span className="text-[10px] font-bold text-neutral-600 text-center uppercase tracking-tight">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* KINERJA CABANG */}
          <div className="px-6 mb-12">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xs font-bold uppercase tracking-widest text-black pb-2 border-b-2 border-black inline-block">Kinerja Cabang</h3>
              <span className="text-[10px] font-bold text-neutral-400 uppercase cursor-pointer hover:text-black transition-colors">Lihat Semua</span>
            </div>
            
            <div className="space-y-3">
              {[
                { name: 'Cabang Pusat', modal: '25', tunai: '8,2', health: 'bg-green-500' },
                { name: 'Cabang Pasar', modal: '18', tunai: '5,1', health: 'bg-green-500' },
                { name: 'Cabang Stasiun', modal: '12', tunai: '3,4', health: 'bg-yellow-500' },
              ].map((cabang, idx) => (
                <div key={idx} className="bg-white border border-neutral-200 p-4 rounded-xl flex items-center justify-between active:bg-neutral-50 cursor-pointer transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-neutral-100 rounded-lg flex items-center justify-center">
                      <Building2 className="w-4 h-4 text-black" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${cabang.health}`}></div>
                        <h4 className="text-sm font-bold text-black">{cabang.name}</h4>
                      </div>
                      <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">
                        Modal: {cabang.modal}jt <span className="text-neutral-300">·</span> Tunai: {cabang.tunai}jt
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-neutral-300" />
                </div>
              ))}
            </div>
          </div>

          {/* SALDO BANK */}
          <div className="px-6 pb-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-black mb-5 pb-2 border-b-2 border-black inline-block">Bank & E-Wallet</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { name: 'BRI', amount: '15.200.000', type: 'bank' },
                { name: 'BCA', amount: '8.600.000', type: 'bank' },
                { name: 'Mandiri', amount: '4.500.000', type: 'bank' },
                { name: 'DANA', amount: '1.250.000', type: 'wallet' },
              ].map((acc, idx) => (
                <div key={idx} className="bg-neutral-50 p-4 rounded-xl border border-neutral-100">
                  <p className="text-[10px] font-bold uppercase text-neutral-500 tracking-wider mb-1">{acc.name}</p>
                  <p className="text-sm font-bold text-black font-mono-num">Rp {acc.amount}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* BOTTOM HOME INDICATOR (mock iOS) */}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent pointer-events-none flex justify-center items-end pb-2">
          <div className="w-1/3 h-1 bg-neutral-300 rounded-full"></div>
        </div>

      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}} />
    </div>
  );
}
