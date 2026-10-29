import { Card, CardContent, CardHeader, CardTitle, Button } from "@fb/ui";
import { SettingsHeader } from "../settings-header";
import { getDemoStore, demoHoldings } from "@/adapters/static-store";
export default function ExportSettingsPage() {
  function download() {
    const data = {
      kind: "fictional-sample",
      accounts: getDemoStore().accounts,
      holdings: demoHoldings(),
      goals: getDemoStore().goals,
    };
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "FamilyBizness - Sample Snapshot.json";
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return (
    <div className="space-y-6">
      <SettingsHeader
        heading="Sample data export"
        text="Download the fictional data currently shown in this browser."
      />
      <Card>
        <CardHeader>
          <CardTitle>Local JSON snapshot</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <p>
            Includes sample accounts, holdings and goals. This is a prototype
            snapshot, not a database backup.
          </p>
          <Button onClick={download}>Download sample snapshot</Button>
        </CardContent>
      </Card>
    </div>
  );
}
