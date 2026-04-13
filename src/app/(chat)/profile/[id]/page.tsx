// ============================================================
// ProfileViewPage — Premium user profile view
// ============================================================
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Settings, Pencil, UserCheck, UserPlus, Image as ImageIcon, MessageSquare } from 'lucide-react';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import StatusCard from '@/components/status/StatusCard';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/store/auth-store';
import { useChatStore } from '@/store/chat-store';
import toast from 'react-hot-toast';

export default function ProfileViewPage() {
  const params = useParams();
  const router = useRouter();
  const profileId = params.id as string;
  const { profile: currentUser } = useAuthStore();
  const { startDirectChat } = useChatStore();
  const supabase = getSupabaseBrowserClient();

  const [author, setAuthor] = useState<any>(null);
  const [statuses, setStatuses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [followerCount, setFollowerCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [relationship, setRelationship] = useState<string | null>(null);

  useEffect(() => {
    const loadProfileData = async () => {
      setIsLoading(true);

      // Load Profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', profileId)
        .single();
      
      if (profileData) setAuthor(profileData);

      // Load statuses
      const { data: statusData } = await supabase
        .from('statuses')
        .select('*, profiles!statuses_user_id_fkey(*)')
        .eq('user_id', profileId)
        .order('created_at', { ascending: false });
      
      if (statusData) setStatuses(statusData);

      // Load Followers Count
      const { count } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', profileId);
      
      setFollowerCount(count || 0);

      // Check following status
      if (currentUser) {
        const { data: followData } = await supabase
          .from('follows')
          .select('*')
          .eq('follower_id', currentUser.id)
          .eq('following_id', profileId)
          .single();
        
        setIsFollowing(!!followData);

        // Check relationship status
        const { data: contactData } = await supabase
          .from('contacts')
          .select('category')
          .eq('user_id', currentUser.id)
          .eq('contact_id', profileId)
          .single();
        
        if (contactData) setRelationship(contactData.category);
      }

      setIsLoading(false);
    };

    loadProfileData();
  }, [profileId, currentUser, supabase]);

  const toggleFollow = async () => {
    if (!currentUser) return;
    
    if (isFollowing) {
      await supabase.from('follows').delete().eq('follower_id', currentUser.id).eq('following_id', profileId);
      setIsFollowing(false);
      setFollowerCount(p => Math.max(0, p - 1));
      toast.success('Unfollowed');
    } else {
      await supabase.from('follows').insert({ follower_id: currentUser.id, following_id: profileId });
      setIsFollowing(true);
      setFollowerCount(p => p + 1);
      toast.success('Following!');
    }
  };

  const handleMessage = async () => {
    const chatId = await startDirectChat(profileId);
    if (chatId) router.push(`/${chatId}`);
  };
  
  const handleEditProfile = () => {
    router.push('/settings');
  };

  const handleEditBanner = () => {
    toast('Banner upload coming soon!', { icon: '🚧' });
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex justify-center items-center bg-[var(--bg-app)]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!author) {
    return (
      <div className="flex-1 flex justify-center items-center bg-[var(--bg-app)] text-[var(--text-primary)]">
        User not found.
      </div>
    );
  }

  const isMe = currentUser?.id === profileId;

  return (
    <div className="flex-1 flex flex-col bg-[var(--bg-app)] overflow-x-hidden relative min-h-screen">
      
      {/* Header bar */}
      <div className="glass-header w-full z-20 sticky top-0 flex items-center justify-between px-5 py-3 border-b border-[var(--border-color)]">
        <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all duration-200">
          <ArrowLeft size={20} />
        </button>
        
        <h1 className="text-[15px] font-semibold text-[var(--text-primary)]">{author.display_name}</h1>

        <button className="p-2 rounded-xl hover:bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all duration-200">
          <Settings size={20} />
        </button>
      </div>

      {/* Banner */}
      <div className="relative w-full h-40 sm:h-56" style={{ background: 'linear-gradient(135deg, var(--navy) 0%, #1E293B 50%, var(--emerald-dark, #15803D) 100%)' }}>
        {author.cover_url ? (
          <img src={author.cover_url} alt="Cover" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center opacity-10">
            <ImageIcon size={48} className="text-white" />
          </div>
        )}
        
        {isMe && (
          <button 
            onClick={handleEditBanner}
            className="absolute right-4 bottom-4 bg-white/15 hover:bg-white/25 backdrop-blur-md p-2.5 rounded-xl text-white transition-all border border-white/10"
          >
            <Pencil size={16} />
          </button>
        )}
      </div>

      {/* Profile body */}
      <div className="relative max-w-4xl mx-auto w-full px-4 sm:px-8">
        
        {/* Avatar overlapping banner */}
        <div className="relative flex justify-between items-end mt-[-56px] sm:mt-[-72px] mb-4">
          <div className="relative z-10 group">
            <div className="rounded-full border-[5px] border-[var(--bg-app)] inline-block">
              <div className="p-0.5 rounded-full" style={{ background: 'linear-gradient(135deg, var(--navy), var(--emerald))' }}>
                <div className="rounded-full bg-[var(--bg-app)] p-0.5">
                  <Avatar src={author.avatar_url} name={author.display_name} size="xxl" />
                </div>
              </div>
            </div>
            
            {isMe && (
              <button 
                onClick={handleEditProfile}
                className="absolute bottom-3 right-3 bg-[var(--bg-primary)]/80 hover:bg-[var(--bg-primary)] backdrop-blur-md p-2 rounded-full text-[var(--text-muted)] transition-all border border-[var(--border-color)]"
              >
                <Pencil size={14} />
              </button>
            )}
          </div>
          
          {/* Actions */}
          {!isMe && (
            <div className="flex gap-2 mb-2">
              <Button variant={isFollowing ? 'secondary' : 'primary'} onClick={toggleFollow} size="sm">
                {isFollowing ? <><UserCheck size={15} className="mr-1.5" /> Following</> : <><UserPlus size={15} className="mr-1.5" /> Follow</>}
              </Button>
              <Button variant="secondary" onClick={handleMessage} size="sm">
                <MessageSquare size={15} className="mr-1.5" /> Message
              </Button>
            </div>
          )}
        </div>

        {/* Info card */}
        <div className="surface-card p-6 mb-8">
          {isMe && (
            <button 
              onClick={handleEditProfile}
              className="absolute right-10 top-auto text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            >
              <Pencil size={16} />
            </button>
          )}

          <h2 className="text-[22px] font-bold text-[var(--text-primary)] flex items-center gap-2.5 mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
            {author.display_name}
            {relationship && (
              <span className={`text-[10px] uppercase px-2.5 py-0.5 rounded-full font-bold ${
                relationship === 'family' 
                  ? 'bg-[var(--gold)]/10 text-[var(--gold)]' 
                  : 'bg-[var(--emerald)]/10 text-[var(--emerald)]'
              }`}>
                {relationship}
              </span>
            )}
          </h2>
          <p className="text-[var(--text-muted)] text-[14px] mb-6 leading-relaxed">
            {author.bio || 'No bio available.'}
          </p>

          <div className="flex items-center gap-10 border-t border-[var(--border-color)] pt-5">
            <div className="flex flex-col">
              <span className="font-bold text-[20px] text-[var(--text-primary)]">{followerCount}</span>
              <span className="text-[11px] text-[var(--text-muted)] font-medium uppercase tracking-wider">Followers</span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-[20px] text-[var(--text-primary)]">{statuses.length}</span>
              <span className="text-[11px] text-[var(--text-muted)] font-medium uppercase tracking-wider">Posts</span>
            </div>
          </div>
        </div>

        {/* Activity timeline */}
        <h3 className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-widest px-1 mb-4 flex items-center gap-2">
          Activity Timeline
        </h3>
        {statuses.length === 0 ? (
          <div className="text-center p-12 surface-card mb-20">
            <p className="text-[var(--text-muted)] text-[14px]">No posts shared yet.</p>
          </div>
        ) : (
          <div className="space-y-4 mb-20">
            {statuses.map(status => (
              <div key={status.id} className="opacity-90 hover:opacity-100 transition-opacity">
                <StatusCard status={{...status, visibility: 'public'}} />
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
