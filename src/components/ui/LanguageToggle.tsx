import { useCallback } from "react";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";

function LanguageToggle() {
  const router = useRouter();
  const { i18n, t } = useTranslation("common");
  const resolvedLanguage = i18n.resolvedLanguage || i18n.language;
  const routerLocale = router.locale;
  const activeLocale = (routerLocale || resolvedLanguage || "en").split("-")[0];
  const labelLanguageMode = t("nav.languageMode", { defaultValue: "Language mode" });
  const labelEnglishShort = t("nav.englishShort", { defaultValue: "EN" });
  const labelJapaneseShort = t("nav.japaneseShort", { defaultValue: "JA" });
  const labelLanguage = t("nav.language", { defaultValue: "Language" });

  const switchLanguage = useCallback(
    (locale: string) => {
      if (locale === i18n.language) return;
      i18n.changeLanguage(locale);
      const { pathname, query, asPath } = router;
      router.push({ pathname, query }, asPath, { locale });
    },
    [i18n, router]
  );

  return (
    <div className="flex items-center gap-2 rounded-full bg-white/80 px-2 py-1 border border-white/60 shadow-sm backdrop-blur">
      <span className="text-xs font-semibold text-slate-500 px-2 hidden sm:inline">
        {labelLanguageMode}
      </span>
      {[
        { locale: "en", label: labelEnglishShort },
        { locale: "ja", label: labelJapaneseShort },
      ].map((item) => {
        const isActive = activeLocale === item.locale;
        return (
          <button
            key={item.locale}
            type="button"
            onClick={() => switchLanguage(item.locale)}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
              isActive
                ? "bg-gradient-to-r from-emerald-500 to-sky-500 text-white shadow"
                : "text-slate-600 hover:text-emerald-700"
            }`}
            aria-pressed={isActive}
            aria-label={`${labelLanguage}: ${item.label}`}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

export default LanguageToggle;
