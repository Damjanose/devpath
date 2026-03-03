import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { BookOpen, ChevronRight, Zap, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Footer } from "@/components/Footer";
import type { Tables } from "@/integrations/supabase/types";

type ModuleWithLessons = Tables<"modules"> & { lessons: Tables<"lessons">[] };

export default function CourseDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Tables<"courses"> | null>(null);
  const [modules, setModules] = useState<ModuleWithLessons[]>([]);
  const [enrollment, setEnrollment] = useState<Tables<"enrollments"> | null>(null);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) loadCourse();
  }, [id, user]);

  async function loadCourse() {
    const [courseRes, modulesRes] = await Promise.all([
      supabase.from("courses").select("*").eq("id", id!).maybeSingle(),
      supabase.from("modules").select("*, lessons(*)").eq("course_id", id!).order("sort_order"),
    ]);
    setCourse(courseRes.data);
    setModules((modulesRes.data as any) || []);

    if (user) {
      const [enrollRes, progressRes] = await Promise.all([
        supabase.from("enrollments").select("*").eq("user_id", user.id).eq("course_id", id!).maybeSingle(),
        supabase.from("lesson_progress").select("lesson_id").eq("user_id", user.id),
      ]);
      setEnrollment(enrollRes.data);
      setCompletedLessons(new Set(progressRes.data?.map((p) => p.lesson_id) || []));
    }
    setLoading(false);
  }

  async function handleEnroll() {
    if (!user) { navigate("/login"); return; }
    const { error } = await supabase.from("enrollments").insert({ user_id: user.id, course_id: id! });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Enrolled!", description: "You've been enrolled in this course." });
      loadCourse();
    }
  }

  if (loading) return <div className="min-h-screen bg-background"><Navbar /><div className="container py-16 text-center text-muted-foreground font-mono animate-pulse-neon">Loading...</div></div>;
  if (!course) return <div className="min-h-screen bg-background"><Navbar /><div className="container py-16 text-center text-muted-foreground">Course not found</div></div>;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="container py-8 max-w-4xl space-y-8 flex-1">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <Badge variant="outline" className="capitalize">{course.difficulty}</Badge>
          <h1 className="text-4xl font-bold text-foreground">{course.title}</h1>
          {course.description && <p className="text-lg text-muted-foreground">{course.description}</p>}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1 text-gold font-mono"><Zap className="h-4 w-4" />{course.points_reward} XP</span>
            <span className="flex items-center gap-1"><BookOpen className="h-4 w-4" />{modules.reduce((acc, m) => acc + m.lessons.length, 0)} lessons</span>
          </div>

          {!enrollment ? (
            <Button variant="hero" size="lg" onClick={handleEnroll}>Enroll Now</Button>
          ) : (
            <div className="text-sm text-primary font-mono">✓ Enrolled — {Math.round(enrollment.progress_percentage)}% complete</div>
          )}
        </motion.div>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Curriculum</h2>
          {modules.map((mod, mi) => (
            <motion.div key={mod.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: mi * 0.05 }} className="rounded-lg border border-border bg-card overflow-hidden">
              <div className="p-4 border-b border-border">
                <h3 className="font-semibold text-foreground">{mod.title}</h3>
                {mod.description && <p className="text-sm text-muted-foreground">{mod.description}</p>}
              </div>
              <div className="divide-y divide-border">
                {mod.lessons.sort((a, b) => a.sort_order - b.sort_order).map((lesson) => {
                  const completed = completedLessons.has(lesson.id);
                  return (
                    <Link
                      key={lesson.id}
                      to={enrollment ? `/lessons/${lesson.id}` : "#"}
                      className={`flex items-center justify-between p-3 px-4 text-sm transition-colors ${
                        enrollment ? "hover:bg-secondary cursor-pointer" : "opacity-50 cursor-not-allowed"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {completed ? (
                          <CheckCircle2 className="h-4 w-4 text-primary" />
                        ) : (
                          <div className="h-4 w-4 rounded-full border border-muted-foreground" />
                        )}
                        <span className={completed ? "text-muted-foreground line-through" : "text-foreground"}>{lesson.title}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <span className="text-xs font-mono">{lesson.estimated_minutes}m</span>
                        <ChevronRight className="h-4 w-4" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </section>
      </main>
      <Footer />
    </div>
  );
}
