import type { APIRoute } from "astro";
import { stays } from "../data/stays";

export const GET: APIRoute = ({ site }) => {
  const base = (site?.origin ?? "https://www.hovato.com").replace(/\/$/, "");
  const paths = ["/", ...stays.map((s) => `/stays/${s.slug}/`)];
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths.map((p) => `  <url><loc>${base}${p}</loc></url>`).join("\n")}
</urlset>`;
  return new Response(body, { headers: { "Content-Type": "application/xml" } });
};
