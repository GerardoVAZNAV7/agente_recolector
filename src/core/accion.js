// ============================================================================
// ACCIÓN — ACTUADORES
// ----------------------------------------------------------------------------
// actuar() es la única función que puede modificar el entorno o la posición
// del agente. Recibe la acción elegida por decidir() y produce un EVENTO,
// que luego rendimiento.js traduce en puntos (ver rendimiento.js).
// ============================================================================

import { CONTENIDO, celdaDestino } from './percepcion.js'

export const EVENTO = {
  PAQUETE_RECOGIDO: 'PAQUETE_RECOGIDO',
  MOVIMIENTO_VALIDO: 'MOVIMIENTO_VALIDO',
  INTENTO_SALIR_TABLERO: 'INTENTO_SALIR_TABLERO',
  INTENTO_CHOCAR_OBSTACULO: 'INTENTO_CHOCAR_OBSTACULO',
  SIN_ACCION: 'SIN_ACCION'
}

/**
 * Ejecuta la acción decidida sobre el entorno real.
 *
 * @param {import('./entorno.js').Entorno} entorno
 * @param {{fila:number, columna:number}} posicionActual
 * @param {{tipo:'RECOGER'}|{tipo:'MOVER', direccion:string}|null} accion
 * @returns {{ nuevaPosicion: {fila:number, columna:number}, evento: string }}
 */
export function actuar(entorno, posicionActual, accion) {
  if (!accion) {
    return { nuevaPosicion: { ...posicionActual }, evento: EVENTO.SIN_ACCION }
  }

  if (accion.tipo === 'RECOGER') {
    entorno.quitarPaquete(posicionActual.fila, posicionActual.columna)
    return { nuevaPosicion: { ...posicionActual }, evento: EVENTO.PAQUETE_RECOGIDO }
  }

  // accion.tipo === 'MOVER'
  const destino = celdaDestino(posicionActual, accion.direccion)

  if (!entorno.estaDentroDelTablero(destino.fila, destino.columna)) {
    // La estrategia nunca debería elegir esto (se descarta en decidir()),
    // pero se deja como salvaguarda fiel a la medida de rendimiento oficial.
    return { nuevaPosicion: { ...posicionActual }, evento: EVENTO.INTENTO_SALIR_TABLERO }
  }

  if (entorno.contieneObstaculo(destino.fila, destino.columna)) {
    return { nuevaPosicion: { ...posicionActual }, evento: EVENTO.INTENTO_CHOCAR_OBSTACULO }
  }

  return { nuevaPosicion: destino, evento: EVENTO.MOVIMIENTO_VALIDO }
}

export { CONTENIDO }
