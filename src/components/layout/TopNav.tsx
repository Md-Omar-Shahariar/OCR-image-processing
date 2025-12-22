import Link from "next/link";
import { useTranslation } from "next-i18next";
import LanguageToggle from "../ui/LanguageToggle";

function TopNav() {
  const { t } = useTranslation("common");

  return (
    <div className="w-full">
      <div className="max-w-6xl mx-auto px-4 pt-5 pb-2 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 border border-white/60 shadow-sm backdrop-blur hover:shadow-md transition"
        >
          <span className="text-sm font-semibold text-emerald-700">◎</span>
          <span className="text-sm font-bold text-slate-800">
            {t("nav.brand")}
          </span>
        </Link>
        <LanguageToggle />
      </div>
    </div>
  );
}

export default TopNav;
