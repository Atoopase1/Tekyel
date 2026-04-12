// ============================================================
// Profile Editor component
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
          <Avatar
            src={profile?.avatar_url}
            name={profile?.display_name || 'User'}
            size="xl"
            className={isUploading ? 'opacity-50' : ''}
          />
          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Spinner size="md" />
            </div>
          )}
          {!isUploading && (
            <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
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
        <p className="text-xs text-[var(--text-muted)] mt-2">Click to change photo</p>
      </div>

      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
          Your name
        </label>
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Enter your name"
          maxLength={50}
          className="w-full px-4 py-2.5 bg-[var(--bg-search)] text-[var(--text-primary)] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[var(--wa-green)]"
        />
      </div>

      {/* Bio */}
      <div>
        <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
          About
        </label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Hey there! I am using WhatsApp."
          rows={3}
          maxLength={200}
          className="w-full px-4 py-2.5 bg-[var(--bg-search)] text-[var(--text-primary)] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[var(--wa-green)] resize-none"
        />
        <p className="text-xs text-[var(--text-muted)] mt-1 text-right">{bio.length}/200</p>
      </div>

      {/* Email/Phone info */}
      <div className="space-y-2">
        {profile?.email && (
          <div>
            <label className="block text-xs font-medium text-[var(--text-muted)] mb-0.5">Email</label>
            <p className="text-sm text-[var(--text-primary)]">{profile.email}</p>
          </div>
        )}
        {profile?.phone && (
          <div>
            <label className="block text-xs font-medium text-[var(--text-muted)] mb-0.5">Phone</label>
            <p className="text-sm text-[var(--text-primary)]">{profile.phone}</p>
          </div>
        )}
      </div>

      <Button onClick={handleSave} isLoading={isSaving} className="w-full">
        Save Changes
      </Button>
    </div>
  );
}
