// ============================================================
// Default chat page — No chat selected
// ============================================================
import { MessageCircle, Lock } from 'lucide-react';
import ChatSidebar from '@/components/chat/ChatSidebar';

export default function ChatDefaultPage() {
  return (
    <div className="flex w-full h-full">
      <div className="w-full max-w-[420px] lg:w-[420px] shrink-0 flex flex-col z-10 border-r border-[var(--border-color)]">
        <ChatSidebar />
      </div>

      <div className="flex-1 hidden lg:flex flex-col items-center justify-center bg-[var(--bg-chat)] border-b-4 border-[var(--wa-green)]">
        <div className="text-center max-w-md px-8">
          {/* Animated icon */}
          <div className="relative mb-8">
            <div className="w-64 h-64 mx-auto relative">
              {/* Decorative circles */}
              <div className="absolute inset-0 rounded-full border-2 border-[var(--border-color)] opacity-20 animate-ping" style={{ animationDuration: '3s' }} />
              <div className="absolute inset-4 rounded-full border-2 border-[var(--border-color)] opacity-15 animate-ping" style={{ animationDuration: '3s', animationDelay: '0.5s' }} />
              <div className="absolute inset-8 rounded-full border-2 border-[var(--border-color)] opacity-10 animate-ping" style={{ animationDuration: '3s', animationDelay: '1s' }} />

              {/* Center icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-24 h-24 bg-gradient-to-br from-[#25D366]/10 to-[#128C7E]/10 rounded-full flex items-center justify-center">
                  <MessageCircle size={48} className="text-[var(--text-muted)] opacity-50" />
                </div>
              </div>
            </div>
          </div>

          <h2 className="text-3xl font-light text-[var(--text-primary)] mb-3">
            WhatsApp Clone
          </h2>
          <p className="text-sm text-[var(--text-muted)] leading-relaxed mb-8">
            Send and receive messages without keeping your phone online.
            <br />
            Use WhatsApp on up to 4 linked devices and 1 phone at the same time.
          </p>
          <div className="flex items-center justify-center gap-1.5 text-xs text-[var(--text-muted)]">
            <Lock size={12} />
            <span>End-to-end encrypted</span>
          </div>
        </div>
      </div>
    </div>
  );
}
