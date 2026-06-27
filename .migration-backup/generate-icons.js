import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function generate() {
  const svgPath = path.join(process.cwd(), 'public', 'icon.svg');
  const out192 = path.join(process.cwd(), 'public', 'icon-192.png');
  const out512 = path.join(process.cwd(), 'public', 'icon-512.png');
  const outMobileScreenshot = path.join(process.cwd(), 'public', 'screenshot-mobile.png');
  const outDesktopScreenshot = path.join(process.cwd(), 'public', 'screenshot-desktop.png');

  console.log('Generating PWA icons and showcase screenshots...');
  
  if (!fs.existsSync(svgPath)) {
    console.error('Error: public/icon.svg not found!');
    process.exit(1);
  }

  try {
    // Generate 192x192
    await sharp(svgPath)
      .resize(192, 192)
      .png()
      .toFile(out192);
    console.log('Generated: public/icon-192.png');

    // Generate 512x512
    await sharp(svgPath)
      .resize(512, 512)
      .png()
      .toFile(out512);
    console.log('Generated: public/icon-512.png');

    // Design high-fidelity Mobile Screenshot SVG
    const mobileSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 540 960" width="540" height="960">
  <rect width="540" height="960" fill="#0B111D"/>
  <rect x="0" y="0" width="540" height="70" fill="#111827" />
  <circle cx="40" cy="35" r="16" fill="#1d4ed8"/>
  <text x="40" y="35" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="central">A</text>
  <text x="75" y="35" font-family="Arial, sans-serif" font-size="18" font-weight="900" fill="white" dominant-baseline="central">AlfathPulsa</text>
  <rect x="30" y="100" width="480" height="140" rx="16" fill="#1E293B" stroke="#334155" stroke-width="1.5" />
  <text x="50" y="140" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#3B82F6" letter-spacing="1">TOTAL OMSET HARI INI</text>
  <text x="50" y="185" font-family="Arial, sans-serif" font-size="32" font-weight="bold" fill="white">Rp 12.450.000</text>
  <text x="50" y="215" font-family="Arial, sans-serif" font-size="11" fill="#94A3B8">Statistik Gabungan â€¢ 4 Cabang Aktif</text>
  <text x="35" y="280" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="white">AKTIVITAS REKAP TERBARU</text>
  <rect x="30" y="300" width="480" height="70" rx="12" fill="#111827" stroke="#1E293B" stroke-width="1" />
  <circle cx="65" cy="335" r="18" fill="#10B981" fill-opacity="0.1"/>
  <path d="M 60 338 L 65 330 L 70 338" fill="none" stroke="#10B981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <text x="100" y="330" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="white">Setoran Sukses - Cabang Pusat</text>
  <text x="100" y="348" font-family="Arial, sans-serif" font-size="11" fill="#64748B">Oleh Mandor Ahmad â€¢ Baru saja</text>
  <text x="460" y="335" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#10B981" text-anchor="end" dominant-baseline="central">+ Rp 2.500.000</text>
  <rect x="30" y="385" width="480" height="70" rx="12" fill="#111827" stroke="#1E293B" stroke-width="1" />
  <circle cx="65" cy="420" r="18" fill="#EF4444" fill-opacity="0.1"/>
  <path d="M 60 417 L 65 425 L 70 417" fill="none" stroke="#EF4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <text x="100" y="415" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="white">Pencatatan Bon / Piutang</text>
  <text x="100" y="433" font-family="Arial, sans-serif" font-size="11" fill="#64748B">Cabang Barat â€¢ 15 mnt yang lalu</text>
  <text x="460" y="420" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#EF4444" text-anchor="end" dominant-baseline="central">- Rp 450.000</text>
  <rect x="30" y="470" width="480" height="70" rx="12" fill="#111827" stroke="#1E293B" stroke-width="1" />
  <circle cx="65" cy="505" r="18" fill="#10B981" fill-opacity="0.1"/>
  <path d="M 60 508 L 65 500 L 70 508" fill="none" stroke="#10B981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <text x="100" y="500" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="white">Setoran Sukses - Cabang Timur</text>
  <text x="100" y="518" font-family="Arial, sans-serif" font-size="11" fill="#64748B">Oleh Mandor Budi â€¢ 1 jam yang lalu</text>
  <text x="460" y="505" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#10B981" text-anchor="end" dominant-baseline="central">+ Rp 1.800.000</text>
  <rect x="30" y="565" width="480" height="230" rx="16" fill="#1E293B" stroke="#334155" stroke-width="1.5" />
  <text x="50" y="600" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="white">TREN SETORAN MINGGUAN</text>
  <path d="M 60 750 Q 150 670 240 710 T 420 630" fill="none" stroke="#0084FF" stroke-width="4" stroke-linecap="round"/>
  <circle cx="420" cy="630" r="6" fill="#0084FF"/>
  <line x1="60" y1="750" x2="450" y2="750" stroke="#475569" stroke-width="1"/>
  <text x="60" y="770" font-family="Arial, sans-serif" font-size="10" fill="#94A3B8" text-anchor="middle">Sen</text>
  <text x="140" y="770" font-family="Arial, sans-serif" font-size="10" fill="#94A3B8" text-anchor="middle">Sel</text>
  <text x="220" y="770" font-family="Arial, sans-serif" font-size="10" fill="#94A3B8" text-anchor="middle">Rab</text>
  <text x="300" y="770" font-family="Arial, sans-serif" font-size="10" fill="#94A3B8" text-anchor="middle">Kam</text>
  <text x="380" y="770" font-family="Arial, sans-serif" font-size="10" fill="#94A3B8" text-anchor="middle">Jum</text>
  <text x="450" y="770" font-family="Arial, sans-serif" font-size="10" fill="#94A3B8" text-anchor="middle">Sab</text>
  <rect x="0" y="875" width="540" height="85" fill="#111827" stroke="#1E293B" stroke-width="1" />
  <rect x="55" y="890" width="40" height="40" rx="8" fill="#1D4ED8" fill-opacity="0.2" />
  <text x="75" y="910" font-family="Arial, sans-serif" font-size="18" fill="#3B82F6" text-anchor="middle" dominant-baseline="central">ðŸ“Š</text>
  <text x="185" y="910" font-family="Arial, sans-serif" font-size="18" fill="#64748B" text-anchor="middle" dominant-baseline="central">ðŸ’Œ</text>
  <text x="295" y="910" font-family="Arial, sans-serif" font-size="18" fill="#64748B" text-anchor="middle" dominant-baseline="central">ðŸ“</text>
  <text x="405" y="910" font-family="Arial, sans-serif" font-size="18" fill="#64748B" text-anchor="middle" dominant-baseline="central">ðŸ‘¥</text>
  <text x="75" y="942" font-family="Arial, sans-serif" font-size="8" font-weight="bold" fill="#3B82F6" text-anchor="middle">Beranda</text>
  <text x="185" y="942" font-family="Arial, sans-serif" font-size="8" fill="#64748B" text-anchor="middle">Setoran</text>
  <text x="295" y="942" font-family="Arial, sans-serif" font-size="8" fill="#64748B" text-anchor="middle">Piutang</text>
  <text x="405" y="942" font-family="Arial, sans-serif" font-size="8" fill="#64748B" text-anchor="middle">Tim</text>
</svg>
`;

    // Design high-fidelity Desktop Screenshot SVG
    const desktopSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 540" width="960" height="540">
  <rect width="960" height="540" fill="#0B111D"/>
  <rect x="0" y="0" width="220" height="540" fill="#111827"/>
  <circle cx="45" cy="45" r="16" fill="#1d4ed8"/>
  <text x="45" y="45" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="central">A</text>
  <text x="80" y="45" font-family="Arial, sans-serif" font-size="18" font-weight="900" fill="white" dominant-baseline="central">AlfathPulsa</text>
  <rect x="15" y="100" width="190" height="40" rx="8" fill="#1D4ED8" fill-opacity="0.2"/>
  <text x="35" y="120" font-family="Arial, sans-serif" font-size="14" fill="#3B82F6" dominant-baseline="central">ðŸ“Š   Beranda</text>
  <text x="35" y="170" font-family="Arial, sans-serif" font-size="14" fill="#64748B" dominant-baseline="central">ðŸ’Œ   Setoran</text>
  <text x="35" y="220" font-family="Arial, sans-serif" font-size="14" fill="#64748B" dominant-baseline="central">ðŸ“   Piutang</text>
  <text x="35" y="270" font-family="Arial, sans-serif" font-size="14" fill="#64748B" dominant-baseline="central">ðŸ‘¥   Tim &amp; Cabang</text>
  <text x="35" y="320" font-family="Arial, sans-serif" font-size="14" fill="#64748B" dominant-baseline="central">âš™ï¸   Pengaturan</text>
  <text x="250" y="50" font-family="Arial, sans-serif" font-size="22" font-weight="bold" fill="white">Dashboard Utama</text>
  <text x="250" y="75" font-family="Arial, sans-serif" font-size="12" fill="#64748B">Sistem Pencatatan Pembukuan Dan Pencatatan Keuangan Cabang</text>
  <rect x="250" y="110" width="210" height="110" rx="16" fill="#1E293B" stroke="#334155" stroke-width="1.5" />
  <text x="270" y="140" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#10B981" letter-spacing="1">TOTAL SETORAN (HARI INI)</text>
  <text x="270" y="175" font-family="Arial, sans-serif" font-size="22" font-weight="bold" fill="white">Rp 12.450.000</text>
  <text x="270" y="200" font-family="Arial, sans-serif" font-size="9" fill="#94A3B8">Peningkatan 12% dari kemarin</text>
  <rect x="480" y="110" width="210" height="110" rx="16" fill="#1E293B" stroke="#334155" stroke-width="1.5" />
  <text x="500" y="140" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#EF4444" letter-spacing="1">TOTAL PIUTANG AKTIF</text>
  <text x="500" y="175" font-family="Arial, sans-serif" font-size="22" font-weight="bold" fill="white">Rp 3.120.000</text>
  <text x="500" y="200" font-family="Arial, sans-serif" font-size="9" fill="#94A3B8">Dari 8 Transaksi Belum Lunas</text>
  <rect x="710" y="110" width="220" height="110" rx="16" fill="#1E293B" stroke="#334155" stroke-width="1.5" />
  <text x="730" y="140" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#0084FF" letter-spacing="1">JUMLAH CABANG AKTIF</text>
  <text x="730" y="175" font-family="Arial, sans-serif" font-size="22" font-weight="bold" fill="white">4 Cabang</text>
  <text x="730" y="200" font-family="Arial, sans-serif" font-size="9" fill="#94A3B8">Semua Cabang Beroperasi Lancar</text>
  <rect x="250" y="240" width="440" height="270" rx="16" fill="#111827" stroke="#1E293B" stroke-width="1" />
  <text x="270" y="275" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="white">Log Aktivitas Terbaru</text>
  <circle cx="285" cy="315" r="12" fill="#10B981" fill-opacity="0.1"/>
  <text x="310" y="312" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="white">Setoran Sukses - Cabang Pusat</text>
  <text x="310" y="327" font-family="Arial, sans-serif" font-size="10" fill="#64748B">Ahmad â€¢ Baru saja</text>
  <text x="660" y="320" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#10B981" text-anchor="end">Rp 2.500.000</text>
  <circle cx="285" cy="365" r="12" fill="#EF4444" fill-opacity="0.1"/>
  <text x="310" y="362" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="white">Tambah Bon Baru - Cabang Barat</text>
  <text x="310" y="377" font-family="Arial, sans-serif" font-size="10" fill="#64748B">Rian â€¢ 15 menit lalu</text>
  <text x="660" y="370" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#EF4444" text-anchor="end">- Rp 450.000</text>
  <circle cx="285" cy="415" r="12" fill="#10B981" fill-opacity="0.1"/>
  <text x="310" y="412" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="white">Setoran Sukses - Cabang Timur</text>
  <text x="310" y="427" font-family="Arial, sans-serif" font-size="10" fill="#64748B">Budi â€¢ 1 jam lalu</text>
  <text x="660" y="420" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#10B981" text-anchor="end">Rp 1.800.000</text>
  <circle cx="285" cy="465" r="12" fill="#0084FF" fill-opacity="0.1"/>
  <text x="310" y="462" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="white">Pemasukan Lain-lain - Pusat</text>
  <text x="310" y="477" font-family="Arial, sans-serif" font-size="10" fill="#64748B">Sistem â€¢ 3 jam lalu</text>
  <text x="660" y="470" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#0084FF" text-anchor="end">Rp 150.000</text>
  <rect x="710" y="240" width="220" height="270" rx="16" fill="#1E293B" stroke="#334155" stroke-width="1.5" />
  <text x="730" y="275" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="white">Prosentase Setoran</text>
  <circle cx="820" cy="370" r="50" fill="none" stroke="#334155" stroke-width="15"/>
  <circle cx="820" cy="370" r="50" fill="none" stroke="#1D4ED8" stroke-width="15" stroke-dasharray="210 100" stroke-dashoffset="0"/>
  <text x="820" y="370" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="central">67%</text>
  <text x="820" y="460" font-family="Arial, sans-serif" font-size="11" fill="#94A3B8" text-anchor="middle">Cabang Pusat Dominan</text>
</svg>
`;

    // Convert mobile SVG to PNG using sharp
    await sharp(Buffer.from(mobileSvg))
      .png()
      .toFile(outMobileScreenshot);
    console.log('Generated: public/screenshot-mobile.png');

    // Convert desktop SVG to PNG using sharp
    await sharp(Buffer.from(desktopSvg))
      .png()
      .toFile(outDesktopScreenshot);
    console.log('Generated: public/screenshot-desktop.png');
    
  } catch (err) {
    console.error('Failed to generate PNG icons and screenshots:', err);
    process.exit(1);
  }
}

generate();

