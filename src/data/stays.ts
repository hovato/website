// ─────────────────────────────────────────────────────────────────────────────
//  The three Hovato stays.
//
//  Confirmed by Hovato: names, locations, and the number and type of units.
//  Everything else (amenities, sleeping capacity, travel times, copy) is our
//  best reading of a property of that kind. It's marked TODO where it needs
//  checking. The photos are Unsplash placeholders until the real shoot.
// ─────────────────────────────────────────────────────────────────────────────
import type { ImageMetadata } from "astro";

import halcyonLiving from "../assets/images/halcyon-living.jpg";
import halcyonLiving2 from "../assets/images/halcyon-living-2.jpg";
import halcyonOpenPlan from "../assets/images/halcyon-open-plan.jpg";
import halcyonKitchen from "../assets/images/halcyon-kitchen.jpg";
import halcyonBedroom from "../assets/images/halcyon-bedroom.jpg";
import halcyonBedLight from "../assets/images/halcyon-bed-light.jpg";
import halcyonBath from "../assets/images/halcyon-bath.jpg";
import halcyonLounge from "../assets/images/halcyon-lounge.jpg";
import backwatersMist from "../assets/images/backwaters-mist.jpg";

import stayoraRoom from "../assets/images/stayora-room.jpg";
import stayoraTropical from "../assets/images/stayora-tropical.jpg";
import stayoraPillows from "../assets/images/stayora-pillows.jpg";
import stayoraRoom2 from "../assets/images/stayora-room-2.jpg";
import stayoraBright from "../assets/images/stayora-bright.jpg";
import stayoraShower from "../assets/images/stayora-shower.jpg";
import stayoraSunlit from "../assets/images/stayora-sunlit.jpg";
import stayoraWood from "../assets/images/stayora-wood.jpg";
import planeWindowSunset from "../assets/images/plane-window-sunset.jpg";

import brownBedroom from "../assets/images/brown-bedroom.jpg";
import brownLounge from "../assets/images/brown-lounge.jpg";
import brownSofa from "../assets/images/brown-sofa.jpg";
import brownReading from "../assets/images/brown-reading.jpg";
import brownBedroom2 from "../assets/images/brown-bedroom-2.jpg";
import brownBedroom3 from "../assets/images/brown-bedroom-3.jpg";
import brownKitchen from "../assets/images/brown-kitchen.jpg";
import brownMonsoon from "../assets/images/brown-monsoon.jpg";

export type StaySlug = "halcyon-suites" | "bohom-stayora" | "hovato-brown";

export interface Photo {
  src: ImageMetadata;
  alt: string;
}

export interface Stay {
  slug: StaySlug;
  index: string;
  name: string;
  /** Name split for large display type. */
  nameLines: [string, string];
  kind: string;
  /** e.g. "Seven two-bedroom apartments" */
  inventory: string;
  unit: { count: number; singular: string; plural: string };
  /** TODO: confirm how many guests each unit sleeps. */
  maxGuestsPerUnit: number;
  area: string;
  areaShort: string;
  airportTime: string;
  tagline: string;
  summary: string;
  intro: { heading: string; body: string[] };
  bestFor: string[];
  facts: { label: string; value: string }[];
  highlights: { icon: string; title: string; text: string }[];
  amenities: { icon: string; label: string }[];
  nearby: { place: string; time: string }[];
  faqs: { q: string; a: string }[];
  theme: { accent: string; tint: string; deep: string };
  hero: Photo;
  cardDetail: Photo;
  gallery: Photo[];
  /** Position on the illustrated Kochi map (see MapKochi.astro). */
  pin: { x: number; y: number };
  /** Route to the airport drawn on the map. */
  route: string;
}

const idAtCheckIn = {
  q: "What do I need to bring at check-in?",
  a: "A government-issued photo ID for every adult guest. Guests from outside India need their passport and visa, as Indian law requires us to register foreign nationals.",
};

export const stays: Stay[] = [
  {
    slug: "halcyon-suites",
    index: "01",
    name: "H. Halcyon Suites",
    nameLines: ["H. Halcyon", "Suites"],
    kind: "Serviced apartments",
    inventory: "Seven two-bedroom apartments",
    unit: { count: 7, singular: "apartment", plural: "apartments" },
    maxGuestsPerUnit: 4,
    area: "Manjummal, Ernakulam",
    areaShort: "Manjummal",
    airportTime: "About 40 min to the airport",
    tagline: "Two-bedroom apartments with room to breathe.",
    summary:
      "Seven two-bedroom apartments in one building in Manjummal, each with its own kitchen and living room. A good fit for families, work teams and longer stays.",
    intro: {
      heading: "Halcyon (adj.): calm, peaceful, quietly happy.",
      body: [
        "That's the brief for every apartment here. Two proper bedrooms, a hall to gather in and a kitchen you'll actually use, in a residential pocket of Manjummal.",
        "Kalamassery, Edappally and the Aluva highway are a short drive away, so the city is close without being outside your window. Stay a weekend, a month or a whole season.",
      ],
    },
    bestFor: ["Families", "Long stays", "Work teams", "Visiting relatives"],
    facts: [
      { label: "Apartments", value: "7" },
      { label: "Layout", value: "2 BHK" },
      { label: "Sleeps", value: "Up to 4" },
      { label: "Airport", value: "≈ 40 min" },
    ],
    highlights: [
      { icon: "bed-double", title: "Two real bedrooms", text: "Separate rooms with their own doors, so early risers and night owls can both sleep." },
      { icon: "cooking-pot", title: "A kitchen that cooks", text: "Everything you need for breakfast, a quick dinner or a full Sunday lunch." },
      { icon: "sofa", title: "Space to gather", text: "A living and dining hall for movie nights, long dinners and work calls." },
      { icon: "sparkles", title: "Quietly looked after", text: "Housekeeping and fresh linen, without the fuss of a hotel." },
    ],
    // TODO: confirm amenities with Hovato.
    amenities: [
      { icon: "wifi", label: "High-speed Wi-Fi" },
      { icon: "snowflake", label: "Air-conditioned bedrooms" },
      { icon: "cooking-pot", label: "Equipped kitchen" },
      { icon: "refrigerator", label: "Refrigerator" },
      { icon: "tv", label: "Smart TV" },
      { icon: "droplets", label: "Hot water" },
      { icon: "zap", label: "Power backup" },
      { icon: "square-parking", label: "Parking" },
      { icon: "sparkles", label: "Housekeeping" },
      { icon: "laptop", label: "Space to work" },
    ],
    // TODO: travel times are approximate road times and should be checked.
    nearby: [
      { place: "Kalamassery", time: "10 min" },
      { place: "Edappally & Lulu Mall", time: "20 min" },
      { place: "Aluva", time: "20 min" },
      { place: "Cochin International Airport", time: "40 min" },
      { place: "MG Road, Ernakulam", time: "40 min" },
      { place: "Fort Kochi", time: "1 hr" },
    ],
    faqs: [
      {
        q: "Can we book more than one apartment?",
        a: "Yes. With seven apartments in one building, Halcyon works well for extended families, wedding guests and work teams. Tell us how many you need and we'll hold them together.",
      },
      {
        q: "Is Halcyon good for long stays?",
        a: "Very. Weekly and monthly stays are welcome. Ask us about long-stay rates when you enquire.",
      },
      {
        q: "How far is the airport?",
        a: "About 40 minutes by road, depending on traffic. We're happy to arrange a pickup or drop on request.",
      },
      idAtCheckIn,
    ],
    theme: { accent: "#2f4a44", tint: "#e3e9e4", deep: "#1f332f" },
    hero: { src: halcyonLiving, alt: "Sunlit living room with a cream sofa, linen curtains and plants by the balcony doors" },
    cardDetail: { src: halcyonBedLight, alt: "A made bed in soft morning light" },
    gallery: [
      { src: halcyonLiving2, alt: "Living room with a deep green sofa and floor-to-ceiling windows" },
      { src: halcyonBedroom, alt: "Bedroom with a large bed and a garden view" },
      { src: halcyonKitchen, alt: "Kitchen with green tiles, an oven and warm under-cabinet light" },
      { src: halcyonOpenPlan, alt: "Open-plan kitchen and dining area" },
      { src: halcyonBedLight, alt: "Bed with white linen and a rattan pendant lamp" },
      { src: halcyonLounge, alt: "Lounge with sculptural armchairs in afternoon sun" },
      { src: halcyonBath, alt: "Bathroom with a stone basin and a walk-in shower" },
      { src: backwatersMist, alt: "Morning mist over the backwaters near Kochi" },
    ],
    pin: { x: 299, y: 293 },
    route: "M299 293 C 312 304, 322 318, 333 327 C 352 290, 372 256, 391 226 C 408 204, 432 172, 466 147",
  },
  {
    slug: "bohom-stayora",
    index: "02",
    name: "Bohom Stayora",
    nameLines: ["Bohom", "Stayora"],
    kind: "Rooms near the airport",
    inventory: "Thirteen attached rooms",
    unit: { count: 13, singular: "room", plural: "rooms" },
    maxGuestsPerUnit: 2,
    area: "Near Cochin International Airport",
    areaShort: "Airport",
    airportTime: "Minutes from the airport",
    tagline: "Easy rooms, minutes from the terminal.",
    summary:
      "Thirteen bright rooms near Cochin International Airport, each with its own bathroom, at friendly prices. Made for early flights, late landings and quick stopovers.",
    intro: {
      heading: "A little bohemian. Very easy on the budget.",
      body: [
        "Stayora is our answer to the airport hotel. Thirteen attached rooms with comfortable beds, hot showers and fast Wi-Fi, a short drive from the terminal.",
        "Land late, sleep well and fly out rested, without spending your holiday budget on a single night.",
      ],
    },
    bestFor: ["Early flights", "Stopovers", "Solo travellers", "Budget trips"],
    facts: [
      { label: "Rooms", value: "13" },
      { label: "Bathrooms", value: "Attached" },
      { label: "Sleeps", value: "Up to 2" },
      { label: "Airport", value: "Minutes" },
    ],
    highlights: [
      { icon: "shower-head", title: "Your own bathroom", text: "Every room is attached, so there's no shared corridor to cross at 4 am." },
      { icon: "plane-landing", title: "Close to the terminal", text: "A short drive to Cochin International Airport, with pickups arranged on request." },
      { icon: "wallet", title: "Kindly priced", text: "Honest rates for a good night's sleep, with our best price when you book direct." },
      { icon: "moon", title: "Late arrivals welcome", text: "Flights don't keep office hours. Tell us your arrival time and we'll be ready." },
    ],
    // TODO: confirm amenities with Hovato.
    amenities: [
      { icon: "bath", label: "Attached bathroom" },
      { icon: "wifi", label: "High-speed Wi-Fi" },
      { icon: "snowflake", label: "Air conditioning" },
      { icon: "droplets", label: "Hot water" },
      { icon: "tv", label: "Television" },
      { icon: "bed-double", label: "Fresh linen & towels" },
      { icon: "plane", label: "Airport pickup on request" },
      { icon: "zap", label: "Power backup" },
      { icon: "square-parking", label: "Parking" },
      { icon: "sparkles", label: "Daily housekeeping" },
    ],
    nearby: [
      { place: "Cochin International Airport", time: "10 min" },
      { place: "Kalady", time: "20 min" },
      { place: "Aluva", time: "25 min" },
      { place: "Lulu Mall, Edappally", time: "45 min" },
      { place: "Athirappilly Falls", time: "1 hr 15 min" },
      { place: "Fort Kochi", time: "1 hr 30 min" },
    ],
    faqs: [
      {
        q: "How far is the airport?",
        a: "Just a short drive. Tell us your flight time and we'll help you plan when to leave. Pickups and drops can be arranged on request.",
      },
      {
        q: "Can I check in late at night?",
        a: "Yes. Many of our guests arrive on late flights. Share your arrival time when you book so we're ready for you.",
      },
      {
        q: "Do all rooms have an attached bathroom?",
        a: "Yes. Every one of the thirteen rooms has its own attached bathroom.",
      },
      idAtCheckIn,
    ],
    theme: { accent: "#a4532f", tint: "#f3e2d6", deep: "#7a3a1f" },
    hero: { src: stayoraRoom, alt: "Warm hotel room with terracotta floors, a checked rug and a low wooden bed" },
    cardDetail: { src: stayoraPillows, alt: "Patterned cushions on a crisp white bed" },
    gallery: [
      { src: stayoraTropical, alt: "Bedroom with a wall of glass looking onto tropical plants" },
      { src: stayoraRoom2, alt: "White bed with a mustard throw and framed prints" },
      { src: stayoraSunlit, alt: "Bed in morning sun with a wooden bench at its foot" },
      { src: stayoraBright, alt: "Bright room with white linen and a reading lamp" },
      { src: stayoraShower, alt: "Rain shower with copper fittings and bath products" },
      { src: stayoraWood, alt: "Wood-panelled room with teal cushions and a garden view" },
      { src: stayoraPillows, alt: "Patterned cushions on a crisp white bed" },
      { src: planeWindowSunset, alt: "Sunset seen from an aeroplane window" },
    ],
    pin: { x: 447, y: 171 },
    route: "M447 171 C 452 162, 459 153, 466 147",
  },
  {
    slug: "hovato-brown",
    index: "03",
    name: "Hovato Brown",
    nameLines: ["Hovato", "Brown"],
    kind: "Private service apartment",
    inventory: "One service apartment",
    unit: { count: 1, singular: "apartment", plural: "apartments" },
    maxGuestsPerUnit: 4,
    area: "Near Cochin International Airport",
    areaShort: "Airport",
    airportTime: "Minutes from the airport",
    tagline: "One apartment. All yours.",
    summary:
      "A single private service apartment near Cochin International Airport, in warm wood and soft light, with its own kitchen and living room. A home base for family visits and long trips.",
    intro: {
      heading: "Brown, as in teak, filter coffee and slow afternoons.",
      body: [
        "Hovato Brown is the quiet one in the family: a single private service apartment where nothing is shared. Unpack properly, cook when you feel like it, and leave the housekeeping to us.",
        "It's minutes from the airport, which makes it an easy base for families flying in from the Gulf, long work trips and anyone who likes a place to themselves.",
      ],
    },
    bestFor: ["Family visits", "Long stays", "Couples", "Privacy"],
    facts: [
      { label: "Apartment", value: "Entire place" },
      { label: "Type", value: "Serviced" },
      { label: "Sleeps", value: "Up to 4" },
      { label: "Airport", value: "Minutes" },
    ],
    highlights: [
      { icon: "key-round", title: "The whole place", text: "No shared spaces. Every room is yours alone for the length of your stay." },
      { icon: "sparkles", title: "Serviced, not stiff", text: "Housekeeping when you want it, and privacy when you don't." },
      { icon: "cooking-pot", title: "Cook, or don't", text: "A kitchen for home-style meals, and a host who knows the best local places to eat." },
      { icon: "plane-landing", title: "Minutes from COK", text: "Easy for arrivals at odd hours and relatives flying in from abroad." },
    ],
    // TODO: confirm amenities with Hovato.
    amenities: [
      { icon: "house", label: "Entire apartment" },
      { icon: "cooking-pot", label: "Kitchen" },
      { icon: "sofa", label: "Living room" },
      { icon: "wifi", label: "High-speed Wi-Fi" },
      { icon: "snowflake", label: "Air conditioning" },
      { icon: "tv", label: "Smart TV" },
      { icon: "washing-machine", label: "Washing machine" },
      { icon: "droplets", label: "Hot water" },
      { icon: "sparkles", label: "Housekeeping" },
      { icon: "square-parking", label: "Parking" },
    ],
    nearby: [
      { place: "Cochin International Airport", time: "10 min" },
      { place: "Kalady", time: "20 min" },
      { place: "Aluva", time: "25 min" },
      { place: "Lulu Mall, Edappally", time: "45 min" },
      { place: "Athirappilly Falls", time: "1 hr 15 min" },
      { place: "Fort Kochi", time: "1 hr 30 min" },
    ],
    faqs: [
      {
        q: "Is the apartment shared with anyone?",
        a: "Never. Hovato Brown is a single apartment, booked by one party at a time.",
      },
      {
        q: "Is it suitable for long stays?",
        a: "Yes. Weekly and monthly stays are welcome. Ask us about long-stay rates when you enquire.",
      },
      {
        q: "How far is the airport?",
        a: "Minutes away by road. Pickups and drops can be arranged on request.",
      },
      idAtCheckIn,
    ],
    theme: { accent: "#5b3b2a", tint: "#ecdfd3", deep: "#3e271b" },
    hero: { src: brownBedroom, alt: "Bright bedroom with wood-panelled walls, a curved sofa and tall windows" },
    cardDetail: { src: brownMonsoon, alt: "Coffee on a windowsill while rain falls outside" },
    gallery: [
      { src: brownLounge, alt: "Living room with warm wood walls and patterned cushions" },
      { src: brownReading, alt: "Reading corner with wooden shelves and plants by the window" },
      { src: brownSofa, alt: "Tan leather sofa with a throw and pampas grass" },
      { src: brownBedroom2, alt: "Bedroom with warm walls and a door open to the terrace" },
      { src: brownKitchen, alt: "Kitchen with a round dining table" },
      { src: brownBedroom3, alt: "Bedroom with timber panelling and a round mirror" },
      { src: brownMonsoon, alt: "Coffee on a windowsill while rain falls outside" },
    ],
    pin: { x: 489, y: 167 },
    route: "M489 167 C 482 160, 474 153, 466 147",
  },
];

export const staysBySlug = Object.fromEntries(stays.map((s) => [s.slug, s])) as Record<StaySlug, Stay>;

/** Total keys across the collection: 7 + 13 + 1. */
export const totalKeys = stays.reduce((n, s) => n + s.unit.count, 0);
