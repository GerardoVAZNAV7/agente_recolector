// ============================================================================
// MEDIDA DE RENDIMIENTO
// ----------------------------------------------------------------------------
// Tabla oficial de puntuación de la práctica:
//
//   Recoger un paquete                  +10
//   Realizar un movimiento               -1
//   Intentar salir del tablero           -5
//   Intentar chocar con un obstáculo     -5
//   Recoger todos los paquetes          +20 adicionales
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

/** Indica si un evento cuenta como "penalización" para la tabla de resultados. */
export function esPenalizacion(evento) {
  return evento === EVENTO.INTENTO_SALIR_TABLERO || evento === EVENTO.INTENTO_CHOCAR_OBSTACULO
}

/** Indica si un evento cuenta como "movimiento" para la tabla de resultados. */
export function esMovimiento(evento) {
  return evento === EVENTO.MOVIMIENTO_VALIDO
}
