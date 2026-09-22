// ============================================================================
// PERCEPCIÓN — SENSORES
// ----------------------------------------------------------------------------
// percibir() es la ÚNICA función autorizada a leer el entorno real. Devuelve
// exclusivamente lo que el agente podría "sentir" desde su posición actual:
// la celda donde está parado y las cuatro celdas adyacentes. Nada más.
//
// El objeto que retorna es la PERCEPCIÓN del ciclo
// ENTORNO → SENSORES → PERCEPCIÓN → DECISIÓN → ACCIÓN → ENTORNO
// ============================================================================

import { CONTENIDO } from './entorno.js'

export const DIRECCIONES = {
  ARRIBA: { fila: -1, columna: 0 },
  ABAJO: { fila: 1, columna: 0 },
  IZQUIERDA: { fila: 0, columna: -1 },
  DERECHA: { fila: 0, columna: 1 }
}

/**
 * @param {import('./entorno.js').Entorno} entorno
 * @param {{fila:number, columna:number}} posicion posición actual del agente
 * @returns {{
 *   posicion: {fila:number, columna:number},
 *   actual: string,
 *   arriba: string, abajo: string, izquierda: string, derecha: string
 * }}
 */
export function percibir(entorno, posicion) {
  const celdaEn = (df, dc) =>
    entorno.contenidoDeCelda(posicion.fila + df, posicion.columna + dc)

  return {
    posicion: { ...posicion },
    // La celda actual nunca puede contener al propio agente como obstáculo;
    // reportamos su contenido "de suelo" (vacío o paquete).
    actual: entorno.contenidoDeCelda(posicion.fila, posicion.columna),
    arriba: celdaEn(DIRECCIONES.ARRIBA.fila, DIRECCIONES.ARRIBA.columna),
    abajo: celdaEn(DIRECCIONES.ABAJO.fila, DIRECCIONES.ABAJO.columna),
    izquierda: celdaEn(DIRECCIONES.IZQUIERDA.fila, DIRECCIONES.IZQUIERDA.columna),
    derecha: celdaEn(DIRECCIONES.DERECHA.fila, DIRECCIONES.DERECHA.columna)
  }
}

/** Utilidad: nombre de dirección -> celda destino, dada una posición. */
export function celdaDestino(posicion, nombreDireccion) {
  const d = DIRECCIONES[nombreDireccion]
  return { fila: posicion.fila + d.fila, columna: posicion.columna + d.columna }
}

export { CONTENIDO }
