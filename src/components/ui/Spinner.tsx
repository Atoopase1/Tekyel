// ============================================================
// Spinner component
// ============================================================
export default function Spinner({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const sizeMap = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`${sizeMap[size]} border-3 border-[var(--bg-hover)] border-t-[var(--wa-green)] rounded-full animate-spin`}
      />
    </div>
  );
}
