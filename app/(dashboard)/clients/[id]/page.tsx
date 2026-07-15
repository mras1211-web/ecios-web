import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ContactForm } from "@/components/clients/contact-form";
import { NoteForm } from "@/components/clients/note-form";

const EVENT_LABEL: Record<string, string> = {
  note: "ملاحظة",
  call: "مكالمة",
  email: "بريد إلكتروني",
  meeting: "اجتماع",
  project_created: "مشروع جديد",
  project_closed: "إغلاق مشروع",
  assessment_completed: "تقييم مُنجز",
  document_uploaded: "مستند مرفوع",
  health_score_changed: "تغيّر مؤشر الصحة",
  status_changed: "تغيّر الحالة",
};

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: org }, { data: contacts }, { data: timeline }, { data: projects }] = await Promise.all([
    supabase.from("organizations").select("*, profiles:primary_consultant_id(full_name)").eq("id", id).single(),
    supabase.from("contacts").select("*").eq("organization_id", id).order("is_primary", { ascending: false }),
    supabase
      .from("organization_timeline")
      .select("*, profiles:created_by(full_name)")
      .eq("organization_id", id)
      .order("created_at", { ascending: false })
      .limit(30),
    supabase.from("projects").select("id, name, status, stage, progress_percent").eq("organization_id", id),
  ]);

  if (!org) notFound();

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <Link href="/clients" className="text-sm text-ink-600 hover:text-summit">
        ← سجل العملاء
      </Link>

      <header className="mt-3 mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-ink-900">{org.name}</h1>
          <p className="mt-1 text-sm text-ink-600">
            {[org.industry, org.city, org.country].filter(Boolean).join(" · ") || "لا توجد تفاصيل إضافية"}
          </p>
        </div>
        <div className="flex gap-6 rounded-lg border border-line bg-white px-5 py-3 text-center">
          <ScoreBadge label="مؤشر الصحة" value={org.health_score} />
          <ScoreBadge label="مؤشر العلاقة" value={org.relationship_score} />
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Section title="سجل النشاط">
            <NoteForm organizationId={org.id} />
            <ol className="space-y-4 border-r-2 border-line pr-4">
              {(timeline ?? []).map((ev) => (
                <li key={ev.id} className="relative">
                  <span className="absolute -right-[21px] top-1 h-2.5 w-2.5 rounded-full bg-brass-600" />
                  <p className="text-sm text-ink-900">
                    <span className="font-medium">{EVENT_LABEL[ev.event_type] ?? ev.event_type}</span>
                    {ev.description ? ` — ${ev.description}` : ev.title ? ` — ${ev.title}` : ""}
                  </p>
                  <p className="text-xs text-ink-600/70">
                    {new Date(ev.created_at).toLocaleString("ar-SA")}
                    {(ev as any).profiles?.full_name ? ` · ${(ev as any).profiles.full_name}` : ""}
                  </p>
                </li>
              ))}
              {!timeline?.length && <p className="text-sm text-ink-600">لا يوجد نشاط بعد</p>}
            </ol>
          </Section>

          <Section title="المشاريع">
            {projects?.length ? (
              <ul className="space-y-2">
                {projects.map((p) => (
                  <li key={p.id} className="flex items-center justify-between rounded border border-line bg-white px-4 py-2.5 text-sm">
                    <span>{p.name}</span>
                    <span className="font-mono text-xs text-ink-600">{p.progress_percent ?? 0}%</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-ink-600">لا توجد مشاريع بعد لهذا العميل</p>
            )}
          </Section>
        </div>

        <div>
          <Section title="جهات الاتصال">
            <ul className="mb-3 space-y-3">
              {(contacts ?? []).map((c) => (
                <li key={c.id} className="rounded border border-line bg-white p-3 text-sm">
                  <p className="font-medium text-ink-900">
                    {c.full_name} {c.is_decision_maker && <span className="text-xs text-brass-600">(صاحب قرار)</span>}
                  </p>
                  <p className="text-ink-600">{c.title}</p>
                  {c.email && <p className="text-xs text-ink-600/70">{c.email}</p>}
                </li>
              ))}
              {!contacts?.length && <p className="text-sm text-ink-600">لا توجد جهات اتصال بعد</p>}
            </ul>
            <ContactForm organizationId={org.id} />
          </Section>

          <Section title="المستشار الرئيسي">
            <p className="text-sm text-ink-900">{(org as any).profiles?.full_name ?? "غير مُسند"}</p>
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="mb-3 font-display text-lg text-ink-900">{title}</h2>
      {children}
    </section>
  );
}

function ScoreBadge({ label, value }: { label: string; value: number | null }) {
  return (
    <div>
      <p className="font-mono text-lg text-summit-700">{value ?? "—"}</p>
      <p className="text-xs text-ink-600">{label}</p>
    </div>
  );
}
