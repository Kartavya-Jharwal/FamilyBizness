import { Separator } from "@fb/ui/components/ui/separator";
import { useTranslation } from "react-i18next";
import { SettingsHeader } from "../settings-header";
import { BaseCurrencySettings } from "./currency-settings";
import { ExchangeRatesSettings } from "./exchange-rates/exchange-rates-settings";
import { LanguageRegionSettings } from "./language-region-settings";

export default function GeneralSettingsPage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <SettingsHeader
        heading={t("settings:general")}
        text={t("settings:general_page_description")}
      />
      <Separator />
      <BaseCurrencySettings />
      <LanguageRegionSettings />
      <div className="pt-6">
        <ExchangeRatesSettings />
      </div>
    </div>
  );
}
