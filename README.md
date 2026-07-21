# ECIOS Web — Authentication & Approval Foundation

Next.js 15 + Supabase Auth، يُفعّل عمليًا نموذج الصلاحيات المصمم في قاعدة البيانات:
تسجيل دخول / تسجيل ذاتي بموافقة العويني / دعوات مباشرة / إعادة تعيين كلمة المرور /
شاشة "بانتظار الموافقة" / لوحة موافقة العويني على الحسابات.

## التشغيل

```bash
npm install
cp .env.example .env.local   # ثم عبّئ NEXT_PUBLIC_SUPABASE_URL و NEXT_PUBLIC_SUPABASE_ANON_KEY
npm run dev
```

⚠️ **لم يتم تشغيل `npm install` أو اختبار البناء فعليًا في بيئة الإنشاء** لعدم توفر اتصال شبكة هناك.
راجع الكود بعد التثبيت، ونفّذ `npm run build` للتحقق من عدم وجود أخطاء TypeScript قبل النشر.

## تفعيل حساب محمد العويني (أول مرة فقط)

لا توجد شاشة لإنشاء `firm_owner` — هذا مقصود أمنيًا. الخطوات:

1. سجّل حسابًا عاديًا عبر `/register` بالبريد الإلكتروني الرسمي للعويني — سيُنشأ بحالة `pending_approval`.
2. من SQL Editor في Supabase، نفّذ يدويًا (مرة واحدة فقط):
   ```sql
   update profiles
   set role = 'firm_owner', status = 'active', is_global = true, approved_at = now()
   where email = 'mohammed@vantage.example.com';
   ```
3. من هذه اللحظة، يملك العويني تحكمًا كاملاً عبر `/admin/approvals` للموافقة على بقية الفريق دون أي تدخل يدوي آخر في قاعدة البيانات.

## ما هو حقيقي وفعّال الآن

- تسجيل الدخول / الخروج، تسجيل ذاتي، نسيت/إعادة تعيين كلمة المرور — متصلة فعليًا بـ Supabase Auth
- شاشة "بانتظار الموافقة" تعمل عبر `middleware.ts` بناءً على `profiles.status`
- لوحة `/admin/approvals` تقرأ وتكتب فعليًا في جداول `profiles` و `invitations` عبر Server Actions، محمية بـ RLS من جهة القاعدة أيضًا (دفاع مزدوج)
- **وحدة العملاء (CRM) فعلية**: `/clients` (قائمة مُصفّاة تلقائيًا عبر RLS حسب من هو مُسند إليه المستخدم)، `/clients/new` (إنشاء عميل + إسناد تلقائي للمنشئ في `organization_assignments`)، `/clients/[id]` (ملف العميل: جهات اتصال، سجل نشاط زمني حي، مشاريع) — كل الكتابة عبر Server Actions في `actions/clients.ts`

## ⚠️ فجوة معروفة: إرسال بريد الدعوات

دالة `inviteTeamMember` تُنشئ سجل الدعوة في قاعدة البيانات فقط. إرسال بريد فعلي يتطلب
استدعاء `supabase.auth.admin.inviteUserByEmail()` بمفتاح Service Role — وهذا **لا يجب**
تشغيله من الواجهة (متصفح) أو حتى من Server Action عادي، بل من Supabase Edge Function
معزولة. حاليًا الرابط يُعرض للعويني لمشاركته يدويًا. هذه أول خطوة منطقية في مرحلة الـ
Edge Functions القادمة.

## البنية

```
app/
  login/  register/  forgot-password/  reset-password/  pending-approval/
  (dashboard)/
    layout.tsx          -- شريط تنقل مشترك، يتحقق من الجلسة
    dashboard/          -- نقطة انطلاق مؤقتة بعد الدخول
    admin/approvals/    -- لوحة موافقة العويني (firm_owner فقط)
    clients/            -- قائمة العملاء، إنشاء عميل، ملف العميل التفصيلي
lib/supabase/           -- عملاء Supabase (متصفح / خادم)
middleware.ts           -- تحديث الجلسة + حماية المسارات حسب الحالة والدور
actions/approvals.ts    -- Server Actions للموافقة والدعوة
actions/clients.ts      -- Server Actions لإنشاء العملاء وجهات الاتصال وسجل النشاط
components/             -- عناصر واجهة مشتركة (AuthShell بهوية Vantage البصرية)
```


