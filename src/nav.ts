/*
 * nav.ts — Navbar flotante y menú hamburguesa.
 *
 * Responsabilidades:
 * - Cambiar de vista al pulsar un enlace (vía hash en la URL).
 * - Abrir/cerrar el menú hamburguesa en pantallas pequeñas.
 * - Cerrar el menú con Escape o al hacer clic fuera.
 */

import type { ViewId } from "./types";

/**
 * Inicializa el comportamiento del navbar.
 *
 * Los enlaces con `data-view` actualizan `location.hash`; el router de
 * `main.ts` escucha `hashchange` y muestra la vista correspondiente.
 */
export function initNav(): void {
    const nav = document.getElementById("nav");
    const burger = document.getElementById("navBurger") as HTMLButtonElement | null;
    if (!nav || !burger) return;

    // Aplica (o quita) el estado abierto y mantiene los atributos ARIA al día.
    const setOpen = (open: boolean): void => {
        nav.classList.toggle("is-open", open);
        burger.setAttribute("aria-expanded", String(open));
        burger.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
    };

    // Cada enlace (incluida la wordmark) cambia el hash y cierra el menú.
    nav.querySelectorAll<HTMLAnchorElement>("a[data-view]").forEach((link) => {
        link.addEventListener("click", (event) => {
            event.preventDefault();
            const view = link.dataset.view as ViewId;
            if (window.location.hash !== `#${view}`) {
                window.location.hash = view;
            }
            setOpen(false);
        });
    });

    burger.addEventListener("click", () => {
        setOpen(!nav.classList.contains("is-open"));
    });

    // Escape cierra el menú desde cualquier parte.
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") setOpen(false);
    });

    // Clic fuera del navbar cierra el menú (solo cuando está abierto).
    document.addEventListener("pointerdown", (event) => {
        if (nav.classList.contains("is-open") && !nav.contains(event.target as Node)) {
            setOpen(false);
        }
    });
}
