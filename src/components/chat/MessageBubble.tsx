// ============================================================
// MessageBubble — Individual message bubble
// ============================================================
'use client';

import { Check, CheckCheck, Clock, Download, Play, FileText } from 'lucide-react';
import { formatMessageTime, formatFileSize } from '@/lib/utils';
import type { Message, MessageStatusType } from '@/types';
import { useState } from 'react';
import { Star } from 'lucide-react';
import { useChatStore } from '@/store/chat-store';
import { useAuthStore } from '@/store/auth-store';
import MessageContextMenu from './MessageContextMenu';
import MessageInfoModal from '../modals/MessageInfoModal';
import ForwardModal from '../modals/ForwardModal';

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
  const [showInfo, setShowInfo] = useState(false);
  const [showForward, setShowForward] = useState(false);
  const [showMenuHover, setShowMenuHover] = useState(false);

  const currentUser = useAuthStore(s => s.user);
  const activeChat = useChatStore(s => s.activeChat);
  const { 
    setReplyingTo, 
    deleteMessageForMe, 
    deleteMessageForEveryone, 
    pinMessage, 
    unpinMessage, 
    starMessage, 
    unstarMessage, 
    addReaction, 
    removeReaction 
  } = useChatStore();

  const isStarred = message.stars?.some(s => s.user_id === currentUser?.id) || false;
  const isPinned = activeChat?.pinned_message_id === message.id;

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
    <div 
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-1 px-4 group`}
      onMouseEnter={() => setShowMenuHover(true)}
      onMouseLeave={() => setShowMenuHover(false)}
    >
      <div
        className={`relative max-w-[75%] min-w-[80px] rounded-xl px-3 py-1.5 shadow-sm ${
          isOwn
            ? 'bg-[var(--bubble-out)] rounded-tr-sm'
            : 'bg-[var(--bubble-in)] rounded-tl-sm'
        }`}
      >
        {/* Context Menu Trigger */}
        <div className={`absolute top-1 right-1 z-10 transition-opacity ${showMenuHover ? 'opacity-100' : 'opacity-0'}`}>
          <MessageContextMenu 
            message={message}
            isOwn={isOwn}
            isStarred={isStarred}
            isPinned={isPinned}
            onReply={() => setReplyingTo(message)}
            onStar={() => isStarred ? unstarMessage(message.id) : starMessage(message.id)}
            onCopy={() => navigator.clipboard.writeText(message.content || message.media_url || '')}
            onInfo={() => setShowInfo(true)}
            onPin={() => isPinned ? unpinMessage(message.chat_id) : pinMessage(message.chat_id, message.id)}
            onForward={() => setShowForward(true)}
            onDeleteForMe={() => deleteMessageForMe(message.id)}
            onDeleteForEveryone={() => deleteMessageForEveryone(message.id)}
            onReact={(emoji) => addReaction(message.id, emoji)}
          />
        </div>

        {/* Replied To */}
        {message.reply_to && (
          <div className="mb-2 p-2 bg-black/5 border-l-4 border-[var(--wa-green)] rounded-md flex flex-col cursor-pointer hover:bg-black/10 transition-colors">
            <span className="text-xs font-semibold text-[var(--wa-green)]">
              {message.reply_to.sender?.display_name || 'User'}
            </span>
            <span className="text-xs text-[var(--text-secondary)] line-clamp-2">
              {message.reply_to.content || (message.reply_to.media_url ? 'Media' : '')}
            </span>
          </div>
        )}
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
        {((message.message_type === 'image') || 
          message.media_metadata?.mime_type?.startsWith('image/') || 
          message.media_metadata?.filename?.match(/\.(jpg|jpeg|png|gif|webp)$/i)) && message.media_url && (
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

        {((message.message_type === 'video') || 
          message.media_metadata?.mime_type?.startsWith('video/') || 
          message.media_metadata?.filename?.match(/\.(mp4|webm|ogg|mov)$/i)) && message.media_url && (
          <div className="mb-1 -mx-1 -mt-0.5 overflow-hidden rounded-lg relative">
            <video
              src={message.media_url}
              className="max-w-full max-h-[300px] rounded-lg"
              controls
              preload="metadata"
            />
          </div>
        )}

        {((message.message_type === 'audio') || 
          message.media_metadata?.mime_type?.startsWith('audio/') || 
          message.media_metadata?.filename?.match(/\.(mp3|wav|ogg|m4a)$/i)) && message.media_url && (
          <div className="mb-1 min-w-[200px]">
            <audio src={message.media_url} controls className="w-full h-10" preload="metadata" />
          </div>
        )}

        {message.message_type === 'document' && 
         !message.media_metadata?.mime_type?.startsWith('image/') && 
         !message.media_metadata?.filename?.match(/\.(jpg|jpeg|png|gif|webp)$/i) &&
         !message.media_metadata?.mime_type?.startsWith('video/') && 
         !message.media_metadata?.filename?.match(/\.(mp4|webm|ogg|mov)$/i) &&
         !message.media_metadata?.mime_type?.startsWith('audio/') && 
         !message.media_metadata?.filename?.match(/\.(mp3|wav|ogg|m4a)$/i) && 
         message.media_url && (
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
        <div className="flex items-center justify-end gap-1 -mb-0.5 mt-0.5" style={{ minWidth: isOwn ? '64px' : '44px' }}>
          {isStarred && <Star size={10} className="fill-[var(--text-muted)] text-[var(--text-muted)]" />}
          <span className="text-[11px] text-[var(--text-muted)]">
            {formatMessageTime(message.created_at)}
          </span>
          {isOwn && <StatusIcon status={overallStatus as MessageStatusType | undefined} />}
        </div>

        {/* Reactions beneath bubble */}
        {message.reactions && message.reactions.length > 0 && (
          <div className={`absolute -bottom-3 ${isOwn ? '-left-2' : '-right-2'} bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-full px-1.5 py-0.5 text-xs flex gap-1 shadow-sm`}>
            {Array.from(new Set(message.reactions.map(r => r.emoji))).map(emoji => (
              <span key={emoji}>{emoji}</span>
            ))}
            {message.reactions.length > 1 && <span className="text-[var(--text-muted)]">{message.reactions.length}</span>}
          </div>
        )}
      </div>

      {showInfo && activeChat && (
        <MessageInfoModal 
          message={message} 
          chatParticipants={activeChat.participants} 
          onClose={() => setShowInfo(false)} 
        />
      )}
      
      {showForward && (
        <ForwardModal message={message} onClose={() => setShowForward(false)} />
      )}
    </div>
  );
}
