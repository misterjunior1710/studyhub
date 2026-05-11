import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Plus, Target, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface Goal {
  id: string;
  title: string;
  target_amount: number;
  current_amount: number;
  deadline: string | null;
}

const SavingsGoalTracker = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [title, setTitle] = useState("");
  const [target, setTarget] = useState<number>(0);
  const [deadline, setDeadline] = useState("");

  const refresh = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("user_savings_goals" as any)
      .select("id, title, target_amount, current_amount, deadline")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setGoals((data ?? []) as any);
  };

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const create = async () => {
    if (!user) {
      toast.error("Sign in to create goals");
      return;
    }
    if (!title.trim() || target <= 0) {
      toast.error("Add a title and target amount");
      return;
    }
    const { error } = await supabase.from("user_savings_goals" as any).insert({
      user_id: user.id,
      title: title.trim(),
      target_amount: target,
      current_amount: 0,
      deadline: deadline || null,
    });
    if (error) {
      toast.error("Couldn't create goal");
      return;
    }
    toast.success("Goal added");
    setTitle("");
    setTarget(0);
    setDeadline("");
    void refresh();
  };

  const contribute = async (g: Goal, amount: number) => {
    if (amount <= 0) return;
    const next = Math.min(g.target_amount, Number(g.current_amount) + amount);
    const { error } = await supabase
      .from("user_savings_goals" as any)
      .update({ current_amount: next })
      .eq("id", g.id);
    if (error) {
      toast.error("Couldn't update goal");
      return;
    }
    if (next >= g.target_amount) toast.success(`🎉 Goal reached: ${g.title}`);
    void refresh();
  };

  const remove = async (id: string) => {
    await supabase.from("user_savings_goals" as any).delete().eq("id", id);
    toast.success("Goal deleted");
    void refresh();
  };

  return (
    <Card className="glass-card p-5 space-y-5">
      <div className="flex items-center gap-2">
        <Target className="h-5 w-5 text-primary" aria-hidden="true" />
        <h3 className="font-semibold">Savings Goals</h3>
      </div>

      <div className="space-y-2">
        <Label htmlFor="goal-title">New goal</Label>
        <Input
          id="goal-title"
          placeholder="e.g. Emergency fund"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="number"
            inputMode="decimal"
            min="0"
            placeholder="Target $"
            value={target || ""}
            onChange={(e) => setTarget(Number(e.target.value) || 0)}
            aria-label="Target amount"
          />
          <Input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            aria-label="Deadline"
          />
        </div>
        <Button onClick={create} className="w-full">
          <Plus className="h-4 w-4 mr-1" /> Add goal
        </Button>
      </div>

      <div className="space-y-3 pt-3 border-t border-border/40">
        {goals.length === 0 && <p className="text-sm text-muted-foreground">No goals yet. Add your first one above.</p>}
        {goals.map((g) => {
          const pct = g.target_amount > 0 ? Math.round((Number(g.current_amount) / Number(g.target_amount)) * 100) : 0;
          return (
            <div key={g.id} className="space-y-2 rounded-lg border border-border/40 p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-medium truncate">{g.title}</p>
                  <p className="text-xs text-muted-foreground">
                    ${Number(g.current_amount).toLocaleString()} / ${Number(g.target_amount).toLocaleString()}
                    {g.deadline && ` · by ${format(new Date(g.deadline), "MMM d, yyyy")}`}
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => remove(g.id)} aria-label={`Delete goal ${g.title}`} className="h-8 w-8">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <Progress value={pct} className="h-2" />
              <div className="flex gap-2">
                {[10, 25, 50, 100].map((amt) => (
                  <Button key={amt} variant="outline" size="sm" onClick={() => contribute(g, amt)}>
                    +${amt}
                  </Button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default SavingsGoalTracker;
