// ============================================================
// MessageContextMenu — Dropdown menu for message actions
// ============================================================
'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  Reply, 
  Star, 
  Copy, 
  Info, 
  Pin, 
  Forward, 
  Trash2, 
  MoreVertical,
  SmilePlus
} from 'lucide-react';
import type { Message } from '@/types';

interface MessageContextMenuProps {
  message: Message;
  isOwn: boolean;
  onReply: () => void;
  onStar: () => void;
  onCopy: () => void;
  onInfo: () => void;
  onPin: () => void;
  onForward: () => void;
  onDeleteForMe: () => void;
  onDeleteForEveryone: () => void;
  onReact: (emoji: string) => void;
  isStarred: boolean;
  isPinned: boolean;
}

export default function MessageContextMenu(props: MessageContextMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowReactions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 rounded-full bg-black/5 hover:bg-black/10 text-gray-500 transition-colors"
      >
        <MoreVertical size={16} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-48 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl shadow-xl z-50 overflow-hidden animate-scaleIn origin-top-right">
          
          {showReactions ? (
            <div className="p-2 flex gap-1 justify-between bg-[var(--bg-secondary)] border-b border-[var(--border-color)]">
              {EMOJIS.map(e => (
                <button
                  key={e}
                  onClick={() => { props.onReact(e); setIsOpen(false); setShowReactions(false); }}
                  className="hover:scale-125 transition-transform text-lg"
                >
                  {e}
                </button>
              ))}
            </div>
          ) : (
            <button
              onClick={(e) => { e.stopPropagation(); setShowReactions(true); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors border-b border-[var(--border-color)]"
            >
              <SmilePlus size={16} className="text-gray-500" /> React
            </button>
          )}

          <div className="py-1">
            <button onClick={() => { props.onReply(); setIsOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors">
              <Reply size={16} className="text-gray-500" /> Reply
            </button>
            <button onClick={() => { props.onCopy(); setIsOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors">
              <Copy size={16} className="text-gray-500" /> Copy
            </button>
            <button onClick={() => { props.onForward(); setIsOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors">
              <Forward size={16} className="text-gray-500" /> Forward
            </button>
            <button onClick={() => { props.onStar(); setIsOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors">
              <Star size={16} className={props.isStarred ? 'text-yellow-500 fill-yellow-500' : 'text-gray-500'} /> {props.isStarred ? 'Unstar' : 'Star'}
            </button>
            <button onClick={() => { props.onPin(); setIsOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors">
              <Pin size={16} className={props.isPinned ? 'text-gray-500 fill-gray-500' : 'text-gray-500'} /> {props.isPinned ? 'Unpin' : 'Pin'}
            </button>
            
            {props.isOwn && (
              <button onClick={() => { props.onInfo(); setIsOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors">
                <Info size={16} className="text-blue-500" /> Message Info
              </button>
            )}

            <div className="h-px bg-[var(--border-color)] my-1" />

            <button onClick={() => { props.onDeleteForMe(); setIsOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-[var(--bg-hover)] transition-colors">
              <Trash2 size={16} /> Delete for me
            </button>

            {props.isOwn && (
              <button onClick={() => { props.onDeleteForEveryone(); setIsOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-[var(--bg-hover)] transition-colors">
                <Trash2 size={16} /> Delete for everyone
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
