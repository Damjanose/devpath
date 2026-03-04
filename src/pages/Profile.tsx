import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/Navbar";
import { XPBar } from "@/components/XPBar";
import { BadgeCard } from "@/components/BadgeCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Footer } from "@/components/Footer";
import { useProfileQuery } from "@/hooks/queries/useProfileQuery";
import { useBadgesQuery } from "@/hooks/queries/useBadgesQuery";
import { useUpdateProfileMutation } from "@/hooks/mutations/useUpdateProfileMutation";

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: profile } = useProfileQuery(user?.id);
  const { data: badges } = useBadgesQuery(user?.id);
  const updateProfile = useUpdateProfileMutation(user?.id);

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");

  // Sync form fields when profile data loads
  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || "");
      setBio(profile.bio || "");
    }
  }, [profile]);

  async function handleSave() {
    try {
      await updateProfile.mutateAsync({ displayName, bio });
      toast({ title: "Profile updated!" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  }

  const level = profile?.level || 1;
  const totalPoints = profile?.total_points || 0;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="container py-8 max-w-2xl space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold text-foreground mb-2">Profile</h1>
          <XPBar current={totalPoints % (level * 500)} max={level * 500} level={level} />
        </motion.div>

        <div className="rounded-lg border border-border bg-card p-6 space-y-4">
          <div className="space-y-2">
            <Label>Display Name</Label>
            <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="bg-secondary border-border" />
          </div>
          <div className="space-y-2">
            <Label>Bio</Label>
            <Textarea value={bio} onChange={(e) => setBio(e.target.value)} className="bg-secondary border-border" rows={3} />
          </div>
          <Button variant="hero" onClick={handleSave} disabled={updateProfile.isPending}>
            {updateProfile.isPending ? "Saving..." : "Save Profile"}
          </Button>
        </div>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Earned Badges</h2>
          {(badges ?? []).length === 0 ? (
            <p className="text-muted-foreground text-sm">No badges earned yet. Keep learning!</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {(badges ?? []).map((ub: any) => ub.badges && (
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
