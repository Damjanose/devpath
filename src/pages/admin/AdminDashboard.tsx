import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { motion } from "framer-motion";
import { BookOpen, Award, Users, BarChart3 } from "lucide-react";
import { useAdminStatsQuery } from "@/hooks/queries/useAdminStatsQuery";

export default function AdminDashboard() {
  const { data: stats = { courses: 0, badges: 0, users: 0, enrollments: 0 } } = useAdminStatsQuery();

  const cards = [
    { label: "Courses", count: stats.courses, icon: BookOpen, link: "/admin/courses", color: "text-primary" },
    { label: "Badges", count: stats.badges, icon: Award, link: "/admin/badges", color: "text-gold" },
    { label: "Users", count: stats.users, icon: Users, link: "/admin", color: "text-cyber-blue" },
    { label: "Enrollments", count: stats.enrollments, icon: BarChart3, link: "/admin", color: "text-cyber-purple" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container py-8 space-y-8">
        <h1 className="text-3xl font-bold text-foreground">Admin Panel</h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {cards.map((card, i) => (
            <Link to={card.link} key={card.label}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="rounded-lg border border-border bg-card p-5 hover:border-primary/30 hover:box-glow transition-all"
              >
                <card.icon className={`h-6 w-6 mb-3 ${card.color}`} />
                <p className="text-3xl font-bold font-mono text-foreground">{card.count}</p>
                <p className="text-sm text-muted-foreground">{card.label}</p>
              </motion.div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
