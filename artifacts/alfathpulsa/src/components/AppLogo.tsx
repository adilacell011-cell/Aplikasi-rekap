import React from 'react';

interface AppLogoIconProps {
  size?: number;
  className?: string;
}

/**
 * Logo mark AlfathPulsa.
 *
 * Huruf A hollow: dua kaki diagonal yang berbagi apex — sisi atas solid,
 * bagian tengah terbuka. Aksen blade oranye menggantikan crossbar.
 */
export function AppLogoIcon({ size = 44, className = '' }: AppLogoIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 44 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="ap-bg" x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1d40b0" />
          <stop offset="100%" stopColor="#1e3a8a" />
        </linearGradient>
      </defs>

      {/* Blue rounded square background */}
      <rect width="44" height="44" rx="10" fill="url(#ap-bg)" />

      {/*
        ── Letter A (hollow) ──────────────────────────────────────────
        Both legs share the sharp apex at (22, 3).
        At the apex the legs overlap, creating the solid peak.
        Below the shoulder they diverge to form the open hollow.

        Left leg  : apex(22,3) → inner-shoulder(26,7) → bottom-inner(11,41) → bottom-outer(3,37)
        Right leg : apex(22,3) → inner-shoulder(18,7) → bottom-inner(33,41) → bottom-outer(41,37)
      */}
      <polygon points="22,3 26,7 11,41 3,37"  fill="white" />
      <polygon points="22,3 18,7 33,41 41,37" fill="white" />

      {/*
        ── Orange wing / blade ────────────────────────────────────────
        Pengganti crossbar yang dinamis: runcing di kiri, melebar ke kanan.
        Tip kiri menembus bagian dalam kaki kiri, ujung kanan masuk ke kaki kanan.

        (12,28) = left sharp tip
        (29,16) = top-right edge rises up
        (37,22) = rightmost point
        (34,33) = bottom-right
        (15,35) = bottom-left body
      */}
      <polygon points="12,28 29,16 37,22 34,33 15,35" fill="#f97316" />
    </svg>
  );
}

interface AppLogoWordmarkProps {
  className?: string;
  iconSize?: number;
  layout?: 'horizontal' | 'stacked';
}

/** Logo lengkap: ikon + wordmark "AlfathPulsa" */
export function AppLogoWordmark({
  className = '',
  iconSize = 44,
  layout = 'horizontal',
}: AppLogoWordmarkProps) {
  if (layout === 'stacked') {
    return (
      <div className={`flex flex-col items-center gap-2 ${className}`}>
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
    <span className="font-black tracking-tighter text-2xl leading-none select-none">
      <span className="text-white">Alfath</span>
      <span className="text-blue-400">Pulsa</span>
    </span>
  );
}
