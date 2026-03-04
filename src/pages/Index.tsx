import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import {
  BookOpen, Award, Zap, Users, Code, BarChart3,
  ChevronRight, Terminal,
} from "lucide-react";
import { usePlatformStatsQuery } from "@/hooks/queries/usePlatformStatsQuery";

function CodeLine({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <div className="flex">
      <span className="w-6 text-right mr-4 text-[#484f58] select-none">{n}</span>
      <span className="font-bold">{children}</span>
    </div>
  );
}

const features = [
  {
    icon: BookOpen,
    title: "Structured Courses",
    description:
      "Expert-crafted courses with modules and bite-sized lessons covering React, TypeScript, Node.js, and more.",
  },
  {
    icon: Award,
    title: "Earn Badges",
    description:
      "Unlock achievement badges as you complete courses, hit milestones, and demonstrate mastery of new skills.",
  },
  {
    icon: Zap,
    title: "XP & Leveling",
    description:
      "Earn experience points for every lesson completed. Watch your developer rank climb from Junior to Senior.",
  },
  {
    icon: Users,
    title: "Community Leaderboard",
    description:
      "Compete with fellow developers on the global leaderboard. See how your progress stacks up.",
  },
  {
    icon: Code,
    title: "Hands-On Practice",
    description:
      "Learn by doing with real-world code examples, projects, and exercises built into every lesson.",
  },
  {
    icon: BarChart3,
    title: "Track Progress",
    description:
      "Visual progress bars, completion stats, and a personalized dashboard to keep you motivated and on track.",
  },
];

const steps = [
  {
    num: "01",
    title: "Create Your Account",
    description:
      "Sign up in seconds and set up your developer profile with your learning goals.",
  },
  {
    num: "02",
    title: "Browse & Enroll",
    description:
      "Explore courses by topic, difficulty, or popularity. Enroll in the ones that match your path.",
  },
  {
    num: "03",
    title: "Complete Lessons",
    description:
      "Work through bite-sized lessons at your own pace. Earn XP for each one you finish.",
  },
  {
    num: "04",
    title: "Unlock Achievements",
    description:
      "Hit milestones to earn badges and climb the leaderboard. Show off your expertise.",
  },
];

const defaultStats = [
  { value: "0+", label: "Active Learners" },
  { value: "0+", label: "Courses Available" },
  { value: "0+", label: "Badges Earned" },
  { value: "0+", label: "Lessons Completed" },
];

export default function Index() {
  const { user } = useAuth();
  const primaryCtaPath = user ? "/dashboard" : "/register";
  const { data: stats = defaultStats } = usePlatformStatsQuery(!!user);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 scanline pointer-events-none" />
        <div className="container py-24 md:py-36 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left — Copy */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-1.5 text-sm font-mono text-primary">
                <Terminal className="h-3 w-3" /> Gamified developer education
              </div>

              <h1 className="text-5xl md:text-7xl font-bold leading-[1.1]">
                Level up your
                <br />
                <span className="text-primary text-glow">dev skills.</span>
              </h1>

              <p className="text-lg text-muted-foreground max-w-xl">
                Master modern development through hands-on courses, earn XP for
                every lesson completed, and unlock badges as you grow from
                beginner to senior engineer.
              </p>

              <div className="flex items-center gap-4 pt-2">
                <Link to={primaryCtaPath}>
                  <Button variant="hero" size="lg" className="text-base">
                    Start Learning Free{" "}
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
                <a href="#how-it-works">
                  <Button variant="neon" size="lg" className="text-base">
                    See How It Works
                  </Button>
                </a>
              </div>
            </motion.div>

            {/* Right — Code editor mockup */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              {/* +500 XP floating badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8, rotate: 0 }}
                animate={{ opacity: 1, scale: 1, rotate: 16 }}
                transition={{ delay: 0.9, type: "spring" }}
                className="absolute -top-3 -right-3 z-10 rounded-full bg-primary px-4 py-1.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/30"
              >
                +500 XP
              </motion.div>

              {/* Editor window */}
              <div className="rounded-xl border border-border bg-[#0d1117] shadow-2xl shadow-black/40 overflow-hidden">
                {/* Title bar */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-[#161b22]">
                  <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
                  <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
                  <span className="h-3 w-3 rounded-full bg-[#28c840]" />
                  <span className="ml-3 text-xs text-muted-foreground font-mono">
                    devpath-academy.ts
                  </span>
                </div>

                {/* Code body */}
                <div className="p-5 font-mono text-sm leading-relaxed space-y-1">
                  <CodeLine n={1}>
                    <span className="text-[#ff7b72]">const</span>{" "}
                    <span className="text-[#79c0ff]">dev</span>{" "}
                    <span className="text-[#c9d1d9]">=</span>{" "}
                    <span className="text-[#ff7b72]">new</span>{" "}
                    <span className="text-[#ffa657]">Developer</span>
                    <span className="text-[#c9d1d9]">();</span>
                  </CodeLine>
                  <div className="h-1" />
                  <CodeLine n={2}>
                    <span className="text-[#79c0ff]">dev</span>
                    <span className="text-[#c9d1d9]">.</span>
                    <span className="text-[#d2a8ff]">learn</span>
                    <span className="text-[#c9d1d9]">(</span>
                    <span className="text-[#a5d6ff]">'React'</span>
                    <span className="text-[#c9d1d9]">,&nbsp;</span>
                    <span className="text-[#a5d6ff]">'TypeScript'</span>
                    <span className="text-[#c9d1d9]">);</span>
                  </CodeLine>
                  <div className="h-1" />
                  <CodeLine n={3}>
                    <span className="text-[#79c0ff]">dev</span>
                    <span className="text-[#c9d1d9]">.</span>
                    <span className="text-[#d2a8ff]">earnBadge</span>
                    <span className="text-[#c9d1d9]">(</span>
                    <span className="text-[#a5d6ff]">'Full Stack Hero'</span>
                    <span className="text-[#c9d1d9]">);</span>
                  </CodeLine>
                  <div className="h-1" />
                  <CodeLine n={4}>
                    <span className="text-[#79c0ff]">dev</span>
                    <span className="text-[#c9d1d9]">.</span>
                    <span className="text-[#d2a8ff]">levelUp</span>
                    <span className="text-[#c9d1d9]">();</span>
                    <span className="text-[#8b949e]">
                      {" "}
                      // +500 XP
                    </span>
                  </CodeLine>
                  <div className="h-1" />
                  <CodeLine n={5}>
                    <span className="text-[#c9d1d9]">console.</span>
                    <span className="text-[#d2a8ff]">log</span>
                    <span className="text-[#c9d1d9]">(</span>
                    <span className="text-[#79c0ff]">dev</span>
                    <span className="text-[#c9d1d9]">.</span>
                    <span className="text-[#79c0ff]">rank</span>
                    <span className="text-[#c9d1d9]">);</span>
                    <span className="text-[#8b949e]">
                      {" "}
                      // 'Senior'
                    </span>
                  </CodeLine>
                  <div className="h-1" />
                  <CodeLine n={6}>
                    <span className="text-primary">{">"}</span>
                    <span className="text-[#c9d1d9] animate-pulse"> _</span>
                  </CodeLine>
                </div>
              </div>

              {/* Badge Unlocked toast */}
              <motion.div
                initial={{ opacity: 0, y: 10, rotate: 0 }}
                animate={{ opacity: 1, y: 0, rotate: -8 }}
                transition={{ delay: 1.2, type: "spring" }}
                className="absolute -bottom-4 left-4 z-10 rounded-lg bg-[#1c2029] border border-border px-4 py-2 text-xs font-semibold text-foreground shadow-lg flex items-center gap-2"
              >
                <Award className="h-3.5 w-3.5 text-yellow-400" />
                Badge Unlocked
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t border-border">
        <div className="container py-20 space-y-10">
          <div className="text-center space-y-2">
            <span className="text-xs font-mono uppercase tracking-wider text-primary">
              Features
            </span>
            <h2 className="text-3xl font-bold text-foreground">
              Everything you need to grow as a developer
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-lg border border-border bg-card p-6 space-y-3 hover:border-primary/30 hover:box-glow transition-all"
              >
                <feature.icon className="h-8 w-8 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Community Stats — logged-in only */}
      {user && <section id="stats" className="border-t border-border">
        <div className="container py-20 space-y-10">
          <div className="text-center space-y-2">
            <span className="text-xs font-mono uppercase tracking-wider text-primary">
              Community
            </span>
            <h2 className="text-3xl font-bold text-foreground">
              Join thousands of developers leveling up
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center space-y-2 rounded-lg border border-border bg-card p-6"
              >
                <p className="text-4xl font-bold font-mono text-primary text-glow">
                  {stat.value}
                </p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>}

      {/* How It Works */}
      <section id="how-it-works" className="border-t border-border">
        <div className="container py-20 space-y-10">
          <div className="text-center space-y-2">
            <span className="text-xs font-mono uppercase tracking-wider text-primary">
              How It Works
            </span>
            <h2 className="text-3xl font-bold text-foreground">
              Your path from zero to hero in 4 steps
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className="rounded-lg border border-border bg-card p-6 space-y-3"
              >
                <span className="text-3xl font-bold font-mono text-primary/40">
                  {step.num}
                </span>
                <h3 className="text-lg font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border">
        <div className="container py-20 text-center space-y-6">
          <h2 className="text-3xl font-bold text-foreground">
            Ready to start your developer journey?
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Join DevPath Academy today and transform the way you learn to code.
            It&apos;s free to get started.
          </p>
          <Link to={primaryCtaPath}>
            <Button variant="hero" size="lg">
              Create Free Account
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
