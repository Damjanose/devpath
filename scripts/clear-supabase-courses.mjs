import { createClient } from "@supabase/supabase-js";

const sb = createClient(
  "https://muirhlmbooaxbrprwrgo.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11aXJobG1ib29heGJycHJ3cmdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1NTM1NzAsImV4cCI6MjA4ODEyOTU3MH0.ZsY55ya8i1sUUkVyV90dPKM89HQ4aH_WLSupf-N8XyY"
);

async function main() {
  // Sign in as admin to get delete permissions
  const { error: authErr } = await sb.auth.signInWithPassword({
    email: "damjanoda@gmail.com",
    password: "Damjanod@1",
  });
  if (authErr) {
    console.log("Auth error:", authErr.message);
    process.exit(1);
  }
  console.log("✅ Signed in as admin");

  // Delete in FK order: lessons → modules → courses
  console.log("\n🗑️  Deleting lessons...");
  const { error: e1 } = await sb
    .from("lessons")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");
  console.log(e1 ? `  ❌ ${e1.message}` : "  ✅ Lessons deleted");

  console.log("🗑️  Deleting modules...");
  const { error: e2 } = await sb
    .from("modules")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");
  console.log(e2 ? `  ❌ ${e2.message}` : "  ✅ Modules deleted");

  console.log("🗑️  Deleting courses...");
  const { error: e3 } = await sb
    .from("courses")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");
  console.log(e3 ? `  ❌ ${e3.message}` : "  ✅ Courses deleted");

  // Verify
  const { data } = await sb.from("courses").select("id");
  console.log(`\n📊 Remaining courses in Supabase: ${data?.length ?? "unknown"}`);
}

main();
