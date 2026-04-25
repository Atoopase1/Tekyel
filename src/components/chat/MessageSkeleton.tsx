// MessageSkeleton — Premium loading skeleton
'use client';

export default function MessageSkeleton({ isOwn }: { isOwn: boolean }) {
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2 px-4`}>
      <div
        className={`rounded-2xl px-4 py-3 ${
          isOwn 
            ? 'bg-[var(--emerald)]/10 rounded-br-md' 
            : 'bg-[var(--bg-primary)] rounded-bl-md border border-[var(--border-color)]'
        }`}
        style={{ width: isOwn ? '55%' : '65%' }}
      >
        <div className="space-y-2">
          {!isOwn && <div className="h-3 w-20 rounded-full animate-shimmer" />}
          <div className="h-3 w-full rounded-full animate-shimmer" />
          <div className="h-3 w-3/4 rounded-full animate-shimmer" />
        </div>
        <div className="flex justify-end mt-2">
          <div className="h-2.5 w-12 rounded-full animate-shimmer" />
        </div>
      </div>
    </div>
  );
}
