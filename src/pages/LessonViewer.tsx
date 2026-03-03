import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { CheckCircle2, ArrowLeft, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";

export default function LessonViewer() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<Tables<"lessons"> | null>(null);
  const [completed, setCompleted] = useState(false);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    if (id && user) loadLesson();
  }, [id, user]);

  async function loadLesson() {
    const [lessonRes, progressRes] = await Promise.all([
      supabase.from("lessons").select("*").eq("id", id!).maybeSingle(),
      supabase.from("lesson_progress").select("id").eq("user_id", user!.id).eq("lesson_id", id!).maybeSingle(),
    ]);
    setLesson(lessonRes.data);
    setCompleted(!!progressRes.data);
  }

  async function handleComplete() {
    if (!user || !lesson || completed) return;
    setCompleting(true);
    try {
      // Insert lesson progress
      await supabase.from("lesson_progress").insert({
        user_id: user.id,
        lesson_id: lesson.id,
        points_earned: lesson.points_reward,
      });

      // Update user points
      const { data: profile } = await supabase.from("profiles").select("total_points, level").eq("user_id", user.id).maybeSingle();
      if (profile) {
        const newPoints = profile.total_points + lesson.points_reward;
        const newLevel = Math.floor(newPoints / 500) + 1;
        await supabase.from("profiles").update({ total_points: newPoints, level: newLevel }).eq("user_id", user.id);
      }

      // Recalculate course progress
      const { data: mod } = await supabase.from("modules").select("course_id").eq("id", lesson.module_id).maybeSingle();
      if (mod) {
        const { data: allLessons } = await supabase.from("lessons").select("id").eq("module_id", lesson.module_id);
        const courseModules = await supabase.from("modules").select("id").eq("course_id", mod.course_id);
        const allModuleIds = courseModules.data?.map(m => m.id) || [];
        
        const { data: courseLessons } = await supabase.from("lessons").select("id").in("module_id", allModuleIds);
        const { data: completedLessons } = await supabase.from("lesson_progress").select("lesson_id").eq("user_id", user.id);
        
        const totalLessons = courseLessons?.length || 1;
        const completedInCourse = completedLessons?.filter(cl => courseLessons?.some(l => l.id === cl.lesson_id)).length || 0;
        const progress = (completedInCourse / totalLessons) * 100;

        await supabase.from("enrollments").update({ 
          progress_percentage: progress,
          completed_at: progress >= 100 ? new Date().toISOString() : null 
        }).eq("user_id", user.id).eq("course_id", mod.course_id);
      }

      setCompleted(true);
      toast({ title: `+${lesson.points_reward} XP!`, description: "Lesson completed!" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setCompleting(false);
    }
  }

  if (!lesson) return <div className="min-h-screen bg-background"><Navbar /><div className="container py-16 text-center text-muted-foreground font-mono animate-pulse-neon">Loading...</div></div>;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container py-8 max-w-3xl space-y-6">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-foreground">{lesson.title}</h1>
            <span className="flex items-center gap-1 text-sm font-mono text-gold"><Zap className="h-4 w-4" />{lesson.points_reward} XP</span>
          </div>

          <div className="rounded-lg border border-border bg-card p-6">
            <div className="prose prose-invert max-w-none">
              {lesson.content ? (
                <div className="whitespace-pre-wrap text-foreground font-mono text-sm leading-relaxed">{lesson.content}</div>
              ) : (
                <p className="text-muted-foreground">No content available yet.</p>
              )}
            </div>
          </div>

          <div className="flex justify-end">
            {completed ? (
              <div className="flex items-center gap-2 text-primary font-mono">
                <CheckCircle2 className="h-5 w-5" /> Completed
              </div>
            ) : (
              <Button variant="hero" onClick={handleComplete} disabled={completing}>
                {completing ? "Completing..." : "Mark as Complete"}
              </Button>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
