/*
 * main.ts — Punto de entrada de la aplicación.
 *
 * Monta las tres vistas, inicializa el navbar y actúa como router basado en
 * el hash de la URL (#reloj, #temporizador, #cronometro). El hash permite
 * enlaces profundos y el botón "atrás" del navegador.
 */

import "./style.css";
import { initNav } from "./nav";
import { initClock } from "./views/clockView";
import { initTimer } from "./views/timerView";
import { initStopwatch } from "./views/stopwatchView";
import { byId } from "./utils/dom";
import { VIEW_IDS, type ViewId } from "./types";

// Secciones del DOM, una por vista, localizadas por id.
const views: Record<ViewId, HTMLElement> = {
    reloj: byId<HTMLElement>("view-reloj"),
    temporizador: byId<HTMLElement>("view-temporizador"),
    cronometro: byId<HTMLElement>("view-cronometro"),
};

/** Convierte el hash actual en un identificador de vista válido. */
function resolveView(): ViewId {
    const hash = window.location.hash.replace("#", "");
    if (hash === "temporizador" || hash === "cronometro") return hash;
    return "reloj"; // Reloj es la vista por defecto.
}

// Controladores de las tres vistas. Cada uno gestiona su propio ciclo de vida.
const clock = initClock(byId<HTMLElement>("clockMount"));
const timer = initTimer();
const stopwatch = initStopwatch();

/**
 * Muestra la vista indicada y oculta el resto, activando/parando el ciclo de
 * vida de cada controlador y marcando el enlace activo del navbar.
 */
function showView(id: ViewId): void {
    for (const key of VIEW_IDS) {
        views[key].hidden = key !== id;
    }

    // El reloj solo renderiza (rAF) mientras su vista está visible.
    if (id === "reloj") {
        clock.start();
    } else {
        clock.stop();
    }

    // Temporizador y cronómetro reaccionan a su visibilidad.
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
