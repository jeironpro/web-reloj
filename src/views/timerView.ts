import { byId } from "../utils/dom";
import { clampInt, formatTimer } from "../utils/format";
import type { ViewController } from "../types";

const CIRCUMFERENCE = 2 * Math.PI * 92;

export function initTimer(): ViewController {
    const hInput = byId<HTMLInputElement>("timerH");
    const mInput = byId<HTMLInputElement>("timerM");
    const sInput = byId<HTMLInputElement>("timerS");
    const display = byId<HTMLElement>("timerDisplay");
    const ring = byId<SVGCircleElement>("timerRing");
    const dial = byId<HTMLElement>("timerDial");
    const startBtn = byId<HTMLButtonElement>("timerStart");
    const resetBtn = byId<HTMLButtonElement>("timerReset");
    const statusEl = byId<HTMLElement>("timerStatus");
    const presets = Array.from(document.querySelectorAll<HTMLButtonElement>("#timerPresets .chip"));

    let totalMs = 5 * 60 * 1000;
    let remainingMs = totalMs;
    let endAt = 0;
    let running = false;
    let finished = false;
    let intervalId: number | undefined;
    let audio: AudioContext | null = null;

    const readTotal = (): number => {
        const h = clampInt(hInput.value, 0, 23);
        const m = clampInt(mInput.value, 0, 59);
        const s = clampInt(sInput.value, 0, 59);
        return ((h * 60 + m) * 60 + s) * 1000;
    };

    const render = (ms: number): void => {
        display.textContent = formatTimer(ms);
        const fraction = totalMs > 0 ? Math.min(1, Math.max(0, ms / totalMs)) : 0;
        ring.style.strokeDashoffset = String(CIRCUMFERENCE * (1 - fraction));
    };

    const syncControls = (): void => {
        const locked = running || finished || remainingMs !== totalMs;
        hInput.disabled = locked;
        mInput.disabled = locked;
        sInput.disabled = locked;
        presets.forEach((chip) => {
            chip.disabled = locked;
        });
        resetBtn.disabled = !running && !finished && remainingMs === totalMs;
    };

    const ensureAudio = (): void => {
        if (audio) {
            void audio.resume();
            return;
        }
        const Ctx =
            window.AudioContext ??
            (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (Ctx) {
            audio = new Ctx();
            void audio.resume();
        }
    };

    const beep = (): void => {
        const ctx = audio;
        if (!ctx || ctx.state !== "running") return;
        const t0 = ctx.currentTime;
        [880, 660].forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "sine";
            osc.frequency.value = freq;
            const start = t0 + i * 0.28;
            gain.gain.setValueAtTime(0.0001, start);
            gain.gain.exponentialRampToValueAtTime(0.25, start + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.4);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(start);
            osc.stop(start + 0.45);
        });
    };

    const step = (): void => {
        const ms = Math.max(0, endAt - Date.now());
        render(ms);
        if (ms <= 0) complete();
    };

    const start = (): void => {
        ensureAudio();
        if (running) {
            pause();
            return;
        }
        if (finished || remainingMs <= 0) {
            remainingMs = totalMs || readTotal();
            if (remainingMs <= 0) return;
            totalMs = remainingMs;
            finished = false;
            dial.classList.remove("is-done");
        }
        endAt = Date.now() + remainingMs;
        running = true;
        startBtn.textContent = "Pausar";
        startBtn.setAttribute("aria-pressed", "true");
        statusEl.textContent = "En marcha…";
        syncControls();
        intervalId = window.setInterval(step, 200);
    };

    const pause = (): void => {
        remainingMs = Math.max(0, endAt - Date.now());
        running = false;
        if (intervalId !== undefined) {
            window.clearInterval(intervalId);
            intervalId = undefined;
        }
        startBtn.textContent = "Continuar";
        startBtn.setAttribute("aria-pressed", "false");
        statusEl.textContent = "En pausa";
        syncControls();
    };

    const reset = (): void => {
        if (intervalId !== undefined) {
            window.clearInterval(intervalId);
            intervalId = undefined;
        }
        running = false;
        finished = false;
        totalMs = readTotal();
        remainingMs = totalMs;
        dial.classList.remove("is-done");
        render(remainingMs);
        startBtn.textContent = "Iniciar";
        startBtn.setAttribute("aria-pressed", "false");
        statusEl.textContent = "";
        syncControls();
    };

    const complete = (): void => {
        if (intervalId !== undefined) {
            window.clearInterval(intervalId);
            intervalId = undefined;
        }
        running = false;
        finished = true;
        remainingMs = 0;
        render(0);
        startBtn.textContent = "Repetir";
        startBtn.setAttribute("aria-pressed", "false");
        statusEl.textContent = "¡Tiempo!";
        dial.classList.add("is-done");
        syncControls();
        beep();
    };

    const onInputChange = (): void => {
        if (running || finished || remainingMs !== totalMs) return;
        totalMs = readTotal();
        remainingMs = totalMs;
        render(totalMs);
        updateChipActive();
        syncControls();
    };

    const applyPreset = (chip: HTMLButtonElement): void => {
        if (running || finished || remainingMs !== totalMs) return;
        const seconds = Number(chip.dataset.seconds ?? 0);
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        hInput.value = String(h);
        mInput.value = String(m);
        sInput.value = String(s);
        totalMs = seconds * 1000;
        remainingMs = totalMs;
        render(totalMs);
        presets.forEach((c) => c.classList.toggle("is-active", c === chip));
        statusEl.textContent = "";
        syncControls();
    };

    const updateChipActive = (): void => {
        const total = readTotal();
        presets.forEach((c) =>
            c.classList.toggle("is-active", Number(c.dataset.seconds ?? 0) * 1000 === total),
        );
    };

    startBtn.addEventListener("click", start);
    resetBtn.addEventListener("click", reset);
    [hInput, mInput, sInput].forEach((input) => input.addEventListener("input", onInputChange));
    presets.forEach((chip) => chip.addEventListener("click", () => applyPreset(chip)));

    render(remainingMs);
    updateChipActive();
    syncControls();

    return {
        setVisible(visible: boolean): void {
            if (visible) {
                render(running ? Math.max(0, endAt - Date.now()) : remainingMs);
            }
        },
    };
}
