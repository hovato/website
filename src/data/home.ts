import type { ImageMetadata } from "astro";
import type { StaySlug } from "./stays";
import { site } from "./site";

import kochiDawn from "../assets/images/kochi-dawn.jpg";
import halcyonLiving from "../assets/images/halcyon-living.jpg";
import stayoraTropical from "../assets/images/stayora-tropical.jpg";
import brownBedroom from "../assets/images/brown-bedroom.jpg";

import fortKochi from "../assets/images/nearby-fort-kochi.jpg";
import mattancherry from "../assets/images/nearby-mattancherry.jpg";
import athirappilly from "../assets/images/nearby-athirappilly.jpg";
import backwaters from "../assets/images/nearby-backwaters.jpg";
import munnar from "../assets/images/nearby-munnar.jpg";
import kathakali from "../assets/images/nearby-kathakali.jpg";

export const heroSlides: { src: ImageMetadata; alt: string; caption: string; position?: string }[] = [
  { src: kochiDawn, alt: "A Chinese fishing net at dawn on still water in Kochi", caption: "Kochi, Kerala", position: "50% 60%" },
  { src: halcyonLiving, alt: "Sunlit living room with linen curtains and plants", caption: "H. Halcyon Suites · Manjummal", position: "50% 55%" },
  { src: stayoraTropical, alt: "Bedroom with a wall of glass onto tropical plants", caption: "Bohom Stayora · Airport", position: "50% 60%" },
  { src: brownBedroom, alt: "Wood-panelled bedroom with a curved sofa", caption: "Hovato Brown · Airport", position: "50% 60%" },
];

/** "What brings you to Kochi?" — each occasion recommends one stay. */
export const occasions: { id: string; label: string; stay: StaySlug; reason: string }[] = [
  {
    id: "flight",
    label: "Catching a flight",
    stay: "bohom-stayora",
    reason: "Minutes from the terminal, with an attached bathroom in every room. Sleep in, not at the gate.",
  },
  {
    id: "family",
    label: "Travelling with family",
    stay: "halcyon-suites",
    reason: "Two bedrooms, a full kitchen and a hall big enough for everyone. Book two side by side if you're a crowd.",
  },
  {
    id: "work",
    label: "Here for work",
    stay: "halcyon-suites",
    reason: "A calm apartment close to Kalamassery, Eloor and Edappally, with a proper table to work from and Wi-Fi that keeps up.",
  },
  {
    id: "long",
    label: "Staying a month or more",
    stay: "hovato-brown",
    reason: "A serviced apartment that's entirely yours: unpack, settle in and let housekeeping take care of the rest.",
  },
  {
    id: "budget",
    label: "Keeping it budget-friendly",
    stay: "bohom-stayora",
    reason: "Clean, comfortable rooms at honest prices. The best rate is always the one you book direct.",
  },
  {
    id: "private",
    label: "Wanting a place to ourselves",
    stay: "hovato-brown",
    reason: "Our single-key stay: one private apartment, booked by one party at a time.",
  },
];

/** The Hovato standard. TODO: confirm each promise holds at all three stays. */
export const standards: { icon: string; title: string; text: string }[] = [
  { icon: "sparkles", title: "Spotless, every stay", text: "Rooms cleaned to a hotel standard, with fresh linen and towels waiting." },
  { icon: "message-circle", title: "A host on call", text: "Real people on WhatsApp and phone, whether you land at noon or 3 am." },
  { icon: "wifi", title: "Wi-Fi that keeps up", text: "Fast and free, for work calls, streaming and video calls home." },
  { icon: "plane", title: "Airport runs", text: "Pickups and drops to Cochin International Airport, arranged on request." },
  { icon: "wallet", title: "Book direct, pay less", text: "No platform fees. Our best rate is always the one you get from us." },
  { icon: "calendar-heart", title: "Stay your way", text: "One night, a week or a whole season. Longer stays get kinder rates." },
];

export const nearby: {
  name: string;
  line: string;
  src: ImageMetadata;
  alt: string;
  fromHalcyon: string;
  fromAirport: string;
}[] = [
  {
    name: "Fort Kochi",
    line: "Chinese fishing nets, colonial lanes and sunsets over the harbour.",
    src: fortKochi,
    alt: "A Chinese fishing net silhouetted against a pink sky",
    fromHalcyon: "1 hr",
    fromAirport: "1 hr 30",
  },
  {
    name: "Mattancherry",
    line: "Antique shops, spice warehouses and the Dutch Palace in Jew Town.",
    src: mattancherry,
    alt: "A quiet street lined with yellow heritage buildings",
    fromHalcyon: "1 hr",
    fromAirport: "1 hr 30",
  },
  {
    name: "Athirappilly Falls",
    line: "Kerala's largest waterfall, a scenic morning's drive from the airport.",
    src: athirappilly,
    alt: "Athirappilly waterfall surrounded by forest",
    fromHalcyon: "1 hr 45",
    fromAirport: "1 hr 15",
  },
  {
    name: "The backwaters",
    line: "Houseboats and palm-lined canals, an easy day trip south to Alappuzha.",
    src: backwaters,
    alt: "A houseboat reflected in a palm-lined canal",
    fromHalcyon: "2 hr",
    fromAirport: "2 hr 30",
  },
  {
    name: "Munnar",
    line: "Rolling tea estates in the Western Ghats. The classic weekend escape.",
    src: munnar,
    alt: "Tea plantations below a rocky peak in Munnar",
    fromHalcyon: "3 hr 30",
    fromAirport: "3 hr",
  },
  {
    name: "Kathakali",
    line: "Watch make-up, music and mime come together at a Fort Kochi theatre.",
    src: kathakali,
    alt: "Kathakali costumes on display in a Kochi cultural centre",
    fromHalcyon: "1 hr",
    fromAirport: "1 hr 30",
  },
];

export const faqs: { q: string; a: string }[] = [
  {
    q: "How do I book?",
    a: "Tap “Book a stay”, pick your dates and send the request on WhatsApp or by email. We'll confirm availability and your rate as quickly as we can.",
  },
  {
    q: "What are the check-in and check-out times?",
    a: `Check-in is from ${site.policies.checkIn} and check-out is by ${site.policies.checkOut}. If your flight lands early or leaves late, ask us and we'll do our best to flex.`,
  },
  {
    q: "Can you arrange an airport pickup?",
    a: "Yes, from any of our stays. Share your flight number when you book and we'll arrange a car to meet you.",
  },
  {
    q: "Do you offer weekly or monthly rates?",
    a: "We do, at all three stays. Halcyon Suites and Hovato Brown are especially well suited to long stays.",
  },
  {
    q: "What do I need at check-in?",
    a: "A government-issued photo ID for each adult. Guests from outside India need their passport and visa.",
  },
];
