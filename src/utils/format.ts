/*
 * format.ts — Utilidades de formato de números y tiempo.
 *
 * Reúne los helpers que antes estaban duplicados entre las vistas (relleno de
 * dígitos, acotado de enteros y formato de milisegundos).
 */

/**
 * Rellena un entero a dos dígitos con un cero a la izquierda (7 → "07").
 */
export function pad2(n: number): string {
    return n.toString().padStart(2, "0");
}

/**
 * Convierte una cadena a entero y la acota al rango [min, max].
 * Si la cadena no es un número válido, devuelve `min`.
 */
export function clampInt(raw: string, min: number, max: number): number {
    const n = Math.trunc(Number(raw));
    if (Number.isNaN(n)) return min;
    return Math.min(max, Math.max(min, n));
}

/**
 * Formatea milisegundos como `MM:SS`, o `H:MM:SS` si hay al menos una hora.
 * Redondea al segundo más cercano.
 */
export function formatTimer(ms: number): string {
    const totalSeconds = Math.max(0, Math.round(ms / 1000));
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return h > 0 ? `${h}:${pad2(m)}:${pad2(s)}` : `${pad2(m)}:${pad2(s)}`;
}

/**
 * Formatea milisegundos como `MM:SS.cc` (minutos:segundos.centésimas).
 * Los minutos pueden superar 59 (ej. 75:00.00).
 */
export function formatSplit(ms: number): string {
    const totalCs = Math.floor(ms / 10);
    const minutes = Math.floor(totalCs / 6000);
    const seconds = Math.floor((totalCs % 6000) / 100);
    const centis = totalCs % 100;
    return `${pad2(minutes)}:${pad2(seconds)}.${pad2(centis)}`;
}
