// ============================================================
// Spinner — Premium gradient loading spinner
// ============================================================
'use client';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  sm: 'w-5 h-5',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
};

export default function Spinner({ size = 'md', className = '' }: SpinnerProps) {
  const s = sizeMap[size];

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <svg
        className={`${s} animate-spin`}
        viewBox="0 0 24 24"
        fill="none"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="var(--border-color)"
          strokeWidth="2.5"
          className="opacity-30"
        />
        <path
          d="M12 2a10 10 0 019.95 9"
          stroke="url(#spinnerGrad)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id="spinnerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--navy, #0F172A)" />
            <stop offset="100%" stopColor="var(--emerald, #16A34A)" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
