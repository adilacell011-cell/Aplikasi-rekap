import React from 'react';

interface AppLogoIconProps {
  size?: number;
  className?: string;
}

/**
 * Logo mark "A" dengan aksen oranye.
 * Geometri dihitung dengan vektor normal agar presisi dan bersih.
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
          <stop offset="0%" stopColor="#1e40af" />
          <stop offset="100%" stopColor="#1e3a8a" />
        </linearGradient>
      </defs>

      {/* Blue rounded square background */}
      <rect width="44" height="44" rx="10" fill="url(#ap-bg)" />

      {/*
        Letter A — both legs share the apex at (22, 3).
        Left leg:  apex (22,3) → inner shoulder (26,7) → bottom-inner (11,41) → bottom-outer (3,37)
        Right leg: apex (22,3) → inner shoulder (18,7) → bottom-inner (33,41) → bottom-outer (41,37)
        Legs are symmetric around x=22.
      */}
      <polygon points="22,3 26,7 11,41 3,37" fill="white" />
      <polygon points="22,3 18,7 33,41 41,37" fill="white" />

      {/*
        Orange swoosh — a clean diagonal parallelogram replacing the crossbar.
        Goes from lower-left to upper-right, overlapping the left leg's inner third
        and the open space between the legs.
        Points: top-left (6,31) → top-right (26,19) → bottom-right (30,25) → bottom-left (10,37)
      */}
      <polygon points="6,31 26,19 30,25 10,37" fill="#f97316" />
    </svg>
  );
}

interface AppLogoWordmarkProps {
  className?: string;
  iconSize?: number;
  /** 'horizontal' = ikon + teks sejajar | 'stacked' = ikon di atas teks */
  layout?: 'horizontal' | 'stacked';
}

/** Logo lengkap: ikon A + wordmark "AlfathPulsa" */
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
