"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createOrganization } from "@/actions/clients";
import { Field, SubmitButton, FormNotice } from "@/components/ui/field";

const schema = z.object({
  name: z.string().min(2, "أدخل اسم المؤسسة"),
  legalName: z.string().optional(),
  industry: z.string().optional(),
  sector: z.string().optional(),
  country: z.string().optional(),
  city: z.string().optional(),
  website: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("بريد إلكتروني غير صحيح").optional().or(z.literal("")),
  description: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export function ClientForm() {
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  function onSubmit(values: FormValues) {
    setServerError(null);
    startTransition(async () => {
      const res = await createOrganization(values);
      // createOrganization redirects on success, so reaching here means it failed
      if (res?.error) setServerError(res.error);
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="max-w-2xl">
      {serverError && <FormNotice kind="error">{serverError}</FormNotice>}

      <div className="grid gap-x-4 sm:grid-cols-2">
        <Field label="اسم المؤسسة" id="name" error={errors.name?.message} {...register("name")} />
        <Field label="الاسم القانوني" id="legalName" {...register("legalName")} />
        <Field label="القطاع" id="industry" placeholder="بنوك، صحة، تصنيع…" {...register("industry")} />
        <Field label="النشاط الفرعي" id="sector" {...register("sector")} />
        <Field label="الدولة" id="country" {...register("country")} />
        <Field label="المدينة" id="city" {...register("city")} />
        <Field label="الموقع الإلكتروني" id="website" {...register("website")} />
        <Field label="الهاتف" id="phone" {...register("phone")} />
        <Field label="البريد الإلكتروني" id="email" type="email" error={errors.email?.message} {...register("email")} />
      </div>

      <div className="mb-4">
        <label htmlFor="description" className="mb-1.5 block text-sm font-medium text-ink-800">
          وصف موجز
        </label>
        <textarea
          id="description"
          rows={3}
          className="w-full rounded border border-line bg-white px-3.5 py-2.5 text-sm focus:border-summit focus:outline-none focus:ring-1 focus:ring-summit"
          {...register("description")}
        />
      </div>

      <SubmitButton loading={isPending}>إنشاء سجل العميل</SubmitButton>
    </form>
  );
}
