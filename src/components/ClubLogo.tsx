import React from 'react';

interface ClubLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'gold' | 'dark' | 'ivory';
  showText?: boolean;
  withArabic?: boolean;
}

export const ClubLogo: React.FC<ClubLogoProps> = ({
  className = '',
  size = 'md',
  variant = 'gold',
  showText = true,
  withArabic = true
}) => {
  // Dimensions
  const sizeMap = {
    sm: { icon: 34, textScale: 'text-xs', subScale: 'text-[9px]' },
    md: { icon: 48, textScale: 'text-sm', subScale: 'text-[11px]' },
    lg: { icon: 64, textScale: 'text-lg', subScale: 'text-xs' },
    xl: { icon: 88, textScale: 'text-2xl', subScale: 'text-sm' }
  };

  const { icon, textScale, subScale } = sizeMap[size];

  // Palette settings
  const primaryColor = variant === 'gold' ? '#c5a059' : variant === 'dark' ? '#1c130e' : '#f7f2ea';
  const accentColor = variant === 'gold' ? '#e5c158' : variant === 'dark' ? '#34241b' : '#eae0d0';

  return (
    <div className={`inline-flex items-center gap-3.5 select-none ${className}`}>
      {/* Precision Vector Emblem matching the official club logo */}
      <div
        className="relative shrink-0 flex items-center justify-center"
        style={{ width: icon, height: icon }}
      >
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full drop-shadow-md"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Subtle outer glow if gold */}
          {variant === 'gold' && (
            <circle cx="100" cy="100" r="90" fill="url(#goldAmbientGlow)" opacity="0.12" />
          )}

          <defs>
            <linearGradient id="goldGradient" x1="20" y1="20" x2="180" y2="180" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#fbf6ee" />
              <stop offset="25%" stopColor="#e5c158" />
              <stop offset="70%" stopColor="#c5a059" />
              <stop offset="100%" stopColor="#96783c" />
            </linearGradient>

            <radialGradient id="goldAmbientGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#e5c158" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#c5a059" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* 1. The Elegant Crescent / Leaf Arc curving upwards */}
          <path
            d="M 130 135 C 105 146 72 144 54 124 C 36 104 36 70 54 44 C 68 24 88 16 94 15 C 92 23 88 40 88 56 C 88 84 100 112 124 126 C 131 130 138 133 145 135 C 140 135 135 135 130 135 Z"
            fill={variant === 'gold' ? 'url(#goldGradient)' : primaryColor}
          />

          {/* 2. Inner Leaf Contour Vein */}
          <path
            d="M 80 44 C 76 56 74 72 78 88 C 82 102 91 116 104 125 C 93 116 85 103 83 89 C 80 73 82 58 87 45 C 84 44 82 44 80 44 Z"
            fill={variant === 'gold' ? '#fbf6ee' : accentColor}
            opacity="0.85"
          />

          {/* 3. The Letter H nestled inside the crescent leaf */}
          {/* Left vertical bar of H */}
          <rect
            x="96"
            y="52"
            width="13"
            height="62"
            rx="1.5"
            fill={variant === 'gold' ? 'url(#goldGradient)' : primaryColor}
          />
          {/* Horizontal crossbar of H */}
          <rect
            x="96"
            y="76"
            width="32"
            height="11"
            rx="1"
            fill={variant === 'gold' ? 'url(#goldGradient)' : primaryColor}
          />
          {/* Right vertical bar of H */}
          <rect
            x="115"
            y="52"
            width="13"
            height="62"
            rx="1.5"
            fill={variant === 'gold' ? 'url(#goldGradient)' : primaryColor}
          />

          {/* Bottom Swoosh curve connecting the tail */}
          <path
            d="M 64 128 C 82 145 106 148 132 140 C 144 136 156 128 162 122 C 152 128 138 134 124 134 C 98 134 76 122 64 106 C 62 114 62 122 64 128 Z"
            fill={variant === 'gold' ? 'url(#goldGradient)' : primaryColor}
            opacity="0.9"
          />
        </svg>
      </div>

      {/* Typography Wordmark */}
      {showText && (
        <div className="flex flex-col text-right">
          {withArabic && (
            <span className="font-amiri font-bold text-white tracking-wide text-base sm:text-lg leading-tight">
              كيمياء السعادة
            </span>
          )}
          <span className={`font-cinzel tracking-wider font-semibold ${subScale} ${
            variant === 'gold' ? 'text-[#c5a059]' : variant === 'dark' ? 'text-slate-800' : 'text-slate-200'
          }`}>
            The Chemistry Of Happiness
          </span>
        </div>
      )}
    </div>
  );
};
