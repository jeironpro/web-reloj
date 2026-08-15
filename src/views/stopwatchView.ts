/*
 * stopwatchView.ts — Cronómetro con centésimas y vueltas.
 *
 * El tiempo transcurrido se calcula contra `performance.now()`: mientras corre
 * suma el lapso desde `startedAt`, y al pausar acumula lo ya medido. El bucle
 * de render (rAF) solo avanza cuando la vista está visible y en marcha.
 */

import { byId } from "../utils/dom";
import { formatSplit, pad2 } from "../utils/format";
import type { ViewController } from "../types";

/** Inicializa el cronómetro y devuelve su controlador de visibilidad. */
export function initStopwatch(): ViewController {
    const display = byId<HTMLElement>("stopwatchDisplay");
    const startBtn = byId<HTMLButtonElement>("stopwatchStart");
    const lapBtn = byId<HTMLButtonElement>("stopwatchLap");
    const resetBtn = byId<HTMLButtonElement>("stopwatchReset");
    const lapsEl = byId<HTMLOListElement>("stopwatchLaps");

    // `accumulated` guarda lo medido antes de la última pausa; `startedAt`,
    // el instante en que empezó a correr la última vez. `lastLap` es el
    // tiempo acumulado en el momento de la vuelta anterior.
    let accumulated = 0;
    let startedAt = 0;
    let running = false;
    let lastLap = 0;
    let lapCount = 0;
    let visible = true;
    let raf = 0;

    const elapsed = (): number => accumulated + (running ? performance.now() - startedAt : 0);

    const render = (): void => {
        display.textContent = formatSplit(elapsed());
    };

    // Bucle de render: se detiene solo si no corre o si la vista está oculta.
    const loop = (): void => {
        if (!running || !visible) return;
        raf = requestAnimationFrame(loop);
        render();
    };

    const startLoop = (): void => {
        cancelAnimationFrame(raf);
        if (running && visible) raf = requestAnimationFrame(loop);
    };

    const start = (): void => {
        if (running) {
            pause();
            return;
        }
        running = true;
        startedAt = performance.now();
        startBtn.textContent = "Pausar";
        lapBtn.disabled = false;
        resetBtn.disabled = false;
        startLoop();
    };

    const pause = (): void => {
        accumulated = elapsed();
        running = false;
        startBtn.textContent = "Reanudar";
        lapBtn.disabled = true;
        startLoop();
        render();
    };

    const reset = (): void => {
        running = false;
        accumulated = 0;
        lastLap = 0;
        lapCount = 0;
        lapsEl.replaceChildren();
        startBtn.textContent = "Iniciar";
        lapBtn.disabled = true;
        resetBtn.disabled = true;
        startLoop();
        render();
    };

    // Registra una vuelta: el parcial es el tiempo desde la vuelta anterior.
    const lap = (): void => {
        const now = elapsed();
        const split = now - lastLap;
        lastLap = now;
        lapCount += 1;

        const item = document.createElement("li");
        item.className = "stopwatch__lap";
        item.dataset.ms = String(split);

        const label = document.createElement("b");
        label.textContent = `Vuelta ${pad2(lapCount)}`;

        const time = document.createElement("span");
        time.textContent = formatSplit(split);

        item.append(label, time);
        lapsEl.prepend(item);

        const items = Array.from(lapsEl.querySelectorAll<HTMLLIElement>("li"));
        let best: HTMLLIElement | null = null;
        let bestMs = Infinity;
        for (const el of items) {
            el.classList.remove("stopwatch__lap--best");
            const value = Number(el.dataset.ms ?? 0);
            if (value < bestMs) {
                bestMs = value;
                best = el;
            }
        }
        if (best && items.length > 1) best.classList.add("stopwatch__lap--best");
    };

    startBtn.addEventListener("click", start);
    lapBtn.addEventListener("click", lap);
    resetBtn.addEventListener("click", reset);

    render();

    return {
        setVisible(next: boolean): void {
            visible = next;
            if (visible) {
                render();
                startLoop();
            } else {
                cancelAnimationFrame(raf);
            }
        },
    };
}
