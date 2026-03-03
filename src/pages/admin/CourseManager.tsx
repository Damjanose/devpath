import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2 } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

export default function CourseManager() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [courses, setCourses] = useState<Tables<"courses">[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Tables<"courses"> | null>(null);
  const [form, setForm] = useState({ title: "", description: "", difficulty: "beginner", points_reward: 100, is_published: false });

  useEffect(() => { loadCourses(); }, []);

  async function loadCourses() {
    const { data } = await supabase.from("courses").select("*").order("created_at", { ascending: false });
    setCourses(data || []);
  }

  function openCreate() {
    setEditing(null);
    setForm({ title: "", description: "", difficulty: "beginner", points_reward: 100, is_published: false });
    setOpen(true);
  }

  function openEdit(course: Tables<"courses">) {
    setEditing(course);
    setForm({ title: course.title, description: course.description || "", difficulty: course.difficulty, points_reward: course.points_reward, is_published: course.is_published });
    setOpen(true);
  }

  async function handleSave() {
    if (!form.title.trim()) { toast({ title: "Title required", variant: "destructive" }); return; }
    if (editing) {
      const { error } = await supabase.from("courses").update(form).eq("id", editing.id);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    } else {
      const { error } = await supabase.from("courses").insert({ ...form, created_by: user!.id });
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    }
    toast({ title: editing ? "Course updated" : "Course created" });
    setOpen(false);
    loadCourses();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this course?")) return;
    await supabase.from("courses").delete().eq("id", id);
    toast({ title: "Course deleted" });
    loadCourses();
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container py-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">Manage Courses</h1>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="hero" onClick={openCreate}><Plus className="h-4 w-4 mr-1" />New Course</Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border">
              <DialogHeader><DialogTitle>{editing ? "Edit Course" : "New Course"}</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="bg-secondary border-border" />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="bg-secondary border-border" />
                </div>
                <div className="space-y-2">
                  <Label>Difficulty</Label>
                  <Select value={form.difficulty} onValueChange={(v) => setForm({ ...form, difficulty: v })}>
                    <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Points Reward</Label>
                  <Input type="number" value={form.points_reward} onChange={(e) => setForm({ ...form, points_reward: parseInt(e.target.value) || 0 })} className="bg-secondary border-border" />
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={form.is_published} onCheckedChange={(v) => setForm({ ...form, is_published: v })} />
                  <Label>Published</Label>
                </div>
                <Button variant="hero" className="w-full" onClick={handleSave}>Save</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full">
            <thead className="bg-secondary text-sm">
              <tr>
                <th className="text-left p-3 text-muted-foreground font-medium">Title</th>
                <th className="text-left p-3 text-muted-foreground font-medium">Difficulty</th>
                <th className="text-left p-3 text-muted-foreground font-medium">XP</th>
                <th className="text-left p-3 text-muted-foreground font-medium">Status</th>
                <th className="text-right p-3 text-muted-foreground font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {courses.map((course) => (
                <tr key={course.id} className="hover:bg-secondary/50">
                  <td className="p-3 text-foreground font-medium">{course.title}</td>
                  <td className="p-3 capitalize text-muted-foreground">{course.difficulty}</td>
                  <td className="p-3 font-mono text-gold">{course.points_reward}</td>
                  <td className="p-3">
                    <span className={`text-xs font-mono ${course.is_published ? "text-primary" : "text-muted-foreground"}`}>
                      {course.is_published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="p-3 text-right space-x-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(course)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(course.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </td>
                </tr>
              ))}
              {courses.length === 0 && (
                <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No courses yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
