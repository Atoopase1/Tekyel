// ============================================================
// ProfileEditor — Premium profile editor component
// ============================================================
'use client';

import { useState, useRef } from 'react';
import { Camera } from 'lucide-react';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import { useAuthStore } from '@/store/auth-store';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

export default function ProfileEditor() {
  const { profile, updateProfile } = useAuthStore();
  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const supabase = getSupabaseBrowserClient();
    const fileName = `avatars/${profile?.id}-${Date.now()}.${file.name.split('.').pop()}`;

    const { data, error } = await supabase.storage
      .from('chat-media')
      .upload(fileName, file, { cacheControl: '3600', upsert: true });

    if (error) {
      console.error('Storage error:', error);
      toast.error(`Upload failed: ${error.message || 'Unknown error'}`);
      setIsUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from('chat-media')
      .getPublicUrl(data.path);

    await updateProfile({ avatar_url: urlData.publicUrl });
    toast.success('Photo updated!');
    setIsUploading(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    await updateProfile({
      display_name: displayName.trim() || 'User',
      bio: bio.trim(),
    });
    setIsSaving(false);
    toast.success('Profile updated!');
  };

  return (
    <div className="space-y-6">
      {/* Avatar */}
      <div className="flex flex-col items-center">
        <div className="relative cursor-pointer group" onClick={() => !isUploading && fileInputRef.current?.click()}>
          <div className="p-1 rounded-full" style={{ background: 'linear-gradient(135deg, var(--navy), var(--emerald))' }}>
            <div className="rounded-full bg-[var(--bg-primary)] p-0.5">
              <Avatar
                src={profile?.avatar_url}
                name={profile?.display_name || 'User'}
                size="xl"
                className={isUploading ? 'opacity-50' : ''}
              />
            </div>
          </div>
          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Spinner size="md" />
            </div>
          )}
          {!isUploading && (
            <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200">
              <Camera size={24} className="text-white" />
            </div>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleAvatarUpload}
        />
        <p className="text-[12px] text-[var(--text-muted)] mt-3">Click to change photo</p>
      </div>

      {/* Name */}
      <div>
        <label className="block text-[13px] font-medium text-[var(--text-primary)] mb-2">
          Your name
        </label>
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Enter your name"
          maxLength={50}
          className="w-full px-4 py-3 bg-[var(--bg-secondary)] text-[var(--text-primary)] rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-[var(--emerald)]/30 focus:bg-[var(--bg-primary)] border border-transparent focus:border-[var(--emerald)]/20 transition-all duration-200"
        />
      </div>

      {/* Bio */}
      <div>
        <label className="block text-[13px] font-medium text-[var(--text-primary)] mb-2">
          About
        </label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Write something about yourself..."
          rows={3}
          maxLength={200}
          className="w-full px-4 py-3 bg-[var(--bg-secondary)] text-[var(--text-primary)] rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-[var(--emerald)]/30 focus:bg-[var(--bg-primary)] border border-transparent focus:border-[var(--emerald)]/20 resize-none transition-all duration-200"
        />
        <p className={`text-[11px] mt-1.5 text-right transition-colors ${bio.length > 180 ? 'text-[var(--gold)]' : 'text-[var(--text-muted)]'}`}>
          {bio.length}/200
        </p>
      </div>

      {/* Email/Phone info */}
      <div className="space-y-3 pt-2">
        {profile?.email && (
          <div className="flex items-center justify-between">
            <label className="text-[12px] font-medium text-[var(--text-muted)] uppercase tracking-wider">Email</label>
            <p className="text-[14px] text-[var(--text-primary)]">{profile.email}</p>
          </div>
        )}
        {profile?.phone && (
          <div className="flex items-center justify-between">
            <label className="text-[12px] font-medium text-[var(--text-muted)] uppercase tracking-wider">Phone</label>
            <p className="text-[14px] text-[var(--text-primary)]">{profile.phone}</p>
          </div>
        )}
      </div>

      <Button onClick={handleSave} isLoading={isSaving} className="w-full" size="lg">
        Save Changes
      </Button>
    </div>
  );
}
