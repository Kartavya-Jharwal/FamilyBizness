import { lazy, Suspense } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@fb/ui";

const ConstitutionChecksWorkspace = lazy(() => import("./constitution-checks-workspace").then(module => ({ default: module.ConstitutionChecksWorkspace })));
const SourcesWorkspace = lazy(() => import("./sources-page").then(module => ({ default: module.SourcesWorkspace })));
const PolicyWorkspace = lazy(() => import("./policy-page").then(module => ({ default: module.PolicyWorkspace })));

export function ConstitutionLinkageWorkspace() {
  return <div className="space-y-4">
    <p className="text-sm text-muted-foreground">Follow a constitutional clause from its source and interpretation to the rule used by a planning tool. Review and activation remain explicit decisions.</p>
    <Tabs defaultValue="checks">
      <TabsList aria-label="Constitution linkage sections" className="h-auto flex-wrap justify-start">
        <TabsTrigger value="checks">Constitution checks</TabsTrigger>
        <TabsTrigger value="sources">Source clauses</TabsTrigger>
        <TabsTrigger value="rules">Other rule drafts</TabsTrigger>
      </TabsList>
      <TabsContent value="checks"><Suspense fallback={<p>Opening constitution checks...</p>}><ConstitutionChecksWorkspace /></Suspense></TabsContent>
      <TabsContent value="sources"><Suspense fallback={<p>Opening source clauses...</p>}><SourcesWorkspace /></Suspense></TabsContent>
      <TabsContent value="rules"><Suspense fallback={<p>Opening operating rules...</p>}><PolicyWorkspace /></Suspense></TabsContent>
    </Tabs>
  </div>;
}
