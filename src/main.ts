import "./style.css";
import { initNav } from "./nav";
import { initClock } from "./views/clockView";
import { initTimer } from "./views/timerView";
import { initStopwatch } from "./views/stopwatchView";
import { VIEW_IDS, type ViewId } from "./types";

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

const clock = initClock(document.getElementById("clockMount") as HTMLElement);
const timer = initTimer();
const stopwatch = initStopwatch();

function showView(id: ViewId): void {
  for (const key of VIEW_IDS) {
    views[key].hidden = key !== id;
  }

  if (id === "reloj") {
    clock.start();
  } else {
    clock.stop();
  }

  timer.setVisible(id === "temporizador");
  stopwatch.setVisible(id === "cronometro");

  document.querySelectorAll<HTMLAnchorElement>("a.nav__link[data-view]").forEach((link) => {
    const active = link.dataset.view === id;
    link.classList.toggle("is-active", active);
    if (active) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

initNav();

window.addEventListener("hashchange", () => showView(resolveView()));
showView(resolveView());
