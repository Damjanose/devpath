import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronRight,
  ArrowLeft,
  GripVertical,
  BookOpen,
  FileText,
  Video,
  HelpCircle,
  Zap,
  Clock,
  Save,
} from "lucide-react";
import { useCourseEditorQuery, courseEditorQueryKey, type ModuleWithLessons } from "@/hooks/queries/useCourseEditorQuery";
import { useQueryClient } from "@tanstack/react-query";
import type { Tables } from "@/integrations/supabase/types";

/* ---------- types ---------- */

const contentTypeIcons: Record<string, React.ReactNode> = {
  text: <FileText className="h-4 w-4" />,
  video: <Video className="h-4 w-4" />,
  quiz: <HelpCircle className="h-4 w-4" />,
};

/* ================================================================== */
/*  CourseEditor Page                                                  */
/* ================================================================== */
export default function CourseEditor() {
  const { id: courseId } = useParams<{ id: string }>();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading: loading } = useCourseEditorQuery(courseId);
  const course = data?.course ?? null;
  const modules = data?.modules ?? [];

  // module + lesson expanded state
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

  // module dialog
  const [moduleDialogOpen, setModuleDialogOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<Tables<"modules"> | null>(null);
  const [moduleForm, setModuleForm] = useState({ title: "", description: "" });

  // lesson dialog
  const [lessonDialogOpen, setLessonDialogOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Tables<"lessons"> | null>(null);
  const [lessonParentModule, setLessonParentModule] = useState<string>("");
  const [lessonForm, setLessonForm] = useState({
    title: "",
    content: "",
    content_type: "text",
    points_reward: 10,
    estimated_minutes: 8,
  });

  function invalidate() {
    if (courseId) {
      queryClient.invalidateQueries({ queryKey: courseEditorQueryKey(courseId) });
    }
  }

  /* ---------- expand / collapse ---------- */
  function toggleModule(moduleId: string) {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      next.has(moduleId) ? next.delete(moduleId) : next.add(moduleId);
      return next;
    });
  }

  /* ============================================================== */
  /*  MODULE CRUD                                                    */
  /* ============================================================== */
  function openCreateModule() {
    setEditingModule(null);
    setModuleForm({ title: "", description: "" });
    setModuleDialogOpen(true);
  }

  function openEditModule(mod: Tables<"modules">) {
    setEditingModule(mod);
    setModuleForm({ title: mod.title, description: mod.description || "" });
    setModuleDialogOpen(true);
  }

  async function saveModule() {
    if (!moduleForm.title.trim()) {
      toast({ title: "Title required", variant: "destructive" });
      return;
    }

    if (editingModule) {
      const { error } = await supabase
        .from("modules")
        .update({ title: moduleForm.title, description: moduleForm.description || null })
        .eq("id", editingModule.id);
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
        return;
      }
      toast({ title: "Module updated" });
    } else {
      const nextOrder = modules.length;
      const { error } = await supabase.from("modules").insert({
        course_id: courseId!,
        title: moduleForm.title,
        description: moduleForm.description || null,
        sort_order: nextOrder,
      });
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
        return;
      }
      toast({ title: "Module created" });
    }
    setModuleDialogOpen(false);
    invalidate();
  }

  async function deleteModule(moduleId: string) {
    if (!confirm("Delete this module and all its lessons?")) return;
    // Delete lessons first
    await supabase.from("lessons").delete().eq("module_id", moduleId);
    await supabase.from("modules").delete().eq("id", moduleId);
    toast({ title: "Module deleted" });
    invalidate();
  }

  async function moveModule(moduleId: string, direction: "up" | "down") {
    const idx = modules.findIndex((m) => m.id === moduleId);
    if ((direction === "up" && idx === 0) || (direction === "down" && idx === modules.length - 1)) return;

    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    const updates = [
      supabase.from("modules").update({ sort_order: swapIdx }).eq("id", modules[idx].id),
      supabase.from("modules").update({ sort_order: idx }).eq("id", modules[swapIdx].id),
    ];
    await Promise.all(updates);
    invalidate();
  }

  /* ============================================================== */
  /*  LESSON CRUD                                                    */
  /* ============================================================== */
  function openCreateLesson(moduleId: string) {
    setEditingLesson(null);
    setLessonParentModule(moduleId);
    setLessonForm({
      title: "",
      content: "",
      content_type: "text",
      points_reward: 10,
      estimated_minutes: 8,
    });
    setLessonDialogOpen(true);
  }

  function openEditLesson(lesson: Tables<"lessons">) {
    setEditingLesson(lesson);
    setLessonParentModule(lesson.module_id);
    setLessonForm({
      title: lesson.title,
      content: lesson.content || "",
      content_type: lesson.content_type,
      points_reward: lesson.points_reward,
      estimated_minutes: lesson.estimated_minutes || 8,
    });
    setLessonDialogOpen(true);
  }

  async function saveLesson() {
    if (!lessonForm.title.trim()) {
      toast({ title: "Title required", variant: "destructive" });
      return;
    }

    if (editingLesson) {
      const { error } = await supabase
        .from("lessons")
        .update({
          title: lessonForm.title,
          content: lessonForm.content || null,
          content_type: lessonForm.content_type,
          points_reward: lessonForm.points_reward,
          estimated_minutes: lessonForm.estimated_minutes,
        })
        .eq("id", editingLesson.id);
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
        return;
      }
      toast({ title: "Lesson updated" });
    } else {
      const parentMod = modules.find((m) => m.id === lessonParentModule);
      const nextOrder = parentMod ? parentMod.lessons.length : 0;
      const { error } = await supabase.from("lessons").insert({
        module_id: lessonParentModule,
        title: lessonForm.title,
        content: lessonForm.content || null,
        content_type: lessonForm.content_type,
        points_reward: lessonForm.points_reward,
        estimated_minutes: lessonForm.estimated_minutes,
        sort_order: nextOrder,
      });
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
        return;
      }
      toast({ title: "Lesson created" });
    }
    setLessonDialogOpen(false);
    invalidate();
  }

  async function deleteLesson(lessonId: string) {
    if (!confirm("Delete this lesson?")) return;
    // Remove any progress records first
    await supabase.from("lesson_progress").delete().eq("lesson_id", lessonId);
    await supabase.from("lessons").delete().eq("id", lessonId);
    toast({ title: "Lesson deleted" });
    invalidate();
  }

  async function moveLesson(lesson: Tables<"lessons">, direction: "up" | "down") {
    const parentMod = modules.find((m) => m.id === lesson.module_id);
    if (!parentMod) return;

    const lessons = parentMod.lessons;
    const idx = lessons.findIndex((l) => l.id === lesson.id);
    if ((direction === "up" && idx === 0) || (direction === "down" && idx === lessons.length - 1)) return;

    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    await Promise.all([
      supabase.from("lessons").update({ sort_order: swapIdx }).eq("id", lessons[idx].id),
      supabase.from("lessons").update({ sort_order: idx }).eq("id", lessons[swapIdx].id),
    ]);
    invalidate();
  }

  /* ---------- derived stats ---------- */
  const totalLessons = modules.reduce((acc, m) => acc + m.lessons.length, 0);
  const totalXP =
    modules.reduce((acc, m) => acc + m.lessons.reduce((a, l) => a + l.points_reward, 0), 0) +
    (course?.points_reward || 0);

  /* ---------- loading / not found ---------- */
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-16 text-center text-muted-foreground font-mono animate-pulse-neon">
          Loading...
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-16 text-center text-muted-foreground">Course not found</div>
      </div>
    );
  }

  /* ================================================================== */
  /*  RENDER                                                             */
  /* ================================================================== */
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container py-8 max-w-5xl space-y-6">
        {/* ---- Header ---- */}
        <div className="flex items-center gap-3">
          <Link to="/admin/courses">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">{course.title}</h1>
            <p className="text-sm text-muted-foreground">
              {modules.length} modules · {totalLessons} lessons · {totalXP} total XP
            </p>
          </div>
          <span
            className={`text-xs font-mono px-2 py-1 rounded ${
              course.is_published
                ? "bg-primary/20 text-primary"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {course.is_published ? "Published" : "Draft"}
          </span>
        </div>

        {/* ---- Add Module ---- */}
        <div className="flex justify-end">
          <Button variant="hero" size="sm" onClick={openCreateModule}>
            <Plus className="h-4 w-4 mr-1" /> Add Module
          </Button>
        </div>

        {/* ---- Modules List ---- */}
        {modules.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-12 text-center text-muted-foreground">
            <BookOpen className="h-8 w-8 mx-auto mb-3 opacity-50" />
            <p>No modules yet. Add your first module to get started.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {modules.map((mod, mi) => {
              const isExpanded = expandedModules.has(mod.id);
              return (
                <motion.div
                  key={mod.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: mi * 0.03 }}
                  className="rounded-lg border border-border bg-card overflow-hidden"
                >
                  {/* Module header */}
                  <div
                    className="flex items-center gap-2 p-4 cursor-pointer hover:bg-secondary/50 transition-colors"
                    onClick={() => toggleModule(mod.id)}
                  >
                    <GripVertical className="h-4 w-4 text-muted-foreground/50 shrink-0" />
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-mono text-muted-foreground mr-2">
                        M{mi + 1}
                      </span>
                      <span className="font-semibold text-foreground">{mod.title}</span>
                      {mod.description && (
                        <span className="ml-2 text-sm text-muted-foreground hidden md:inline">
                          — {mod.description}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground font-mono shrink-0">
                      {mod.lessons.length} lessons
                    </span>
                    <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => moveModule(mod.id, "up")} disabled={mi === 0} title="Move up">
                        <span className="text-xs">↑</span>
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => moveModule(mod.id, "down")} disabled={mi === modules.length - 1} title="Move down">
                        <span className="text-xs">↓</span>
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditModule(mod)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteModule(mod.id)}>
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    </div>
                  </div>

                  {/* Lessons */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-border divide-y divide-border">
                          {mod.lessons.map((lesson, li) => (
                            <div
                              key={lesson.id}
                              className="flex items-center gap-3 px-4 py-2.5 pl-12 hover:bg-secondary/30 transition-colors group"
                            >
                              <span className="text-xs font-mono text-muted-foreground w-8 shrink-0">
                                {mi + 1}.{li + 1}
                              </span>
                              <span className="text-muted-foreground shrink-0">
                                {contentTypeIcons[lesson.content_type] || contentTypeIcons.text}
                              </span>
                              <span className="flex-1 text-sm text-foreground truncate">
                                {lesson.title}
                              </span>
                              <span className="flex items-center gap-1 text-xs text-muted-foreground font-mono shrink-0">
                                <Clock className="h-3 w-3" /> {lesson.estimated_minutes || "—"}m
                              </span>
                              <span className="flex items-center gap-1 text-xs text-gold font-mono shrink-0">
                                <Zap className="h-3 w-3" /> {lesson.points_reward}
                              </span>
                              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => moveLesson(lesson, "up")} disabled={li === 0}>
                                  <span className="text-xs">↑</span>
                                </Button>
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => moveLesson(lesson, "down")} disabled={li === mod.lessons.length - 1}>
                                  <span className="text-xs">↓</span>
                                </Button>
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditLesson(lesson)}>
                                  <Pencil className="h-3.5 w-3.5" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteLesson(lesson.id)}>
                                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                                </Button>
                              </div>
                            </div>
                          ))}

                          {mod.lessons.length === 0 && (
                            <div className="px-12 py-6 text-center text-sm text-muted-foreground">
                              No lessons in this module yet
                            </div>
                          )}

                          {/* Add Lesson button */}
                          <div className="px-12 py-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs text-muted-foreground hover:text-primary"
                              onClick={() => openCreateLesson(mod.id)}
                            >
                              <Plus className="h-3 w-3 mr-1" /> Add Lesson
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* ================================================================ */}
        {/*  MODULE DIALOG                                                    */}
        {/* ================================================================ */}
        <Dialog open={moduleDialogOpen} onOpenChange={setModuleDialogOpen}>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle>{editingModule ? "Edit Module" : "New Module"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={moduleForm.title}
                  onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
                  placeholder="e.g. Getting Started"
                  className="bg-secondary border-border"
                />
              </div>
              <div className="space-y-2">
                <Label>Description (optional)</Label>
                <Textarea
                  value={moduleForm.description}
                  onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
                  placeholder="Brief summary of this module"
                  className="bg-secondary border-border"
                  rows={2}
                />
              </div>
              <Button variant="hero" className="w-full" onClick={saveModule}>
                <Save className="h-4 w-4 mr-1" /> {editingModule ? "Update Module" : "Create Module"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* ================================================================ */}
        {/*  LESSON DIALOG                                                    */}
        {/* ================================================================ */}
        <Dialog open={lessonDialogOpen} onOpenChange={setLessonDialogOpen}>
          <DialogContent className="bg-card border-border max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingLesson ? "Edit Lesson" : "New Lesson"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={lessonForm.title}
                  onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                  placeholder="e.g. Installing Node.js"
                  className="bg-secondary border-border"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label>Content Type</Label>
                  <Select
                    value={lessonForm.content_type}
                    onValueChange={(v) => setLessonForm({ ...lessonForm, content_type: v })}
                  >
                    <SelectTrigger className="bg-secondary border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="quiz">Quiz</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>XP Reward</Label>
                  <Input
                    type="number"
                    value={lessonForm.points_reward}
                    onChange={(e) =>
                      setLessonForm({ ...lessonForm, points_reward: parseInt(e.target.value) || 0 })
                    }
                    className="bg-secondary border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Est. Minutes</Label>
                  <Input
                    type="number"
                    value={lessonForm.estimated_minutes}
                    onChange={(e) =>
                      setLessonForm({
                        ...lessonForm,
                        estimated_minutes: parseInt(e.target.value) || 1,
                      })
                    }
                    className="bg-secondary border-border"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Content (Markdown)</Label>
                <Textarea
                  value={lessonForm.content}
                  onChange={(e) => setLessonForm({ ...lessonForm, content: e.target.value })}
                  placeholder={"# Lesson Title\n\nWrite your lesson content in Markdown...\n\n```js\nconsole.log('Hello');\n```"}
                  className="bg-secondary border-border font-mono text-sm"
                  rows={14}
                />
                <p className="text-xs text-muted-foreground">
                  Supports Markdown: headings (#), bold (**), code blocks (```), tables, lists, etc.
                </p>
              </div>

              <Button variant="hero" className="w-full" onClick={saveLesson}>
                <Save className="h-4 w-4 mr-1" /> {editingLesson ? "Update Lesson" : "Create Lesson"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
