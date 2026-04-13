// ============================================================
// MessageContextMenu — Premium glass dropdown for actions
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
  SmilePlus,
  Pencil
} from 'lucide-react';
import type { Message } from '@/types';

interface MessageContextMenuProps {
  message: Message;
  isOwn: boolean;
  onReply: () => void;
  onEdit: () => void;
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

  const MenuItem = ({ icon: Icon, label, onClick, danger, iconClass, disabled }: { 
    icon: any; label: string; onClick: () => void; danger?: boolean; iconClass?: string; disabled?: boolean 
  }) => (
    <button 
      onClick={() => { onClick(); setIsOpen(false); }} 
      disabled={disabled}
      className={`w-full flex items-center gap-3 px-4 py-2.5 text-[13px] transition-all duration-150 ${
        danger 
          ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10' 
          : 'text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
      } ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
    >
      <Icon size={15} className={iconClass || 'text-[var(--text-muted)]'} />
      {label}
    </button>
  );

  return (
    <div className="relative inline-block" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 rounded-lg bg-[var(--bg-primary)]/80 hover:bg-[var(--bg-primary)] text-[var(--text-muted)] transition-all duration-150 border border-[var(--border-color)]/50"
        style={{ backdropFilter: 'blur(8px)' }}
      >
        <MoreVertical size={15} />
      </button>

      {isOpen && (
        <div 
          className="absolute right-0 top-full mt-1 w-52 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-2xl z-50 overflow-hidden animate-scaleIn origin-top-right"
          style={{ boxShadow: 'var(--shadow-xl)' }}
        >
          {/* Reaction bar */}
          {showReactions ? (
            <div className="p-2.5 flex gap-1.5 justify-between bg-[var(--bg-secondary)] border-b border-[var(--border-color)]">
              {EMOJIS.map(e => (
                <button
                  key={e}
                  onClick={() => { props.onReact(e); setIsOpen(false); setShowReactions(false); }}
                  className="hover:scale-125 transition-transform text-lg p-1 rounded-lg hover:bg-[var(--bg-hover)]"
                >
                  {e}
                </button>
              ))}
            </div>
          ) : (
            <button
              onClick={(e) => { e.stopPropagation(); setShowReactions(true); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all duration-150 border-b border-[var(--border-color)]"
            >
              <SmilePlus size={15} className="text-[var(--gold)]" /> React
            </button>
          )}

          <div className="py-1">
            <MenuItem icon={Reply} label="Reply" onClick={props.onReply} iconClass="text-[var(--emerald)]" />
            {props.isOwn && (
              <MenuItem 
                icon={Pencil} 
                label="Edit" 
                onClick={props.onEdit}
                iconClass="text-[var(--emerald)]"
                disabled={props.message.message_type !== 'text'}
              />
            )}
            <MenuItem icon={Copy} label="Copy" onClick={props.onCopy} />
            <MenuItem icon={Forward} label="Forward" onClick={props.onForward} />
            <MenuItem 
              icon={Star} 
              label={props.isStarred ? 'Unstar' : 'Star'} 
              onClick={props.onStar}
              iconClass={props.isStarred ? 'text-[var(--gold)] fill-[var(--gold)]' : 'text-[var(--text-muted)]'}
            />
            <MenuItem 
              icon={Pin} 
              label={props.isPinned ? 'Unpin' : 'Pin'} 
              onClick={props.onPin}
              iconClass={props.isPinned ? 'text-[var(--emerald)] fill-[var(--emerald)]' : 'text-[var(--text-muted)]'}
            />
            
            {props.isOwn && (
              <MenuItem icon={Info} label="Message Info" onClick={props.onInfo} iconClass="text-blue-500" />
            )}

            <div className="h-px bg-[var(--border-color)] my-1 mx-3" />

            <MenuItem icon={Trash2} label="Delete for me" onClick={props.onDeleteForMe} danger />
            {props.isOwn && (
              <MenuItem icon={Trash2} label="Delete for everyone" onClick={props.onDeleteForEveryone} danger />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
