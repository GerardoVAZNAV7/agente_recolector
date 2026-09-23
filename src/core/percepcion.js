// ============================================================================
// PERCEPCIONES  (SENSORES)
// ----------------------------------------------------------------------------
// percibir() es la unica funcion autorizada a leer el entorno real. Devuelve
// todo lo que el agente puede sentir en su turno: su posicion, la celda en la
// que esta y el contenido de las 4 casillas vecinas. Nada mas.
// Recordar: sin una percepcion el agente no tiene entrada para decidir.
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
 * @param {{fila:number, columna:number}} posicion posicion actual del agente
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
    // La celda actual se reporta como "suelo" (vacia o paquete): el agente
    // nunca puede ser obstaculo para si mismo.
    actual: entorno.contenidoDeCelda(posicion.fila, posicion.columna),
    arriba: celdaEn(DIRECCIONES.ARRIBA.fila, DIRECCIONES.ARRIBA.columna),
    abajo: celdaEn(DIRECCIONES.ABAJO.fila, DIRECCIONES.ABAJO.columna),
    izquierda: celdaEn(DIRECCIONES.IZQUIERDA.fila, DIRECCIONES.IZQUIERDA.columna),
    derecha: celdaEn(DIRECCIONES.DERECHA.fila, DIRECCIONES.DERECHA.columna)
  }
}

/** Utilidad: convertir el nombre de una direccion en la celda que toca desde cierta posicion. */
export function celdaDestino(posicion, nombreDireccion) {
  const d = DIRECCIONES[nombreDireccion]
  return { fila: posicion.fila + d.fila, columna: posicion.columna + d.columna }
}

export { CONTENIDO }