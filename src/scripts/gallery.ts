// Full-screen photo viewer for stay galleries: keyboard, swipe, and focus-safe via <dialog>.
import type Lenis from "lenis";

export function initGallery({ lenis }: { lenis?: Lenis }) {
  const dialog = document.querySelector<HTMLDialogElement>("[data-lightbox]");
  const items = Array.from(document.querySelectorAll<HTMLElement>("[data-gallery-item]"));
  if (!dialog || !items.length) return;

  const img = dialog.querySelector<HTMLImageElement>("[data-lightbox-img]")!;
  const caption = dialog.querySelector<HTMLElement>("[data-lightbox-caption]")!;
  const count = dialog.querySelector<HTMLElement>("[data-lightbox-count]")!;
  let index = 0;

  const preload = (i: number) => {
    const it = items[(i + items.length) % items.length];
    const pre = new Image();
    pre.src = it.dataset.full ?? "";
  };

  function show(i: number, dir = 0) {
    index = (i + items.length) % items.length;
    const it = items[index];
    img.classList.remove("is-in", "from-left", "from-right");
    void img.offsetWidth;
    img.src = it.dataset.full ?? "";
    img.alt = it.dataset.caption ?? "";
    caption.textContent = it.dataset.caption ?? "";
    count.textContent = `${String(index + 1).padStart(2, "0")} / ${String(items.length).padStart(2, "0")}`;
    if (dir) img.classList.add(dir > 0 ? "from-right" : "from-left");
    const reveal = () => img.classList.add("is-in");
    if (img.complete) requestAnimationFrame(reveal);
    else img.addEventListener("load", reveal, { once: true });
    preload(index + 1);
    preload(index - 1);
  }

  const next = () => show(index + 1, 1);
  const prev = () => show(index - 1, -1);

  items.forEach((it, i) =>
    it.addEventListener("click", () => {
      show(i);
      dialog.showModal();
      document.documentElement.classList.add("lightbox-open");
      lenis?.stop();
    }),
  );
  dialog.querySelector("[data-lightbox-next]")?.addEventListener("click", next);
  dialog.querySelector("[data-lightbox-prev]")?.addEventListener("click", prev);
  dialog.querySelector("[data-lightbox-close]")?.addEventListener("click", () => dialog.close());
  dialog.addEventListener("close", () => {
    document.documentElement.classList.remove("lightbox-open");
    lenis?.start();
    items[index]?.focus({ preventScroll: true });
  });
  dialog.addEventListener("click", (e) => {
    if (e.target === dialog || (e.target as Element).matches("[data-lightbox-stage]")) dialog.close();
  });
  dialog.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") next();
    if (e.key === "ArrowLeft") prev();
  });

  // Swipe
  let startX = 0;
  let startY = 0;
  dialog.addEventListener("pointerdown", (e) => {
    startX = e.clientX;
    startY = e.clientY;
  });
  dialog.addEventListener("pointerup", (e) => {
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) (dx < 0 ? next : prev)();
  });
}
