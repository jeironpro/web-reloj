/*
 * dom.ts — Utilidades de acceso al DOM.
 *
 * Centraliza la única operación repetida en todas las vistas: localizar un
 * elemento por id y fallar de forma explícita si falta.
 */

/**
 * Obtiene un elemento por su id, lanzando un error claro si no existe.
 *
 * El genérico permite tipar el resultado (HTMLInputElement, SVGCircleElement…)
 * para no repetir casts `as` por todo el código.
 */
export function byId<T extends Element>(id: string): T {
    const el = document.getElementById(id);
    if (!el) throw new Error(`Elemento #${id} no encontrado`);
    return el as unknown as T;
}
