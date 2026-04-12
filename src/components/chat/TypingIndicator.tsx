// ============================================================
// TypingIndicator — Animated "typing…" bubble
// ============================================================
'use client';

interface TypingIndicatorProps {
  names: string[];
}

export default function TypingIndicator({ names }: TypingIndicatorProps) {
  if (names.length === 0) return null;

  return (
    <div className="flex justify-start mb-1 px-4">
      <div className="bg-[var(--bubble-in)] rounded-xl rounded-tl-sm px-4 py-2.5 shadow-sm">
        <div className="flex items-center gap-1">
          <div className="flex gap-1">
            <span className="w-2 h-2 rounded-full bg-[var(--text-muted)] animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-2 h-2 rounded-full bg-[var(--text-muted)] animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-2 h-2 rounded-full bg-[var(--text-muted)] animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
