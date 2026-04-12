'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { UserPlus, UserCheck, ShieldPlus, ArrowLeft, Users } from 'lucide-react';
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

      // Load specific statuses they have access to
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

  if (isLoading) {
    return <div className="flex-1 flex justify-center p-12 bg-[var(--bg-app)]"><Spinner size="lg" /></div>;
  }

  if (!author) {
    return <div className="flex-1 p-12 text-center bg-[var(--bg-app)]">User not found.</div>;
  }

  const isMe = currentUser?.id === profileId;

  return (
    <div className="flex-1 flex flex-col bg-[var(--bg-app)] overflow-y-auto">
      {/* Header */}
      <div className="bg-[var(--bg-header)] shadow-sm z-10 w-full sticky top-0 border-b border-[var(--border-color)]">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-[var(--bg-hover)] rounded-full text-[var(--text-muted)]">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">Profile</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto w-full px-6 py-8">
        {/* Profile Card */}
        <div className="bg-[var(--bg-primary)] p-6 rounded-2xl shadow-sm border border-[var(--border-color)] mb-8 flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <Avatar src={author.avatar_url} name={author.display_name} size="xl" />
          
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-2xl font-bold text-[var(--text-primary)] flex justify-center sm:justify-start items-center gap-2">
              {author.display_name}
              {relationship && (
                <span className="text-[10px] uppercase bg-[var(--wa-green)]/20 text-[var(--wa-green)] px-2 py-0.5 rounded-full font-bold">
                  {relationship}
                </span>
              )}
            </h2>
            <p className="text-[var(--text-muted)] text-sm mb-4">
              {author.bio || 'Available'}
            </p>
            
            <div className="flex items-center justify-center sm:justify-start gap-6 mb-6">
              <div className="flex flex-col items-center sm:items-start">
                <span className="font-bold text-[var(--text-primary)]">{followerCount}</span>
                <span className="text-xs text-[var(--text-muted)] uppercase">Followers</span>
              </div>
              <div className="flex flex-col items-center sm:items-start">
                <span className="font-bold text-[var(--text-primary)]">{statuses.length}</span>
                <span className="text-xs text-[var(--text-muted)] uppercase">Posts</span>
              </div>
            </div>

            {!isMe && (
              <div className="flex flex-wrap justify-center sm:justify-start gap-3">
                <Button variant={isFollowing ? 'secondary' : 'primary'} onClick={toggleFollow} className="px-6">
                  {isFollowing ? <><UserCheck size={16} className="mr-2" /> Following</> : <><UserPlus size={16} className="mr-2" /> Follow</>}
                </Button>
                <Button variant="secondary" onClick={handleMessage}>Message</Button>
              </div>
            )}
          </div>
        </div>

        {/* User's Posts */}
        <h3 className="text-sm font-semibold text-[var(--text-muted)] uppercase mb-4 px-2">Recent Posts</h3>
        {statuses.length === 0 ? (
          <div className="text-center p-8 bg-[var(--bg-primary)] rounded-xl border border-[var(--border-color)]">
            <p className="text-[var(--text-muted)]">No posts shared yet.</p>
          </div>
        ) : (
          statuses.map(status => (
            <StatusCard key={status.id} status={status} />
          ))
        )}
      </div>
    </div>
  );
}
