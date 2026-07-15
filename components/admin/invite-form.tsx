"use client";

import { useState, useTransition } from "react";
import { inviteTeamMember } from "@/actions/approvals";

const ROLE_OPTIONS = [
  { value: "managing_consultant", label: "شريك / مدير" },
  { value: "senior_consultant", label: "مستشار أول" },
  { value: "consultant", label: "مستشار" },
  { value: "project_manager", label: "مدير مشروع" },
  { value: "business_analyst", label: "محلل أعمال" },
  { value: "viewer", label: "مُطّلع فقط" },
  { value: "auditor", label: "مدقّق" },
] as const;

export function InviteForm() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<(typeof ROLE_OPTIONS)[number]["value"]>("consultant");
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ error: string | null; link?: string } | null>(null);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(async () => {
          const res = await inviteTeamMember(email, role);
          if (res.error) {
            setResult({ error: res.error });
          } else {
            setResult({
              error: null,
              link: `${window.location.origin}/register?invite=${res.token}`,
            });
            setEmail("");
          }
        });
      }}
      className="flex flex-col gap-3 rounded-lg border border-line bg-white p-4 sm:flex-row sm:items-end"
    >
      <div className="flex-1">
        <label className="mb-1.5 block text-sm font-medium text-ink-800" htmlFor="invite-email">
          البريد الإلكتروني
        </label>
        <input
          id="invite-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@example.com"
          className="w-full rounded border border-line px-3.5 py-2.5 text-sm focus:border-summit focus:outline-none focus:ring-1 focus:ring-summit"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink-800" htmlFor="invite-role">
          الدور
        </label>
        <select
          id="invite-role"
          value={role}
          onChange={(e) => setRole(e.target.value as typeof role)}
          className="rounded border border-line bg-white px-2.5 py-2.5 text-sm"
        >
          {ROLE_OPTIONS.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="rounded bg-summit px-4 py-2.5 text-sm font-medium text-paper hover:bg-summit-400 disabled:opacity-60"
      >
        إرسال دعوة
      </button>

      {result?.error && <p className="text-sm text-red-700 sm:basis-full">{result.error}</p>}
      {result?.link && (
        <div className="sm:basis-full rounded border border-summit-100 bg-summit-50 px-3.5 py-2.5 text-xs text-summit-700">
          تم إنشاء الدعوة. لم يُفعَّل إرسال البريد التلقائي بعد — شارك هذا الرابط يدويًا حاليًا:{" "}
          <span className="font-mono">{result.link}</span>
        </div>
      )}
    </form>
  );
}
