import { ClientForm } from "@/components/clients/client-form";

export default function NewClientPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <span className="font-mono text-xs uppercase tracking-[0.2em] text-summit-400">عملاء</span>
      <h1 className="mt-1 mb-6 font-display text-2xl text-ink-900">عميل جديد</h1>
      <ClientForm />
    </div>
  );
}
