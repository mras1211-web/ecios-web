"use client";

import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AuthShell } from "@/components/auth-shell";
import { Field, SubmitButton, FormNotice } from "@/components/ui/field";

const schema = z
  .object({
    fullName: z.string().min(2, "أدخل الاسم الكامل"),
    email: z.string().email("أدخل بريدًا إلكترونيًا صحيحًا"),
    password: z.string().min(8, "8 أحرف على الأقل"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "كلمتا المرور غير متطابقتين",
    path: ["confirmPassword"],
  });
type FormValues = z.infer<typeof schema>;

// useSearchParams() forces Next.js to bail out of static prerendering for
// whatever reads it, so that part must sit inside its own <Suspense>
// boundary — otherwise `next build` fails even though `next dev` works fine.
export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterForm />
    </Suspense>
  );
}

function RegisterForm() {
  const searchParams = useSearchParams();
  const inviteToken = searchParams.get("invite");
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    setServerError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: { full_name: values.fullName, invite_token: inviteToken ?? undefined },
        emailRedirectTo: `${window.location.origin}/login`,
      },
    });

    if (error) {
      setServerError(
        error.message.includes("already registered")
          ? "هذا البريد الإلكتروني مسجّل مسبقًا"
          : "تعذّر إنشاء الحساب، حاول مرة أخرى"
      );
      return;
    }
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <AuthShell eyebrow="تم إرسال الطلب" title="تحقق من بريدك الإلكتروني">
        <FormNotice kind="success">
          أرسلنا رابط تفعيل إلى بريدك الإلكتروني. بعد التفعيل،{" "}
          {inviteToken
            ? "سيُفعَّل حسابك مباشرة وفق الدور المحدد في الدعوة."
            : "سيظهر طلبك في قائمة الحسابات بانتظار موافقة محمد العويني قبل أن تتمكن من الدخول."}
        </FormNotice>
        <Link href="/login" className="text-sm font-medium text-summit-400 hover:text-summit">
          العودة إلى تسجيل الدخول
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      eyebrow="طلب انضمام"
      title="إنشاء حساب"
      subtitle={
        inviteToken
          ? "لديك دعوة صالحة — أكمل بياناتك لتفعيل حسابك مباشرة"
          : "سيُراجع محمد العويني طلبك قبل تفعيل الحساب"
      }
    >
      {serverError && <FormNotice kind="error">{serverError}</FormNotice>}
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Field label="الاسم الكامل" id="fullName" autoComplete="name" error={errors.fullName?.message} {...register("fullName")} />
        <Field label="البريد الإلكتروني" id="email" type="email" autoComplete="email" error={errors.email?.message} {...register("email")} />
        <Field label="كلمة المرور" id="password" type="password" autoComplete="new-password" error={errors.password?.message} {...register("password")} />
        <Field
          label="تأكيد كلمة المرور"
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />
        <div className="mt-2 mb-5">
          <SubmitButton loading={isSubmitting}>إرسال طلب الانضمام</SubmitButton>
        </div>
      </form>
      <p className="text-center text-sm text-ink-600">
        لديك حساب بالفعل؟{" "}
        <Link href="/login" className="font-medium text-summit-400 hover:text-summit">
          تسجيل الدخول
        </Link>
      </p>
    </AuthShell>
  );
}
