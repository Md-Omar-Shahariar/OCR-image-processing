/** @type {import('next-i18next').UserConfig} */
const config = {
  i18n: {
    defaultLocale: "en",
    locales: ["en", "ja"],
  },
  reloadOnPrerender: process.env.NODE_ENV === "development",
  localeDetection: true,
};

module.exports = config;
