import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@fb/ui";

export default function AnalysisAttributionPage() {
  const legalRoot = `${import.meta.env.BASE_URL}open-source/ghostfolio/`;
  return (
    <main className="mx-auto max-w-3xl space-y-5 p-4 md:p-6">
      <Link
        to="/insights?tab=x-ray"
        className="text-sm underline underline-offset-4"
      >
        Back to X-ray
      </Link>
      <h1 className="text-2xl font-semibold">Open-source attribution</h1>
      <Card><CardHeader><CardTitle>Constitution policy module</CardTitle></CardHeader><CardContent className="space-y-3 text-sm"><p>Adapted from a user-supplied project authored by a separate agent from an exploratory policy-as-code prompt. The original prompt was not supplied. No third-party upstream identity or endorsement is asserted.</p><a className="underline" href={`${import.meta.env.BASE_URL}open-source/policy-module/NOTICE.md`}>Source and modification record</a><p><a className="underline" href={`${import.meta.env.BASE_URL}open-source/policy-module/zod-LICENSE`}>Zod dependency license</a></p></CardContent></Card>
      <Card>
        <CardHeader>
          <CardTitle>Portfolio application and shared UI</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm leading-relaxed">
          <p>
            This is a modified fork of Wealthfolio, combined with the analysis
            adaptation below. Original copyright, licenses and attribution
            remain applicable. Product branding and original logos have been
            removed. No affiliation or endorsement is claimed.
          </p>
          <a
            className="block underline underline-offset-4"
            href="https://github.com/wealthfolio/wealthfolio"
            target="_blank"
            rel="noreferrer"
          >
            Wealthfolio upstream source
          </a>
          <ul className="list-disc space-y-2 pl-5">
            {[
              ["LICENSE", "Original application license"],
              ["NOTICE.md", "Original attribution and modification record"],
              ["TRADEMARKS.md", "Original trademark record"],
              ["sdk-LICENSE", "Original SDK license"],
              ["Design-NOTICE.md", "Shared design foundations"],
            ].map(([file, label]) => (
              <li key={file}>
                <a
                  className="underline underline-offset-4"
                  href={`${import.meta.env.BASE_URL}open-source/portfolio/${file}`}
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Font licenses</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc space-y-2 pl-5 text-sm">
            {[
              "inter",
              "rubik",
              "merriweather",
              "jetbrains-mono",
              "ibm-plex-mono",
            ].map((font) => (
              <li key={font}>
                <a
                  className="underline underline-offset-4"
                  href={`${import.meta.env.BASE_URL}open-source/fonts/${font}-LICENSE`}
                >
                  {font} — original font license
                </a>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Analysis features</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm leading-relaxed">
          <p>
            This is a modified fork of Ghostfolio. The X-ray review workflow,
            explanatory analysis layout and fund look-through approach have been
            adapted to the host application in React.
          </p>
          <p>
            Original copyright and license notices remain applicable. These
            features are licensed under the GNU Affero General Public License
            version 3. This is not the official Ghostfolio product; no
            affiliation or endorsement is claimed. The upstream name is used for
            attribution only.
          </p>
          <a
            className="block underline underline-offset-4"
            href="https://github.com/ghostfolio/ghostfolio"
            target="_blank"
            rel="noreferrer"
          >
            Ghostfolio upstream source
          </a>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <a
                href={`${legalRoot}LICENSE`}
                className="underline underline-offset-4"
              >
                Original AGPL license
              </a>
            </li>
            <li>
              <a
                href={`${legalRoot}NOTICE.md`}
                className="underline underline-offset-4"
              >
                Source provenance and modification notice
              </a>
            </li>
            <li>
              <a
                href={`${legalRoot}TRADEMARKS.md`}
                className="underline underline-offset-4"
              >
                Trademark attribution
              </a>
            </li>
          </ul>
          <p className="text-muted-foreground">
            The host retains its own Wealthfolio attribution and shared
            design-foundation notices. Analysis screens use the host theme and
            canonical design tokens.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
