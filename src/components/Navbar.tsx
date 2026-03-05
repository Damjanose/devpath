import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Code2,
  LogOut,
  LayoutDashboard,
  Shield,
  Trophy,
  Menu,
} from "lucide-react";

export function Navbar() {
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const handleSignOut = async () => {
    setOpen(false);
    await signOut();
    navigate("/");
  };

  // Helper: if on homepage, use anchor; otherwise link to /#anchor
  const sectionHref = (anchor: string) =>
    location.pathname === "/" ? `#${anchor}` : `/#${anchor}`;

  /** Shared nav links so desktop & mobile stay in sync */
  const navLinks = (
    <>
      <Link to="/courses" onClick={() => setOpen(false)}>
        <Button variant="ghost" size="sm" className="w-full justify-start">
          Courses
        </Button>
      </Link>

      {!user && (
        <>
          <a href={sectionHref("features")} onClick={() => setOpen(false)}>
            <Button variant="ghost" size="sm" className="w-full justify-start">
              Features
            </Button>
          </a>
          <a href={sectionHref("how-it-works")} onClick={() => setOpen(false)}>
            <Button variant="ghost" size="sm" className="w-full justify-start">
              How It Works
            </Button>
          </a>
          <a href={sectionHref("stats")} onClick={() => setOpen(false)}>
            <Button variant="ghost" size="sm" className="w-full justify-start">
              Community
            </Button>
          </a>
        </>
      )}

      {user ? (
        <>
          <Link to="/dashboard" onClick={() => setOpen(false)}>
            <Button variant="ghost" size="sm" className="w-full justify-start">
              <LayoutDashboard className="h-4 w-4 mr-1" />
              Dashboard
            </Button>
          </Link>
          <Link to="/profile" onClick={() => setOpen(false)}>
            <Button variant="ghost" size="sm" className="w-full justify-start">
              <Trophy className="h-4 w-4 mr-1" />
              Profile
            </Button>
          </Link>
          {isAdmin && (
            <Link to="/admin" onClick={() => setOpen(false)}>
              <Button variant="ghost" size="sm" className="w-full justify-start">
                <Shield className="h-4 w-4 mr-1" />
                Admin
              </Button>
            </Link>
          )}
          <Button variant="outline" size="sm" onClick={handleSignOut} className="w-full justify-start">
            <LogOut className="h-4 w-4 mr-1" />
            Sign Out
          </Button>
        </>
      ) : (
        <>
          <Link to="/login" onClick={() => setOpen(false)}>
            <Button variant="ghost" size="sm" className="w-full justify-start">
              Log In
            </Button>
          </Link>
          <Link to="/register" onClick={() => setOpen(false)}>
            <Button variant="hero" size="sm" className="w-full justify-start">
              Start Learning
            </Button>
          </Link>
        </>
      )}
    </>
  );

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <Code2 className="h-7 w-7 text-primary group-hover:text-glow transition-all" />
          <span className="text-xl font-bold text-foreground">
            Dev<span className="text-primary">Path</span>
          </span>
        </Link>

        {/* Desktop nav — hidden on small screens */}
        <div className="hidden md:flex items-center gap-2">
          {navLinks}
        </div>

        {/* Mobile hamburger — visible on small screens */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-64 pt-10">
            <SheetTitle className="sr-only">Navigation menu</SheetTitle>
            <div className="flex flex-col gap-2">
              {navLinks}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
