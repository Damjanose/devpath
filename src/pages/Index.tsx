import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { motion } from "framer-motion";
import { Code2, Zap, Trophy, BookOpen, ChevronRight, Terminal } from "lucide-react";

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 scanline pointer-events-none" />
        <div className="container py-24 md:py-32 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center space-y-6"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-1.5 text-sm font-mono text-primary">
              <Terminal className="h-3 w-3" /> Level up your dev skills
            </div>

            <h1 className="text-5xl md:text-7xl font-bold leading-tight">
              Learn. Code.{" "}
              <span className="text-primary text-glow">Level Up.</span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              A gamified learning platform for developers. Earn XP, unlock badges, and track your progress as you master new technologies.
            </p>

            <div className="flex items-center justify-center gap-4">
              <Link to="/register">
                <Button variant="hero" size="lg" className="text-base">
                  Start Learning <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
              <Link to="/courses">
                <Button variant="neon" size="lg" className="text-base">
                  Browse Courses
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border">
        <div className="container py-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: BookOpen,
                title: "Structured Courses",
                description: "Curated learning paths with modules and lessons designed for real-world skills.",
              },
              {
                icon: Zap,
                title: "Earn XP & Level Up",
                description: "Complete lessons to earn experience points. Watch your level grow as you learn.",
              },
              {
                icon: Trophy,
                title: "Unlock Badges",
                description: "Collect bronze, silver, gold, and platinum badges as you hit milestones.",
              },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="rounded-lg border border-border bg-card p-6 space-y-3 hover:border-primary/30 hover:box-glow transition-all"
              >
                <feature.icon className="h-8 w-8 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border">
        <div className="container py-20 text-center space-y-6">
          <h2 className="text-3xl font-bold text-foreground">Ready to start your journey?</h2>
          <p className="text-muted-foreground">Join developers who are leveling up their skills every day.</p>
          <Link to="/register">
            <Button variant="hero" size="lg">Create Free Account</Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Code2 className="h-4 w-4 text-primary" />
            <span>DevPath Academy</span>
          </div>
          <span>© 2026</span>
        </div>
      </footer>
    </div>
  );
}
