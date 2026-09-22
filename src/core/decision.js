// ============================================================================
// DECISIÓN
// ----------------------------------------------------------------------------
// decidir(percepcion, memoria) implementa la estrategia descrita en
// "estrategia_agente_recolector.md":
//
//   1. Recoger paquete si está en la celda actual.
//   2. Moverse hacia un paquete visible en una celda adyacente.
//   3. Nunca elegir obstáculos.
//   4. Nunca elegir salir del tablero.
//   5. Preferir direcciones que llevan a territorio desconocido (frontera).
//   6. Evitar recorridos repetitivos (celdas ya visitadas).
//   7. Si no hay nada nuevo por explorar, retroceder (backtracking) usando
//      la relación padre guardada en la memoria.
//   8. Desempate fijo: ARRIBA > DERECHA > ABAJO > IZQUIERDA.
//
// IMPORTANTE: esta función solo recibe `percepcion` (lo que el agente sintió
// ESTE turno) y `memoria` (lo que ha acumulado). Nunca recibe el entorno
// real ni el mapa completo.
// ============================================================================

import { CONTENIDO, celdaDestino } from './percepcion.js'

// Orden de desempate fijo (Prioridad 8 de la estrategia).
const ORDEN_DESEMPATE = ['ARRIBA', 'DERECHA', 'ABAJO', 'IZQUIERDA']

// Puntajes internos de apoyo a la decisión (sección 7 de la estrategia).
// OJO: esto es solo una herramienta interna, NO la medida de rendimiento
// oficial de la práctica (ver rendimiento.js).
const PUNTAJE = {
  PAQUETE: 100,
  FRONTERA_DESCONOCIDA: 30,
  LIBRE_NO_VISITADA: 10,
  LIBRE_VISITADA: -20,
  BLOQUEADA: -100
}

/**
 * @param {ReturnType<typeof import('./percepcion.js').percibir>} percepcion
 * @param {import('./memoria.js').MemoriaAgente} memoria
 * @returns {{tipo:'RECOGER'} | {tipo:'MOVER', direccion:string} | null}
 *          null significa "sin ninguna acción posible" (agente atrapado).
 */
export function decidir(percepcion, memoria) {
  // ---- Prioridad 1: recoger ----
  if (percepcion.actual === CONTENIDO.PAQUETE) {
    return { tipo: 'RECOGER' }
  }

  // ---- Evaluar las 4 direcciones (Prioridades 2 a 6) ----
  const candidatos = []
  for (const direccion of ORDEN_DESEMPATE) {
    const contenido = percepcion[direccion.toLowerCase()]

    // Prioridad 3 y 4: descartar obstáculos y límites del tablero.
    if (contenido === CONTENIDO.OBSTACULO || contenido === CONTENIDO.FUERA_DEL_TABLERO) {
      continue
    }

    const destino = celdaDestino(percepcion.posicion, direccion)
    const visitada = memoria.fueVisitada(destino.fila, destino.columna)
    let puntaje

    if (contenido === CONTENIDO.PAQUETE) {
      puntaje = PUNTAJE.PAQUETE // Prioridad 2
    } else if (!visitada && esCeldaFrontera(memoria, destino)) {
      puntaje = PUNTAJE.FRONTERA_DESCONOCIDA // Prioridad 5: abre territorio nuevo
    } else if (!visitada) {
      puntaje = PUNTAJE.LIBRE_NO_VISITADA
    } else {
      puntaje = PUNTAJE.LIBRE_VISITADA // Prioridad 6: penaliza repetir camino
    }

    candidatos.push({ direccion, puntaje, visitada })
  }

  // Ningún vecino transitable: intentar retroceder, si no hay a dónde, se acabó.
  if (candidatos.length === 0) {
    return retroceder(percepcion, memoria)
  }

  const mejor = candidatos.reduce((a, b) => (b.puntaje > a.puntaje ? b : a))

  // ---- Prioridad 7: backtracking ----
  // Si la mejor opción disponible ya fue visitada, significa que no queda
  // nada nuevo accesible desde aquí: mejor retroceder por el historial que
  // seguir pisando terreno ya conocido sin rumbo.
  if (mejor.puntaje === PUNTAJE.LIBRE_VISITADA) {
    const accionRetroceso = retroceder(percepcion, memoria)
    if (accionRetroceso) return accionRetroceso

    // No hay a dónde retroceder (la pila de recorrido está vacía): estamos
    // de vuelta en el punto de partida y ya no existe ninguna celda nueva
    // alcanzable desde aquí. Avanzar "a ciegas" hacia una celda visitada
    // solo produciría un rebote infinito entre dos casillas sin ningún
    // beneficio, así que el agente reconoce que agotó su región alcanzable
    // y no tiene ninguna acción útil que realizar.
    return null
  }

  return { tipo: 'MOVER', direccion: mejor.direccion }
}

/** Una celda es "frontera" si alguno de sus vecinos aún es desconocido para el agente. */
function esCeldaFrontera(memoria, celda) {
  const vecinos = [
    [-1, 0], [1, 0], [0, -1], [0, 1]
  ]
  return vecinos.some(([df, dc]) => !memoria.esConocida(celda.fila + df, celda.columna + dc))
}

/**
 * Prioridad 7: retroceder un paso siguiendo la PILA del camino realmente
 * recorrido (no un simple "vecino descubierto desde"), para garantizar que
 * el regreso avanza siempre un paso más hacia atrás en el camino y no hace
 * rebotar al agente entre dos celdas ya visitadas.
 */
function retroceder(percepcion, memoria) {
  const anterior = memoria.posicionDeRetroceso()
  if (!anterior) return null

  const direccion = direccionEntre(percepcion.posicion, anterior)
  if (!direccion) return null

  return { tipo: 'MOVER', direccion, esBacktracking: true }
}

function direccionEntre(desde, hasta) {
  if (hasta.fila === desde.fila - 1 && hasta.columna === desde.columna) return 'ARRIBA'
  if (hasta.fila === desde.fila + 1 && hasta.columna === desde.columna) return 'ABAJO'
  if (hasta.columna === desde.columna - 1 && hasta.fila === desde.fila) return 'IZQUIERDA'
  if (hasta.columna === desde.columna + 1 && hasta.fila === desde.fila) return 'DERECHA'
  return null
}
