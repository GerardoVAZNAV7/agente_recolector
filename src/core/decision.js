// ============================================================================
// DECISIONES
// ----------------------------------------------------------------------------
// decidir() es el "cerebro" del agente: elige una accion a partir de lo que
// percibe (percepcion) y de lo que recuerda (memoria). Prioridades de mi
// estrategia, para que no se me olviden:
//   1. si hay paquete en la celda actual, recoger.
//   2. si un vecino tiene paquete, ir hacia el.
//   3. nunca elegir obstaculos ni salidas del tablero.
//   4. preferir celdas frontera (vecinas de territorio desconocido).
//   5. evitar repetir celdas ya visitadas.
//   6. si no queda nada nuevo, retroceder por la pila (backtracking).
//   7. desempate fijo: ARRIBA > DERECHA > ABAJO > IZQUIERDA.
// ============================================================================

import { CONTENIDO, celdaDestino } from './percepcion.js'

// Orden de desempate fijo cuando dos celdas tienen el mismo puntaje.
const ORDEN_DESEMPATE = ['ARRIBA', 'DERECHA', 'ABAJO', 'IZQUIERDA']

// Puntajes internos para comparar direcciones entre si. No confundir con la
// medida de rendimiento oficial de la practica (ver rendimiento.js).
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
  // Prioridad 1: si hay paquete en la celda actual, recoger.
  if (percepcion.actual === CONTENIDO.PAQUETE) {
    return { tipo: 'RECOGER' }
  }

  // Evaluar las 4 direcciones y quedarme con la mejor.
  const candidatos = []
  for (const direccion of ORDEN_DESEMPATE) {
    const contenido = percepcion[direccion.toLowerCase()]

    // Prioridad 3: descartar obstaculos y bordes del tablero.
    if (contenido === CONTENIDO.OBSTACULO || contenido === CONTENIDO.FUERA_DEL_TABLERO) {
      continue
    }

    const destino = celdaDestino(percepcion.posicion, direccion)
    const visitada = memoria.fueVisitada(destino.fila, destino.columna)
    let puntaje

    if (contenido === CONTENIDO.PAQUETE) {
      puntaje = PUNTAJE.PAQUETE // Prioridad 2: hay un paquete a mi lado.
    } else if (!visitada && esCeldaFrontera(memoria, destino)) {
      puntaje = PUNTAJE.FRONTERA_DESCONOCIDA // Prioridad 4: abre territorio nuevo.
    } else if (!visitada) {
      puntaje = PUNTAJE.LIBRE_NO_VISITADA // Libre y nueva: buena opcion.
    } else {
      puntaje = PUNTAJE.LIBRE_VISITADA // Prioridad 5: penalizo volver a pisar.
    }

    candidatos.push({ direccion, puntaje, visitada })
  }

  // Sin vecinos transitables: intentar retroceder. Si no hay, se acabo.
  if (candidatos.length === 0) {
    return retroceder(percepcion, memoria)
  }

  const mejor = candidatos.reduce((a, b) => (b.puntaje > a.puntaje ? b : a))

  // Prioridad 6 (backtracking): si lo mejor que queda ya fue visitado, no
  // tiene sentido seguir pisando lo conocido, mejor retroceder por la pila.
  if (mejor.puntaje === PUNTAJE.LIBRE_VISITADA) {
    const accionRetroceso = retroceder(percepcion, memoria)
    if (accionRetroceso) return accionRetroceso

    // La pila esta vacia y volvi al inicio: sin territorio nuevo alcanzable,
    // avanzar solo rebotaria entre celdas visitadas. Mejor detenerse.
    return null
  }

  return { tipo: 'MOVER', direccion: mejor.direccion }
}

/** Una celda es "frontera" si alguno de sus vecinos aun es desconocido. */
function esCeldaFrontera(memoria, celda) {
  const vecinos = [
    [-1, 0], [1, 0], [0, -1], [0, 1]
  ]
  return vecinos.some(([df, dc]) => !memoria.esConocida(celda.fila + df, celda.columna + dc))
}

/**
 * Retroceder un paso siguiendo la pila del camino real recorrido, para que
 * el regreso no rebote entre dos celdas ya visitadas.
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