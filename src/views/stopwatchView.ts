import { byId } from "../utils/dom";
import { formatSplit, pad2 } from "../utils/format";
import type { ViewController } from "../types";

export function initStopwatch(): ViewController {
    const display = byId<HTMLElement>("stopwatchDisplay");
    const startBtn = byId<HTMLButtonElement>("stopwatchStart");
    const lapBtn = byId<HTMLButtonElement>("stopwatchLap");
    const resetBtn = byId<HTMLButtonElement>("stopwatchReset");
    const lapsEl = byId<HTMLOListElement>("stopwatchLaps");

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
