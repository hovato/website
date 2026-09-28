// ─────────────────────────────────────────────────────────────────────────────
//  Hovato: motion & interaction
//  Smooth scroll (Lenis) + GSAP ScrollTrigger/SplitText, all progressive:
//  content is readable without any of this running.
// ─────────────────────────────────────────────────────────────────────────────
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";
import { initBooking } from "./booking";
import { initGallery } from "./gallery";

gsap.registerPlugin(ScrollTrigger, SplitText);

declare global {
  interface Window {
    __revealTimer?: number;
    __lenis?: Lenis;
  }
}

const html = document.documentElement;
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
const $ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => root.querySelector<T>(sel);
const $$ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) =>
  Array.from(root.querySelectorAll<T>(sel));

// The inline safety net in <head> is no longer needed.
window.clearTimeout(window.__revealTimer);

// ── Smooth scroll ───────────────────────────────────────────────────────────
let lenis: Lenis | undefined;
if (!reduceMotion) {
  lenis = new Lenis({ lerp: 0.1, smoothWheel: true, wheelMultiplier: 1 });
  window.__lenis = lenis;
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis!.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

const headerOffset = () => -(($("[data-header]")?.offsetHeight ?? 80) + 12);

function scrollToTarget(target: HTMLElement | number, immediate = false) {
  if (lenis) lenis.scrollTo(target, { offset: typeof target === "number" ? 0 : headerOffset(), immediate, duration: 1.4 });
  else if (typeof target === "number") window.scrollTo({ top: target, behavior: immediate ? "auto" : "smooth" });
  else target.scrollIntoView({ behavior: immediate ? "auto" : "smooth" });
}

// Same-page anchor links ("#faq", "/#faq" when already on "/")
document.addEventListener("click", (e) => {
  const a = (e.target as Element).closest<HTMLAnchorElement>("a[href*='#']");
  if (!a || a.target === "_blank" || e.defaultPrevented || e.metaKey || e.ctrlKey) return;
  const url = new URL(a.href, location.href);
  if (url.pathname !== location.pathname || !url.hash) return;
  const target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
  if (!target) return;
  e.preventDefault();
  closeMenu();
  scrollToTarget(target);
  history.replaceState(null, "", url.hash);
});

// Arriving with a hash from another page
if (location.hash) {
  const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
  if (target) requestAnimationFrame(() => setTimeout(() => scrollToTarget(target, true), 60));
}

// ── Header: solid on scroll, tucks away on the way down ─────────────────────
const header = $("[data-header]");
let lastY = window.scrollY;
function onScroll() {
  const y = window.scrollY;
  if (header) {
    header.classList.toggle("is-scrolled", y > 40);
    const panelOpen = header.classList.contains("is-panel-open");
    if (!panelOpen && !html.classList.contains("menu-open")) {
      if (y > lastY + 4 && y > 480) header.classList.add("is-hidden");
      else if (y < lastY - 4 || y < 480) header.classList.remove("is-hidden");
    }
  }
  const dock = $("[data-dock]");
  dock?.classList.toggle("is-visible", y > window.innerHeight * 0.55);
  // Stay pages: floating booking bar after the hero, tucked away again over the footer
  const staybar = $("[data-staybar]");
  if (staybar) {
    const footerTop = $("[data-footer]")?.getBoundingClientRect().top ?? Infinity;
    staybar.classList.toggle("is-visible", y > window.innerHeight * 0.8 && footerTop > window.innerHeight * 0.9);
  }
  lastY = y;
}
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

// Mega panel for "Our stays"
const staysToggle = $<HTMLButtonElement>("[data-stays-toggle]");
const staysPanel = $("[data-stays-panel]");
let panelTimer = 0;
function setPanel(open: boolean, focusFirst = false) {
  if (!header || !staysToggle) return;
  window.clearTimeout(panelTimer);
  header.classList.toggle("is-panel-open", open);
  staysToggle.setAttribute("aria-expanded", String(open));
  if (open) header.classList.remove("is-hidden");
  if (open && focusFirst) $<HTMLAnchorElement>(".stays-panel__card", staysPanel ?? document)?.focus();
}
if (staysToggle && staysPanel && header) {
  staysToggle.addEventListener("click", (e) => {
    const open = staysToggle.getAttribute("aria-expanded") !== "true";
    setPanel(open, open && (e as PointerEvent).pointerType === "");
  });
  if (finePointer) {
    const hoverZone = [staysToggle.parentElement!, staysPanel];
    hoverZone.forEach((el) => {
      el.addEventListener("mouseenter", () => {
        window.clearTimeout(panelTimer);
        panelTimer = window.setTimeout(() => setPanel(true), 90);
      });
      el.addEventListener("mouseleave", () => {
        window.clearTimeout(panelTimer);
        panelTimer = window.setTimeout(() => setPanel(false), 220);
      });
    });
  }
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && header.classList.contains("is-panel-open")) {
      setPanel(false);
      staysToggle.focus();
    }
  });
  document.addEventListener("click", (e) => {
    if (!header.contains(e.target as Node)) setPanel(false);
  });
  staysPanel.addEventListener("focusout", (e) => {
    const next = e.relatedTarget as Node | null;
    if (next && !staysPanel.contains(next) && next !== staysToggle) setPanel(false);
  });
}

// Full-screen menu
const menu = $("[data-menu]");
const menuToggle = $<HTMLButtonElement>("[data-menu-toggle]");
function openMenu() {
  if (!menu || !menuToggle) return;
  html.classList.add("menu-open");
  menuToggle.setAttribute("aria-expanded", "true");
  menu.removeAttribute("inert");
  menu.setAttribute("aria-hidden", "false");
  lenis?.stop();
  window.setTimeout(() => $<HTMLAnchorElement>("a", menu)?.focus({ preventScroll: true }), 450);
}
function closeMenu() {
  if (!menu || !menuToggle || !html.classList.contains("menu-open")) return;
  html.classList.remove("menu-open");
  menuToggle.setAttribute("aria-expanded", "false");
  menu.setAttribute("inert", "");
  menu.setAttribute("aria-hidden", "true");
  lenis?.start();
}
menuToggle?.addEventListener("click", () => (html.classList.contains("menu-open") ? closeMenu() : openMenu()));
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && html.classList.contains("menu-open")) {
    closeMenu();
    menuToggle?.focus();
  }
});
menu?.addEventListener("click", (e) => {
  if ((e.target as Element).closest("[data-book-open]")) closeMenu();
});

// Back to top
$$("[data-to-top]").forEach((b) => b.addEventListener("click", () => scrollToTarget(0)));

// ── Booking & gallery ───────────────────────────────────────────────────────
initBooking({ lenis, onOpen: () => { closeMenu(); setPanel(false); } });
initGallery({ lenis });

// ── Intro + hero ────────────────────────────────────────────────────────────
function heroReveal() {
  const tl = gsap.timeline();
  const media = $("[data-hero-media]");
  const lines = $$("[data-hero-line]");
  const bits = $$("[data-hero-in]");
  if (media) tl.fromTo(media, { scale: 1.18 }, { scale: 1, duration: 2.4, ease: "expo.out" }, 0);
  if (lines.length) tl.fromTo(lines, { y: 0, yPercent: 105 }, { y: 0, yPercent: 0, duration: 1.5, ease: "expo.out", stagger: 0.12 }, 0.1);
  if (bits.length) tl.fromTo(bits, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 1.2, ease: "expo.out", stagger: 0.09 }, 0.4);
  return tl;
}

function runIntro() {
  const intro = $("[data-intro]");
  if (!intro || !html.classList.contains("has-intro")) return false;

  const paths = $$<SVGPathElement>("[data-intro-mark] path", intro);
  paths.forEach((p) => {
    const len = p.getTotalLength();
    gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
  });
  const firstImg = $<HTMLImageElement>("[data-hero-slide] img");
  const imageReady = new Promise<void>((resolve) => {
    if (!firstImg || firstImg.complete) return resolve();
    firstImg.addEventListener("load", () => resolve(), { once: true });
    firstImg.addEventListener("error", () => resolve(), { once: true });
    window.setTimeout(resolve, 3000);
  });

  const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
  tl.to(paths, { strokeDashoffset: 0, duration: 1.3, ease: "power2.inOut", stagger: 0.18 }, 0)
    .from($("[data-intro-mark] circle", intro), { scale: 0, transformOrigin: "50% 50%", duration: 0.6, ease: "back.out(3)" }, 0.9)
    .to($$("[data-intro-letter]", intro), { y: "0%", duration: 1.1, stagger: 0.06 }, 0.35)
    .to($("[data-intro-sub]", intro), { opacity: 1, duration: 0.9 }, 1)
    .to($("[data-intro-bar]", intro), { scaleX: 1, duration: 1.6, ease: "power2.inOut" }, 0.2)
    .addPause(1.9, () => {
      imageReady.then(() => tl.play());
    })
    .to($$("[data-intro-letter]", intro), { y: "-110%", duration: 0.7, stagger: 0.04, ease: "expo.in" }, 1.95)
    .to([$("[data-intro-mark]", intro), $("[data-intro-sub]", intro), $(".intro__bar", intro)], { opacity: 0, duration: 0.4 }, 2.1)
    .to(intro, { clipPath: "inset(0% 0% 100% 0%)", duration: 1.2, ease: "expo.inOut" }, 2.35)
    .add(heroReveal(), 2.9)
    .add(() => {
      intro.remove();
      html.classList.remove("has-intro");
      try {
        sessionStorage.setItem("hovato:intro", "1");
      } catch {}
      ScrollTrigger.refresh();
    }, 3.4);
  return true;
}

if (reduceMotion) {
  html.classList.add("reveal-all");
  html.classList.remove("has-intro");
} else if (!runIntro() && $("[data-hero-line], [data-hero-in]")) {
  heroReveal();
}

// Hero slideshow
(function heroSlides() {
  const slides = $$("[data-hero-slide]");
  if (slides.length < 2) return;
  const indexEl = $("[data-hero-index]");
  const captionEl = $("[data-hero-caption]");
  const bar = $("[data-hero-progress]");
  const DURATION = 6.5;
  let current = 0;
  let timer: gsap.core.Tween | undefined;

  const go = (next: number) => {
    const prev = slides[current];
    slides.forEach((s) => s.classList.remove("was-active"));
    prev.classList.remove("is-active");
    prev.classList.add("was-active");
    current = next;
    slides[current].classList.add("is-active");
    window.setTimeout(() => prev.classList.remove("was-active"), 1700);
    if (indexEl) indexEl.textContent = String(current + 1).padStart(2, "0");
    if (captionEl) {
      gsap.fromTo(captionEl, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.8, ease: "expo.out" });
      captionEl.textContent = slides[current].dataset.caption ?? "";
    }
    run();
  };
  const run = () => {
    timer?.kill();
    timer = gsap.fromTo(bar, { scaleX: 0 }, {
      scaleX: 1,
      duration: DURATION,
      ease: "none",
      onComplete: () => go((current + 1) % slides.length),
    });
  };
  run();
  const hero = $("[data-hero]");
  if (hero) {
    ScrollTrigger.create({
      trigger: hero,
      start: "top top",
      end: "bottom top",
      onLeave: () => timer?.pause(),
      onEnterBack: () => timer?.resume(),
    });
  }
  document.addEventListener("visibilitychange", () => (document.hidden ? timer?.pause() : timer?.resume()));
})();

// Stay page hero parallax + slight fade as you scroll away
$$("[data-hero-scroll]").forEach((el) => {
  if (reduceMotion) return;
  gsap.to(el, {
    yPercent: 12,
    ease: "none",
    scrollTrigger: { trigger: el.closest("section") ?? el, start: "top top", end: "bottom top", scrub: true },
  });
});

// ── Scroll reveals ──────────────────────────────────────────────────────────
if (!reduceMotion) {
  ScrollTrigger.batch("[data-reveal]", {
    start: "top 88%",
    once: true,
    onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: 1.2, ease: "expo.out", stagger: 0.1, overwrite: true }),
  });

  $$("[data-reveal-stagger]").forEach((group) => {
    gsap.to(group.children, {
      opacity: 1,
      y: 0,
      duration: 1.1,
      ease: "expo.out",
      stagger: 0.08,
      scrollTrigger: { trigger: group, start: "top 88%", once: true },
    });
  });

  $$("[data-img-reveal]").forEach((el) => {
    const img = $("img", el);
    const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: "top 88%", once: true } });
    tl.to(el, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.5, ease: "expo.inOut" });
    if (img) tl.from(img, { scale: 1.35, duration: 2, ease: "expo.out" }, 0.1);
  });

  $$("[data-split]").forEach((el) => {
    SplitText.create(el, {
      type: "lines",
      mask: "lines",
      autoSplit: true,
      onSplit(self) {
        gsap.set(el, { visibility: "visible" });
        return gsap.from(self.lines, {
          yPercent: 105,
          duration: 1.3,
          ease: "expo.out",
          stagger: 0.1,
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        });
      },
    });
  });

  // Manifesto: words brighten as you read
  $$("[data-scrub-text]").forEach((el) => {
    const split = SplitText.create(el, { type: "words", tag: "span" });
    gsap.fromTo(
      split.words,
      { opacity: 0.16 },
      {
        opacity: 1,
        ease: "none",
        stagger: 0.1,
        scrollTrigger: { trigger: el, start: "top 80%", end: "bottom 50%", scrub: 0.6 },
      },
    );
  });

  // Parallax images inside frames
  $$<HTMLElement>("[data-parallax]").forEach((el) => {
    const amount = parseFloat(el.dataset.parallax ?? "0.1") || 0.1;
    el.style.setProperty("--p", String(amount));
    const frame = el.closest(".frame, .cta, section") ?? el.parentElement!;
    gsap.fromTo(
      el,
      { yPercent: -amount * 50 },
      {
        yPercent: amount * 50,
        ease: "none",
        scrollTrigger: { trigger: frame, start: "top bottom", end: "bottom top", scrub: true },
      },
    );
  });

  // Count-up stats
  $$("[data-count]").forEach((el) => {
    const end = Number(el.dataset.count);
    const counter = { v: 0 };
    el.textContent = "00";
    ScrollTrigger.create({
      trigger: el,
      start: "top 92%",
      once: true,
      onEnter: () =>
        gsap.to(counter, {
          v: end,
          duration: 1.8,
          ease: "power3.out",
          onUpdate: () => (el.textContent = String(Math.round(counter.v)).padStart(2, "0")),
        }),
    });
  });

  // Footer wordmark rises letter by letter
  const word = $("[data-footer-word]");
  if (word) {
    gsap.from(word.children, {
      yPercent: 70,
      opacity: 0,
      duration: 1.4,
      ease: "expo.out",
      stagger: 0.07,
      scrollTrigger: { trigger: word, start: "top 95%", once: true },
    });
  }
} else {
  html.classList.add("reveal-all");
}

// ── Stacked stay cards ──────────────────────────────────────────────────────
const mm = gsap.matchMedia();
mm.add("(min-width: 1001px) and (prefers-reduced-motion: no-preference)", () => {
  const cards = $$("[data-stay-card]");
  cards.forEach((card, i) => {
    const next = cards[i + 1];
    if (!next) return;
    gsap.fromTo(card, { scale: 1, filter: "brightness(1) saturate(1)" }, {
      scale: 0.93,
      filter: "brightness(0.7) saturate(0.9)",
      ease: "none",
      scrollTrigger: {
        trigger: next,
        start: "top bottom",
        end: () => `top ${($("[data-header]")?.offsetHeight ?? 84) + 40}px`,
        scrub: true,
        invalidateOnRefresh: true,
      },
    });
  });
});

// ── Marquee that reacts to scroll speed ────────────────────────────────────
$$("[data-marquee]").forEach((m) => {
  const track = $("[data-marquee-track]", m);
  if (!track || reduceMotion) return;
  const loop = gsap.to(track, { xPercent: -50, duration: 38, ease: "none", repeat: -1 });
  let dir = 1;
  ScrollTrigger.create({
    trigger: m,
    start: "top bottom",
    end: "bottom top",
    onUpdate(self) {
      const v = self.getVelocity();
      if (Math.abs(v) < 5) return;
      dir = v > 0 ? 1 : -1;
      const boost = Math.min(1 + Math.abs(v) / 260, 6);
      gsap.timeline({ overwrite: true })
        .to(loop, { timeScale: dir * boost, duration: 0.25, ease: "power2.out" })
        .to(loop, { timeScale: dir, duration: 1.2, ease: "power2.out" });
    },
  });
});

// ── Horizontal rail (Explore Kochi) ─────────────────────────────────────────
$$("[data-rail]").forEach((rail) => {
  const section = rail.closest("section") ?? document;
  const prev = $<HTMLButtonElement>("[data-rail-prev]", section);
  const next = $<HTMLButtonElement>("[data-rail-next]", section);
  const bar = $("[data-rail-progress]", section);
  const step = () => {
    const item = rail.querySelector("li");
    return item ? item.getBoundingClientRect().width + 24 : rail.clientWidth * 0.8;
  };
  const update = () => {
    const max = rail.scrollWidth - rail.clientWidth;
    const p = max > 0 ? rail.scrollLeft / max : 1;
    if (bar) bar.style.transform = `scaleX(${0.12 + p * 0.88})`;
    if (prev) prev.disabled = rail.scrollLeft < 8;
    if (next) next.disabled = rail.scrollLeft > max - 8;
  };
  prev?.addEventListener("click", () => rail.scrollBy({ left: -step(), behavior: "smooth" }));
  next?.addEventListener("click", () => rail.scrollBy({ left: step(), behavior: "smooth" }));
  rail.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
  update();

  // Drag to scroll with a mouse
  let down = false;
  let moved = false;
  let startX = 0;
  let startLeft = 0;
  rail.addEventListener("pointerdown", (e) => {
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    down = true;
    moved = false;
    startX = e.clientX;
    startLeft = rail.scrollLeft;
  });
  window.addEventListener("pointermove", (e) => {
    if (!down) return;
    const dx = e.clientX - startX;
    if (!moved && Math.abs(dx) > 4) {
      moved = true;
      rail.classList.add("is-dragging");
    }
    if (moved) rail.scrollLeft = startLeft - dx;
  });
  window.addEventListener("pointerup", () => {
    if (!down) return;
    down = false;
    if (moved) {
      rail.classList.remove("is-dragging");
      // let scroll-snap settle on the nearest card
      rail.scrollBy({ left: 1, behavior: "smooth" });
    }
  });
  rail.addEventListener("click", (e) => {
    if (moved) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, true);
});

// ── Finder ("What brings you to Kochi?") ────────────────────────────────────
$$("[data-finder]").forEach((finder) => {
  const chips = $$<HTMLButtonElement>("[data-finder-chip]", finder);
  const results = $$("[data-finder-result]", finder);
  const select = (chip: HTMLButtonElement, focus = false) => {
    const id = chip.dataset.finderChip;
    chips.forEach((c) => {
      const on = c === chip;
      c.setAttribute("aria-checked", String(on));
      c.tabIndex = on ? 0 : -1;
    });
    results.forEach((r) => {
      const on = r.dataset.finderResult === id;
      r.hidden = !on;
      r.classList.toggle("is-entering", on);
    });
    if (focus) chip.focus();
  };
  chips.forEach((chip, i) => {
    chip.addEventListener("click", () => select(chip));
    chip.addEventListener("keydown", (e) => {
      const dirs: Record<string, number> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
      if (!(e.key in dirs)) return;
      e.preventDefault();
      select(chips[(i + dirs[e.key] + chips.length) % chips.length], true);
    });
  });
});

// ── Illustrated map ─────────────────────────────────────────────────────────
$$("[data-map]").forEach((map) => {
  const scope = map.closest("section") ?? document;
  const items = $$("[data-map-item]", scope);
  const pins = $$<SVGGElement>("[data-map-pin]", map);
  const routes = $$<SVGPathElement>("[data-map-route]", map);
  const setActive = (slug: string | null) => {
    items.forEach((el) => el.classList.toggle("is-active", el.dataset.mapItem === slug));
    pins.forEach((el) => el.classList.toggle("is-active", el.dataset.mapPin === slug));
    routes.forEach((el) => el.classList.toggle("is-active", el.dataset.mapRoute === slug));
  };
  const focusSlug = map.dataset.mapFocus;
  let current: string | null = null;
  const activate = (slug: string) => {
    current = slug;
    setActive(slug);
  };
  items.forEach((el) => {
    const slug = el.dataset.mapItem!;
    el.addEventListener("mouseenter", () => activate(slug));
    el.addEventListener("focus", () => activate(slug));
    el.addEventListener("click", () => activate(slug));
  });
  pins.forEach((el) => {
    const slug = el.dataset.mapPin!;
    el.addEventListener("mouseenter", () => activate(slug));
    el.addEventListener("focus", () => activate(slug));
    el.addEventListener("click", () => {
      if (focusSlug) return;
      activate(slug);
      window.location.href = `/stays/${slug}/`;
    });
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        window.location.href = `/stays/${slug}/`;
      }
    });
  });
  ScrollTrigger.create({
    trigger: map,
    start: "top 70%",
    once: true,
    onEnter: () => window.setTimeout(() => current || activate(focusSlug ?? items[0]?.dataset.mapItem ?? pins[0]?.dataset.mapPin ?? ""), 500),
  });
});

// ── Magnetic buttons ────────────────────────────────────────────────────────
if (finePointer && !reduceMotion) {
  $$("[data-magnetic]").forEach((el) => {
    const xTo = gsap.quickTo(el, "x", { duration: 0.6, ease: "power3.out" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.6, ease: "power3.out" });
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - (r.left + r.width / 2)) * 0.28);
      yTo((e.clientY - (r.top + r.height / 2)) * 0.4);
    });
    el.addEventListener("pointerleave", () => {
      xTo(0);
      yTo(0);
    });
  });
}

// ── Cursor ──────────────────────────────────────────────────────────────────
(function cursor() {
  const el = $("[data-cursor]");
  const label = $("[data-cursor-label]");
  if (!el || !label || !finePointer || reduceMotion) return;
  const xTo = gsap.quickTo(el, "x", { duration: 0.35, ease: "power3.out" });
  const yTo = gsap.quickTo(el, "y", { duration: 0.35, ease: "power3.out" });
  window.addEventListener(
    "pointermove",
    (e) => {
      if (e.pointerType !== "mouse") return;
      xTo(e.clientX);
      yTo(e.clientY);
      el.classList.add("is-active");
    },
    { passive: true },
  );
  document.documentElement.addEventListener("pointerleave", () => el.classList.remove("is-active"));
  document.addEventListener("pointerover", (e) => {
    const t = e.target as Element;
    const labelled = t.closest<HTMLElement>("[data-cursor-label]");
    const interactive = t.closest("a, button, [role='button'], [role='radio'], summary, label, input, textarea, select");
    // A control inside a labelled area (e.g. a button inside the drag rail) gets the plain link state.
    const useLabel = Boolean(labelled && (!interactive || interactive === labelled || !labelled.contains(interactive)));
    const text = useLabel ? labelled!.dataset.cursorLabel ?? "" : "";
    el.classList.toggle("has-label", text !== "");
    label.textContent = text;
    el.classList.toggle("is-link", !text && Boolean(interactive));
    el.classList.toggle(
      "on-dark",
      Boolean(t.closest(".section--dark, .site-footer, .stay-card, .hero, .site-menu, .stay-hero, .lightbox, [data-dark]")) &&
        !t.closest(".stays-panel, .book__panel"),
    );
  });
})();

// Let ScrollTrigger measure again once fonts and images have settled.
window.addEventListener("load", () => ScrollTrigger.refresh());
document.fonts?.ready.then(() => ScrollTrigger.refresh());
