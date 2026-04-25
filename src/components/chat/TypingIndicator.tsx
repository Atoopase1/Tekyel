// TypingIndicator — Premium animated emerald typing bubble
'use client';

interface TypingIndicatorProps {
  names: string[];
}

export default function TypingIndicator({ names }: TypingIndicatorProps) {
  if (names.length === 0) return null;

  return (
    <div className="flex justify-start mb-1.5 px-4 animate-fadeIn">
      <div 
        className="bg-[var(--bubble-in)] rounded-2xl rounded-bl-md px-4 py-3 border border-[var(--border-color)]"
        style={{ boxShadow: 'var(--shadow-xs)' }}
      >
        <div className="flex items-center gap-1.5">
          <div className="flex gap-1">
            <span 
              className="w-[6px] h-[6px] rounded-full bg-[var(--emerald)]" 
              style={{ animation: 'typingBounce 1.2s infinite', animationDelay: '0ms' }} 
            />
            <span 
              className="w-[6px] h-[6px] rounded-full bg-[var(--emerald)]" 
              style={{ animation: 'typingBounce 1.2s infinite', animationDelay: '200ms' }} 
            />
            <span 
              className="w-[6px] h-[6px] rounded-full bg-[var(--emerald)]" 
              style={{ animation: 'typingBounce 1.2s infinite', animationDelay: '400ms' }} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}
