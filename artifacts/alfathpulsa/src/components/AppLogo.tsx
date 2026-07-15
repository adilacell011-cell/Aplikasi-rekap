import React from 'react';

interface AppLogoIconProps {
  size?: number;
  className?: string;
}

/** Logo mark "A" dengan aksen oranye — dipakai sebagai ikon di mana saja */
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

      {/* Blue rounded background */}
      <rect width="44" height="44" rx="10" fill="url(#ap-bg)" />

      {/* White A — left diagonal leg */}
      <polygon points="3,41 12,41 25,5 16,5" fill="white" />

      {/* White A — right diagonal leg */}
      <polygon points="19,5 28,5 41,41 32,41" fill="white" />

      {/* Orange diagonal swoosh accent (replaces crossbar, cutting through lower-left leg) */}
      <polygon points="5,36 27,21 31,26 9,41" fill="#f97316" />
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
