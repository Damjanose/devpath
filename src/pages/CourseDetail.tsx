import { useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { BookOpen, ChevronRight, Zap, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Footer } from "@/components/Footer";
import { useCourseQuery } from "@/hooks/queries/useCourseQuery";
import { useEnrollmentsQuery } from "@/hooks/queries/useEnrollmentsQuery";
import { useCourseProgressQuery } from "@/hooks/queries/useCourseProgressQuery";
import { useEnrollCourseMutation } from "@/hooks/mutations/useEnrollCourseMutation";

interface Lesson {
  id: string;
  title: string;
  sort_order: number;
  estimated_minutes: number;
}

interface Module {
  id: string;
  title: string;
  description?: string;
  lessons: Lesson[];
}

interface Course {
  id: string;
  title: string;
  description?: string;
  difficulty: string;
  points_reward: number;
  modules?: Module[];
}

interface Enrollment {
  id?: string;
  course_id: string;
  progress_percentage: number;
  [key: string]: unknown;
}

export default function CourseDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const { data: courseData, isLoading: loading } = useCourseQuery(id);
  const course = courseData as unknown as Course | null;
  const modules = useMemo(() => (course?.modules || []) as Module[], [course]);

  const { data: rawEnrollments } = useEnrollmentsQuery(user?.id ?? undefined);
  const enrollment = useMemo(() => {
    if (!rawEnrollments || !id) return null;
    return (rawEnrollments as Enrollment[]).find((e) => e.course_id === id) || null;
  }, [rawEnrollments, id]);

  const { data: progressData } = useCourseProgressQuery(
    user?.id ?? undefined,
    id
  );
  const completedLessons = useMemo(
    () => new Set(progressData?.completed_lesson_ids || []),
    [progressData]
  );

  const totalLessons = modules.reduce((acc, m) => acc + m.lessons.length, 0);
  const completedCount = modules.reduce(
    (acc, m) => acc + m.lessons.filter((lesson) => completedLessons.has(lesson.id)).length,
    0
  );
  const computedProgress = totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0;

  const enrollMutation = useEnrollCourseMutation();

  async function handleEnroll() {
    if (!user) { navigate("/login"); return; }
    try {
      await enrollMutation.mutateAsync({ userId: user.id!, courseId: id! });
      toast({ title: "Enrolled!", description: "You've been enrolled in this course." });
    } catch (err) {
      toast({ title: "Error", description: err instanceof Error ? err.message : "Failed to enroll", variant: "destructive" });
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
            <div className="text-sm text-primary font-mono">✓ Enrolled — {Math.round(computedProgress)}% complete</div>
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
                        <span className={completed ? "text-muted-foreground line-through decoration-2 decoration-primary/60" : "text-foreground"}>{lesson.title}</span>
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
