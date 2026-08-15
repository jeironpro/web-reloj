import "./style.css";
import { initNav } from "./nav";
import { VIEW_IDS, type ViewId } from "./types";

const TITLES: Record<ViewId, string> = {
  reloj: "Reloj",
  temporizador: "Temporizador",
  cronometro: "Cronómetro",
};

const views: Record<ViewId, HTMLElement> = {
  reloj: document.getElementById("view-reloj") as HTMLElement,
  temporizador: document.getElementById("view-temporizador") as HTMLElement,
  cronometro: document.getElementById("view-cronometro") as HTMLElement,
};

function resolveView(): ViewId {
  const hash = window.location.hash.replace("#", "");
  if (hash === "temporizador" || hash === "cronometro") return hash;
  return "reloj";
}

function showView(id: ViewId): void {
  for (const key of VIEW_IDS) {
    views[key].hidden = key !== id;
  }

  document.querySelectorAll<HTMLAnchorElement>("a.nav__link[data-view]").forEach((link) => {
    const active = link.dataset.view === id;
    link.classList.toggle("is-active", active);
    if (active) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });

  document.title = `Reloj · ${TITLES[id]}`;
}

initNav();

window.addEventListener("hashchange", () => showView(resolveView()));
showView(resolveView());
