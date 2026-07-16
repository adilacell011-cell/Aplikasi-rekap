import React from 'react';

interface AppLogoIconProps {
  size?: number;
  className?: string;
}

/**
 * AlfathPulsa logo mark — recreasi logo resmi Agen BRILink AlfathPulsa.
 *
 * Struktur:
 *  - "A" dua kaki solid (biru BRILink #1b3a8a)
 *  - Speed-lines diagonal di dalam hollow A (oranye/gold)
 *  - "P" D-shape (oranye vivid, even-odd hole) — ditampilkan hanya
 *    pada ukuran ≥ 36px agar tidak terlalu padat di icon kecil
 */
export function AppLogoIcon({ size = 44, className = '' }: AppLogoIconProps) {
  const showP = size >= 36;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 260 260"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        {/* Background rounded square — dark navy for dark theme */}
        <linearGradient id="ap-bg2" x1="0" y1="0" x2="260" y2="260" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#0c1460" />
          <stop offset="100%" stopColor="#1a2fa0" />
        </linearGradient>

        {/* Subtle top-shine */}
        <linearGradient id="ap-shine2" x1="0" y1="0" x2="0" y2="260" gradientUnits="userSpaceOnUse">
          <stop offset="0%"  stopColor="#ffffff" stopOpacity="0.12" />
          <stop offset="50%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>

        {/* P gradient — vivid amber-orange */}
        <linearGradient id="p-grad2" x1="0.2" y1="0" x2="1" y2="1" gradientUnits="objectBoundingBox">
          <stop offset="0%"   stopColor="#ffaa00" />
          <stop offset="55%"  stopColor="#f97316" />
          <stop offset="100%" stopColor="#e55a00" />
        </linearGradient>

        {/* Speed-line gradients */}
        <linearGradient id="sl1-2" x1="0" y1="0" x2="260" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#fde68a" />
          <stop offset="100%" stopColor="#fbbf24" />
        </linearGradient>
        <linearGradient id="sl2-2" x1="0" y1="0" x2="260" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#f97316" />
        </linearGradient>
        <linearGradient id="sl3-2" x1="0" y1="0" x2="260" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#f97316" />
          <stop offset="100%" stopColor="#ea580c" />
        </linearGradient>

        {/* Clip to A hollow */}
        <clipPath id="a-clip2">
          <polygon points="105,58 46,196 164,196" />
        </clipPath>
      </defs>

      {/* Rounded square background */}
      <rect width="260" height="260" rx="54" fill="url(#ap-bg2)" />
      <rect width="260" height="260" rx="54" fill="url(#ap-shine2)" />

      {/*
        ── A mark ────────────────────────────────────────────────────
        Apex: (105, 18)
        Left outer:  (16, 196)
        Left inner:  (46, 196)
        Inner apex:  (105, 58)
        Right inner: (164, 196)
        Right outer: (194, 196)
      */}

      {/* A — left leg (BRILink blue) */}
      <polygon
        points="105,18 16,196 46,196 105,58"
        fill="#2554c7"
      />

      {/* A — right leg (BRILink blue) */}
      <polygon
        points="105,18 105,58 164,196 194,196"
        fill="#2554c7"
      />

      {/* Speed lines clipped to A hollow */}
      <g clipPath="url(#a-clip2)">
        {/* Bottom strip — gold */}
        <polygon points="0,230 260,115 260,135 0,250" fill="url(#sl1-2)" />
        {/* Middle strip — amber */}
        <polygon points="0,205 260,90  260,110 0,225" fill="url(#sl2-2)" />
        {/* Top strip — orange */}
        <polygon points="0,180 260,65  260,85  0,200" fill="url(#sl3-2)" />
      </g>

      {/*
        ── P mark (only when size ≥ 36) ──────────────────────────────
        Spine left: x=112, inner spine wall: x=130
        Bowl: D-arc centred at (130, 108), r_outer=58, r_inner=38
        P spans y=18 → y=198
      */}
      {showP && (
        <path
          fillRule="evenodd"
          fill="url(#p-grad2)"
          d="
            M 112,18
            L 130,18
            A 58,58 0 0,1 188,76
            A 58,58 0 0,1 130,134
            L 112,134
            Z
            M 130,40
            A 36,36 0 0,1 166,76
            A 36,36 0 0,1 130,112
            Z
          "
        />
      )}
    </svg>
  );
}

interface AppLogoWordmarkProps {
  className?: string;
  iconSize?: number;
  layout?: 'horizontal' | 'stacked';
}

/** Logo lengkap: ikon + wordmark */
export function AppLogoWordmark({
  className = '',
  iconSize = 44,
  layout = 'horizontal',
}: AppLogoWordmarkProps) {
  if (layout === 'stacked') {
    return (
      <div className={`flex flex-col items-center gap-3 ${className}`}>
        <AppLogoIcon size={iconSize} />
        <LogoText />
      </div>
    );
  }
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <AppLogoIcon size={iconSize} />
      <LogoText />
    </div>
  );
}

function LogoText() {
  return (
    <div className="flex flex-col leading-none select-none">
      <span className="font-black tracking-tight text-[1.35rem] leading-none">
        <span className="text-white">Alfath</span>
        <span className="text-orange-400">Pulsa</span>
      </span>
      <span className="text-[8px] font-black uppercase tracking-[0.3em] text-white/35 mt-0.5">
        Agen BRILink
      </span>
    </div>
  );
}
