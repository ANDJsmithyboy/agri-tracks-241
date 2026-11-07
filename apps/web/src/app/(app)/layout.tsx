import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/app-shell";

// Les pages applicatives sont authentifiées et par utilisateur :
// routes « bloquantes » (non prerender). Requis avec cacheComponents
// car le shell utilise des hooks runtime (usePathname…).
export const instant = false;

export default function AppLayout({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
