import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { BadgeCard } from "@/components/BadgeCard";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2 } from "lucide-react";
import { useAdminBadgesQuery, adminBadgesQueryKey } from "@/hooks/queries/useAdminBadgesQuery";
import { useQueryClient } from "@tanstack/react-query";

export default function BadgeManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: badges = [] } = useAdminBadgesQuery();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", condition_type: "points_total", condition_value: 100, tier: "bronze" });

  async function handleSave() {
    if (!form.name.trim()) { toast({ title: "Name required", variant: "destructive" }); return; }
    const { error } = await supabase.from("badges").insert(form);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Badge created" });
    setOpen(false);
    setForm({ name: "", description: "", condition_type: "points_total", condition_value: 100, tier: "bronze" });
    queryClient.invalidateQueries({ queryKey: adminBadgesQueryKey });
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this badge?")) return;
    await supabase.from("badges").delete().eq("id", id);
    toast({ title: "Badge deleted" });
    queryClient.invalidateQueries({ queryKey: adminBadgesQueryKey });
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container py-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">Manage Badges</h1>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="hero"><Plus className="h-4 w-4 mr-1" />New Badge</Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border">
              <DialogHeader><DialogTitle>Create Badge</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="bg-secondary border-border" />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="bg-secondary border-border" />
                </div>
                <div className="space-y-2">
                  <Label>Condition Type</Label>
                  <Select value={form.condition_type} onValueChange={(v) => setForm({ ...form, condition_type: v })}>
                    <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="points_total">Total Points</SelectItem>
                      <SelectItem value="courses_completed">Courses Completed</SelectItem>
                      <SelectItem value="lessons_completed">Lessons Completed</SelectItem>
                      <SelectItem value="streak_days">Streak Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Condition Value</Label>
                  <Input type="number" value={form.condition_value} onChange={(e) => setForm({ ...form, condition_value: parseInt(e.target.value) || 0 })} className="bg-secondary border-border" />
                </div>
                <div className="space-y-2">
                  <Label>Tier</Label>
                  <Select value={form.tier} onValueChange={(v) => setForm({ ...form, tier: v })}>
                    <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bronze">Bronze</SelectItem>
                      <SelectItem value="silver">Silver</SelectItem>
                      <SelectItem value="gold">Gold</SelectItem>
                      <SelectItem value="platinum">Platinum</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="hero" className="w-full" onClick={handleSave}>Create Badge</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {badges.map((badge) => (
            <div key={badge.id} className="relative group">
              <BadgeCard name={badge.name} description={badge.description} tier={badge.tier} earned />
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleDelete(badge.id)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
          {badges.length === 0 && (
            <p className="col-span-full text-center text-muted-foreground py-8">No badges created yet</p>
          )}
        </div>
      </main>
    </div>
  );
}
