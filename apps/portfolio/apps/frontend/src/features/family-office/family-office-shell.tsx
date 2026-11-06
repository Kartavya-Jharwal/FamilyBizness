import {useEffect} from "react";
import {useFamilyName,familyTitle} from "./family-name";
import "./family-office.css";
import type { ReactNode } from "react";

export function FamilyOfficeShell({ title, children }: { title: string; children: ReactNode }) {
  const name=useFamilyName();
  useEffect(()=>{document.title=`${title} | ${familyTitle()}`;},[title,name]);
  return <main className="fo-workspace mx-auto w-full max-w-7xl flex flex-col gap-6 p-4 pb-28 md:p-6">
    <header className="fo-workspace-heading"><h1>{title}</h1></header>
    {children}
  </main>;
}
