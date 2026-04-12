'use client';

import { useState, useRef } from 'react';
import { Image as ImageIcon, X, Send, Video, File } from 'lucide-react';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/store/auth-store';
import toast from 'react-hot-toast';

export default function StatusUploader({ onStatusPosted }: { onStatusPosted: () => void }) {
  const { profile } = useAuthStore();
  const supabase = getSupabaseBrowserClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [textContent, setTextContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [visibility, setVisibility] = useState<'public' | 'friends' | 'family'>('public');
  const [isPosting, setIsPosting] = useState(false);

  const determineContentType = (file: File | null) => {
    if (!file) return 'text';
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    if (file.type.startsWith('audio/')) return 'audio';
    return 'document';
  };

  const handlePost = async () => {
    if (!textContent.trim() && !file) return;

    setIsPosting(true);
    let mediaUrl = null;

    try {
      if (file) {
        const fileName = `status/${profile?.id}-${Date.now()}.${file.name.split('.').pop()}`;
        const { data, error } = await supabase.storage
          .from('chat-media')
          .upload(fileName, file, { cacheControl: '3600', upsert: false });

        if (error) throw error;

        const { data: urlData } = supabase.storage.from('chat-media').getPublicUrl(data.path);
        mediaUrl = urlData.publicUrl;
      }

      const { error } = await supabase.from('statuses').insert({
        user_id: profile?.id,
        content_type: determineContentType(file),
        media_url: mediaUrl,
        text_content: textContent.trim() || null,
        visibility,
      });

      if (error) throw error;

      toast.success('Status posted!');
      setTextContent('');
      setFile(null);
      onStatusPosted();
    } catch (err: any) {
      toast.error(`Failed to post status: ${err.message}`);
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="bg-[var(--bg-primary)] p-4 rounded-xl shadow-sm border border-[var(--border-color)]">
      <textarea
        value={textContent}
        onChange={(e) => setTextContent(e.target.value)}
        placeholder="What's on your mind? Share a status..."
        className="w-full bg-transparent border-none focus:outline-none resize-none text-[var(--text-primary)] placeholder-[var(--text-muted)] min-h-[60px]"
        disabled={isPosting}
      />
      
      {file && (
        <div className="relative inline-block mb-3 border border-[var(--border-color)] rounded-lg p-2 bg-[var(--bg-secondary)]">
          <button
            onClick={() => setFile(null)}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
          >
            <X size={14} />
          </button>
          <div className="flex items-center gap-2 text-sm text-[var(--text-primary)]">
            {file.type.startsWith('video/') ? <Video size={16} /> : file.type.startsWith('image/') ? <ImageIcon size={16} /> : <File size={16} />}
            <span className="truncate max-w-[200px]">{file.name}</span>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mt-2 pt-3 border-t border-[var(--border-color)]">
        <div className="flex gap-2">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={(e) => e.target.files && setFile(e.target.files[0])}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-[var(--text-muted)] hover:text-[var(--wa-green)] hover:bg-[var(--bg-secondary)] rounded-full transition-colors"
            disabled={isPosting}
          >
            <ImageIcon size={20} />
          </button>
          
          <select
            value={visibility}
            onChange={(e) => setVisibility(e.target.value as any)}
            className="bg-[var(--bg-secondary)] text-[var(--text-primary)] text-xs rounded-lg px-2 py-1 outline-none border-none cursor-pointer"
            disabled={isPosting}
          >
            <option value="public">🌍 Public (Discoverable)</option>
            <option value="friends">👥 Friends Only</option>
            <option value="family">🛡️ Family Only</option>
          </select>
        </div>

        <Button
          onClick={handlePost}
          disabled={isPosting || (!textContent.trim() && !file)}
          className="flex items-center gap-2"
          size="sm"
        >
          {isPosting ? <Spinner size="sm" /> : <Send size={16} />}
          Post Status
        </Button>
      </div>
    </div>
  );
}
