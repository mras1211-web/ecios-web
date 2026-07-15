"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AuthShell } from "@/components/auth-shell";
import { Field, SubmitButton, FormNotice } from "@/components/ui/field";

const schema = z
  .object({
    password: z.string().min(8, "8 أحرف على الأقل"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "كلمتا المرور غير متطابقتين",
    path: ["confirmPassword"],
  });
type FormValues = z.infer<typeof schema>;

// Reached via the emailed reset link, which Supabase exchanges for a
// short-lived recovery session before the user lands here.
export default function ResetPasswordPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    setServerError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: values.password });
    if (error) {
      setServerError("انتهت صلاحية الرابط أو حدث خطأ، أعد طلب رابط جديد");
      return;
    }
    router.push("/login");
  }

  return (
    <AuthShell eyebrow="إعادة تعيين كلمة المرور" title="اختر كلمة مرور جديدة">
      {serverError && <FormNotice kind="error">{serverError}</FormNotice>}
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Field label="كلمة المرور الجديدة" id="password" type="password" autoComplete="new-password" error={errors.password?.message} {...register("password")} />
        <Field
          label="تأكيد كلمة المرور"
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />
        <div className="mt-2">
          <SubmitButton loading={isSubmitting}>حفظ كلمة المرور</SubmitButton>
        </div>
      </form>
    </AuthShell>
  );
}
