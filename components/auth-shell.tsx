import type { ReactNode } from "react";

/**
 * Shared shell for every auth screen (login, register, forgot/reset password,
 * pending-approval). The left panel carries the one signature element for
 * the whole product: elevation contour lines, standing in for a consulting
 * firm's real job — reading an organization's terrain from above to find
 * the route to the summit. Everything else stays quiet on purpose.
 */
export function AuthShell({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen grid lg:grid-cols-[minmax(0,1fr)_480px] bg-paper">
      <div className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-summit-700 text-paper p-12">
        <ContourField />
        <div className="relative z-10">
          <span className="font-mono text-xs tracking-[0.2em] uppercase text-brass-100/80">
            Vantage · ECIOS
          </span>
        </div>
        <div className="relative z-10 max-w-md">
          <p className="font-display text-3xl leading-snug">
            نظام تشغيل استخباراتي لإدارة الاستشارات المؤسسية،
            <span className="text-brass-100"> من أول اتصال حتى إغلاق الأثر.</span>
          </p>
        </div>
        <div className="relative z-10 font-mono text-xs text-paper/50">
          Enterprise Consulting Intelligence Operating System
        </div>
      </div>

      <div className="flex flex-col justify-center px-8 py-16 sm:px-16 lg:px-14">
        <div className="mx-auto w-full max-w-sm">
          <span className="font-mono text-xs tracking-[0.2em] uppercase text-summit-400">
            {eyebrow}
          </span>
          <h1 className="mt-2 font-display text-3xl text-ink-900">{title}</h1>
          {subtitle && <p className="mt-2 text-sm text-ink-600">{subtitle}</p>}
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}

function ContourField() {
  // Concentric, hand-perturbed contour lines — each ring is a labeled
  // elevation band, echoing a topo map read by a consultant surveying
  // an organization's current state before charting the way up.
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.35]"
      viewBox="0 0 600 800"
      fill="none"
      aria-hidden="true"
    >
      {[...Array(9)].map((_, i) => {
        const r = 60 + i * 42;
        const cx = 470;
        const cy = 120;
        return (
          <path
            key={i}
            d={describeWobblyCircle(cx, cy, r, i)}
            stroke="#B08D57"
            strokeOpacity={0.55 - i * 0.03}
            strokeWidth={1}
            fill="none"
          />
        );
      })}
    </svg>
  );
}

// Deterministic wobble (no Math.random -> stable SSR output) so each ring
// reads as a natural elevation contour rather than a perfect circle.
function describeWobblyCircle(cx: number, cy: number, r: number, seed: number) {
  const points: string[] = [];
  const steps = 40;
  for (let i = 0; i <= steps; i++) {
    const angle = (i / steps) * Math.PI * 2;
    const wobble = Math.sin(angle * 3 + seed) * (r * 0.04) + Math.cos(angle * 5 + seed * 2) * (r * 0.02);
    const x = cx + (r + wobble) * Math.cos(angle);
    const y = cy + (r + wobble) * Math.sin(angle);
    points.push(`${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return points.join(" ") + " Z";
}
