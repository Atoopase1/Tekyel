// ============================================================
// Settings Page
// ============================================================
'use client';

import { ArrowLeft, Moon, Sun } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import ProfileEditor from '@/components/settings/ProfileEditor';
import ChatSidebar from '@/components/chat/ChatSidebar';

export default function SettingsPage() {
  const router = useRouter();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  const toggleDarkMode = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    document.documentElement.classList.toggle('dark', newDark);
    localStorage.setItem('theme', newDark ? 'dark' : 'light');
  };

  return (
    <div className="flex w-full h-full">
      {/* Desktop sidebar */}
      <div className="w-full max-w-[420px] lg:w-[420px] shrink-0 hidden lg:flex flex-col z-10 border-r border-[var(--border-color)]">
        <ChatSidebar />
      </div>
      
      <div className="flex-1 flex flex-col bg-[var(--bg-primary)] max-w-2xl mx-auto w-full border-x border-[var(--border-color)]">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4 bg-[var(--bg-header)] border-b border-[var(--border-color)]">
        <button
          onClick={() => router.push('/')}
          className="p-1.5 rounded-full hover:bg-[var(--bg-hover)] transition-colors text-[var(--text-muted)]"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-semibold text-[var(--text-primary)]">Settings</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        {/* Dark mode toggle */}
        <div className="flex items-center justify-between mb-8 p-4 bg-[var(--bg-secondary)] rounded-xl">
          <div className="flex items-center gap-3">
            {isDark ? <Moon size={20} className="text-[var(--wa-green)]" /> : <Sun size={20} className="text-[var(--wa-green)]" />}
            <div>
              <p className="text-sm font-medium text-[var(--text-primary)]">Dark Mode</p>
              <p className="text-xs text-[var(--text-muted)]">Toggle dark/light theme</p>
            </div>
          </div>
          <button
            onClick={toggleDarkMode}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              isDark ? 'bg-[var(--wa-green)]' : 'bg-gray-300'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                isDark ? 'translate-x-6' : ''
              }`}
            />
          </button>
        </div>

        {/* Profile editor */}
        <ProfileEditor />
      </div>
    </div>
    </div>
  );
}
