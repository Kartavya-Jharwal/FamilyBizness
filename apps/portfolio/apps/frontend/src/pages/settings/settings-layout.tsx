import { ApplicationShell, Tabs, TabsList, TabsTrigger, buttonVariants } from "@fb/ui";
import { Icons } from "@fb/ui/components/ui/icons";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

export default function SettingsLayout() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const sections = useMemo(
    () => [
      {
        title: t("settings:nav.sections.preferences"),
        items: [
          { title: "Office & profiles", href: "office", subtitle: "Reporting perimeter and visitor profiles", icon: <Icons.Folder className="size-5" /> },
          {
            title: t("settings:nav.items.general"),
            href: "general",
            subtitle: t("settings:nav.subtitles.general"),
            icon: <Icons.Settings2 className="size-5" />,
          },
          {
            title: t("settings:nav.items.appearance"),
            href: "appearance",
            subtitle: t("settings:nav.subtitles.appearance"),
            icon: <Icons.Monitor className="size-5" />,
          },
        ],
      },
      {
        title: t("settings:nav.sections.finance"),
        items: [
          {
            title: t("settings:nav.items.accounts"),
            href: "accounts",
            subtitle: t("settings:nav.subtitles.accounts"),
            icon: <Icons.CreditCard className="size-5" />,
          },
          {
            title: t("settings:nav.items.portfolios"),
            href: "portfolios",
            subtitle: t("settings:nav.subtitles.portfolios"),
            icon: <Icons.Folder className="size-5" />,
          },
          {
            title: t("settings:nav.items.contribution_limits"),
            href: "contribution-limits",
            subtitle: t("settings:nav.subtitles.contribution_limits"),
            icon: <Icons.TrendingUp className="size-5" />,
          },
          {
            title: t("settings:nav.items.spending"),
            href: "spending",
            subtitle: t("settings:nav.subtitles.spending"),
            icon: <Icons.Wallet className="size-5" />,
          },
        ],
      },
      {
        title: t("settings:nav.sections.data"),
        items: [
          { title: "Sources & review", href: "sources", subtitle: "Source records and review evidence", icon: <Icons.Activity className="size-5" /> },
          {
            title: t("settings:nav.items.securities"),
            href: "securities",
            subtitle: t("settings:nav.subtitles.securities"),
            icon: <Icons.BadgeDollarSign className="size-5" />,
          },
          {
            title: t("settings:nav.items.classifications"),
            href: "taxonomies",
            subtitle: t("settings:nav.subtitles.classifications"),
            icon: <Icons.Blocks className="size-5" />,
          },
          { title: "Family records & recovery", href: "records", subtitle: "Case identity, saved records and portable recovery", icon: <Icons.Folder className="size-5" /> },
          {
            title: t("settings:nav.items.backup_export"),
            href: "exports",
            subtitle: t("settings:nav.subtitles.backup_export"),
            icon: <Icons.Download className="size-5" />,
          },
        ],
      },
      {
        title: t("settings:nav.sections.about"),
        items: [
          {
            title: t("settings:nav.items.about"),
            href: "about",
            subtitle: t("settings:nav.subtitles.about"),
            icon: <Icons.InfoCircle className="size-5" />,
          },
        ],
      },
    ],
    [t],
  );

  const activePath = location.pathname.split("/")[2] || "general";
  const categoryIndex = Math.max(0, sections.findIndex(section => section.items.some(item => item.href === activePath)));
  const category = sections[categoryIndex];
  return <ApplicationShell className="settings-root app-shell min-h-screen overflow-x-hidden">
    <main className="mx-auto w-full max-w-6xl space-y-5 p-4 pb-[var(--mobile-nav-total-offset)] md:p-6">
      <header><h1 className="text-3xl font-semibold tracking-tight">{t("settings:title")}</h1><p className="mt-2 text-sm text-muted-foreground">Office preferences, data and records in one place.</p></header>
      <Tabs value={String(categoryIndex)} onValueChange={value => navigate(`/settings/${sections[Number(value)].items[0].href}`)}>
        <TabsList className="h-auto flex-wrap" aria-label="Settings categories">{sections.map((section,index) => <TabsTrigger key={section.title} value={String(index)}>{section.title}</TabsTrigger>)}</TabsList>
      </Tabs>
      <nav className="flex flex-wrap gap-2" aria-label={`${category.title} settings`}>{category.items.map(item => <Link key={item.href} className={buttonVariants({variant:activePath===item.href?"secondary":"ghost"})} to={`/settings/${item.href}`} aria-current={activePath===item.href?"page":undefined}>{item.title}</Link>)}</nav>
      <div className="min-w-0"><Outlet /></div>
    </main>
  </ApplicationShell>;
}
