import { NodeViewWrapper, NodeViewContent, NodeViewProps } from '@tiptap/react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'c', label: 'C' },
  { value: 'csharp', label: 'C#' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'php', label: 'PHP' },
  { value: 'swift', label: 'Swift' },
  { value: 'kotlin', label: 'Kotlin' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'scss', label: 'SCSS' },
  { value: 'sql', label: 'SQL' },
  { value: 'bash', label: 'Bash' },
  { value: 'json', label: 'JSON' },
  { value: 'yaml', label: 'YAML' },
  { value: 'markdown', label: 'Markdown' },
  { value: 'latex', label: 'LaTeX' },
  { value: 'r', label: 'R' },
  { value: 'matlab', label: 'MATLAB' },
];

const CodeBlockComponent = ({ node, updateAttributes, extension }: NodeViewProps) => {
  return (
    <NodeViewWrapper className="code-block-wrapper relative my-4">
      <div className="absolute right-2 top-2 z-10">
        <Select
          value={node.attrs.language || 'javascript'}
          onValueChange={(value) => updateAttributes({ language: value })}
        >
          <SelectTrigger className="h-7 w-[120px] text-xs bg-background/80 backdrop-blur-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LANGUAGES.map((lang) => (
              <SelectItem key={lang.value} value={lang.value} className="text-xs">
                {lang.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <pre className="bg-card border border-border rounded-lg p-4 pt-10 overflow-x-auto">
        <code className="font-mono text-sm">
          <NodeViewContent />
        </code>
      </pre>
    </NodeViewWrapper>
  );
};

export default CodeBlockComponent;
