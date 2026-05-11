import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Wallet } from "lucide-react";
import { toast } from "sonner";

interface Category {
  id: string;
  name: string;
  amount: number;
}

interface Budget {
  id?: string;
  income: number;
  categories: Category[];
}

const DEFAULT: Budget = {
  income: 0,
  categories: [
    { id: crypto.randomUUID(), name: "Rent / Housing", amount: 0 },
    { id: crypto.randomUUID(), name: "Groceries", amount: 0 },
    { id: crypto.randomUUID(), name: "Transport", amount: 0 },
    { id: crypto.randomUUID(), name: "Subscriptions", amount: 0 },
    { id: crypto.randomUUID(), name: "Fun money", amount: 0 },
  ],
};

const fmt = (n: number) => `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

const BudgetCalculator = () => {
  const { user } = useAuth();
  const [budget, setBudget] = useState<Budget>(DEFAULT);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("user_budgets" as any)
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (data) {
        setBudget({
          id: (data as any).id,
          income: Number((data as any).income) || 0,
          categories: (data as any).categories ?? DEFAULT.categories,
        });
      }
    })();
  }, [user]);

  const totalSpent = budget.categories.reduce((s, c) => s + (Number(c.amount) || 0), 0);
  const remaining = (Number(budget.income) || 0) - totalSpent;
  const savingsPct = budget.income > 0 ? Math.max(0, Math.round((remaining / budget.income) * 100)) : 0;

  const updateCategory = (id: string, patch: Partial<Category>) =>
    setBudget((b) => ({ ...b, categories: b.categories.map((c) => (c.id === id ? { ...c, ...patch } : c)) }));

  const addCategory = () =>
    setBudget((b) => ({ ...b, categories: [...b.categories, { id: crypto.randomUUID(), name: "New category", amount: 0 }] }));

  const removeCategory = (id: string) =>
    setBudget((b) => ({ ...b, categories: b.categories.filter((c) => c.id !== id) }));

  const save = async () => {
    if (!user) {
      toast.error("Sign in to save your budget");
      return;
    }
    setSaving(true);
    const payload = {
      user_id: user.id,
      name: "My Budget",
      period: "monthly",
      income: budget.income,
      categories: budget.categories,
    };
    const { error, data } = budget.id
      ? await supabase.from("user_budgets" as any).update(payload).eq("id", budget.id).select().maybeSingle()
      : await supabase.from("user_budgets" as any).insert(payload).select().maybeSingle();
    setSaving(false);
    if (error) {
      toast.error("Couldn't save budget");
    } else {
      if (data && !budget.id) setBudget((b) => ({ ...b, id: (data as any).id }));
      toast.success("Budget saved");
    }
  };

  return (
    <Card className="glass-card p-5 space-y-5">
      <div className="flex items-center gap-2">
        <Wallet className="h-5 w-5 text-primary" aria-hidden="true" />
        <h3 className="font-semibold">Budget Calculator</h3>
      </div>

      <div className="space-y-2">
        <Label htmlFor="income">Monthly income (after tax)</Label>
        <Input
          id="income"
          type="number"
          inputMode="decimal"
          min="0"
          value={budget.income || ""}
          onChange={(e) => setBudget((b) => ({ ...b, income: Number(e.target.value) || 0 }))}
          placeholder="e.g. 1500"
        />
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">Expenses</p>
        {budget.categories.map((c) => (
          <div key={c.id} className="flex items-center gap-2">
            <Input
              value={c.name}
              onChange={(e) => updateCategory(c.id, { name: e.target.value })}
              className="flex-1"
              aria-label="Category name"
            />
            <Input
              type="number"
              inputMode="decimal"
              min="0"
              value={c.amount || ""}
              onChange={(e) => updateCategory(c.id, { amount: Number(e.target.value) || 0 })}
              placeholder="0"
              className="w-28"
              aria-label={`${c.name} amount`}
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeCategory(c.id)}
              aria-label={`Remove ${c.name}`}
              className="h-9 w-9"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={addCategory} className="mt-2">
          <Plus className="h-4 w-4 mr-1" /> Add category
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-3 pt-3 border-t border-border/40">
        <div>
          <p className="text-xs text-muted-foreground">Spent</p>
          <p className="text-lg font-semibold">{fmt(totalSpent)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Remaining</p>
          <p className={`text-lg font-semibold ${remaining < 0 ? "text-destructive" : ""}`}>{fmt(remaining)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Savings rate</p>
          <p className="text-lg font-semibold">{savingsPct}%</p>
        </div>
      </div>

      <Button onClick={save} disabled={saving} className="w-full">
        {saving ? "Saving…" : "Save budget"}
      </Button>
    </Card>
  );
};

export default BudgetCalculator;
