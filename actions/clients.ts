"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const ORG_SIZES = ["micro", "small", "medium", "large", "enterprise"] as const;
const OWNERSHIP_TYPES = ["government", "private", "family", "public_listed", "ngo", "mixed"] as const;

export type CreateOrgInput = {
  name: string;
  legalName?: string;
  industry?: string;
  sector?: string;
  country?: string;
  city?: string;
  website?: string;
  phone?: string;
  email?: string;
  employeeCount?: number;
  annualRevenue?: number;
  orgSize?: (typeof ORG_SIZES)[number];
  ownershipType?: (typeof OWNERSHIP_TYPES)[number];
  description?: string;
};

/**
 * Creates a client organization AND assigns the creating consultant to it
 * in the same flow — without an organization_assignments row the creator
 * would immediately lose visibility into the record they just made, since
 * RLS scopes staff strictly to explicit assignments (see migration 005).
 */
export async function createOrganization(input: CreateOrgInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "غير مصرح" };

  const { data: org, error } = await supabase
    .from("organizations")
    .insert({
      name: input.name,
      legal_name: input.legalName || null,
      industry: input.industry || null,
      sector: input.sector || null,
      country: input.country || null,
      city: input.city || null,
      website: input.website || null,
      phone: input.phone || null,
      email: input.email || null,
      employee_count: input.employeeCount ?? null,
      annual_revenue: input.annualRevenue ?? null,
      org_size: input.orgSize || null,
      ownership_type: input.ownershipType || null,
      description: input.description || null,
      primary_consultant_id: user.id,
      created_by: user.id,
      health_score: 70,
      relationship_score: 70,
    })
    .select("id")
    .single();

  if (error || !org) return { error: "تعذّر إنشاء سجل العميل" };

  await supabase.from("organization_assignments").insert({
    organization_id: org.id,
    user_id: user.id,
    role_on_account: "lead",
    assigned_by: user.id,
  });

  revalidatePath("/clients");
  redirect(`/clients/${org.id}`);
}

export async function addContact(organizationId: string, formData: {
  fullName: string;
  title?: string;
  email?: string;
  phone?: string;
  isPrimary?: boolean;
  isDecisionMaker?: boolean;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "غير مصرح" };

  const { error } = await supabase.from("contacts").insert({
    organization_id: organizationId,
    full_name: formData.fullName,
    title: formData.title || null,
    email: formData.email || null,
    phone: formData.phone || null,
    is_primary: formData.isPrimary ?? false,
    is_decision_maker: formData.isDecisionMaker ?? false,
    created_by: user.id,
  });

  if (error) return { error: "تعذّر إضافة جهة الاتصال" };
  revalidatePath(`/clients/${organizationId}`);
  return { error: null };
}

export async function addNote(organizationId: string, note: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "غير مصرح" };

  const { error } = await supabase.from("organization_timeline").insert({
    organization_id: organizationId,
    event_type: "note",
    title: "ملاحظة",
    description: note,
    created_by: user.id,
  });

  if (error) return { error: "تعذّر حفظ الملاحظة" };
  revalidatePath(`/clients/${organizationId}`);
  return { error: null };
}

export async function updateHealthScore(organizationId: string, healthScore: number, relationshipScore: number) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("organizations")
    .update({ health_score: healthScore, relationship_score: relationshipScore })
    .eq("id", organizationId);

  if (error) return { error: "تعذّر تحديث المؤشر" };
  revalidatePath(`/clients/${organizationId}`);
  return { error: null };
}
