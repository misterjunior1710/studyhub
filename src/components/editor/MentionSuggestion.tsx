import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

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
            .limit(5);

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
        <div className="bg-popover border border-border rounded-md shadow-lg p-2 text-sm text-muted-foreground">
          Searching...
        </div>
      );
    }

    if (users.length === 0 && query) {
      return (
        <div className="bg-popover border border-border rounded-md shadow-lg p-2 text-sm text-muted-foreground">
          No users found
        </div>
      );
    }

    if (users.length === 0) {
      return null;
    }

    return (
      <div className="bg-popover border border-border rounded-md shadow-lg overflow-hidden">
        {users.map((user, index) => (
          <button
            key={user.id}
            className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors ${
              index === selectedIndex ? 'bg-accent text-accent-foreground' : 'hover:bg-muted'
            }`}
            onClick={() =>
              command({
                id: user.id,
                label: user.username || 'Unknown',
              })
            }
          >
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-xs">
                {user.username?.charAt(0).toUpperCase() || '?'}
              </AvatarFallback>
            </Avatar>
            <span>@{user.username}</span>
          </button>
        ))}
      </div>
    );
  }
);

MentionSuggestion.displayName = 'MentionSuggestion';

export default MentionSuggestion;
