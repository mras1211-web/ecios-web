"use client";

import { useState, useTransition } from "react";
import { addNote } from "@/actions/clients";

export function NoteForm({ organizationId }: { organizationId: string }) {
  const [note, setNote] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!note.trim()) return;
        setError(null);
        startTransition(async () => {
          const res = await addNote(organizationId, note);
          if (res.error) setError(res.error);
          else setNote("");
        });
      }}
      className="mb-4 flex gap-2"
    >
      <input
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="أضف ملاحظة إلى سجل النشاط…"
        className="flex-1 rounded border border-line px-3 py-2 text-sm focus:border-summit focus:outline-none focus:ring-1 focus:ring-summit"
      />
      <button
        type="submit"
        disabled={isPending}
        className="rounded bg-summit px-4 py-2 text-sm font-medium text-paper hover:bg-summit-400 disabled:opacity-60"
      >
        إضافة
      </button>
      {error && <p className="text-xs text-red-700">{error}</p>}
    </form>
  );
}
