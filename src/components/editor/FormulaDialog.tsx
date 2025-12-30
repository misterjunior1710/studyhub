import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface FormulaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInsert: (latex: string, isBlock: boolean) => void;
  initialValue?: string;
}

const FORMULA_EXAMPLES = [
  { label: 'Fraction', formula: '\\frac{a}{b}' },
  { label: 'Square Root', formula: '\\sqrt{x}' },
  { label: 'Exponent', formula: 'x^{2}' },
  { label: 'Subscript', formula: 'x_{i}' },
  { label: 'Sum', formula: '\\sum_{i=1}^{n} x_i' },
  { label: 'Integral', formula: '\\int_{a}^{b} f(x) dx' },
  { label: 'Greek Letter', formula: '\\alpha, \\beta, \\gamma' },
  { label: 'Infinity', formula: '\\infty' },
];

const FormulaDialog = ({ open, onOpenChange, onInsert, initialValue = '' }: FormulaDialogProps) => {
  const [latex, setLatex] = useState(initialValue);
  const [isBlock, setIsBlock] = useState(false);
  const [preview, setPreview] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!latex.trim()) {
      setPreview('');
      setError('');
      return;
    }

    try {
      const rendered = katex.renderToString(latex, {
        throwOnError: true,
        displayMode: isBlock,
      });
      setPreview(rendered);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid LaTeX');
      setPreview('');
    }
  }, [latex, isBlock]);

  const handleInsert = () => {
    if (latex.trim() && !error) {
      onInsert(latex, isBlock);
      setLatex('');
      onOpenChange(false);
    }
  };

  const insertExample = (formula: string) => {
    setLatex((prev) => prev + formula);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-lg">∑</span>
            Insert Formula
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>LaTeX Expression</Label>
            <Textarea
              value={latex}
              onChange={(e) => setLatex(e.target.value)}
              placeholder="Enter LaTeX, e.g., \frac{a}{b}"
              className="font-mono text-sm min-h-[80px]"
            />
          </div>

          <div className="flex flex-wrap gap-1">
            {FORMULA_EXAMPLES.map((ex) => (
              <Button
                key={ex.label}
                type="button"
                variant="outline"
                size="sm"
                className="text-xs h-7"
                onClick={() => insertExample(ex.formula)}
              >
                {ex.label}
              </Button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isBlock"
              checked={isBlock}
              onChange={(e) => setIsBlock(e.target.checked)}
              className="rounded border-border"
            />
            <Label htmlFor="isBlock" className="text-sm cursor-pointer">
              Display as block (centered, larger)
            </Label>
          </div>

          <div className="space-y-2">
            <Label>Preview</Label>
            <div className="min-h-[60px] p-4 bg-muted/50 rounded-md flex items-center justify-center border border-border">
              {error ? (
                <p className="text-destructive text-sm">{error}</p>
              ) : preview ? (
                <div
                  className="text-foreground"
                  dangerouslySetInnerHTML={{ __html: preview }}
                />
              ) : (
                <p className="text-muted-foreground text-sm">Formula preview will appear here</p>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleInsert} disabled={!latex.trim() || !!error}>
            Insert Formula
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FormulaDialog;
