import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Link from '@tiptap/extension-link';
import { common, createLowlight } from 'lowlight';
import { useState, useCallback, useEffect } from 'react';
import { Button } from './ui/button';
import { 
  Bold, Italic, List, ListOrdered, Heading2, Quote, Undo, Redo,
  Code2, Hash, AtSign, Sigma, Link2
} from 'lucide-react';
import { FormulaDialog, AIWritingMenu } from './editor';
import katex from 'katex';

// Create lowlight instance with common languages
const lowlight = createLowlight(common);

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  onMentionsChange?: (mentions: string[]) => void;
  onHashtagsChange?: (hashtags: string[]) => void;
}

// Custom paste handler to clean up messy HTML
const cleanPastedHtml = (html: string): string => {
  // Remove Word-specific tags and attributes
  let cleaned = html
    .replace(/<o:p[^>]*>[\s\S]*?<\/o:p>/gi, '')
    .replace(/<\/?o:[^>]*>/gi, '')
    .replace(/class="[^"]*Mso[^"]*"/gi, '')
    .replace(/style="[^"]*mso-[^"]*"/gi, '')
    .replace(/<!\[if[^>]*>[\s\S]*?<!\[endif\]>/gi, '')
    .replace(/<!--\[if[^>]*>[\s\S]*?<!\[endif\]-->/gi, '');
  
  // Remove empty spans and divs
  cleaned = cleaned
    .replace(/<span[^>]*>\s*<\/span>/gi, '')
    .replace(/<div[^>]*>\s*<\/div>/gi, '');
  
  return cleaned;
};

const RichTextEditor = ({ 
  content, 
  onChange, 
  placeholder,
  onMentionsChange,
  onHashtagsChange 
}: RichTextEditorProps) => {
  const [showFormulaDialog, setShowFormulaDialog] = useState(false);
  const [selectedText, setSelectedText] = useState('');

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false, // We'll use CodeBlockLowlight instead
      }),
      CodeBlockLowlight.configure({
        lowlight,
        defaultLanguage: 'javascript',
        HTMLAttributes: {
          class: 'code-block bg-card border border-border rounded-lg p-4 my-2 overflow-x-auto font-mono text-sm',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline cursor-pointer',
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
      
      // Extract mentions and hashtags from content
      const mentionMatches = html.match(/@(\w+)/g) || [];
      const hashtagMatches = html.match(/#(\w+)/g) || [];
      
      const mentions = mentionMatches.map(m => m.slice(1));
      const hashtags = hashtagMatches.map(h => h.slice(1));
      
      onMentionsChange?.(mentions);
      onHashtagsChange?.(hashtags);
    },
    onSelectionUpdate: ({ editor }) => {
      const { from, to } = editor.state.selection;
      const text = editor.state.doc.textBetween(from, to, ' ');
      setSelectedText(text);
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[200px] px-3 py-2',
      },
      // Clean paste handler
      handlePaste: (view, event, slice) => {
        const html = event.clipboardData?.getData('text/html');
        if (html) {
          // Check if it's from Word or similar
          if (html.includes('mso-') || html.includes('o:p')) {
            event.preventDefault();
            const cleanedHtml = cleanPastedHtml(html);
            // Let TipTap handle the cleaned content
            const plainText = event.clipboardData?.getData('text/plain') || '';
            view.dispatch(view.state.tr.insertText(plainText));
            return true;
          }
        }
        return false;
      },
    },
  });

  // Update selected text on selection change
  useEffect(() => {
    if (!editor) return;
    
    const updateSelection = () => {
      const { from, to } = editor.state.selection;
      const text = editor.state.doc.textBetween(from, to, ' ');
      setSelectedText(text);
    };

    editor.on('selectionUpdate', updateSelection);
    return () => {
      editor.off('selectionUpdate', updateSelection);
    };
  }, [editor]);

  const insertFormula = useCallback((latex: string, isBlock: boolean) => {
    if (!editor) return;
    
    try {
      const html = katex.renderToString(latex, {
        throwOnError: false,
        displayMode: isBlock,
      });
      
      // Insert as HTML with data attribute for later editing
      const formulaHtml = `<span class="formula ${isBlock ? 'block-formula' : 'inline-formula'}" data-latex="${encodeURIComponent(latex)}">${html}</span>`;
      editor.chain().focus().insertContent(formulaHtml).run();
    } catch (err) {
      console.error('Error inserting formula:', err);
    }
  }, [editor]);

  const handleAIReplace = useCallback((newText: string) => {
    if (!editor) return;
    editor.chain().focus().insertContent(newText).run();
  }, [editor]);

  const handleAIInsert = useCallback((text: string) => {
    if (!editor) return;
    editor.chain().focus().insertContent(text).run();
  }, [editor]);

  const insertLink = useCallback(() => {
    if (!editor) return;
    const url = prompt('Enter URL:');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="border rounded-md overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-2 border-b bg-muted/50">
        {/* Text formatting */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'bg-accent' : ''}
          title="Bold (Ctrl+B)"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'bg-accent' : ''}
          title="Italic (Ctrl+I)"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editor.isActive('heading', { level: 2 }) ? 'bg-accent' : ''}
          title="Heading"
        >
          <Heading2 className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-border mx-1 self-center" />

        {/* Lists */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive('bulletList') ? 'bg-accent' : ''}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive('orderedList') ? 'bg-accent' : ''}
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={editor.isActive('blockquote') ? 'bg-accent' : ''}
          title="Quote"
        >
          <Quote className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-border mx-1 self-center" />

        {/* Code & Formula */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={editor.isActive('codeBlock') ? 'bg-accent' : ''}
          title="Code Block"
        >
          <Code2 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowFormulaDialog(true)}
          title="Insert Formula (LaTeX)"
        >
          <Sigma className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-border mx-1 self-center" />

        {/* Link */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={insertLink}
          className={editor.isActive('link') ? 'bg-accent' : ''}
          title="Insert Link"
        >
          <Link2 className="h-4 w-4" />
        </Button>

        {/* Mentions & Hashtags hints */}
        <div className="flex items-center gap-1 px-2 text-xs text-muted-foreground">
          <AtSign className="h-3 w-3" />
          <span className="hidden sm:inline">mention</span>
          <Hash className="h-3 w-3 ml-2" />
          <span className="hidden sm:inline">tag</span>
        </div>

        <div className="flex-1" />

        {/* AI Assistant */}
        <AIWritingMenu
          selectedText={selectedText}
          onReplace={handleAIReplace}
          onInsert={handleAIInsert}
        />

        {/* Undo/Redo */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo"
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo"
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>

      {/* Editor Content */}
      <EditorContent editor={editor} className="bg-background" />

      {/* Formula Dialog */}
      <FormulaDialog
        open={showFormulaDialog}
        onOpenChange={setShowFormulaDialog}
        onInsert={insertFormula}
      />
    </div>
  );
};

export default RichTextEditor;