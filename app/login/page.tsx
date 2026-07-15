"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AuthShell } from "@/components/auth-shell";
import { Field, SubmitButton, FormNotice } from "@/components/ui/field";

const schema = z.object({
  email: z.string().email("أدخل بريدًا إلكترونيًا صحيحًا"),
  password: z.string().min(1, "كلمة المرور مطلوبة"),
});
type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
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
    const { error } = await supabase.auth.signInWithPassword(values);

    if (error) {
      setServerError(
        error.message === "Invalid login credentials"
          ? "البريد الإلكتروني أو كلمة المرور غير صحيحة"
          : "تعذّر تسجيل الدخول، حاول مرة أخرى"
      );
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <AuthShell eyebrow="تسجيل الدخول" title="مرحبًا بعودتك" subtitle="ادخل إلى منصة ECIOS الخاصة بفريق فانتج">
      {serverError && <FormNotice kind="error">{serverError}</FormNotice>}
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Field
          label="البريد الإلكتروني"
          id="email"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register("email")}
        />
        <Field
          label="كلمة المرور"
          id="password"
          type="password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register("password")}
        />
        <div className="mb-5 flex justify-end">
          <Link href="/forgot-password" className="text-xs text-summit-400 hover:text-summit">
            نسيت كلمة المرور؟
          </Link>
        </div>
        <SubmitButton loading={isSubmitting}>تسجيل الدخول</SubmitButton>
      </form>
      <p className="mt-6 text-center text-sm text-ink-600">
        ليس لديك حساب؟{" "}
        <Link href="/register" className="font-medium text-summit-400 hover:text-summit">
          سجّل طلب انضمام
        </Link>
      </p>
    </AuthShell>
  );
}
