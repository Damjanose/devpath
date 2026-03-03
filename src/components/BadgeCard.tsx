import { motion } from "framer-motion";
import { Award } from "lucide-react";

interface BadgeCardProps {
  name: string;
  description?: string | null;
  tier: string;
  earned?: boolean;
}

const tierColors: Record<string, string> = {
  bronze: "from-amber-700 to-amber-900",
  silver: "from-slate-300 to-slate-500",
  gold: "from-yellow-400 to-amber-500",
  platinum: "from-cyan-300 to-blue-500",
};

export function BadgeCard({ name, description, tier, earned = false }: BadgeCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={`relative rounded-lg border p-4 text-center transition-all ${
        earned
          ? "border-primary/30 bg-card box-glow"
          : "border-border bg-card/50 opacity-50 grayscale"
      }`}
    >
      <div className={`mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br ${tierColors[tier] || tierColors.bronze}`}>
        <Award className="h-6 w-6 text-primary-foreground" />
      </div>
      <h4 className="text-sm font-semibold text-foreground">{name}</h4>
      {description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}
      <span className="mt-2 inline-block rounded-full bg-secondary px-2 py-0.5 text-xs font-mono capitalize text-secondary-foreground">
        {tier}
      </span>
    </motion.div>
  );
}
