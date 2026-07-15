"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { AuthShell } from "@/components/auth-shell";
import { Field, SubmitButton, FormNotice } from "@/components/ui/field";

const schema = z.object({ email: z.string().email("أدخل بريدًا إلكترونيًا صحيحًا") });
type FormValues = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    const supabase = createClient();
    await supabase.auth.resetPasswordForEmail(values.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    // Always show the same success state regardless of whether the email
    // exists — avoids leaking which addresses are registered.
    setSent(true);
  }

  if (sent) {
    return (
      <AuthShell eyebrow="إعادة تعيين كلمة المرور" title="تحقق من بريدك">
        <FormNotice kind="success">
          إن كان البريد الإلكتروني مسجلاً لدينا، أرسلنا إليه رابط إعادة تعيين كلمة المرور.
        </FormNotice>
        <Link href="/login" className="text-sm font-medium text-summit-400 hover:text-summit">
          العودة إلى تسجيل الدخول
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell eyebrow="إعادة تعيين كلمة المرور" title="نسيت كلمة المرور؟" subtitle="سنرسل رابطًا لإعادة التعيين إلى بريدك">
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Field label="البريد الإلكتروني" id="email" type="email" autoComplete="email" error={errors.email?.message} {...register("email")} />
        <div className="mt-2 mb-5">
          <SubmitButton loading={isSubmitting}>إرسال رابط إعادة التعيين</SubmitButton>
        </div>
      </form>
      <Link href="/login" className="text-sm font-medium text-summit-400 hover:text-summit">
        العودة إلى تسجيل الدخول
      </Link>
    </AuthShell>
  );
}
