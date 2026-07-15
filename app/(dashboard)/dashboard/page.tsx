import { createClient } from "@/lib/supabase/server";

// Placeholder landing page. The real dashboard (client health, project
// pipeline, evaluation leaderboard) is a separate build phase — this
// exists so the auth flow has somewhere real to land and prove itself.
export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role, status")
    .eq("id", user!.id)
    .single();

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <span className="font-mono text-xs uppercase tracking-[0.2em] text-summit-400">لوحة التحكم</span>
      <h1 className="mt-1 font-display text-2xl text-ink-900">أهلًا بك، {profile?.full_name}</h1>
      <p className="mt-2 text-sm text-ink-600">
        الدور الحالي: <span className="font-mono">{profile?.role}</span> — الحالة:{" "}
        <span className="font-mono">{profile?.status}</span>
      </p>
      <div className="mt-8 rounded-lg border border-dashed border-line bg-white/60 px-6 py-10 text-center text-sm text-ink-600">
        هذه نقطة انطلاق مؤقتة تُثبت أن المصادقة والصلاحيات تعمل فعليًا. لوحة المؤشرات
        الحقيقية (صحة العملاء، خط أنابيب المشاريع، ترتيب أداء المستشارين) مرحلة بناء منفصلة.
      </div>
    </div>
  );
}
