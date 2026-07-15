"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const ASSIGNABLE_ROLES = [
  "managing_consultant",
  "senior_consultant",
  "consultant",
  "project_manager",
  "business_analyst",
  "viewer",
  "auditor",
] as const;

/**
 * Approves a self-registered user pending review, assigning their role.
 * RLS (`profiles_update_owner`) additionally enforces that only the
 * firm_owner can actually perform this update — this check here is just
 * a fast, friendly failure before hitting the database.
 */
export async function approveUser(userId: string, role: (typeof ASSIGNABLE_ROLES)[number]) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "غير مصرح" };

  const { error } = await supabase
    .from("profiles")
    .update({ status: "active", role, approved_by: user.id, approved_at: new Date().toISOString() })
    .eq("id", userId);

  if (error) return { error: "تعذّرت الموافقة على الحساب" };

  await supabase.from("audit_log").insert({
    actor_id: user.id,
    action: "user.approved",
    entity_type: "profiles",
    entity_id: userId,
    metadata: { role },
  });

  revalidatePath("/admin/approvals");
  return { error: null };
}

export async function rejectUser(userId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "غير مصرح" };

  const { error } = await supabase.from("profiles").update({ status: "suspended" }).eq("id", userId);
  if (error) return { error: "تعذّر رفض الطلب" };

  await supabase.from("audit_log").insert({
    actor_id: user.id,
    action: "user.rejected",
    entity_type: "profiles",
    entity_id: userId,
  });

  revalidatePath("/admin/approvals");
  return { error: null };
}

/**
 * Creates an invitation row. NOTE: this only writes the DB record that lets
 * the `handle_new_user` trigger auto-activate a matching signup. Actually
 * emailing the invite link requires Supabase's admin API (service-role key)
 * called from an Edge Function — not safe to run with the anon key used
 * here. Wire that Edge Function up before relying on this in production;
 * until then, share the /register?invite=<token> link manually.
 */
export async function inviteTeamMember(email: string, role: (typeof ASSIGNABLE_ROLES)[number]) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "غير مصرح" };

  const { data, error } = await supabase
    .from("invitations")
    .insert({ email, role, invited_by: user.id })
    .select("token")
    .single();

  if (error) return { error: "تعذّر إرسال الدعوة — قد يكون البريد مدعوًا مسبقًا" };

  revalidatePath("/admin/approvals");
  return { error: null, token: data.token as string };
}
