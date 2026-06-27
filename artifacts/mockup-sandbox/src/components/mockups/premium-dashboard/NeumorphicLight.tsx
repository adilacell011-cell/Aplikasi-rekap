import React from 'react';
import { 
  Bell, 
  ChevronRight, 
  Send, 
  Wallet, 
  Download, 
  Banknote, 
  PiggyBank, 
  FileText, 
  Receipt, 
  Info, 
  Users, 
  Settings,
  TrendingUp,
  CreditCard
} from 'lucide-react';
import './neumorphic-light.css';

export function NeumorphicLight() {
  return (
    <div className="neu-container relative overflow-x-hidden pb-20">
      <div className="neu-light-source"></div>
      
      <div className="max-w-[440px] mx-auto w-full relative z-10 p-5 pt-8 flex flex-col gap-6">
        
        {/* Header */}
        <header className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl neu-raised flex items-center justify-center text-[#0ea5e9]">
              <span className="font-bold text-xl neu-glow-text">A</span>
            </div>
            <div>
              <h1 className="font-bold text-lg text-slate-800 leading-tight">AlfathPulsa</h1>
              <p className="text-sm font-medium text-slate-500">Cabang Pusat</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-800">Budi Santoso</p>
              <p className="text-xs font-medium text-slate-500">Mandor</p>
            </div>
            <button className="w-12 h-12 rounded-full neu-raised-sm flex items-center justify-center text-slate-600 relative">
              <Bell size={20} />
              <span className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full neu-glow-dot-cyan border-2 border-[#e8ebf2]"></span>
            </button>
          </div>
        </header>

        {/* Date & Time */}
        <div className="flex items-center justify-center">
          <div className="neu-inset px-5 py-2 rounded-full text-sm font-semibold text-slate-600">
            Sabtu, 27 Jun · 09:14
          </div>
        </div>

        {/* Announcement */}
        <div className="neu-inset rounded-xl p-4 flex items-start gap-3 border border-white/40">
          <div className="mt-0.5 neu-glow-dot-amber w-2 h-2 rounded-full flex-shrink-0"></div>
          <p className="text-sm font-medium text-slate-700 leading-relaxed">
            Setoran wajib sebelum jam 16.00 — jangan lupa rekap voucher harian.
          </p>
        </div>

        {/* HERO Balance Panel */}
        <div className="neu-raised rounded-[28px] p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-400/10 blur-3xl rounded-full"></div>
          
          <div className="flex justify-between items-start mb-4 relative z-10">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Dana Terkelola</h2>
            <div className="neu-raised-sm rounded-full px-3 py-1 flex items-center gap-1.5 border border-white/50">
              <TrendingUp size={14} className="text-[#0ea5e9]" />
              <span className="text-xs font-bold text-[#0ea5e9] animate-pulse-glow">+3,2% hari ini</span>
            </div>
          </div>
          
          <div className="mb-6 relative z-10">
            <div className="flex items-start">
              <span className="text-xl font-bold text-slate-700 mt-2 mr-1">Rp</span>
              <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight" style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }}>
                47.850.000
              </h1>
            </div>
          </div>
          
          <div className="flex gap-4 relative z-10">
            <div className="neu-inset flex-1 rounded-2xl p-4 flex flex-col gap-1 border border-white/30">
              <span className="text-xs font-semibold text-slate-500">Saldo Digital</span>
              <span className="text-base font-bold text-slate-800">Rp 28.300.000</span>
            </div>
            <div className="neu-inset flex-1 rounded-2xl p-4 flex flex-col gap-1 border border-white/30">
              <span className="text-xs font-semibold text-slate-500">Saldo Tunai</span>
              <span className="text-base font-bold text-slate-800">Rp 19.550.000</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex justify-between items-center px-2">
          <div className="flex flex-col items-center gap-3">
            <button className="w-16 h-16 rounded-full neu-glow flex items-center justify-center text-[#0ea5e9] border border-white/50 transition-transform active:scale-95">
              <Send size={24} className="ml-1" />
            </button>
            <span className="text-xs font-bold text-slate-700">Geser Dana</span>
          </div>
          
          <div className="flex flex-col items-center gap-3">
            <button className="w-16 h-16 rounded-full neu-raised flex items-center justify-center text-slate-600 transition-transform active:scale-95">
              <Download size={24} />
            </button>
            <span className="text-xs font-bold text-slate-600">Tarik Tunai</span>
          </div>
          
          <div className="flex flex-col items-center gap-3">
            <button className="w-16 h-16 rounded-full neu-raised flex items-center justify-center text-slate-600 transition-transform active:scale-95">
              <Wallet size={24} />
            </button>
            <span className="text-xs font-bold text-slate-600">Setor</span>
          </div>
        </div>

        {/* Menu Tiles Grid */}
        <div className="grid grid-cols-4 gap-4 mt-2">
          {[
            { icon: Banknote, label: 'Hutang/Bon', active: true },
            { icon: PiggyBank, label: 'Tabungan' },
            { icon: Wallet, label: 'Setoran' },
            { icon: FileText, label: 'Rekap Vcr' },
            { icon: Receipt, label: 'Slip Gaji' },
            { icon: Info, label: 'Info SOP' },
            { icon: Users, label: 'Tim/Cabg' },
            { icon: Settings, label: 'Pengaturan' }
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <button className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform active:scale-95 ${item.active ? 'neu-glow-active text-[#0ea5e9] border border-white/60' : 'neu-raised-icon text-slate-600 border border-white/40'}`}>
                <item.icon size={22} className={item.active ? 'neu-glow-text' : ''} />
              </button>
              <span className={`text-[10px] sm:text-xs font-bold text-center leading-tight ${item.active ? 'text-[#0ea5e9]' : 'text-slate-600'}`}>
                {item.label}
              </span>
            </div>
          ))}
        </div>

        {/* Kinerja Cabang */}
        <div className="mt-4">
          <div className="flex justify-between items-end mb-4 px-1">
            <h3 className="text-lg font-bold text-slate-800">Kinerja Cabang</h3>
            <button className="text-xs font-bold text-[#0ea5e9] neu-glow-text flex items-center gap-1">
              Lihat Semua <ChevronRight size={14} />
            </button>
          </div>
          
          <div className="flex flex-col gap-4">
            {[
              { name: 'Cabang Pusat', modal: '25jt', tunai: '8,2jt', dot: 'green' },
              { name: 'Cabang Pasar', modal: '18jt', tunai: '5,1jt', dot: 'none' },
              { name: 'Cabang Stasiun', modal: '12jt', tunai: '3,4jt', dot: 'amber' },
            ].map((cabang, i) => (
              <div key={i} className="neu-raised rounded-2xl p-4 flex items-center justify-between border border-white/30">
                <div className="flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full ${cabang.dot === 'green' ? 'neu-glow-dot-green' : cabang.dot === 'amber' ? 'neu-glow-dot-amber' : 'bg-slate-300'}`}></div>
                  <span className="font-bold text-slate-700">{cabang.name}</span>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-slate-800">Modal Rp {cabang.modal}</div>
                  <div className="text-xs font-semibold text-slate-500 mt-0.5">Tunai Rp {cabang.tunai}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Saldo Bank & E-Wallet */}
        <div className="mt-4">
          <div className="flex justify-between items-end mb-4 px-1">
            <h3 className="text-lg font-bold text-slate-800">Bank & E-Wallet</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {[
              { name: 'BRI', amount: '15.200.000' },
              { name: 'BCA', amount: '8.600.000' },
              { name: 'Mandiri', amount: '4.500.000' },
              { name: 'DANA', amount: '1.250.000' },
            ].map((bank, i) => (
              <div key={i} className="neu-raised rounded-2xl p-4 border border-white/30 flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full neu-inset flex items-center justify-center text-slate-500 border border-white/50">
                    <CreditCard size={14} />
                  </div>
                  <span className="font-bold text-sm text-slate-700">{bank.name}</span>
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-500">Rp</span>
                  <span className="text-base font-bold text-slate-800 ml-1">{bank.amount}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
