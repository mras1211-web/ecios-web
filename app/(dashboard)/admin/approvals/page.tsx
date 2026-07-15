import { createClient } from "@/lib/supabase/server";
import { ApprovalsTable } from "@/components/admin/approvals-table";
import { InviteForm } from "@/components/admin/invite-form";

export default async function ApprovalsPage() {
  const supabase = await createClient();

  const [{ data: pending }, { data: invitations }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, full_name, email, created_at, registration_method")
      .eq("status", "pending_approval")
      .order("created_at", { ascending: true }),
    supabase
      .from("invitations")
      .select("id, email, role, status, expires_at, created_at")
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <header className="mb-8">
        <span className="font-mono text-xs uppercase tracking-[0.2em] text-summit-400">
          الإدارة
        </span>
        <h1 className="mt-1 font-display text-2xl text-ink-900">موافقة الحسابات والدعوات</h1>
        <p className="mt-1 text-sm text-ink-600">
          راجع طلبات الانضمام الذاتية، وأرسل دعوات مباشرة لأعضاء فريقك.
        </p>
      </header>

      <section className="mb-10">
        <h2 className="mb-3 font-display text-lg text-ink-900">
          بانتظار الموافقة {pending?.length ? `(${pending.length})` : ""}
        </h2>
        <ApprovalsTable users={pending ?? []} />
      </section>

      <section className="mb-10">
        <h2 className="mb-3 font-display text-lg text-ink-900">دعوة عضو جديد</h2>
        <InviteForm />
      </section>

      <section>
        <h2 className="mb-3 font-display text-lg text-ink-900">آخر الدعوات المُرسَلة</h2>
        <div className="overflow-hidden rounded-lg border border-line bg-white">
          <table className="w-full text-sm">
            <thead className="bg-paper text-right text-xs uppercase tracking-wide text-ink-600">
              <tr>
                <th className="px-4 py-2.5 font-medium">البريد الإلكتروني</th>
                <th className="px-4 py-2.5 font-medium">الدور</th>
                <th className="px-4 py-2.5 font-medium">الحالة</th>
                <th className="px-4 py-2.5 font-medium">تنتهي في</th>
              </tr>
            </thead>
            <tbody>
              {(invitations ?? []).map((inv) => (
                <tr key={inv.id} className="border-t border-line">
                  <td className="px-4 py-2.5">{inv.email}</td>
                  <td className="px-4 py-2.5 font-mono text-xs">{inv.role}</td>
                  <td className="px-4 py-2.5">
                    <StatusBadge status={inv.status} />
                  </td>
                  <td className="px-4 py-2.5 text-ink-600">
                    {new Date(inv.expires_at).toLocaleDateString("ar-SA")}
                  </td>
                </tr>
              ))}
              {!invitations?.length && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-ink-600">
                    لا توجد دعوات بعد
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: "bg-brass-100 text-brass-700",
    accepted: "bg-summit-50 text-summit-700",
    expired: "bg-line text-ink-600",
    revoked: "bg-red-50 text-red-700",
  };
  const label: Record<string, string> = {
    pending: "بانتظار القبول",
    accepted: "تم القبول",
    expired: "منتهية",
    revoked: "مُلغاة",
  };
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${map[status] ?? ""}`}>
      {label[status] ?? status}
    </span>
  );
}
