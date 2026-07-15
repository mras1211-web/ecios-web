import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/sign-out-button";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/dashboard" className="font-display text-lg text-summit-700">
            ECIOS <span className="text-brass-600">· Vantage</span>
          </Link>
          <nav className="flex items-center gap-5 text-sm">
            <Link href="/dashboard" className="text-ink-700 hover:text-summit">
              الرئيسية
            </Link>
            <Link href="/clients" className="text-ink-700 hover:text-summit">
              العملاء
            </Link>
            {profile?.role === "firm_owner" && (
              <Link href="/admin/approvals" className="text-ink-700 hover:text-summit">
                موافقة الحسابات
              </Link>
            )}
            <span className="text-ink-600/70">{profile?.full_name}</span>
            <SignOutButton />
          </nav>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
