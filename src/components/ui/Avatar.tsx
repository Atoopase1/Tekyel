// ============================================================
// Avatar component — User/Group avatar with online indicator
// ============================================================
'use client';

import { getInitials, stringToColor } from '@/lib/utils';

interface AvatarProps {
  src?: string | null;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  isOnline?: boolean;
  className?: string;
}

const sizeMap = {
  sm: { container: 'w-8 h-8', text: 'text-xs', dot: 'w-2.5 h-2.5' },
  md: { container: 'w-10 h-10', text: 'text-sm', dot: 'w-3 h-3' },
  lg: { container: 'w-12 h-12', text: 'text-base', dot: 'w-3.5 h-3.5' },
  xl: { container: 'w-20 h-20', text: 'text-2xl', dot: 'w-4 h-4' },
  xxl: { container: 'w-36 h-36', text: 'text-4xl', dot: 'w-6 h-6' },
};

export default function Avatar({ src, name, size = 'md', isOnline, className = '' }: AvatarProps) {
  const s = sizeMap[size];
  const bgColor = stringToColor(name);

  return (
    <div className={`relative inline-flex shrink-0 ${className}`}>
      {src ? (
        <img
          src={src}
          alt={name}
          className={`${s.container} rounded-full object-cover`}
        />
      ) : (
        <div
          className={`${s.container} rounded-full flex items-center justify-center text-white font-semibold ${s.text}`}
          style={{ backgroundColor: bgColor }}
        >
          {getInitials(name)}
        </div>
      )}
      {isOnline !== undefined && (
        <span
          className={`absolute -bottom-0.5 -right-0.5 ${s.dot} rounded-full border-2 border-[var(--bg-primary)] ${
            isOnline ? 'bg-green-500' : 'bg-gray-400'
          }`}
        />
      )}
    </div>
  );
}
