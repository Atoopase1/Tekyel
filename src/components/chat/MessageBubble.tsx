// ============================================================
// MessageBubble — Individual message bubble
// ============================================================
'use client';

import { Check, CheckCheck, Clock, Download, Play, FileText } from 'lucide-react';
import { formatMessageTime, formatFileSize } from '@/lib/utils';
import type { Message, MessageStatusType } from '@/types';
import { useState } from 'react';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showSenderName?: boolean;
}

function StatusIcon({ status }: { status?: MessageStatusType }) {
  switch (status) {
    case 'seen':
      return <CheckCheck size={16} className="text-[#53BDEB]" />;
    case 'delivered':
      return <CheckCheck size={16} className="text-[var(--text-muted)]" />;
    case 'sent':
      return <Check size={16} className="text-[var(--text-muted)]" />;
    default:
      return <Clock size={14} className="text-[var(--text-muted)]" />;
  }
}

export default function MessageBubble({ message, isOwn, showSenderName }: MessageBubbleProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  const overallStatus = message.status?.length
    ? message.status.every((s) => s.status === 'seen')
      ? 'seen'
      : message.status.every((s) => s.status === 'delivered' || s.status === 'seen')
        ? 'delivered'
        : 'sent'
    : undefined;

  if (message.is_deleted) {
    return (
      <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-1 px-4`}>
        <div className="px-3 py-2 rounded-lg bg-[var(--bg-secondary)] text-[var(--text-muted)] text-sm italic">
          🚫 This message was deleted
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-1 px-4 group`}>
      <div
        className={`relative max-w-[75%] min-w-[80px] rounded-xl px-3 py-1.5 shadow-sm ${
          isOwn
            ? 'bg-[var(--bubble-out)] rounded-tr-sm'
            : 'bg-[var(--bubble-in)] rounded-tl-sm'
        }`}
      >
        {/* Sender name in groups */}
        {showSenderName && !isOwn && message.sender && (
          <p
            className="text-xs font-semibold mb-0.5"
            style={{ color: `hsl(${(message.sender.display_name.charCodeAt(0) * 37) % 360}, 70%, 50%)` }}
          >
            {message.sender.display_name}
          </p>
        )}

        {/* Media content */}
        {message.message_type === 'image' && message.media_url && (
          <div className="mb-1 -mx-1 -mt-0.5 overflow-hidden rounded-lg">
            <img
              src={message.media_url}
              alt="Photo"
              className={`max-w-full max-h-[300px] object-cover cursor-pointer transition-opacity ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImageLoaded(true)}
              loading="lazy"
            />
            {!imageLoaded && (
              <div className="w-48 h-48 bg-[var(--bg-hover)] animate-pulse rounded-lg" />
            )}
          </div>
        )}

        {message.message_type === 'video' && message.media_url && (
          <div className="mb-1 -mx-1 -mt-0.5 overflow-hidden rounded-lg relative">
            <video
              src={message.media_url}
              className="max-w-full max-h-[300px] rounded-lg"
              controls
              preload="metadata"
            />
          </div>
        )}

        {message.message_type === 'audio' && message.media_url && (
          <div className="mb-1 min-w-[200px]">
            <audio src={message.media_url} controls className="w-full h-10" preload="metadata" />
          </div>
        )}

        {message.message_type === 'document' && message.media_url && (
          <a
            href={message.media_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 mb-1 p-2 bg-[var(--bg-hover)] rounded-lg hover:opacity-80 transition-opacity"
          >
            <FileText size={32} className="text-[var(--wa-green)] shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-[var(--text-primary)] truncate font-medium">
                {message.media_metadata?.filename || 'Document'}
              </p>
              <p className="text-xs text-[var(--text-muted)]">
                {message.media_metadata?.size
                  ? formatFileSize(message.media_metadata.size as number)
                  : 'File'}
              </p>
            </div>
            <Download size={18} className="text-[var(--text-muted)] shrink-0" />
          </a>
        )}

        {/* Text content */}
        {message.content && (
          <p className="text-sm text-[var(--text-primary)] whitespace-pre-wrap break-words">
            {message.content}
          </p>
        )}

        {/* Time & Status */}
        <div className="flex items-center justify-end gap-1 -mb-0.5 mt-0.5">
          <span className="text-[11px] text-[var(--text-muted)]">
            {formatMessageTime(message.created_at)}
          </span>
          {isOwn && <StatusIcon status={overallStatus as MessageStatusType | undefined} />}
        </div>
      </div>
    </div>
  );
}
