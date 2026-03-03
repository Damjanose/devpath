import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { fetchEnrollmentsByEmail } from "@/lib/api";
import { Navbar } from "@/components/Navbar";
import { XPBar } from "@/components/XPBar";
import { CourseCard } from "@/components/CourseCard";
import { BadgeCard } from "@/components/BadgeCard";
import { motion } from "framer-motion";
import { BookOpen, Trophy, Zap, Target } from "lucide-react";
import { Footer } from "@/components/Footer";
import type { Tables } from "@/integrations/supabase/types";

type DashboardEnrollment = {
  id: string;
  course_id: string;
  progress_percentage: number;
  course: {
    id: string;
    title: string;
    description?: string | null;
    difficulty: string;
    points_reward: number;
  } | null;
};

function normalizeEnrollment(raw: Record<string, unknown>): DashboardEnrollment | null {
  const course = (raw.course || raw.courses) as Record<string, unknown> | null;
  if (!course) return null;

  const id = String(raw.id || "");
  const courseId = String(raw.course_id || course.id || "");
  if (!id || !courseId) return null;

  return {
    id,
    course_id: courseId,
    progress_percentage: Number(raw.progress_percentage || 0),
    course: {
      id: String(course.id || courseId),
      title: String(course.title || "Untitled course"),
      description: (course.description as string | null | undefined) ?? null,
      difficulty: String(course.difficulty || "beginner"),
      points_reward: Number(course.points_reward || 0),
    },
  };
}

export default function Dashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Tables<"profiles"> | null>(null);
  const [enrollments, setEnrollments] = useState<DashboardEnrollment[]>([]);
  const [badges, setBadges] = useState<(Tables<"user_badges"> & { badges: Tables<"badges"> | null })[]>([]);
  const [stats, setStats] = useState({ lessonsCompleted: 0, coursesEnrolled: 0 });

  useEffect(() => {
    if (!user) return;
    loadDashboard();
  }, [user]);

  async function loadDashboard() {
    const cacheKey = `enrollments_${user!.email}`;
    const cachedEnrollments = (JSON.parse(localStorage.getItem(cacheKey) || "[]") as Record<string, unknown>[])
      .map(normalizeEnrollment)
      .filter((e): e is DashboardEnrollment => !!e);

    const [profileRes, apiEnrollments, badgeRes, progressRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("user_id", user!.id).maybeSingle(),
      fetchEnrollmentsByEmail(user!.email || ""),
      supabase.from("user_badges").select("*, badges(*)").eq("user_id", user!.id),
      supabase.from("lesson_progress").select("id").eq("user_id", user!.id),
    ]);

    const normalizedApiEnrollments = (apiEnrollments as Record<string, unknown>[])
      .map(normalizeEnrollment)
      .filter((e): e is DashboardEnrollment => !!e);

    const finalEnrollments = normalizedApiEnrollments.length > 0 ? normalizedApiEnrollments : cachedEnrollments;

    setProfile(profileRes.data);
    setEnrollments(finalEnrollments);
    setBadges((badgeRes.data as any) || []);
    setStats({
      lessonsCompleted: progressRes.data?.length || 0,
      coursesEnrolled: finalEnrollments.length,
    });
  }

  const level = profile?.level || 1;
  const totalPoints = profile?.total_points || 0;
  const xpForNextLevel = level * 500;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="container py-8 space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, <span className="text-primary">{profile?.display_name || "Developer"}</span>
          </h1>
          <p className="text-muted-foreground">Continue your learning journey</p>
        </motion.div>

        <XPBar current={totalPoints % xpForNextLevel} max={xpForNextLevel} level={level} />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { icon: Zap, label: "Total XP", value: totalPoints, color: "text-primary" },
            { icon: Trophy, label: "Level", value: level, color: "text-gold" },
            { icon: BookOpen, label: "Courses", value: stats.coursesEnrolled, color: "text-cyber-blue" },
            { icon: Target, label: "Lessons Done", value: stats.lessonsCompleted, color: "text-cyber-purple" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="rounded-lg border border-border bg-card p-4"
            >
              <stat.icon className={`h-5 w-5 mb-2 ${stat.color}`} />
              <p className="text-2xl font-bold font-mono text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">My Courses</h2>
          {enrollments.length === 0 ? (
            <p className="text-muted-foreground text-sm">No courses yet. <Link to="/courses" className="text-primary hover:underline">Browse courses</Link></p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {enrollments.map((e) => e.course && (
                <CourseCard
                  key={e.id}
                  id={e.course.id}
                  title={e.course.title}
                  description={e.course.description}
                  difficulty={e.course.difficulty}
                  pointsReward={e.course.points_reward}
                  progress={e.progress_percentage}
                />
              ))}
            </div>
          )}
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Badges</h2>
          {badges.length === 0 ? (
            <p className="text-muted-foreground text-sm">Complete lessons and courses to earn badges!</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
              {badges.map((ub) => ub.badges && (
                <BadgeCard key={ub.id} name={ub.badges.name} description={ub.badges.description} tier={ub.badges.tier} earned />
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
