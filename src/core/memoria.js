// ============================================================================
// MEMORIA DEL AGENTE
// ----------------------------------------------------------------------------
// Informacion que el agente construye turno a turno con lo que percibe.
// Guardo tres cosas: el mapa conocido, las celdas visitadas y la PILA del
// camino recorrido (para el backtracking).
// Recordar: esto NO es el entorno real, es la memoria interna del agente.
// ============================================================================

import { CONTENIDO } from './entorno.js'

export class MemoriaAgente {
  constructor(filas, columnas) {
    this.filas = filas
    this.columnas = columnas

    // Mapa conocido: al inicio todo es DESCONOCIDO ('?').
    this.mapaConocido = Array.from({ length: filas }, () =>
      Array.from({ length: columnas }, () => CONTENIDO.DESCONOCIDO)
    )

    // Posiciones por las que el agente ya paso fisicamente.
    this.visitadas = new Set()

    // Pila del camino real hasta la posicion actual (sin incluirla).
    // Es lo que permite el backtracking en decision.js.
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
    if (fila < 0 || fila >= this.filas || columna < 0 || columna >= this.columnas) return true // el borde se conoce como fuera del tablero
    return this.mapaConocido[fila][columna] !== CONTENIDO.DESCONOCIDO
  }

  _actualizarCelda(fila, columna, contenido) {
    if (fila < 0 || fila >= this.filas || columna < 0 || columna >= this.columnas) return
    this.mapaConocido[fila][columna] = contenido
  }

  /**
   * Actualiza el mapa conocido con los datos de la percepcion y marca la
   * posicion actual como visitada.
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

  /** A donde retroceder (el tope de la pila), o null si la pila esta vacia. */
  posicionDeRetroceso() {
    if (this.pilaRecorrido.length === 0) return null
    return this.pilaRecorrido[this.pilaRecorrido.length - 1]
  }

  /** Se llama al avanzar a una celda nueva: guardo de donde vengo. */
  apilarOrigen(posicion) {
    this.pilaRecorrido.push({ ...posicion })
  }

  /** Se llama al completar un retroceso: quito el tope de la pila. */
  desapilarOrigen() {
    this.pilaRecorrido.pop()
  }
}