import "./family-office.css";
import type { ReactNode } from "react";

export function FamilyOfficeShell({ title, children }: { title: string; children: ReactNode }) {
  return <main className="fo-workspace mx-auto w-full max-w-7xl space-y-6 p-4 pb-28 md:p-6">
    <header className="fo-workspace-heading"><h1>{title}</h1></header>
    {children}
  </main>;
}
