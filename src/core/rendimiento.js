// ============================================================================
// MEDIDA DE RENDIMIENTO
// ----------------------------------------------------------------------------
// Tabla oficial de puntos de la practica. No confundir con los puntajes
// internos de decision.js (esos solo sirven para elegir direccion).
//   paquete +10 | movimiento -1 | salir del tablero -5
//   chocar obstaculo -5 | bono todos los paquetes +20
// ============================================================================

import { EVENTO } from './accion.js'

export const PUNTOS = {
  [EVENTO.PAQUETE_RECOGIDO]: 10,
  [EVENTO.MOVIMIENTO_VALIDO]: -1,
  [EVENTO.INTENTO_SALIR_TABLERO]: -5,
  [EVENTO.INTENTO_CHOCAR_OBSTACULO]: -5,
  [EVENTO.SIN_ACCION]: 0
}

export const BONO_TODOS_LOS_PAQUETES = 20

/**
 * @param {string} evento uno de los valores de EVENTO (accion.js)
 * @returns {number} delta de puntos que produjo ese evento
 */
export function puntosPorEvento(evento) {
  return PUNTOS[evento] ?? 0
}

/** Indica si un evento cuenta como "penalizacion" en la tabla de resultados. */
export function esPenalizacion(evento) {
  return evento === EVENTO.INTENTO_SALIR_TABLERO || evento === EVENTO.INTENTO_CHOCAR_OBSTACULO
}

/** Indica si un evento cuenta como "movimiento" en la tabla de resultados. */
export function esMovimiento(evento) {
  return evento === EVENTO.MOVIMIENTO_VALIDO
}