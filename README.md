# Hovato website

Marketing site for **Hovato**, a growing family of stays in Kochi, Kerala. At launch:

| Stay | What it is | Where |
| --- | --- | --- |
| H. Halcyon Suites | 7 two-bedroom (2 BHK) serviced apartments | Manjummal, Ernakulam |
| Bohom Stayora | 13 attached, budget-friendly rooms | Near Cochin International Airport |
| Hovato Brown | 1 private service apartment | Near Cochin International Airport |

Built with [Astro](https://astro.build) (static HTML), GSAP + Lenis for motion. No backend: bookings are sent as a pre-written WhatsApp (or email) message.

## Run it

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # outputs static files to dist/
```

Deploy on Netlify: build command `npm run build`, publish directory `dist` (already set in `netlify.toml`).

## Where things live

- `src/data/site.ts`: phone, WhatsApp, email, social links, check-in/out times
- `src/data/stays.ts`: everything about each stay (copy, facts, amenities, FAQs, photos, colours)
- `src/data/home.ts`: home page content (hero slides, "Find your stay", the Hovato standard, nearby places, FAQs)
- `src/assets/images/`: photos (Astro resizes and converts them to AVIF/WebP at build time)
- `public/og/`: social share images

## Adding a new stay

The site is built so a new property is one data entry, not a redesign. No page copy counts or lists the stays.

1. Put its photos in `src/assets/images/`.
2. In `src/data/stays.ts`, copy an existing entry, give it a new `slug`, and add that slug to the `StaySlug` type.
3. Set its `pin` (map position, see the projection note in `src/components/MapKochi.astro`) and `route` to the airport.
4. Optionally point a "What brings you to Kochi?" option at it in `src/data/home.ts`.

The home page cards, hero slideshow, stats, menus, booking drawer, map, footer, sitemap, search-engine data and its own `/stays/<slug>/` page all update from that entry. Add a social image at `public/og/<slug>.jpg`.

## Before launch: confirm with Hovato

Only the stay names, locations and unit counts came from Hovato. Everything below is a placeholder or an assumption:

1. **Contact details** in `src/data/site.ts`: phone (currently `+91 00000 00000`), WhatsApp number (empty, so buttons open WhatsApp's chat picker), email (`hello@hovato.com`), Instagram and Facebook.
2. **Domain** in `astro.config.mjs` (`site`) and `public/robots.txt`.
3. **Photos.** All are Unsplash placeholders (see `ATTRIBUTIONS.md`). Replace with real photos of each property. Keep the same filenames, or update the imports in `src/data/`. Then remove the "Photos are for illustration…" note on the stay pages.
4. **Amenities** for each stay (Wi-Fi, AC, kitchen kit, parking, power backup, washing machine…).
5. **Sleeping capacity** (`maxGuestsPerUnit`): set to 4 per Halcyon apartment, 2 per Stayora room, 4 for Hovato Brown. The booking form uses these.
6. **Service promises**: 24/7 host availability, airport pickups on request, late check-in, long-stay rates, "best rate when you book direct", daily housekeeping.
7. **Check-in 2:00 pm / check-out 11:00 am.**
8. **Travel times** on the stay pages and in "Explore Kochi" are approximate road times.
9. **Exact addresses** for the airport stays. The map places them near the airport, and the structured data uses Nedumbassery as the locality.
10. **Logo.** The arch mark and wordmark were designed for this site. Swap them in `src/components/Logo.astro` if Hovato has an official logo.
