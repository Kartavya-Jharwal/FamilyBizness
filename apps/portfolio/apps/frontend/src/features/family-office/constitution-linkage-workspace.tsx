import { useSearchParams } from "react-router-dom";
import { selectedProfileId } from "@/features/profiles/session";
import { preparedOfficeId } from "@/features/profiles/profile-workspace";
import { FamilyCharterOverview } from "./family-charter-overview";
import { lazy, Suspense } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@fb/ui";

const ConstitutionChecksWorkspace = lazy(() => import("./constitution-checks-workspace").then(module => ({ default: module.ConstitutionChecksWorkspace })));
const SourcesWorkspace = lazy(() => import("./sources-page").then(module => ({ default: module.SourcesWorkspace })));
const PolicyWorkspace = lazy(() => import("./policy-page").then(module => ({ default: module.PolicyWorkspace })));

export function ConstitutionLinkageWorkspace() {
  const [params,setParams]=useSearchParams();
  const requested=params.get("section");
  const prepared=selectedProfileId()===preparedOfficeId;
  return <div className="space-y-4">
    <p className="text-sm text-muted-foreground">Follow a constitutional clause from its source and interpretation to the rule used by a planning tool. Review and activation remain explicit decisions.</p>
    <Tabs value={requested&&(prepared||requested!=="charter")&&["charter","checks","sources","rules"].includes(requested)?requested:prepared?"charter":"checks"} onValueChange={value=>setParams(current=>{const next=new URLSearchParams(current);next.set("section",String(value));return next;})}>
      <TabsList aria-label="Constitution linkage sections" className="h-auto flex-wrap justify-start">
        {prepared&&<TabsTrigger value="charter">Family charter</TabsTrigger>}
        <TabsTrigger value="checks">Constitution checks</TabsTrigger>
        <TabsTrigger value="sources">Source clauses</TabsTrigger>
        <TabsTrigger value="rules">Other rule drafts</TabsTrigger>
      </TabsList>
      {prepared&&<TabsContent value="charter"><FamilyCharterOverview/></TabsContent>}
      <TabsContent value="checks"><Suspense fallback={<p>Opening constitution checks...</p>}><ConstitutionChecksWorkspace /></Suspense></TabsContent>
      <TabsContent value="sources"><Suspense fallback={<p>Opening source clauses...</p>}><SourcesWorkspace /></Suspense></TabsContent>
      <TabsContent value="rules"><Suspense fallback={<p>Opening operating rules...</p>}><PolicyWorkspace /></Suspense></TabsContent>
    </Tabs>
  </div>;
}
