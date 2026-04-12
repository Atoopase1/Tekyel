// ============================================================
// Public Search and Contacts Page
// ============================================================
'use client';

import { useState, useEffect } from 'react';
import { Search, UserPlus, ShieldPlus, Users } from 'lucide-react';
import SearchInput from '@/components/ui/SearchInput';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/store/auth-store';
import { useChatStore } from '@/store/chat-store';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import type { Profile } from '@/types';

type PublicProfile = Profile;
type Contact = { id: string; user_id: string; contact_id: string; category: string; profiles: PublicProfile };

export default function ContactsPage() {
  const router = useRouter();
  const { profile } = useAuthStore();
  const { startDirectChat } = useChatStore();
  const supabase = getSupabaseBrowserClient();

  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<PublicProfile[]>([]);
  
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoadingContacts, setIsLoadingContacts] = useState(true);

  // Load saved contacts
  const loadContacts = async () => {
    setIsLoadingContacts(true);
    const { data } = await supabase
      .from('contacts')
      .select('*, profiles!contacts_contact_id_fkey(*)')   // Join with profile to get contact info
      .order('created_at', { ascending: false });
    
    if (data) setContacts(data as any);
    setIsLoadingContacts(false);
  };

  useEffect(() => {
    if (profile) loadContacts();
  }, [profile]);

  // Search global directory
  useEffect(() => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    const searchDelay = setTimeout(async () => {
      setIsSearching(true);
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', profile?.id)
        .or(`display_name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%`)
        .limit(20);

      if (data) setSearchResults(data as PublicProfile[]);
      setIsSearching(false);
    }, 500);

    return () => clearTimeout(searchDelay);
  }, [query, profile?.id]);

  const handleAddContact = async (contactId: string, category: 'friend' | 'family') => {
    const { error } = await supabase
      .from('contacts')
      .upsert({
        user_id: profile?.id,
        contact_id: contactId,
        category,
      }, { onConflict: 'user_id,contact_id' });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(`Added as ${category}!`);
      loadContacts();
    }
  };

  const handleMessage = async (userId: string) => {
    const chatId = await startDirectChat(userId);
    if (chatId) router.push(`/${chatId}`);
  };

  return (
    <div className="flex-1 flex flex-col bg-[var(--bg-app)]">
      {/* Search Header */}
      <div className="bg-[var(--bg-header)] px-6 py-8 shadow-sm z-10 w-full max-w-4xl mx-auto">
        <h1 className="text-2xl font-semibold text-[var(--text-primary)] mb-6">Network & Contacts</h1>
        <SearchInput
          placeholder="Search phone, email, or name..."
          value={query}
          onChange={setQuery}
        />
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 w-full max-w-4xl mx-auto">
        {query ? (
          <div>
            <h2 className="text-[var(--wa-green)] font-semibold text-sm mb-4 uppercase tracking-wider">
              {isSearching ? <Spinner size="sm" /> : 'Global Search Results'}
            </h2>
            <div className="bg-[var(--bg-primary)] rounded-xl divide-y divide-[var(--border-color)] shadow-sm">
              {searchResults.length === 0 && !isSearching && (
                <div className="p-4 text-center text-[var(--text-muted)] text-sm">No users found.</div>
              )}
              {searchResults.map((user) => {
                const isSaved = contacts.find((c) => c.contact_id === user.id);
                return (
                  <div key={user.id} className="flex items-center justify-between p-4 hover:bg-[var(--bg-hover)] transition-colors">
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push(`/profile/${user.id}`)}>
                      <Avatar src={user.avatar_url} name={user.display_name} />
                      <div>
                        <p className="text-[var(--text-primary)] font-medium">{user.display_name}</p>
                        <p className="text-[var(--text-muted)] text-xs">{user.is_online ? 'Online' : 'Offline'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isSaved ? (
                        <div className="px-2 py-1 bg-[var(--bg-secondary)] rounded text-xs font-semibold text-[var(--wa-green)] uppercase">
                          {isSaved.category}
                        </div>
                      ) : (
                        <>
                          <Button variant="secondary" size="sm" onClick={() => handleAddContact(user.id, 'friend')} className="text-xs">
                            <UserPlus size={14} className="mr-1" /> Friend
                          </Button>
                          <Button variant="primary" size="sm" onClick={() => handleAddContact(user.id, 'family')} className="text-xs">
                            <ShieldPlus size={14} className="mr-1" /> Family
                          </Button>
                        </>
                      )}
                      <Button variant="secondary" size="sm" onClick={() => handleMessage(user.id)} className="text-xs ml-2">Message</Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Saved Contacts Sections */}
            {isLoadingContacts ? (
              <div className="flex justify-center p-8"><Spinner size="lg" /></div>
            ) : (
              <>
                {/* Family */}
                <div>
                  <h2 className="text-[var(--wa-green)] font-semibold text-sm mb-4 uppercase tracking-wider flex items-center gap-2">
                    <ShieldPlus size={16} /> Family Circle
                  </h2>
                  <div className="bg-[var(--bg-primary)] rounded-xl divide-y divide-[var(--border-color)] shadow-sm">
                    {contacts.filter(c => c.category === 'family').length === 0 && (
                      <div className="p-4 text-center text-[var(--text-muted)] text-sm">No family members added.</div>
                    )}
                    {contacts.filter(c => c.category === 'family').map((contact) => (
                      <div key={contact.id} className="flex items-center justify-between p-4 hover:bg-[var(--bg-hover)] transition-colors">
                        <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push(`/profile/${contact.contact_id}`)}>
                          <Avatar src={contact.profiles.avatar_url} name={contact.profiles.display_name} />
                          <div>
                            <p className="text-[var(--text-primary)] font-medium">{contact.profiles.display_name}</p>
                          </div>
                        </div>
                        <Button variant="secondary" size="sm" onClick={() => handleMessage(contact.contact_id)}>Message</Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Friends */}
                <div>
                  <h2 className="text-[var(--wa-green)] font-semibold text-sm mb-4 uppercase tracking-wider flex items-center gap-2">
                    <Users size={16} /> Friends List
                  </h2>
                  <div className="bg-[var(--bg-primary)] rounded-xl divide-y divide-[var(--border-color)] shadow-sm">
                    {contacts.filter(c => c.category === 'friend').length === 0 && (
                      <div className="p-4 text-center text-[var(--text-muted)] text-sm">No friends added.</div>
                    )}
                    {contacts.filter(c => c.category === 'friend').map((contact) => (
                      <div key={contact.id} className="flex items-center justify-between p-4 hover:bg-[var(--bg-hover)] transition-colors">
                        <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push(`/profile/${contact.contact_id}`)}>
                          <Avatar src={contact.profiles.avatar_url} name={contact.profiles.display_name} />
                          <div>
                            <p className="text-[var(--text-primary)] font-medium">{contact.profiles.display_name}</p>
                          </div>
                        </div>
                        <Button variant="secondary" size="sm" onClick={() => handleMessage(contact.contact_id)}>Message</Button>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
