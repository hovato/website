// @ts-check
import { defineConfig, fontProviders } from "astro/config";

export default defineConfig({
  // TODO: replace with Hovato's real domain before launch (used for canonical URLs, sitemap and social cards).
  site: "https://www.hovato.com",
  trailingSlash: "ignore",
  build: { format: "directory" },
  prefetch: { prefetchAll: true, defaultStrategy: "hover" },
  fonts: [
    {
      provider: fontProviders.google(),
      name: "Instrument Serif",
      cssVariable: "--font-display",
      weights: [400],
      styles: ["normal", "italic"],
      subsets: ["latin"],
      fallbacks: ["Georgia", "serif"],
    },
    {
      provider: fontProviders.google(),
      name: "Manrope",
      cssVariable: "--font-sans",
      weights: ["300 800"],
      styles: ["normal"],
      subsets: ["latin"],
      fallbacks: ["system-ui", "sans-serif"],
    },
  ],
});
