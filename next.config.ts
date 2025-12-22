import type { NextConfig } from "next";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { i18n } = require("./next-i18next.config");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  i18n,
};

export default nextConfig;
