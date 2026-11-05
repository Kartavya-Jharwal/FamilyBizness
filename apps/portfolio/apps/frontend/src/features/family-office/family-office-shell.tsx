import type { ReactNode } from "react";

export function FamilyOfficeShell({ title, children }: { title: string; children: ReactNode }) {
  return <main className="mx-auto w-full max-w-7xl space-y-6 p-4 pb-28 md:p-6">
    <header><h1 className="text-3xl font-semibold tracking-tight">{title}</h1></header>
    {children}
  </main>;
}
