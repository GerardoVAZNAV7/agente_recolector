// ============================================================================
// MEMORIA DEL AGENTE
// ----------------------------------------------------------------------------
// Esta clase NO forma parte del entorno: es información que el propio agente
// va construyendo turno a turno a partir de lo que percibe. Es la base para
// que decidir() pueda explorar, evitar repetir caminos y hacer backtracking.
//
// El backtracking se implementa con una PILA del camino realmente recorrido
// (como en una búsqueda en profundidad clásica): cada vez que el agente
// avanza hacia una celda nueva, apila la posición de la que viene; cada vez
// que retrocede, desapila. Esto garantiza que el regreso sigue exactamente
// el camino ya caminado (sin "atajos" inventados) y evita que el agente
// rebote entre dos celdas sin llegar nunca a una zona nueva.
// ============================================================================

import { CONTENIDO } from './entorno.js'

export class MemoriaAgente {
  constructor(filas, columnas) {
    this.filas = filas
    this.columnas = columnas

    // Mapa conocido por el agente: empieza todo en DESCONOCIDO ('?').
    this.mapaConocido = Array.from({ length: filas }, () =>
      Array.from({ length: columnas }, () => CONTENIDO.DESCONOCIDO)
    )

    // Posiciones ya visitadas físicamente por el agente.
    this.visitadas = new Set()

    // Pila con el camino recorrido desde el punto de partida hasta la
    // posición actual (sin incluirla). Es el "historial de posiciones"
    // que permite el backtracking.
    this.pilaRecorrido = []

    this.ultimoEvento = null
    this.ultimaAccion = null
  }

  _clave(fila, columna) {
    return `${fila},${columna}`
  }

  fueVisitada(fila, columna) {
    return this.visitadas.has(this._clave(fila, columna))
  }

  esConocida(fila, columna) {
    if (fila < 0 || fila >= this.filas || columna < 0 || columna >= this.columnas) return true // el borde se "conoce" como fuera del tablero
    return this.mapaConocido[fila][columna] !== CONTENIDO.DESCONOCIDO
  }

  _actualizarCelda(fila, columna, contenido) {
    if (fila < 0 || fila >= this.filas || columna < 0 || columna >= this.columnas) return
    this.mapaConocido[fila][columna] = contenido
  }

  /**
   * Actualiza el mapa conocido con los datos de una percepción y registra
   * la posición actual como visitada.
   */
  actualizarConPercepcion(percepcion) {
    const { posicion, actual, arriba, abajo, izquierda, derecha } = percepcion
    const { fila, columna } = posicion

    this._actualizarCelda(fila, columna, actual)
    this._actualizarCelda(fila - 1, columna, arriba)
    this._actualizarCelda(fila + 1, columna, abajo)
    this._actualizarCelda(fila, columna - 1, izquierda)
    this._actualizarCelda(fila, columna + 1, derecha)

    this.visitadas.add(this._clave(fila, columna))
  }

  marcarPaqueteRecogido(fila, columna) {
    this._actualizarCelda(fila, columna, CONTENIDO.VACIO)
  }

  /** Última posición del camino recorrido (a dónde retroceder), o null si no hay. */
  posicionDeRetroceso() {
    if (this.pilaRecorrido.length === 0) return null
    return this.pilaRecorrido[this.pilaRecorrido.length - 1]
  }

  /** Se llama al avanzar hacia una celda nueva: guarda de dónde venimos. */
  apilarOrigen(posicion) {
    this.pilaRecorrido.push({ ...posicion })
  }

  /** Se llama al completar un movimiento de backtracking: consume el tope de la pila. */
  desapilarOrigen() {
    this.pilaRecorrido.pop()
  }
}
