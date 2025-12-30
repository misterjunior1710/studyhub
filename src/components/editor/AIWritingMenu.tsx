import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Sparkles, Loader2, Wand2, FileText, CheckCircle, BookOpen } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AIWritingMenuProps {
  selectedText: string;
  onReplace: (newText: string) => void;
  onInsert: (text: string) => void;
  disabled?: boolean;
}

type AIAction = 'improve' | 'grammar' | 'summarize' | 'simplify';

const AIWritingMenu = ({ selectedText, onReplace, onInsert, disabled }: AIWritingMenuProps) => {
  const [loading, setLoading] = useState(false);
  const [currentAction, setCurrentAction] = useState<AIAction | null>(null);

  const handleAIAction = async (action: AIAction) => {
    if (!selectedText.trim()) {
      toast.error('Please select some text first');
      return;
    }

    setLoading(true);
    setCurrentAction(action);

    try {
      const { data, error } = await supabase.functions.invoke('ai-writing-assist', {
        body: { text: selectedText, action },
      });

      if (error) throw error;

      if (data?.result) {
        if (action === 'summarize') {
          // For summarize, insert after the selection
          onInsert(`\n\n**Summary:**\n${data.result}`);
        } else {
          // For other actions, replace the selection
          onReplace(data.result);
        }
        toast.success(`Text ${action === 'improve' ? 'improved' : action === 'grammar' ? 'corrected' : action === 'summarize' ? 'summarized' : 'simplified'} successfully`);
      }
    } catch (err) {
      console.error('AI writing assist error:', err);
      toast.error('Failed to process text. Please try again.');
    } finally {
      setLoading(false);
      setCurrentAction(null);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={disabled || loading}
          className="gap-1"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          <span className="hidden sm:inline">AI</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem
          onClick={() => handleAIAction('improve')}
          disabled={loading}
          className="gap-2"
        >
          <Wand2 className="h-4 w-4" />
          Improve Writing
          {currentAction === 'improve' && <Loader2 className="h-3 w-3 animate-spin ml-auto" />}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleAIAction('grammar')}
          disabled={loading}
          className="gap-2"
        >
          <CheckCircle className="h-4 w-4" />
          Fix Grammar
          {currentAction === 'grammar' && <Loader2 className="h-3 w-3 animate-spin ml-auto" />}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => handleAIAction('summarize')}
          disabled={loading}
          className="gap-2"
        >
          <FileText className="h-4 w-4" />
          Summarize
          {currentAction === 'summarize' && <Loader2 className="h-3 w-3 animate-spin ml-auto" />}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleAIAction('simplify')}
          disabled={loading}
          className="gap-2"
        >
          <BookOpen className="h-4 w-4" />
          Simplify
          {currentAction === 'simplify' && <Loader2 className="h-3 w-3 animate-spin ml-auto" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AIWritingMenu;
