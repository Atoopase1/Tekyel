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
          stroke="var(--emerald)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
