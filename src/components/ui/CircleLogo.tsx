// ============================================================
// CircleLogo — Premium SVG logo for the Circle app
// ============================================================
'use client';

interface CircleLogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
}

export default function CircleLogo({ size = 48, className = '', showText = false }: CircleLogoProps) {
  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <img 
        src="/logo.jpg" 
        alt="Circle Logo" 
        width={size} 
        height={size} 
        className="rounded-xl object-cover shadow-sm border border-[var(--border-color)]/50" 
        style={{ width: size, height: size }}
      />
      
      {showText && (
        <span className="font-bold text-xl tracking-tight gradient-text">
          Circle
        </span>
      )}
    </div>
  );
}
