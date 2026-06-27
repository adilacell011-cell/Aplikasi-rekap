import React from 'react';
import { 
  Bell, 
  Menu, 
  ArrowRightLeft, 
  Download, 
  Upload, 
  Wallet, 
  PiggyBank, 
  Receipt, 
  FileText, 
  BookOpen, 
  Users, 
  Settings,
  TrendingUp,
  MapPin,
  Building2,
  Landmark,
  CreditCard,
  Smartphone,
  ChevronRight,
  Info
} from 'lucide-react';
import './_group.css';

export function VibrantGradient() {
  return (
    <div className="vibrant-gradient-app min-h-screen flex justify-center bg-gray-100/50">
      {/* Mobile Container */}
      <div className="w-full max-w-[440px] bg-[#f8fafc] min-h-screen relative shadow-2xl overflow-hidden flex flex-col">
        
        {/* Top Background Glow */}
        <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-indigo-100 via-purple-50/50 to-transparent pointer-events-none" />

        {/* Header */}
        <header className="px-5 pt-12 pb-4 relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 p-[2px] shadow-sm">
                <div className="w-full h-full bg-white rounded-full flex items-center justify-center border-2 border-white">
                  <span className="text-indigo-600 font-bold text-sm">AP</span>
                </div>
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-800 leading-tight">AlfathPulsa</h1>
                <p className="text-xs text-slate-500 font-medium">Budi Santoso · Mandor</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-semibold text-slate-700">Cabang Pusat</p>
                <p className="text-[10px] text-slate-500">Sabtu, 27 Jun · 09:14</p>
              </div>
              <button className="relative p-2 bg-white rounded-full shadow-sm text-slate-600 border border-slate-100 hover:bg-slate-50">
                <Bell size={18} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-pink-500 rounded-full ring-2 ring-white" />
              </button>
            </div>
          </div>

          <div className="sm:hidden flex justify-between items-center bg-white/60 backdrop-blur-md rounded-lg py-2 px-3 border border-white/40 shadow-sm">
            <div className="flex items-center gap-1.5 text-indigo-700">
              <MapPin size={14} />
              <span className="text-xs font-bold">Cabang Pusat</span>
            </div>
            <span className="text-[10px] font-medium text-slate-500">Sabtu, 27 Jun · 09:14</span>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto vg-hide-scrollbar pb-24 relative z-10">
          
          {/* Announcement Strip */}
          <div className="mx-5 mb-5 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-full border border-blue-500/20 py-2 px-4 flex items-center gap-2">
            <Info size={16} className="text-blue-600 flex-shrink-0" />
            <div className="vg-marquee flex-1">
              <span className="vg-marquee-content text-xs font-medium text-blue-800">
                Setoran wajib sebelum jam 16.00 — jangan lupa rekap voucher harian.
              </span>
            </div>
          </div>

          {/* Hero Balance Card */}
          <div className="mx-5 mb-6">
            <div className="vg-hero-gradient rounded-3xl p-6 text-white shadow-[0_10px_30px_-10px_rgba(124,58,237,0.5)] relative overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/20 rounded-full blur-2xl"></div>
              <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-pink-500/30 rounded-full blur-2xl"></div>
              
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-white/80 text-sm font-medium">Total Dana Terkelola</p>
                  <div className="bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1 border border-white/20">
                    <TrendingUp size={12} className="text-green-300" />
                    <span className="text-xs font-bold text-white">+3,2% hari ini</span>
                  </div>
                </div>
                
                <h2 className="text-3xl font-extrabold tracking-tight mb-6 flex items-baseline gap-1 drop-shadow-sm">
                  <span className="text-lg font-medium text-white/80">Rp</span>
                  <span className="vg-font-mono">47.850.000</span>
                </h2>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/20">
                  <div>
                    <p className="text-white/70 text-[11px] font-medium mb-1">Saldo Digital</p>
                    <p className="font-bold text-sm tracking-wide">
                      <span className="text-white/80 font-normal mr-0.5">Rp</span>
                      28.300.000
                    </p>
                  </div>
                  <div>
                    <p className="text-white/70 text-[11px] font-medium mb-1">Saldo Tunai</p>
                    <p className="font-bold text-sm tracking-wide">
                      <span className="text-white/80 font-normal mr-0.5">Rp</span>
                      19.550.000
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mx-5 mb-8 flex justify-center gap-4">
            {[
              { icon: ArrowRightLeft, label: "Geser Dana", color: "text-indigo-600", bg: "bg-indigo-50", shadow: "shadow-indigo-100" },
              { icon: Upload, label: "Tarik Tunai", color: "text-emerald-600", bg: "bg-emerald-50", shadow: "shadow-emerald-100" },
              { icon: Download, label: "Setor", color: "text-blue-600", bg: "bg-blue-50", shadow: "shadow-blue-100" }
            ].map((action, i) => (
              <button key={i} className="flex flex-col items-center gap-2 group">
                <div className={`w-14 h-14 rounded-2xl ${action.bg} flex items-center justify-center shadow-lg ${action.shadow} transition-transform group-hover:scale-105 border border-white`}>
                  <action.icon size={22} className={action.color} />
                </div>
                <span className="text-[11px] font-bold text-slate-700">{action.label}</span>
              </button>
            ))}
          </div>

          {/* Menu Tiles */}
          <div className="mx-5 mb-8 grid grid-cols-4 gap-y-5 gap-x-3">
            {[
              { icon: Receipt, label: "Hutang/Bon", gradient: "from-rose-400 to-pink-500" },
              { icon: PiggyBank, label: "Tabungan", gradient: "from-amber-400 to-orange-500" },
              { icon: Wallet, label: "Setoran", gradient: "from-emerald-400 to-teal-500" },
              { icon: FileText, label: "Rekap Voucher", gradient: "from-blue-400 to-indigo-500" },
              { icon: BookOpen, label: "Slip Gaji", gradient: "from-violet-400 to-purple-500" },
              { icon: Info, label: "Info SOP", gradient: "from-cyan-400 to-blue-500" },
              { icon: Users, label: "Tim & Cabang", gradient: "from-fuchsia-400 to-pink-500" },
              { icon: Settings, label: "Pengaturan", gradient: "from-slate-400 to-slate-500" }
            ].map((item, i) => (
              <button key={i} className="flex flex-col items-center gap-2">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.gradient} p-[1px] shadow-sm`}>
                  <div className="w-full h-full bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/40 shadow-inner">
                    <item.icon size={20} className="text-white drop-shadow-sm" />
                  </div>
                </div>
                <span className="text-[10px] font-bold text-slate-600 text-center leading-tight w-full break-words px-1">{item.label}</span>
              </button>
            ))}
          </div>

          {/* Kinerja Cabang */}
          <div className="mx-5 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Building2 size={18} className="text-indigo-500" />
                Kinerja Cabang
              </h3>
              <button className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center">
                Lihat Semua <ChevronRight size={14} />
              </button>
            </div>
            
            <div className="flex flex-col gap-3">
              {[
                { name: "Cabang Pusat", modal: "25jt", tunai: "8,2jt", health: "bg-emerald-400", bg: "from-indigo-50/50 to-white" },
                { name: "Cabang Pasar", modal: "18jt", tunai: "5,1jt", health: "bg-emerald-400", bg: "from-blue-50/50 to-white" },
                { name: "Cabang Stasiun", modal: "12jt", tunai: "3,4jt", health: "bg-amber-400", bg: "from-orange-50/50 to-white" },
              ].map((cabang, i) => (
                <div key={i} className={`vg-glass-card rounded-2xl p-4 flex items-center justify-between bg-gradient-to-r ${cabang.bg}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center border border-slate-100 relative">
                      <MapPin size={18} className="text-slate-600" />
                      <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 ${cabang.health} rounded-full ring-2 ring-white`} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">{cabang.name}</h4>
                      <p className="text-[11px] text-slate-500 font-medium">Modal <span className="font-bold text-slate-700">Rp {cabang.modal}</span></p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400 font-medium mb-0.5">Tunai di Laci</p>
                    <p className="text-sm font-bold text-slate-800">Rp {cabang.tunai}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Saldo Bank & E-Wallet */}
          <div className="mx-5 mb-8">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
              <Landmark size={18} className="text-blue-500" />
              Saldo Bank & E-Wallet
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              {[
                { name: "BRI", balance: "15.200.000", icon: Landmark, color: "text-blue-700", bg: "bg-blue-50" },
                { name: "BCA", balance: "8.600.000", icon: Landmark, color: "text-blue-600", bg: "bg-blue-50/50" },
                { name: "Mandiri", balance: "4.500.000", icon: Landmark, color: "text-yellow-600", bg: "bg-yellow-50" },
                { name: "DANA", balance: "1.250.000", icon: Smartphone, color: "text-sky-500", bg: "bg-sky-50" },
              ].map((bank, i) => (
                <div key={i} className="vg-glass-card rounded-2xl p-3.5 bg-white flex flex-col justify-between hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-7 h-7 rounded-lg ${bank.bg} flex items-center justify-center`}>
                      <bank.icon size={14} className={bank.color} />
                    </div>
                    <span className="text-xs font-bold text-slate-700">{bank.name}</span>
                  </div>
                  <p className="text-[13px] font-bold text-slate-800">
                    <span className="text-slate-400 font-medium mr-1 text-[11px]">Rp</span>
                    {bank.balance}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
