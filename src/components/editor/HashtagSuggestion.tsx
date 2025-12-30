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
  'mathematics', 'physics', 'chemistry', 'biology', 'english',
  'history', 'geography', 'economics', 'accounting', 'computer-science',
  // Topics
  'homework', 'exam-prep', 'study-tips', 'notes', 'question',
  'solved', 'help-needed', 'tutorial', 'formula', 'theorem',
  // Grades
  'grade-9', 'grade-10', 'grade-11', 'grade-12',
  // Types
  'doubt', 'discussion', 'resource', 'announcement',
];

const HashtagSuggestion = forwardRef<HashtagSuggestionRef, HashtagSuggestionProps>(
  ({ query, command }, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    const filteredTags = useMemo(() => {
      if (!query) return PREDEFINED_HASHTAGS.slice(0, 8);
      
      const lowerQuery = query.toLowerCase();
      const matches = PREDEFINED_HASHTAGS.filter((tag) =>
        tag.toLowerCase().includes(lowerQuery)
      );

      // If no matches, suggest creating a custom hashtag
      if (matches.length === 0 && query.length > 0) {
        return [query.toLowerCase().replace(/\s+/g, '-')];
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
              id: filteredTags[selectedIndex],
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
      <div className="bg-popover border border-border rounded-md shadow-lg overflow-hidden max-h-[200px] overflow-y-auto">
        {filteredTags.map((tag, index) => (
          <button
            key={tag}
            className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors ${
              index === selectedIndex ? 'bg-accent text-accent-foreground' : 'hover:bg-muted'
            }`}
            onClick={() =>
              command({
                id: tag,
                label: tag,
              })
            }
          >
            <Hash className="h-4 w-4 text-primary" />
            <span>{tag}</span>
          </button>
        ))}
      </div>
    );
  }
);

HashtagSuggestion.displayName = 'HashtagSuggestion';

export default HashtagSuggestion;
