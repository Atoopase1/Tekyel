'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Settings, Pencil, UserCheck, UserPlus, Image as ImageIcon } from 'lucide-react';
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
  const { profile: currentUser, setProfile } = useAuthStore();
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
  
  const handleEditProfile = () => {
    toast('Profile editing coming soon!', { icon: '🚧' });
  };

  const handleEditBanner = () => {
    toast('Banner upload coming soon!', { icon: '🚧' });
  };

  if (isLoading) {
    return <div className="flex-1 flex justify-center items-center bg-[#18181B]"><Spinner size="lg" /></div>;
  }

  if (!author) {
    return <div className="flex-1 flex justify-center items-center bg-[#18181B] text-white">User not found.</div>;
  }

  const isMe = currentUser?.id === profileId;

  return (
    <div className="flex-1 flex flex-col bg-[#121212] overflow-x-hidden relative min-h-screen">
      
      {/* 1. Dark Header with Top Bar (Back, Search, Settings) */}
      <div className="bg-[#18181B] w-full z-20 sticky top-0 flex items-center justify-between px-4 py-3 border-b border-black/40 shadow-sm">
        <button onClick={() => router.back()} className="text-[var(--text-muted)] hover:text-white transition-colors">
          <ArrowLeft size={24} />
        </button>
        
        <div className="flex-1 max-w-md mx-4">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search" 
              className="w-full bg-[#27272A] text-white text-sm rounded-full py-2 px-4 focus:outline-none focus:ring-1 focus:ring-gray-500 placeholder-gray-400"
            />
          </div>
        </div>

        <button className="text-[var(--text-muted)] hover:text-white transition-colors">
          <Settings size={22} />
        </button>
      </div>

      {/* 2. Banner/Cover Photo Section */}
      <div className="relative w-full h-40 sm:h-56 bg-gradient-to-r from-gray-800 to-gray-900 border-b-2 border-black/50">
        {author.cover_url ? (
          <img src={author.cover_url} alt="Cover" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center opacity-30">
            <ImageIcon size={48} className="text-white" />
          </div>
        )}
        
        {/* Banner Edit Icon overlay */}
        {isMe && (
          <button 
            onClick={handleEditBanner}
            className="absolute right-4 bottom-4 bg-white/20 hover:bg-white/30 backdrop-blur-md p-2 rounded-full text-white transition-all shadow-lg border border-white/10"
          >
            <Pencil size={18} />
          </button>
        )}
      </div>

      {/* Profile Body Layer */}
      <div className="relative max-w-4xl mx-auto w-full px-4 sm:px-8">
        
        {/* 3. Overlapping Avatar */}
        <div className="relative flex justify-between items-end mt-[-56px] sm:mt-[-72px] mb-4">
          <div className="relative z-10 group">
            {/* The dense thick border matches the dark background */}
            <div className="rounded-full border-[6px] sm:border-[8px] border-[#121212] inline-block bg-[#121212]">
              <Avatar src={author.avatar_url} name={author.display_name} size="xxl" className="w-24 h-24 sm:w-36 sm:h-36" />
            </div>
            
            {/* Avatar Edit Icon */}
            {isMe && (
              <button 
                onClick={handleEditProfile}
                className="absolute bottom-2 right-2 bg-white/20 hover:bg-white/30 backdrop-blur-md p-1.5 sm:p-2 rounded-full text-white transition-all border border-white/10"
              >
                <Pencil size={14} className="sm:w-4 sm:h-4" />
              </button>
            )}
          </div>
          
          {/* Action Buttons to the Right of Avatar (if not myself) */}
          {!isMe && (
            <div className="flex gap-2 mb-2">
               <Button variant={isFollowing ? 'secondary' : 'primary'} onClick={toggleFollow} className="px-4 py-2 text-sm h-10 rounded-full">
                  {isFollowing ? <UserCheck size={16} /> : <UserPlus size={16} />} 
               </Button>
               <Button variant="secondary" onClick={handleMessage} className="px-4 py-2 text-sm h-10 rounded-full bg-[#27272A] border-none text-white hover:bg-[#3F3F46]">
                 Message
               </Button>
            </div>
          )}
        </div>

        {/* 4. Background and Info text */}
        <div className="relative bg-[#18181B] rounded-2xl p-6 border border-[#27272A] shadow-md mb-8">
          
          {/* Main Info Edit Icon */}
          {isMe && (
             <button 
                onClick={handleEditProfile}
                className="absolute right-6 top-6 text-[#71717A] hover:text-white transition-colors"
             >
                <Pencil size={18} />
             </button>
          )}

          <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-1">
            {author.display_name}
            {relationship && (
              <span className="text-[10px] uppercase bg-[var(--wa-green)]/20 text-[var(--wa-green)] px-2 py-0.5 rounded-full font-bold">
                {relationship}
              </span>
            )}
          </h2>
          <p className="text-[#A1A1AA] text-sm mb-6 leading-relaxed">
            {author.bio || 'No bio available.'}
          </p>

          <div className="flex items-center gap-8 border-t border-[#27272A] pt-4">
            <div className="flex flex-col">
              <span className="font-bold text-lg text-white">{followerCount}</span>
              <span className="text-xs text-[#71717A] font-medium uppercase tracking-wider">Followers</span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg text-white">{statuses.length}</span>
              <span className="text-xs text-[#71717A] font-medium uppercase tracking-wider">Posts</span>
            </div>
          </div>
        </div>

        {/* User's Posts Feed */}
        <h3 className="text-xs font-bold text-[#71717A] uppercase tracking-widest px-2 mb-4">Activity Timeline</h3>
        {statuses.length === 0 ? (
          <div className="text-center p-12 bg-[#18181B] rounded-2xl border border-[#27272A] mb-20">
            <p className="text-[#71717A]">No posts shared yet.</p>
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
