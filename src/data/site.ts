// ─────────────────────────────────────────────────────────────────────────────
//  Hovato — brand & contact settings.
//  Anything marked TODO is a placeholder. Confirm it with Hovato before launch.
// ─────────────────────────────────────────────────────────────────────────────

export const site = {
  name: "Hovato",
  legalName: "Hovato Hospitality", // TODO: confirm the registered business name
  descriptor: "Bespoke Hospitality",
  tagline: "Where better stays create greater value",
  region: "Kochi, Kerala",
  description:
    "Hovato is a growing collection of stays in Kochi, Kerala, each with its own character and all kept to one standard of care. Book direct with a real host.",

  contact: {
    // TODO: real phone number. `display` is what visitors read, `tel` is what the phone dials.
    phone: { display: "+91 00000 00000", tel: "+910000000000" },
    // TODO: WhatsApp number in international format, digits only (e.g. "919876543210").
    // While this is empty, WhatsApp buttons open WhatsApp and let the guest pick a chat,
    // so enquiries still work in the demo.
    whatsapp: "",
    // TODO: real inbox.
    email: "hello@hovato.com",
  },

  // TODO: real profile links. Empty links are hidden.
  social: {
    instagram: "",
    facebook: "",
  },

  // TODO: confirm house timings.
  policies: {
    checkIn: "2:00 pm",
    checkOut: "11:00 am",
  },
} as const;

/** Link that opens a WhatsApp chat with a pre-filled message. */
export function whatsappHref(message = "Hello Hovato! I'd like to know more about staying with you.") {
  const text = encodeURIComponent(message);
  return site.contact.whatsapp
    ? `https://wa.me/${site.contact.whatsapp}?text=${text}`
    : `https://wa.me/?text=${text}`;
}

export function mailHref(subject = "Stay enquiry", body = "") {
  const q = new URLSearchParams({ subject, body }).toString().replace(/\+/g, "%20");
  return `mailto:${site.contact.email}?${q}`;
}
