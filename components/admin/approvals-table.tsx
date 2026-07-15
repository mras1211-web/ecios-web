"use client";

import { useState, useTransition } from "react";
import { approveUser, rejectUser } from "@/actions/approvals";

const ROLE_OPTIONS = [
  { value: "managing_consultant", label: "شريك / مدير" },
  { value: "senior_consultant", label: "مستشار أول" },
  { value: "consultant", label: "مستشار" },
  { value: "project_manager", label: "مدير مشروع" },
  { value: "business_analyst", label: "محلل أعمال" },
  { value: "viewer", label: "مُطّلع فقط" },
  { value: "auditor", label: "مدقّق" },
] as const;

type PendingUser = {
  id: string;
  full_name: string;
  email: string;
  created_at: string;
  registration_method: string;
};

export function ApprovalsTable({ users }: { users: PendingUser[] }) {
  if (!users.length) {
    return (
      <div className="rounded-lg border border-dashed border-line bg-white/60 px-4 py-8 text-center text-sm text-ink-600">
        لا توجد طلبات بانتظار الموافقة حاليًا
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {users.map((u) => (
        <UserRow key={u.id} user={u} />
      ))}
    </div>
  );
}

function UserRow({ user }: { user: PendingUser }) {
  const [role, setRole] = useState<(typeof ROLE_OPTIONS)[number]["value"]>("consultant");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [handled, setHandled] = useState(false);

  if (handled) return null;

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-line bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-medium text-ink-900">{user.full_name}</p>
        <p className="text-sm text-ink-600">{user.email}</p>
        <p className="mt-0.5 text-xs text-ink-600/70">
          طلب في {new Date(user.created_at).toLocaleDateString("ar-SA")}
        </p>
        {error && <p className="mt-1 text-xs text-red-700">{error}</p>}
      </div>
      <div className="flex items-center gap-2">
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as typeof role)}
          className="rounded border border-line bg-white px-2.5 py-2 text-sm"
        >
          {ROLE_OPTIONS.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
        <button
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              const res = await approveUser(user.id, role);
              if (res.error) setError(res.error);
              else setHandled(true);
            })
          }
          className="rounded bg-summit px-3.5 py-2 text-sm font-medium text-paper hover:bg-summit-400 disabled:opacity-60"
        >
          موافقة
        </button>
        <button
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              const res = await rejectUser(user.id);
              if (res.error) setError(res.error);
              else setHandled(true);
            })
          }
          className="rounded border border-line px-3.5 py-2 text-sm font-medium text-ink-700 hover:bg-line/30 disabled:opacity-60"
        >
          رفض
        </button>
      </div>
    </div>
  );
}
