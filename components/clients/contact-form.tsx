"use client";

import { useState, useTransition } from "react";
import { addContact } from "@/actions/clients";

export function ContactForm({ organizationId }: { organizationId: string }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [title, setTitle] = useState("");
  const [email, setEmail] = useState("");

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-sm font-medium text-summit-400 hover:text-summit"
      >
        + إضافة جهة اتصال
      </button>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        startTransition(async () => {
          const res = await addContact(organizationId, { fullName, title, email });
          if (res.error) setError(res.error);
          else {
            setFullName("");
            setTitle("");
            setEmail("");
            setOpen(false);
          }
        });
      }}
      className="mt-2 flex flex-wrap items-end gap-2 rounded border border-line bg-paper p-3"
    >
      <input
        required
        placeholder="الاسم الكامل"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        className="rounded border border-line px-2.5 py-1.5 text-sm"
      />
      <input
        placeholder="المسمى الوظيفي"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="rounded border border-line px-2.5 py-1.5 text-sm"
      />
      <input
        type="email"
        placeholder="البريد الإلكتروني"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="rounded border border-line px-2.5 py-1.5 text-sm"
      />
      <button
        type="submit"
        disabled={isPending}
        className="rounded bg-summit px-3 py-1.5 text-sm font-medium text-paper hover:bg-summit-400"
      >
        حفظ
      </button>
      <button type="button" onClick={() => setOpen(false)} className="text-sm text-ink-600">
        إلغاء
      </button>
      {error && <p className="w-full text-xs text-red-700">{error}</p>}
    </form>
  );
}
