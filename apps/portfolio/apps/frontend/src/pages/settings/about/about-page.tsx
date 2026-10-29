import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@fb/ui";
import { SettingsHeader } from "../settings-header";
export default function AboutSettingsPage() {
  return (
    <div className="space-y-6">
      <SettingsHeader
        heading="About FamilyBizness"
        text="Local prototype with fictional sample data."
      />
      <Card>
        <CardHeader>
          <CardTitle>Combined portfolio prototype</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <p>
            Portfolio workflows and analysis tools share one application, one
            sample-data source and one theme system.
          </p>
          <p>
            The assistant is scripted. Sample figures illustrate the interface;
            no market-data service or AI model is connected.
          </p>
          <Link to="/open-source" className="underline underline-offset-4">
            Open-source licenses and attribution
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
