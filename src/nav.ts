import type { ViewId } from "./types";

export function initNav(): void {
    const nav = document.getElementById("nav");
    const burger = document.getElementById("navBurger") as HTMLButtonElement | null;
    if (!nav || !burger) return;

    const setOpen = (open: boolean): void => {
        nav.classList.toggle("is-open", open);
        burger.setAttribute("aria-expanded", String(open));
        burger.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
    };

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

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") setOpen(false);
    });

    document.addEventListener("pointerdown", (event) => {
        if (nav.classList.contains("is-open") && !nav.contains(event.target as Node)) {
            setOpen(false);
        }
    });
}
