// ============================================================================
// ACCIONES  (ACTUADORES)
// ----------------------------------------------------------------------------
// actuar() es la unica funcion que puede modificar el entorno o la posicion
// del agente. Recibe la accion elegida por decidir() y devuelve un EVENTO
// que despues rendimiento.js convierte en puntos.
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
    // Quita el paquete del almacen y me quedo en la misma celda.
    entorno.quitarPaquete(posicionActual.fila, posicionActual.columna)
    return { nuevaPosicion: { ...posicionActual }, evento: EVENTO.PAQUETE_RECOGIDO }
  }

  // MOVER: calculo la celda a donde me dirijo.
  const destino = celdaDestino(posicionActual, accion.direccion)

  if (!entorno.estaDentroDelTablero(destino.fila, destino.columna)) {
    // Salvaguarda: decidir() ya descarta esto, pero si pasara se registra
    // la penalizacion (intento de salir del tablero).
    return { nuevaPosicion: { ...posicionActual }, evento: EVENTO.INTENTO_SALIR_TABLERO }
  }

  if (entorno.contieneObstaculo(destino.fila, destino.columna)) {
    // Salvaguarda similar: nunca deberia pedirme chocar con un obstaculo.
    return { nuevaPosicion: { ...posicionActual }, evento: EVENTO.INTENTO_CHOCAR_OBSTACULO }
  }

  return { nuevaPosicion: destino, evento: EVENTO.MOVIMIENTO_VALIDO }
}

export { CONTENIDO }