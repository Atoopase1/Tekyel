// ============================================================
// CircleLogo — SVG logo for the Circle app
// ============================================================
'use client';

interface CircleLogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
}

export default function CircleLogo({ size = 40, className = '', showText = false }: CircleLogoProps) {
  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer gradient ring */}
        <defs>
          <linearGradient id="chatCircleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0BC4FC" />
            <stop offset="100%" stopColor="#011B33" />
          </linearGradient>
          <linearGradient id="chatCircleInner" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#E0F2FE" />
          </linearGradient>
          <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" floodOpacity="0.15"/>
          </filter>
        </defs>

        {/* Professional gradient outer circle */}
        <circle cx="32" cy="32" r="28" fill="url(#chatCircleGrad)" filter="url(#softShadow)" />

        {/* Stylized speech bubble cutout or inner shape */}
        <path 
          d="M32 18C23.163 18 16 24.268 16 32c0 4.298 2.148 8.147 5.513 10.74L19 48l5.885-3.139C27.02 45.583 29.435 46 32 46c8.837 0 16-6.268 16-14S40.837 18 32 18z" 
          fill="url(#chatCircleInner)" 
        />
        
        {/* Abstract typing indicator / dots */}
        <circle cx="24" cy="32" r="2.5" fill="#011B33" opacity="0.8" />
        <circle cx="32" cy="32" r="2.5" fill="#011B33" opacity="0.8" />
        <circle cx="40" cy="32" r="2.5" fill="#011B33" opacity="0.8" />
      </svg>
      
      {showText && (
        <span className="font-bold text-xl tracking-tight bg-gradient-to-br from-[#09A5DB] to-[#011B33] bg-clip-text text-transparent">
          Circle
        </span>
      )}
    </div>
  );
}
