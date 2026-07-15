"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();
  return (
    <button
      onClick={async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push("/login");
        router.refresh();
      }}
      className="rounded border border-line px-4 py-2 text-sm font-medium text-ink-700 hover:bg-line/30"
    >
      تسجيل الخروج
    </button>
  );
}
