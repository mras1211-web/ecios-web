import { redirect } from "next/navigation";

// middleware handles the real auth-state branching (signed out -> /login,
// pending -> /pending-approval); this only covers a signed-in, active user
// landing on "/".
export default function RootPage() {
  redirect("/dashboard");
}
