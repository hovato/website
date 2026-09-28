// ─────────────────────────────────────────────────────────────────────────────
//  Booking drawer: choose a stay → dates & guests → send on WhatsApp / email.
//  There is no booking engine; the request is written out for the guest to
//  send, and Hovato confirms availability and rate by reply.
// ─────────────────────────────────────────────────────────────────────────────
import type Lenis from "lenis";

interface StayInfo {
  slug: string;
  name: string;
  area: string;
  unitSingular: string;
  unitPlural: string;
  unitCount: number;
  maxGuestsPerUnit: number;
  accent: string;
}
interface Config {
  stays: StayInfo[];
  whatsapp: string;
  email: string;
}
interface State {
  stay: string | null;
  checkIn: string | null; // yyyy-mm-dd
  checkOut: string | null;
  adults: number;
  children: number;
  units: number;
  name: string;
  phone: string;
  note: string;
}

const STORAGE_KEY = "hovato:booking";
const DAY = 86_400_000;

// ── Dates (local, no time component) ─────────────────────────────────────────
const pad = (n: number) => String(n).padStart(2, "0");
const toISO = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const fromISO = (s: string) => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
};
const today = () => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
};
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const addMonths = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth() + n, 1);
const nights = (a: string, b: string) => Math.round((fromISO(b).getTime() - fromISO(a).getTime()) / DAY);

const fmtShort = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" });
const fmtDay = new Intl.DateTimeFormat("en-IN", { weekday: "short", day: "numeric", month: "short" });
const fmtLong = new Intl.DateTimeFormat("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
const fmtLabel = new Intl.DateTimeFormat("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
const fmtMonth = new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric" });

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

export function initBooking({ lenis, onOpen }: { lenis?: Lenis; onOpen?: () => void }) {
  const root = document.querySelector<HTMLElement>("[data-book]");
  const configEl = document.getElementById("book-config");
  if (!root || !configEl) return;

  const config: Config = JSON.parse(configEl.textContent || "{}");
  const staysBy = Object.fromEntries(config.stays.map((s) => [s.slug, s]));
  const panel = root.querySelector<HTMLElement>(".book__panel")!;
  const q = <T extends Element = HTMLElement>(sel: string) => root.querySelector<T>(sel);
  const qa = <T extends Element = HTMLElement>(sel: string) => Array.from(root.querySelectorAll<T>(sel));

  const titleEl = q("[data-book-title]")!;
  const bodyEl = q("[data-book-body]")!;
  const steps = qa("[data-step]");
  const dots = qa("[data-step-dot]");
  const backBtn = q<HTMLButtonElement>("[data-book-back]")!;
  const nextBtn = q<HTMLButtonElement>("[data-book-next]")!;
  const sendBtn = q<HTMLAnchorElement>("[data-book-send]")!;
  const mailLink = q<HTMLAnchorElement>("[data-book-mail]")!;
  const recap = q("[data-book-recap]")!;
  const form = q<HTMLFormElement>("[data-book-form]")!;

  const titles: Record<number, string> = {
    1: "Where would you like to <em>stay?</em>",
    2: "When are you <em>coming?</em>",
    3: "Almost <em>there.</em>",
  };

  // ── State ────────────────────────────────────────────────────────────────
  const fresh: State = { stay: null, checkIn: null, checkOut: null, adults: 2, children: 0, units: 1, name: "", phone: "", note: "" };
  let state: State = { ...fresh };
  try {
    const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "null");
    if (saved) state = { ...fresh, ...saved };
  } catch {}
  // Drop anything that no longer makes sense (past dates, removed stays)
  if (state.stay && !staysBy[state.stay]) state.stay = null;
  if (state.checkIn && fromISO(state.checkIn) < today()) {
    state.checkIn = null;
    state.checkOut = null;
  }
  const save = () => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {}
  };

  let step = 1;
  let lastTrigger: HTMLElement | null = null;
  let isOpen = false;

  const capacity = () => {
    const s = state.stay ? staysBy[state.stay] : null;
    return s ? state.units * s.maxGuestsPerUnit : 99;
  };

  // ── Summaries shared across the page ─────────────────────────────────────
  const datesText = () => {
    if (!state.checkIn) return "Add dates";
    const a = fromISO(state.checkIn);
    if (!state.checkOut) return `${fmtShort.format(a)} – ?`;
    return `${fmtShort.format(a)} – ${fmtShort.format(fromISO(state.checkOut))}`;
  };
  const guestsText = () =>
    [plural(state.adults, "adult", "adults"), state.children ? plural(state.children, "child", "children") : ""]
      .filter(Boolean)
      .join(", ");
  const unitsText = () => {
    const s = state.stay ? staysBy[state.stay] : null;
    return s ? plural(state.units, s.unitSingular, s.unitPlural) : "";
  };

  function paintExternal() {
    document.querySelectorAll<HTMLElement>("[data-book-value]").forEach((el) => {
      const key = el.dataset.bookValue;
      if (key === "stay") el.textContent = state.stay ? staysBy[state.stay].name : "Any Hovato stay";
      if (key === "dates") el.textContent = datesText();
      if (key === "guests") el.textContent = guestsText();
    });
  }

  function paintRecap() {
    const bits: string[] = [];
    if (state.stay) bits.push(`<strong>${staysBy[state.stay].name}</strong>`);
    if (state.checkIn && state.checkOut) {
      const n = nights(state.checkIn, state.checkOut);
      bits.push(`${datesText()} · ${plural(n, "night", "nights")}`);
    }
    if (step > 1) bits.push(guestsText());
    recap.innerHTML = bits.join(" · ") || "Choose a stay to begin.";
  }

  // ── Step 1: stay ─────────────────────────────────────────────────────────
  const stayInputs = qa<HTMLInputElement>("input[name='book-stay']");
  // Picking a stay with a pointer moves straight on to dates. Keyboard users
  // arrowing through the options stay put and press Continue.
  let pickedByPointer = false;
  qa(".book-stay").forEach((label) => label.addEventListener("pointerdown", () => (pickedByPointer = true)));
  stayInputs.forEach((input) => {
    input.addEventListener("change", () => {
      if (!input.checked) return;
      setStay(input.value);
      if (pickedByPointer) window.setTimeout(() => step === 1 && go(2), 260);
      pickedByPointer = false;
    });
  });
  function setStay(slug: string | null) {
    state.stay = slug;
    stayInputs.forEach((i) => (i.checked = i.value === slug));
    const s = slug ? staysBy[slug] : null;
    if (s) {
      state.units = Math.min(Math.max(1, state.units), s.unitCount);
      // Make sure the party fits: add units if possible, otherwise trim guests.
      const need = Math.ceil((state.adults + state.children) / s.maxGuestsPerUnit);
      state.units = Math.min(Math.max(state.units, need), s.unitCount);
      clampGuests();
    }
    paintSteppers();
    save();
    paintExternal();
    paintRecap();
  }

  // ── Step 2: calendar ─────────────────────────────────────────────────────
  const monthsEl = q("[data-cal-months]")!;
  const statusEl = q("[data-cal-status]")!;
  const inEl = q("[data-cal-in]")!;
  const outEl = q("[data-cal-out]")!;
  const prevBtn = q<HTMLButtonElement>("[data-cal-prev]")!;
  const nextMonthBtn = q<HTMLButtonElement>("[data-cal-next]")!;
  const minDate = today();
  const maxDate = addDays(minDate, 365);
  let view = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
  if (state.checkIn) {
    const c = fromISO(state.checkIn);
    view = new Date(c.getFullYear(), c.getMonth(), 1);
  }
  let focusISO = state.checkIn ?? toISO(minDate);
  let hoverISO: string | null = null;
  const monthsVisible = () => (panel.clientWidth >= 560 ? 2 : 1);

  function renderCalendar() {
    const count = monthsVisible();
    monthsEl.style.setProperty("--cal-months", String(count));
    const dow = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
    let htmlStr = "";
    for (let m = 0; m < count; m++) {
      const first = addMonths(view, m);
      const offset = (first.getDay() + 6) % 7; // Monday first
      const days = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
      htmlStr += `<div class="cal-month"><p class="cal-month__title">${fmtMonth.format(first)}</p><div class="cal-grid" role="grid" aria-label="${fmtMonth.format(first)}">`;
      htmlStr += dow.map((d) => `<span class="cal-grid__dow" aria-hidden="true">${d}</span>`).join("");
      htmlStr += `<span class="cal-day cal-day--blank"></span>`.repeat(offset);
      for (let d = 1; d <= days; d++) {
        const date = new Date(first.getFullYear(), first.getMonth(), d);
        const iso = toISO(date);
        const disabled = date < minDate || date > maxDate;
        htmlStr += `<button type="button" class="cal-day" data-date="${iso}" aria-label="${fmtLabel.format(date)}"${disabled ? " disabled" : ""} tabindex="-1">${d}</button>`;
      }
      htmlStr += `</div></div>`;
    }
    monthsEl.innerHTML = htmlStr;
    prevBtn.disabled = view <= new Date(minDate.getFullYear(), minDate.getMonth(), 1);
    nextMonthBtn.disabled = addMonths(view, count) > maxDate;
    paintRange();
  }

  function paintRange() {
    const start = state.checkIn;
    const end = state.checkOut ?? (state.checkIn && hoverISO && hoverISO > state.checkIn ? hoverISO : null);
    const todayISO = toISO(minDate);
    let focusable: HTMLButtonElement | null = null;
    monthsEl.querySelectorAll<HTMLButtonElement>(".cal-day[data-date]").forEach((b) => {
      const iso = b.dataset.date!;
      b.classList.toggle("is-today", iso === todayISO);
      b.classList.toggle("is-start", iso === start);
      b.classList.toggle("has-range", iso === start && Boolean(end));
      b.classList.toggle("is-end", Boolean(end) && iso === end);
      b.classList.toggle("in-range", Boolean(start && end && iso > start && iso < end));
      b.setAttribute("aria-pressed", String(iso === start || iso === state.checkOut));
      b.tabIndex = -1;
      if (iso === focusISO && !b.disabled) focusable = b;
    });
    const fallback = monthsEl.querySelector<HTMLButtonElement>(".cal-day[data-date]:not(:disabled)");
    ((focusable as HTMLButtonElement | null) ?? fallback)?.setAttribute("tabindex", "0");

    inEl.textContent = state.checkIn ? fmtDay.format(fromISO(state.checkIn)) : "Add date";
    outEl.textContent = state.checkOut ? fmtDay.format(fromISO(state.checkOut)) : "Add date";
    q("[data-cal-slot='in']")?.classList.toggle("is-set", Boolean(state.checkIn));
    q("[data-cal-slot='out']")?.classList.toggle("is-set", Boolean(state.checkOut));
    if (!state.checkIn) statusEl.textContent = "Choose your check-in date";
    else if (!state.checkOut) statusEl.textContent = "Now choose your check-out date";
    else statusEl.textContent = `${plural(nights(state.checkIn, state.checkOut), "night", "nights")} · ${datesText()}`;
  }

  function pick(iso: string) {
    if (!state.checkIn || state.checkOut || iso <= state.checkIn) {
      state.checkIn = iso;
      state.checkOut = null;
    } else {
      state.checkOut = iso;
    }
    focusISO = iso;
    hoverISO = null;
    paintRange();
    save();
    paintExternal();
    paintRecap();
  }

  monthsEl.addEventListener("click", (e) => {
    const b = (e.target as Element).closest<HTMLButtonElement>(".cal-day[data-date]");
    if (b && !b.disabled) pick(b.dataset.date!);
  });
  monthsEl.addEventListener("mouseover", (e) => {
    const b = (e.target as Element).closest<HTMLButtonElement>(".cal-day[data-date]");
    if (!b || b.disabled || !state.checkIn || state.checkOut) return;
    hoverISO = b.dataset.date!;
    paintRange();
  });
  monthsEl.addEventListener("mouseleave", () => {
    if (hoverISO) {
      hoverISO = null;
      paintRange();
    }
  });
  monthsEl.addEventListener("keydown", (e) => {
    const b = (e.target as Element).closest<HTMLButtonElement>(".cal-day[data-date]");
    if (!b) return;
    const moves: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
    let target: Date | null = null;
    const cur = fromISO(b.dataset.date!);
    if (e.key in moves) target = addDays(cur, moves[e.key]);
    else if (e.key === "PageUp") target = new Date(cur.getFullYear(), cur.getMonth() - 1, cur.getDate());
    else if (e.key === "PageDown") target = new Date(cur.getFullYear(), cur.getMonth() + 1, cur.getDate());
    else if (e.key === "Home") target = addDays(cur, -((cur.getDay() + 6) % 7));
    else if (e.key === "End") target = addDays(cur, 6 - ((cur.getDay() + 6) % 7));
    if (!target) return;
    e.preventDefault();
    if (target < minDate) target = minDate;
    if (target > maxDate) target = maxDate;
    focusISO = toISO(target);
    const lastVisible = addMonths(view, monthsVisible());
    if (target < view || target >= lastVisible) {
      view = new Date(target.getFullYear(), target.getMonth() - (target < view ? 0 : monthsVisible() - 1), 1);
      renderCalendar();
    } else {
      paintRange();
    }
    monthsEl.querySelector<HTMLButtonElement>(`[data-date="${focusISO}"]`)?.focus();
  });
  prevBtn.addEventListener("click", () => {
    view = addMonths(view, -1);
    renderCalendar();
  });
  nextMonthBtn.addEventListener("click", () => {
    view = addMonths(view, 1);
    renderCalendar();
  });
  q("[data-cal-clear]")?.addEventListener("click", () => {
    state.checkIn = null;
    state.checkOut = null;
    hoverISO = null;
    paintRange();
    save();
    paintExternal();
    paintRecap();
  });
  let resizeFrame = 0;
  window.addEventListener("resize", () => {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(() => isOpen && step === 2 && renderCalendar());
  });

  // ── Step 2: guests & units ───────────────────────────────────────────────
  const steppers = qa("[data-stepper]");
  const unitsRow = q("[data-stepper='units']")!;
  function clampGuests() {
    const cap = capacity();
    state.adults = Math.max(1, Math.min(state.adults, cap));
    state.children = Math.max(0, Math.min(state.children, cap - state.adults));
  }
  function paintSteppers() {
    const s = state.stay ? staysBy[state.stay] : null;
    const cap = capacity();
    const units = s?.unitCount ?? 1;
    unitsRow.hidden = !s || units <= 1;
    if (s) {
      q("[data-units-label]")!.textContent = s.unitPlural[0].toUpperCase() + s.unitPlural.slice(1);
      q("[data-units-hint]")!.textContent = `Up to ${s.maxGuestsPerUnit} guests each · ${s.unitCount} available`;
    }
    const vals: Record<string, number> = { adults: state.adults, children: state.children, units: state.units };
    steppers.forEach((row) => {
      const key = row.dataset.stepper!;
      row.querySelector("output")!.textContent = String(vals[key]);
      const dec = row.querySelector<HTMLButtonElement>("[data-dec]")!;
      const inc = row.querySelector<HTMLButtonElement>("[data-inc]")!;
      const guests = state.adults + state.children;
      if (key === "adults") {
        dec.disabled = state.adults <= 1;
        inc.disabled = guests >= cap && state.units >= units;
      } else if (key === "children") {
        dec.disabled = state.children <= 0;
        inc.disabled = guests >= cap && state.units >= units;
      } else {
        dec.disabled = state.units <= 1;
        inc.disabled = state.units >= units;
      }
    });
  }
  steppers.forEach((row) => {
    const key = row.dataset.stepper as "adults" | "children" | "units";
    const change = (delta: number) => {
      const s = state.stay ? staysBy[state.stay] : null;
      if (key === "units") {
        state.units = Math.max(1, Math.min(state.units + delta, s?.unitCount ?? 1));
        clampGuests();
      } else {
        state[key] = Math.max(key === "adults" ? 1 : 0, state[key] + delta);
        // Growing party: take another room/apartment if one is free.
        if (s && state.adults + state.children > capacity() && state.units < s.unitCount) state.units += 1;
        clampGuests();
      }
      paintSteppers();
      save();
      paintExternal();
      paintRecap();
    };
    row.querySelector("[data-dec]")!.addEventListener("click", () => change(-1));
    row.querySelector("[data-inc]")!.addEventListener("click", () => change(1));
  });

  // ── Step 3: details & sending ────────────────────────────────────────────
  const fields = {
    name: form.querySelector<HTMLInputElement>("[name='name']")!,
    phone: form.querySelector<HTMLInputElement>("[name='phone']")!,
    note: form.querySelector<HTMLTextAreaElement>("[name='note']")!,
  };
  fields.name.value = state.name;
  fields.phone.value = state.phone;
  fields.note.value = state.note;
  (Object.keys(fields) as (keyof typeof fields)[]).forEach((k) => {
    fields[k].addEventListener("input", () => {
      state[k] = fields[k].value;
      if (k === "name") fields.name.closest(".field")?.classList.remove("is-invalid");
      save();
      paintLinks();
    });
  });
  form.addEventListener("submit", (e) => e.preventDefault());

  function message() {
    const s = state.stay ? staysBy[state.stay] : null;
    const lines = ["Hello Hovato! I'd like to check availability.", ""];
    if (s) lines.push(`Stay: ${s.name} (${s.area})`);
    if (state.checkIn && state.checkOut) {
      const n = nights(state.checkIn, state.checkOut);
      const long = (iso: string) => fmtLong.format(fromISO(iso)).replace(/,\s*(\d{4})$/, " $1");
      lines.push(`Dates: ${long(state.checkIn)} to ${long(state.checkOut)} (${plural(n, "night", "nights")})`);
    }
    lines.push(`Guests: ${guestsText()}`);
    if (s && s.unitCount > 1) lines.push(`${s.unitPlural[0].toUpperCase() + s.unitPlural.slice(1)}: ${state.units}`);
    lines.push("");
    if (state.name.trim()) lines.push(`Name: ${state.name.trim()}`);
    if (state.phone.trim()) lines.push(`Phone: ${state.phone.trim()}`);
    if (state.note.trim()) lines.push(`Note: ${state.note.trim()}`);
    return lines.join("\n").trim();
  }
  function paintLinks() {
    const text = encodeURIComponent(message());
    sendBtn.href = config.whatsapp ? `https://wa.me/${config.whatsapp}?text=${text}` : `https://wa.me/?text=${text}`;
    const s = state.stay ? staysBy[state.stay] : null;
    const subject = encodeURIComponent(`Booking enquiry${s ? `: ${s.name}` : ""}`);
    mailLink.href = `mailto:${config.email}?subject=${subject}&body=${text}`;
  }
  function paintSummary() {
    const s = state.stay ? staysBy[state.stay] : null;
    qa("[data-summary-img]").forEach((el) => (el.hidden = el.dataset.summaryImg !== state.stay));
    const set = (k: string, v: string) => {
      const el = q(`[data-sum='${k}']`);
      if (el) el.textContent = v;
    };
    set("stay", s ? `${s.name}, ${s.area}` : "—");
    set(
      "dates",
      state.checkIn && state.checkOut
        ? `${fmtDay.format(fromISO(state.checkIn))} → ${fmtDay.format(fromISO(state.checkOut))} · ${plural(nights(state.checkIn, state.checkOut), "night", "nights")}`
        : "—",
    );
    set("guests", [guestsText(), s && s.unitCount > 1 ? unitsText() : ""].filter(Boolean).join(" · "));
  }
  const validName = () => {
    const ok = state.name.trim().length > 1;
    fields.name.closest(".field")?.classList.toggle("is-invalid", !ok);
    if (!ok) fields.name.focus();
    return ok;
  };
  sendBtn.addEventListener("click", (e) => {
    if (!validName()) {
      e.preventDefault();
      shake();
    }
  });
  mailLink.addEventListener("click", (e) => {
    if (!validName()) e.preventDefault();
  });

  // ── Navigation ───────────────────────────────────────────────────────────
  function canLeave(from: number) {
    if (from === 1) return Boolean(state.stay);
    if (from === 2) return Boolean(state.checkIn && state.checkOut);
    return true;
  }
  function shake() {
    root!.classList.remove("is-shake");
    void root!.offsetWidth;
    root!.classList.add("is-shake");
  }
  function go(n: number, opts: { focus?: boolean } = {}) {
    const back = n < step;
    step = Math.max(1, Math.min(3, n));
    steps.forEach((el) => {
      const on = Number(el.dataset.step) === step;
      el.hidden = !on;
      el.classList.toggle("is-entering", on);
      el.classList.toggle("is-back", on && back);
    });
    dots.forEach((d) => {
      const i = Number(d.dataset.stepDot);
      d.classList.toggle("is-active", i === step);
      d.classList.toggle("is-done", i < step);
      if (i === step) d.setAttribute("aria-current", "step");
      else d.removeAttribute("aria-current");
    });
    titleEl.innerHTML = titles[step];
    backBtn.hidden = step === 1;
    nextBtn.hidden = step === 3;
    sendBtn.hidden = step !== 3;
    mailLink.hidden = step !== 3;
    bodyEl.scrollTop = 0;
    if (step === 2) {
      if (state.checkIn) {
        const c = fromISO(state.checkIn);
        view = new Date(c.getFullYear(), c.getMonth(), 1);
      }
      renderCalendar();
      paintSteppers();
    }
    if (step === 3) {
      paintSummary();
      paintLinks();
      if (opts.focus !== false) window.setTimeout(() => fields.name.focus({ preventScroll: true }), 350);
    }
    paintRecap();
  }
  nextBtn.addEventListener("click", () => {
    if (!canLeave(step)) {
      shake();
      if (step === 2) statusEl.textContent = state.checkIn ? "Choose your check-out date to continue" : "Choose your dates to continue";
      return;
    }
    go(step + 1);
  });
  backBtn.addEventListener("click", () => go(step - 1));

  // ── Open / close ─────────────────────────────────────────────────────────
  function open(mode: string, staySlug?: string | null, trigger?: HTMLElement | null) {
    onOpen?.();
    if (staySlug && staysBy[staySlug]) setStay(staySlug);
    lastTrigger = trigger ?? (document.activeElement as HTMLElement | null);
    let target = 1;
    if (mode === "stay") target = 1;
    else if (mode === "dates" || mode === "guests") target = state.stay ? 2 : 1;
    else target = !state.stay ? 1 : !(state.checkIn && state.checkOut) ? 2 : 3;
    go(target, { focus: false });

    isOpen = true;
    root!.removeAttribute("inert");
    root!.setAttribute("aria-hidden", "false");
    root!.classList.add("is-open");
    document.documentElement.classList.add("book-open");
    lenis?.stop();
    window.setTimeout(() => {
      const focusTarget =
        step === 1
          ? root!.querySelector<HTMLInputElement>("input[name='book-stay']:checked") ?? stayInputs[0]
          : step === 2
            ? monthsEl.querySelector<HTMLButtonElement>(".cal-day[tabindex='0']")
            : fields.name;
      (focusTarget ?? panel).focus({ preventScroll: true });
    }, 420);
  }
  function close() {
    if (!isOpen) return;
    isOpen = false;
    root!.classList.remove("is-open");
    root!.setAttribute("aria-hidden", "true");
    root!.setAttribute("inert", "");
    document.documentElement.classList.remove("book-open");
    lenis?.start();
    lastTrigger?.focus({ preventScroll: true });
  }

  document.addEventListener("click", (e) => {
    const trigger = (e.target as Element).closest<HTMLElement>("[data-book-open]");
    if (trigger) {
      e.preventDefault();
      open(trigger.dataset.bookOpen || "auto", trigger.dataset.bookStay, trigger);
      return;
    }
    if ((e.target as Element).closest("[data-book-close]")) close();
  });
  document.addEventListener("keydown", (e) => {
    if (!isOpen) return;
    if (e.key === "Escape") {
      e.preventDefault();
      close();
      return;
    }
    if (e.key === "Tab") {
      // Keep focus inside the drawer
      const focusables = Array.from(
        panel.querySelectorAll<HTMLElement>(
          "a[href]:not([hidden]), button:not([disabled]):not([hidden]), input:not([disabled]), textarea, [tabindex='0']",
        ),
      ).filter((el) => el.offsetParent !== null || el === document.activeElement);
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  // Initial paint
  if (state.stay) stayInputs.forEach((i) => (i.checked = i.value === state.stay));
  paintSteppers();
  paintExternal();
  paintRecap();
}
