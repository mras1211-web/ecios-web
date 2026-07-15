import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/sign-out-button";

export default async function PendingApprovalPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, status")
    .eq("id", user.id)
    .single();

  if (profile?.status === "active") redirect("/dashboard");

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-6">
      <div className="w-full max-w-md rounded-lg border border-line bg-white p-10 text-center shadow-sm">
        <span className="font-mono text-xs uppercase tracking-[0.2em] text-summit-400">Vantage · ECIOS</span>
        <h1 className="mt-4 font-display text-2xl text-ink-900">
          مرحبًا {profile?.full_name?.split(" ")[0] ?? ""}، طلبك قيد المراجعة
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-600">
          تم استلام طلب انضمامك بنجاح. سيقوم محمد العويني بمراجعة الحساب وتفعيله قريبًا.
          سيصلك بريد إلكتروني فور التفعيل، ويمكنك حينها تسجيل الدخول مباشرة.
        </p>
        <div className="mt-8">
          <SignOutButton />
        </div>
      </div>
    </div>
  );
}
