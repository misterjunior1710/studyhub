import { forwardRef, useImperativeHandle, useState, useMemo } from 'react';
import { Hash } from 'lucide-react';

export interface HashtagSuggestionProps {
  query: string;
  command: (item: { id: string; label: string }) => void;
}

export interface HashtagSuggestionRef {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

const PREDEFINED_HASHTAGS = [
  // Subjects
  'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English',
  'History', 'Geography', 'Economics', 'Accounting', 'Computer Science',
  // Topics
  'Homework', 'Exam Prep', 'Study Tips', 'Notes', 'Question',
  'Solved', 'Help Needed', 'Tutorial', 'Formula', 'Theorem',
  // Grades
  'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12',
  // Types
  'Doubt', 'Discussion', 'Resource', 'Announcement',
];

// Helper to convert to Title Case
const toTitleCase = (str: string) => {
  return str
    .split(/[-\s]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

const HashtagSuggestion = forwardRef<HashtagSuggestionRef, HashtagSuggestionProps>(
  ({ query, command }, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    const filteredTags = useMemo(() => {
      if (!query) return PREDEFINED_HASHTAGS.slice(0, 8);
      
      const lowerQuery = query.toLowerCase();
      const matches = PREDEFINED_HASHTAGS.filter((tag) =>
        tag.toLowerCase().includes(lowerQuery)
      );

      // If no matches, suggest creating a custom hashtag (title cased)
      if (matches.length === 0 && query.length > 0) {
        return [toTitleCase(query.replace(/[-_]+/g, ' '))];
      }

      return matches.slice(0, 8);
    }, [query]);

    useImperativeHandle(ref, () => ({
      onKeyDown: ({ event }: { event: KeyboardEvent }) => {
        if (event.key === 'ArrowUp') {
          setSelectedIndex((prev) => (prev <= 0 ? filteredTags.length - 1 : prev - 1));
          return true;
        }

        if (event.key === 'ArrowDown') {
          setSelectedIndex((prev) => (prev >= filteredTags.length - 1 ? 0 : prev + 1));
          return true;
        }

        if (event.key === 'Enter') {
          if (filteredTags[selectedIndex]) {
            command({
              id: filteredTags[selectedIndex].toLowerCase().replace(/\s+/g, '-'),
              label: filteredTags[selectedIndex],
            });
          }
          return true;
        }

        return false;
      },
    }));

    if (filteredTags.length === 0) {
      return null;
    }

    return (
      <div className="bg-popover border border-border rounded-lg shadow-xl overflow-hidden max-h-[240px] overflow-y-auto animate-scale-in">
        {filteredTags.map((tag, index) => (
          <button
            key={tag}
            className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm text-left transition-all duration-200 ${
              index === selectedIndex 
                ? 'bg-gradient-to-r from-accent/30 to-primary/10 text-foreground' 
                : 'hover:bg-muted/50'
            }`}
            onClick={() =>
              command({
                id: tag.toLowerCase().replace(/\s+/g, '-'),
                label: tag,
              })
            }
            style={{ 
              animationDelay: `${index * 30}ms`,
            }}
          >
            <div className={`flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-accent to-primary transition-transform duration-200 ${
              index === selectedIndex ? 'scale-110' : ''
            }`}>
              <Hash className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <span className="font-medium">{tag}</span>
          </button>
        ))}
      </div>
    );
  }
);

HashtagSuggestion.displayName = 'HashtagSuggestion';

export default HashtagSuggestion;
