import { Link } from "react-router-dom";
import { Code2 } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-3">
            <Link to="/" className="flex items-center gap-2">
              <Code2 className="h-5 w-5 text-primary" />
              <span className="text-lg font-bold text-foreground">
                Dev<span className="text-primary">Path</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Gamified learning for developers who want to level up their skills.
            </p>
          </div>

          {/* Platform */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground">Platform</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="/#features" className="hover:text-foreground transition-colors">Features</a>
              </li>
              <li>
                <a href="/#how-it-works" className="hover:text-foreground transition-colors">How It Works</a>
              </li>
              <li>
                <a href="/#stats" className="hover:text-foreground transition-colors">Community</a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground">Resources</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/courses" className="hover:text-foreground transition-colors">Courses</Link>
              </li>
              <li>
                <span className="cursor-default">Documentation</span>
              </li>
              <li>
                <span className="cursor-default">Support</span>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <span className="cursor-default">Privacy Policy</span>
              </li>
              <li>
                <span className="cursor-default">Terms of Service</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <span>&copy; 2026 DevPath Academy. All rights reserved.</span>
          <span>Built for developers, by developers.</span>
        </div>
      </div>
    </footer>
  );
}
