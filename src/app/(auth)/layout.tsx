// ============================================================
// Auth Layout — Premium centered auth with navy/emerald gradient
// ============================================================
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Circle — Sign In',
  description: 'Sign in to your Circle account',
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-app)]">
      {/* Premium gradient header */}
      <div 
        className="h-60 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 40%, #16A34A 100%)',
        }}
      >
        {/* Subtle mesh overlay */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(22, 163, 74, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(245, 158, 11, 0.15) 0%, transparent 40%)',
          }}
        />
        {/* Subtle grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      {/* Content card */}
      <div className="flex-1 flex items-start justify-center -mt-40 px-4 pb-8 relative z-10">
        <div 
          className="w-full max-w-md bg-[var(--bg-primary)] rounded-2xl overflow-hidden"
          style={{ boxShadow: 'var(--shadow-2xl)' }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
