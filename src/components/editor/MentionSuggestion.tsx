import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { AtSign, Loader2 } from 'lucide-react';

export interface MentionSuggestionProps {
  query: string;
  command: (item: { id: string; label: string }) => void;
}

export interface MentionSuggestionRef {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

interface Profile {
  id: string;
  username: string | null;
}

const MentionSuggestion = forwardRef<MentionSuggestionRef, MentionSuggestionProps>(
  ({ query, command }, ref) => {
    const [users, setUsers] = useState<Profile[]>([]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
      const searchUsers = async () => {
        if (!query || query.length < 1) {
          setUsers([]);
          return;
        }

        setLoading(true);
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('id, username')
            .ilike('username', `%${query}%`)
            .limit(8);

          if (error) throw error;
          setUsers(data || []);
          setSelectedIndex(0);
        } catch (err) {
          console.error('Error searching users:', err);
          setUsers([]);
        } finally {
          setLoading(false);
        }
      };

      const debounce = setTimeout(searchUsers, 150);
      return () => clearTimeout(debounce);
    }, [query]);

    useImperativeHandle(ref, () => ({
      onKeyDown: ({ event }: { event: KeyboardEvent }) => {
        if (event.key === 'ArrowUp') {
          setSelectedIndex((prev) => (prev <= 0 ? users.length - 1 : prev - 1));
          return true;
        }

        if (event.key === 'ArrowDown') {
          setSelectedIndex((prev) => (prev >= users.length - 1 ? 0 : prev + 1));
          return true;
        }

        if (event.key === 'Enter') {
          if (users[selectedIndex]) {
            command({
              id: users[selectedIndex].id,
              label: users[selectedIndex].username || 'Unknown',
            });
          }
          return true;
        }

        return false;
      },
    }));

    if (loading) {
      return (
        <div className="bg-popover border border-border rounded-lg shadow-xl p-3 animate-fade-in">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Searching...</span>
          </div>
        </div>
      );
    }

    if (users.length === 0 && query) {
      return (
        <div className="bg-popover border border-border rounded-lg shadow-xl p-3 animate-fade-in">
          <p className="text-sm text-muted-foreground">No users found</p>
        </div>
      );
    }

    if (users.length === 0) {
      return null;
    }

    return (
      <div className="bg-popover border border-border rounded-lg shadow-xl overflow-hidden max-h-[240px] overflow-y-auto animate-scale-in">
        {users.map((user, index) => (
          <button
            key={user.id}
            className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm text-left transition-all duration-200 ${
              index === selectedIndex 
                ? 'bg-gradient-to-r from-primary/20 to-accent/10 text-foreground' 
                : 'hover:bg-muted/50'
            }`}
            onClick={() =>
              command({
                id: user.id,
                label: user.username || 'Unknown',
              })
            }
          >
            <div className={`flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent transition-transform duration-200 ${
              index === selectedIndex ? 'scale-110' : ''
            }`}>
              <AtSign className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-medium capitalize">@{user.username}</span>
          </button>
        ))}
      </div>
    );
  }
);

MentionSuggestion.displayName = 'MentionSuggestion';

export default MentionSuggestion;
