import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Code2, LogOut, LayoutDashboard, Shield, Trophy } from "lucide-react";

export function Navbar() {
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <Code2 className="h-7 w-7 text-primary group-hover:text-glow transition-all" />
          <span className="text-xl font-bold text-foreground">
            Dev<span className="text-primary">Path</span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <Link to="/courses">
            <Button variant="ghost" size="sm">Courses</Button>
          </Link>

          {user ? (
            <>
              <Link to="/dashboard">
                <Button variant="ghost" size="sm"><LayoutDashboard className="h-4 w-4 mr-1" />Dashboard</Button>
              </Link>
              <Link to="/profile">
                <Button variant="ghost" size="sm"><Trophy className="h-4 w-4 mr-1" />Profile</Button>
              </Link>
              {isAdmin && (
                <Link to="/admin">
                  <Button variant="ghost" size="sm"><Shield className="h-4 w-4 mr-1" />Admin</Button>
                </Link>
              )}
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Link to="/login"><Button variant="ghost" size="sm">Login</Button></Link>
              <Link to="/register"><Button variant="hero" size="sm">Sign Up</Button></Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
