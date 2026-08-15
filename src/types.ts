/*
 * types.ts — Tipos compartidos de la aplicación.
 */

/** Identificadores de las tres vistas disponibles. */
export type ViewId = "reloj" | "temporizador" | "cronometro";

/** Lista de vistas en orden (usada para recorrerlas en el router). */
export const VIEW_IDS: readonly ViewId[] = ["reloj", "temporizador", "cronometro"];

/**
 * Contrato de las vistas que deben reaccionar al mostrarse u ocultarse:
 * temporizador y cronómetro pausan su bucle de render cuando no están activas.
 */
export interface ViewController {
    setVisible(visible: boolean): void;
}
