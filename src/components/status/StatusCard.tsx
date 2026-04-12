'use client';

import { formatDistanceToNow } from 'date-fns';
import { UserPlus, ShieldPlus } from 'lucide-react';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import { useRouter } from 'next/navigation';

export default function StatusCard({ status, onAddContact }: { status: any, onAddContact?: (id: string, category: 'friend'|'family') => void }) {
  const router = useRouter();
  const { profiles, content_type, media_url, text_content, created_at, visibility } = status;

  return (
    <div className="bg-[var(--bg-primary)] p-4 rounded-xl shadow-sm border border-[var(--border-color)] mb-4 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push(`/profile/${status.user_id}`)}>
          <Avatar src={profiles.avatar_url} name={profiles.display_name} />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[var(--text-primary)]">{profiles.display_name}</span>
              <span className="text-[10px] uppercase bg-[var(--bg-secondary)] px-1.5 py-0.5 rounded text-[var(--text-muted)]">
                {visibility}
              </span>
            </div>
            <span className="text-xs text-[var(--text-muted)]">
              {formatDistanceToNow(new Date(created_at), { addSuffix: true })}
            </span>
          </div>
        </div>
        
        {/* Quick Actions (only shown for public statuses where hook is provided) */}
        {onAddContact && (
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={() => onAddContact(status.user_id, 'friend')} className="text-[10px] px-2 py-1 h-auto">
              Friend
            </Button>
            <Button variant="primary" size="sm" onClick={() => onAddContact(status.user_id, 'family')} className="text-[10px] px-2 py-1 h-auto">
              Family
            </Button>
          </div>
        )}
      </div>

      {/* Content */}
      {text_content && (
        <p className="text-[var(--text-primary)] whitespace-pre-wrap text-sm">{text_content}</p>
      )}

      {/* Media */}
      {media_url && content_type === 'image' && (
        <div className="w-full max-h-[500px] bg-black rounded-lg overflow-hidden flex items-center justify-center">
          <img src={media_url} alt="Status media" className="object-contain max-h-[500px] w-full" />
        </div>
      )}

      {media_url && content_type === 'video' && (
        <div className="w-full rounded-lg overflow-hidden border border-[var(--border-color)]">
          <video src={media_url} controls className="w-full max-h-[500px] bg-black" />
        </div>
      )}

      {media_url && content_type === 'audio' && (
        <div className="w-full p-4 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)]">
          <audio src={media_url} controls className="w-full" />
        </div>
      )}

      {media_url && content_type === 'document' && (
        <a
          href={media_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[var(--wa-green)] hover:underline text-sm font-medium p-3 bg-[var(--bg-secondary)] rounded-lg text-center block"
        >
          View Attachment
        </a>
      )}
    </div>
  );
}
