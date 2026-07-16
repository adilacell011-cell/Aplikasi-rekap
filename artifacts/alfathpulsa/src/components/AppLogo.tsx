import React from 'react';

interface AppLogoIconProps {
  size?: number;
  className?: string;
}

/**
 * AlfathPulsa logo mark — clean geometric "A" on dark navy background.
 *
 * - Two rounded-stroke legs converge at the apex.
 * - Sky-blue crossbar sits exactly where the legs are at that height,
 *   creating a flush connection without visual gaps.
 * - Subtle top-shine overlay gives depth without decoration.
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
        {/* Main background gradient — dark navy → brand blue */}
        <linearGradient id="ap-bg" x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#0c1460" />
          <stop offset="100%" stopColor="#1b3eb8" />
        </linearGradient>

        {/* Subtle top-shine — gives depth without being heavy */}
        <linearGradient id="ap-shine" x1="0" y1="0" x2="0" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#ffffff" stopOpacity="0.13" />
          <stop offset="55%"  stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>

        {/* Crossbar gradient — left sky-blue → right white tint */}
        <linearGradient id="ap-bar" x1="11" y1="0" x2="33" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#7dd3fc" />
        </linearGradient>
      </defs>

      {/* Background */}
      <rect width="44" height="44" rx="11" fill="url(#ap-bg)" />
      <rect width="44" height="44" rx="11" fill="url(#ap-shine)" />

      {/*
        ── Letter A ────────────────────────────────────────────────────
        Apex: (22, 7)
        Left  leg → (5,  39)
        Right leg → (39, 39)
        Crossbar at y=27 connects flush with both legs.
          Left  leg at y=27:  x ≈ 11.4
          Right leg at y=27:  x ≈ 32.6
      */}

      {/* Left leg */}
      <line
        x1="22" y1="7"
        x2="5"  y2="39"
        stroke="white"
        strokeWidth="5.5"
        strokeLinecap="round"
      />

      {/* Right leg */}
      <line
        x1="22" y1="7"
        x2="39" y2="39"
        stroke="white"
        strokeWidth="5.5"
        strokeLinecap="round"
      />

      {/* Crossbar — sky-blue gradient, flush with legs */}
      <line
        x1="11.5" y1="27"
        x2="32.5" y2="27"
        stroke="url(#ap-bar)"
        strokeWidth="4"
        strokeLinecap="round"
      />
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
        <span className="text-sky-300">Pulsa</span>
      </span>
      <span className="text-[8px] font-black uppercase tracking-[0.3em] text-white/35 mt-0.5">
        Agen BRILink
      </span>
    </div>
  );
}
