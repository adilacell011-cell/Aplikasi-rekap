import React from 'react';

interface AppLogoIconProps {
  size?: number;
  className?: string;
}

/** Monogram "AP" — dipakai sebagai ikon di mana saja */
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
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#1e3a8a" />
        </linearGradient>
      </defs>
      <rect width="44" height="44" rx="12" fill="url(#ap-bg)" />

      {/* Letter A */}
      <rect x="4" y="10" width="4.5" height="24" rx="2" fill="white" />
      <rect x="14" y="10" width="4.5" height="24" rx="2" fill="white" />
      <rect x="4" y="10" width="15" height="4.5" rx="2" fill="white" />
      <rect x="5" y="22" width="13" height="3.5" rx="1.5" fill="white" />

      {/* Letter P */}
      <rect x="25" y="10" width="4.5" height="24" rx="2" fill="white" />
      <rect x="25" y="10" width="12" height="4.5" rx="2" fill="white" />
      <rect x="25" y="21.5" width="12" height="4" rx="1.5" fill="white" />
      <rect x="32.5" y="10" width="4.5" height="16" rx="2" fill="white" />

      {/* Lightning accent */}
      <path d="M35 34 L39 27 L36.5 27 L40 22 L33 30 L35.5 30 Z" fill="#93c5fd" opacity="0.8" />
    </svg>
  );
}

interface AppLogoWordmarkProps {
  className?: string;
  iconSize?: number;
  /** 'horizontal' = ikon + teks sejajar | 'stacked' = ikon di atas teks */
  layout?: 'horizontal' | 'stacked';
}

/** Logo lengkap: ikon AP + wordmark "AlfathPulsa" */
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
