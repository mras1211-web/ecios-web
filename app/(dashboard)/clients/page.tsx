import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const HEALTH_LABEL: Record<string, string> = {
  excellent: "ممتاز",
  healthy: "جيد",
  at_risk: "معرّض للخطر",
  critical: "حرج",
};
const HEALTH_COLOR: Record<string, string> = {
  excellent: "bg-summit-50 text-summit-700",
  healthy: "bg-brass-100 text-brass-700",
  at_risk: "bg-amber-100 text-amber-800",
  critical: "bg-red-100 text-red-800",
};

export default async function ClientsPage() {
  const supabase = await createClient();

  // RLS already restricts this to organizations the current user is
  // assigned to (or all of them, if firm_owner) — no extra filtering here.
  const { data: organizations } = await supabase
    .from("organizations")
    .select("id, name, industry, city, health_score, health_status, primary_consultant_id, profiles:primary_consultant_id(full_name)")
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-summit-400">العملاء</span>
          <h1 className="mt-1 font-display text-2xl text-ink-900">سجل العملاء</h1>
        </div>
        <Link
          href="/clients/new"
          className="rounded bg-summit px-4 py-2.5 text-sm font-medium text-paper hover:bg-summit-400"
        >
          + عميل جديد
        </Link>
      </header>

      {!organizations?.length ? (
        <div className="rounded-lg border border-dashed border-line bg-white/60 px-6 py-16 text-center">
          <p className="text-sm text-ink-600">لا يوجد عملاء مُسندون إليك بعد.</p>
          <Link href="/clients/new" className="mt-3 inline-block text-sm font-medium text-summit-400 hover:text-summit">
            أضف أول عميل
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {organizations.map((org) => (
            <Link
              key={org.id}
              href={`/clients/${org.id}`}
              className="rounded-lg border border-line bg-white p-5 transition-shadow hover:shadow-md"
            >
              <div className="mb-3 flex items-start justify-between">
                <h2 className="font-display text-lg text-ink-900">{org.name}</h2>
                {org.health_status && (
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${HEALTH_COLOR[org.health_status]}`}>
                    {HEALTH_LABEL[org.health_status]}
                  </span>
                )}
              </div>
              <p className="text-sm text-ink-600">
                {[org.industry, org.city].filter(Boolean).join(" · ") || "—"}
              </p>
              <div className="mt-4 flex items-center justify-between text-xs text-ink-600/70">
                <span>{(org as any).profiles?.full_name ?? "بدون مستشار رئيسي"}</span>
                {org.health_score != null && <span className="font-mono">{org.health_score}/100</span>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
