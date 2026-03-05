import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/Navbar";
import { XPBar } from "@/components/XPBar";
import { BadgeCard } from "@/components/BadgeCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Footer } from "@/components/Footer";
import { useProfileQuery } from "@/hooks/queries/useProfileQuery";
import { useBadgesQuery } from "@/hooks/queries/useBadgesQuery";
import { useUpdateProfileMutation } from "@/hooks/mutations/useUpdateProfileMutation";
import { useTTSSettings } from "@/hooks/useTTSSettings";
import { Volume2 } from "lucide-react";

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: profile } = useProfileQuery(user?.id);
  const { data: badges } = useBadgesQuery(user?.id);
  const updateProfile = useUpdateProfileMutation(user?.id);
  const ttsSettings = useTTSSettings();

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  // Sync form fields when profile data loads
  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || "");
      setBio(profile.bio || "");
    }
  }, [profile]);

  // Load available TTS voices
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const load = () => {
      const all = speechSynthesis.getVoices().filter((v) => v.lang.startsWith("en"));
      setVoices(all);
    };
    load();
    speechSynthesis.addEventListener("voiceschanged", load);
    return () => speechSynthesis.removeEventListener("voiceschanged", load);
  }, []);

  function previewVoice(voiceName: string) {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(
      "This is an audio test from the AI agent."
    );
    utterance.rate = ttsSettings.rate;
    const voice = voices.find((v) => v.name === voiceName);
    if (voice) utterance.voice = voice;
    utterance.lang = "en-US";
    speechSynthesis.speak(utterance);
  }

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

        {/* Audio / Text-to-Speech Settings */}
        <div className="rounded-lg border border-border bg-card p-6 space-y-5">
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <Volume2 className="h-5 w-5" /> Audio Settings
          </h2>

          <div className="flex items-center justify-between">
            <div>
              <Label>Enable Lesson Audio</Label>
              <p className="text-sm text-muted-foreground">Show speaker icon on lessons to read content aloud</p>
            </div>
            <Switch
              checked={ttsSettings.enabled}
              onCheckedChange={ttsSettings.setEnabled}
            />
          </div>

          {ttsSettings.enabled && (
            <>
              <div className="space-y-2">
                <Label>Reading Speed</Label>
                <div className="flex gap-2">
                  {[{label: "1x", value: 1}, {label: "1.5x", value: 1.5}, {label: "2x", value: 2}, {label: "3x", value: 3}].map((s) => (
                    <button
                      key={s.value}
                      onClick={() => ttsSettings.setRate(s.value)}
                      className={`px-3 py-1.5 rounded-md text-sm font-mono transition-colors ${
                        ttsSettings.rate === s.value
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Voice</Label>
                {voices.length > 0 ? (
                  <Select
                    value={ttsSettings.voiceName || "_default"}
                    onValueChange={(val) => {
                      const name = val === "_default" ? "" : val;
                      ttsSettings.setVoiceName(name);
                      previewVoice(name || voices[0]?.name || "");
                    }}
                  >
                    <SelectTrigger className="bg-secondary border-border">
                      <SelectValue placeholder="Select a voice" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_default">Default</SelectItem>
                      {voices.map((v) => (
                        <SelectItem key={v.name} value={v.name}>
                          {v.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-sm text-muted-foreground">No voices available in this browser.</p>
                )}
              </div>
            </>
          )}
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
