// ============================================================
// AppNavigation — Sidebar/Bottom bar for switching views
// ============================================================
'use client';

import { MessageSquare, Users, CircleDashed } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';

export default function AppNavigation() {
  const pathname = usePathname();
  const router = useRouter();

  const tabs = [
    { name: 'Chats', href: '/', icon: MessageSquare },
    { name: 'Status', href: '/status', icon: CircleDashed },
    { name: 'Contacts', href: '/contacts', icon: Users },
  ];

  return (
    <>
      {/* Desktop Navigation (Left-most thin bar) */}
      <div className="hidden lg:flex flex-col items-center gap-6 py-6 w-16 bg-[var(--bg-header)] border-r border-[var(--border-color)] shrink-0 z-20">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.href || (tab.href !== '/' && pathname.startsWith(tab.href));
          return (
            <button
              key={tab.name}
              onClick={() => router.push(tab.href)}
              className={`p-3 rounded-xl transition-all duration-200 group relative ${
                isActive
                  ? 'bg-[var(--wa-green)] bg-opacity-20 text-[var(--wa-green)]'
                  : 'text-[var(--text-muted)] hover:bg-[var(--bg-hover)]'
              }`}
            >
              <Icon size={24} className={isActive ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'} />
              {/* Tooltip */}
              <span className="absolute left-14 px-2 py-1 bg-[var(--text-primary)] text-[var(--bg-primary)] text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                {tab.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* Mobile Navigation (Bottom bar) */}
      <div className="lg:hidden absolute bottom-0 left-0 right-0 h-16 bg-[var(--bg-header)] border-t border-[var(--border-color)] flex items-center justify-around z-20">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.href || (tab.href !== '/' && pathname.startsWith(tab.href));
          return (
            <button
              key={tab.name}
              onClick={() => router.push(tab.href)}
              className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${
                isActive ? 'text-[var(--wa-green)]' : 'text-[var(--text-muted)]'
              }`}
            >
              <Icon size={22} className={isActive ? 'opacity-100' : 'opacity-70'} />
              <span className="text-[10px] font-medium">{tab.name}</span>
            </button>
          );
        })}
      </div>
    </>
  );
}
