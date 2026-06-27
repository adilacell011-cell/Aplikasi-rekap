import React from 'react';
import { 
  Bell, 
  ChevronRight, 
  ArrowRightLeft, 
  Download, 
  Upload,
  Receipt,
  PiggyBank,
  FileText,
  Users,
  Settings,
  AlertCircle,
  TrendingUp,
  Wallet,
  Building2,
  Building,
  Store,
  Landmark,
  Smartphone,
  Info
} from 'lucide-react';

export function RefinedMinimal() {
  return (
    <div className="min-h-screen bg-slate-100 flex justify-center items-center py-10 font-sans">
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        
        .refined-minimal-container {
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .marquee-container {
          display: flex;
          overflow: hidden;
          width: 100%;
        }

        .marquee-content {
          white-space: nowrap;
          animation: marquee 20s linear infinite;
        }

        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
      `}} />
      
      <div className="refined-minimal-container w-full max-w-[420px] bg-white h-[850px] max-h-screen sm:rounded-[40px] sm:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] relative overflow-hidden flex flex-col border border-slate-200/50">
        
        {/* Top Header */}
        <header className="px-6 pt-10 pb-4 bg-white z-10 shrink-0">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase mb-1.5">Sabtu, 27 Jun · 09:14</p>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">AlfathPulsa</h1>
            </div>
            <button className="w-10 h-10 rounded-full border border-slate-100 flex items-center justify-center relative bg-white hover:bg-slate-50 transition-colors shadow-sm">
              <Bell size={18} className="text-slate-600" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-slate-900 rounded-full border-2 border-white"></span>
            </button>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-white font-medium text-sm shadow-sm">
              BS
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900 leading-tight">Budi Santoso</p>
              <p className="text-xs text-slate-500 mt-0.5">Mandor · Cabang Pusat</p>
            </div>
          </div>
        </header>

        {/* Announcement Strip - Minimalist */}
        <div className="bg-slate-50 border-y border-slate-100 px-6 py-2.5 flex items-center gap-3 shrink-0">
          <Info size={14} className="text-slate-400 shrink-0" />
          <div className="marquee-container relative h-[18px]">
            <p className="marquee-content text-[11px] font-medium text-slate-600 absolute">
              Setoran wajib sebelum jam 16.00 — jangan lupa rekap voucher harian.
            </p>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto hide-scrollbar pb-10">
          
          {/* HERO Balance Card */}
          <section className="px-6 pt-8 pb-6">
            <div className="mb-6 flex justify-between items-end">
              <div>
                <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wide mb-2">Total Dana Terkelola</p>
                <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
                  <span className="text-slate-400 font-medium text-xl mr-1.5 font-sans">Rp</span>
                  47.850.000
                </h2>
              </div>
              <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-700 bg-slate-100 px-2 py-1 rounded-md mb-1">
                <TrendingUp size={12} />
                <span>+3,2% hari ini</span>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-1 pl-3 border-l-[1.5px] border-slate-200">
                <p className="text-[10px] text-slate-500 mb-1 uppercase tracking-wide font-medium">Saldo Digital</p>
                <p className="text-sm font-semibold text-slate-900">Rp 28.300.000</p>
              </div>
              <div className="flex-1 pl-3 border-l-[1.5px] border-slate-200">
                <p className="text-[10px] text-slate-500 mb-1 uppercase tracking-wide font-medium">Saldo Tunai</p>
                <p className="text-sm font-semibold text-slate-900">Rp 19.550.000</p>
              </div>
            </div>
          </section>

          {/* Quick Actions */}
          <section className="px-6 mb-8">
            <div className="flex justify-between gap-3">
              <button className="flex-1 flex flex-col items-center justify-center py-3.5 bg-slate-900 rounded-xl hover:bg-slate-800 transition-colors shadow-sm group">
                <ArrowRightLeft size={18} className="text-white mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-medium text-white">Geser Dana</span>
              </button>
              <button className="flex-1 flex flex-col items-center justify-center py-3.5 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition-colors shadow-sm group">
                <Download size={18} className="text-slate-700 mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-medium text-slate-700">Tarik Tunai</span>
              </button>
              <button className="flex-1 flex flex-col items-center justify-center py-3.5 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition-colors shadow-sm group">
                <Upload size={18} className="text-slate-700 mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-medium text-slate-700">Setor</span>
              </button>
            </div>
          </section>

          <div className="px-6 mb-8">
            <div className="w-full h-px bg-slate-100"></div>
          </div>

          {/* Menu Tiles - Soft Tinted / Refined */}
          <section className="px-6 mb-8">
            <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-5">Layanan</h3>
            <div className="grid grid-cols-4 gap-y-6 gap-x-2">
              <button className="flex flex-col items-center gap-2.5 group">
                <div className="w-11 h-11 rounded-[14px] flex items-center justify-center bg-slate-50 border border-slate-100 group-hover:bg-slate-100 group-hover:border-slate-200 transition-all">
                  <Receipt size={18} className="text-slate-700" />
                </div>
                <span className="text-[10px] font-medium text-slate-600 text-center leading-tight">Hutang/Bon</span>
              </button>
              <button className="flex flex-col items-center gap-2.5 group">
                <div className="w-11 h-11 rounded-[14px] flex items-center justify-center bg-slate-50 border border-slate-100 group-hover:bg-slate-100 group-hover:border-slate-200 transition-all">
                  <PiggyBank size={18} className="text-slate-700" />
                </div>
                <span className="text-[10px] font-medium text-slate-600 text-center leading-tight">Tabungan</span>
              </button>
              <button className="flex flex-col items-center gap-2.5 group">
                <div className="w-11 h-11 rounded-[14px] flex items-center justify-center bg-slate-50 border border-slate-100 group-hover:bg-slate-100 group-hover:border-slate-200 transition-all">
                  <Upload size={18} className="text-slate-700" />
                </div>
                <span className="text-[10px] font-medium text-slate-600 text-center leading-tight">Setoran</span>
              </button>
              <button className="flex flex-col items-center gap-2.5 group">
                <div className="w-11 h-11 rounded-[14px] flex items-center justify-center bg-slate-50 border border-slate-100 group-hover:bg-slate-100 group-hover:border-slate-200 transition-all">
                  <FileText size={18} className="text-slate-700" />
                </div>
                <span className="text-[10px] font-medium text-slate-600 text-center leading-tight">Rekap Vcr</span>
              </button>
              <button className="flex flex-col items-center gap-2.5 group">
                <div className="w-11 h-11 rounded-[14px] flex items-center justify-center bg-slate-50 border border-slate-100 group-hover:bg-slate-100 group-hover:border-slate-200 transition-all">
                  <Wallet size={18} className="text-slate-700" />
                </div>
                <span className="text-[10px] font-medium text-slate-600 text-center leading-tight">Slip Gaji</span>
              </button>
              <button className="flex flex-col items-center gap-2.5 group">
                <div className="w-11 h-11 rounded-[14px] flex items-center justify-center bg-slate-50 border border-slate-100 group-hover:bg-slate-100 group-hover:border-slate-200 transition-all">
                  <AlertCircle size={18} className="text-slate-700" />
                </div>
                <span className="text-[10px] font-medium text-slate-600 text-center leading-tight">Info SOP</span>
              </button>
              <button className="flex flex-col items-center gap-2.5 group">
                <div className="w-11 h-11 rounded-[14px] flex items-center justify-center bg-slate-50 border border-slate-100 group-hover:bg-slate-100 group-hover:border-slate-200 transition-all">
                  <Users size={18} className="text-slate-700" />
                </div>
                <span className="text-[10px] font-medium text-slate-600 text-center leading-tight">Tim & Cab</span>
              </button>
              <button className="flex flex-col items-center gap-2.5 group">
                <div className="w-11 h-11 rounded-[14px] flex items-center justify-center bg-slate-50 border border-slate-100 group-hover:bg-slate-100 group-hover:border-slate-200 transition-all">
                  <Settings size={18} className="text-slate-700" />
                </div>
                <span className="text-[10px] font-medium text-slate-600 text-center leading-tight">Pengaturan</span>
              </button>
            </div>
          </section>

          <div className="px-6 mb-8">
            <div className="w-full h-px bg-slate-100"></div>
          </div>

          {/* Kinerja Cabang */}
          <section className="px-6 mb-8">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">Kinerja Cabang</h3>
              <button className="text-[11px] font-medium text-slate-400 hover:text-slate-800 transition-colors flex items-center">
                Lihat Semua <ChevronRight size={12} className="ml-1" />
              </button>
            </div>
            
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-all cursor-pointer group">
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-white transition-colors border border-transparent group-hover:border-slate-100">
                    <Building2 size={16} className="text-slate-700" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-semibold text-slate-900">Cabang Pusat</p>
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                    </div>
                    <p className="text-[11px] text-slate-500">Modal Rp 25jt · Tunai Rp 8,2jt</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-all cursor-pointer group">
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-white transition-colors border border-transparent group-hover:border-slate-100">
                    <Store size={16} className="text-slate-700" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-semibold text-slate-900">Cabang Pasar</p>
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                    </div>
                    <p className="text-[11px] text-slate-500">Modal Rp 18jt · Tunai Rp 5,1jt</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-all cursor-pointer group">
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-white transition-colors border border-transparent group-hover:border-slate-100">
                    <Building size={16} className="text-slate-700" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-semibold text-slate-900">Cabang Stasiun</p>
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
                    </div>
                    <p className="text-[11px] text-slate-500">Modal Rp 12jt · Tunai Rp 3,4jt</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
              </div>
            </div>
          </section>

          <div className="px-6 mb-8">
            <div className="w-full h-px bg-slate-100"></div>
          </div>

          {/* Saldo Bank & E-Wallet */}
          <section className="px-6 mb-4">
            <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-5">Saldo Bank & E-Wallet</h3>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="border border-slate-100 p-3.5 rounded-xl bg-slate-50/50 hover:bg-slate-50 hover:border-slate-200 transition-all cursor-pointer">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-6 h-6 rounded bg-white border border-slate-100 flex items-center justify-center">
                    <Landmark size={12} className="text-slate-600" />
                  </div>
                  <span className="text-[11px] font-semibold text-slate-700">BRI</span>
                </div>
                <p className="text-sm font-bold text-slate-900">Rp 15.200.000</p>
              </div>

              <div className="border border-slate-100 p-3.5 rounded-xl bg-slate-50/50 hover:bg-slate-50 hover:border-slate-200 transition-all cursor-pointer">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-6 h-6 rounded bg-white border border-slate-100 flex items-center justify-center">
                    <Landmark size={12} className="text-slate-600" />
                  </div>
                  <span className="text-[11px] font-semibold text-slate-700">BCA</span>
                </div>
                <p className="text-sm font-bold text-slate-900">Rp 8.600.000</p>
              </div>

              <div className="border border-slate-100 p-3.5 rounded-xl bg-slate-50/50 hover:bg-slate-50 hover:border-slate-200 transition-all cursor-pointer">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-6 h-6 rounded bg-white border border-slate-100 flex items-center justify-center">
                    <Landmark size={12} className="text-slate-600" />
                  </div>
                  <span className="text-[11px] font-semibold text-slate-700">Mandiri</span>
                </div>
                <p className="text-sm font-bold text-slate-900">Rp 4.500.000</p>
              </div>

              <div className="border border-slate-100 p-3.5 rounded-xl bg-slate-50/50 hover:bg-slate-50 hover:border-slate-200 transition-all cursor-pointer">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-6 h-6 rounded bg-white border border-slate-100 flex items-center justify-center">
                    <Smartphone size={12} className="text-slate-600" />
                  </div>
                  <span className="text-[11px] font-semibold text-slate-700">DANA</span>
                </div>
                <p className="text-sm font-bold text-slate-900">Rp 1.250.000</p>
              </div>
            </div>
          </section>

        </div>
        
        {/* Soft bottom fade to indicate scrollability */}
        <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
      </div>
    </div>
  );
}
