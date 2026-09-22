// ============================================================================
// ENTORNO
// ----------------------------------------------------------------------------
// Representa el almacén REAL. El agente NUNCA debe leer este objeto
// directamente para decidir; solo lo hace a través de percibir() (ver
// percepcion.js). Esto mantiene la simulación honesta respecto a la
// restricción de la actividad: "el agente no conoce el mapa completo".
// ============================================================================

export const CONTENIDO = {
  VACIO: 'VACIO',
  PAQUETE: 'PAQUETE',
  OBSTACULO: 'OBSTACULO',
  AGENTE: 'AGENTE',
  FUERA_DEL_TABLERO: 'FUERA_DEL_TABLERO',
  DESCONOCIDO: 'DESCONOCIDO'
}

// Símbolos usados por el editor de mapas / import-export de escenarios.
export const SIMBOLOS = {
  VACIO: '.',
  PAQUETE: 'P',
  OBSTACULO: 'X',
  AGENTE: 'A'
}

export class Entorno {
  /**
   * @param {number} filas
   * @param {number} columnas
   * @param {{fila:number, columna:number}[]} paquetes
   * @param {{fila:number, columna:number}[]} obstaculos
   * @param {{fila:number, columna:number}} posicionInicialAgente
   */
  constructor(filas, columnas, paquetes = [], obstaculos = [], posicionInicialAgente = { fila: 0, columna: 0 }) {
    this.filas = filas
    this.columnas = columnas
    this.posicionInicialAgente = { ...posicionInicialAgente }

    // Set de claves "fila,columna" para búsquedas O(1).
    this.obstaculos = new Set(obstaculos.map(p => this._clave(p.fila, p.columna)))
    this.paquetesRestantes = new Set(paquetes.map(p => this._clave(p.fila, p.columna)))
    this.totalPaquetesIniciales = this.paquetesRestantes.size
  }

  _clave(fila, columna) {
    return `${fila},${columna}`
  }

  estaDentroDelTablero(fila, columna) {
    return fila >= 0 && fila < this.filas && columna >= 0 && columna < this.columnas
  }

  contieneObstaculo(fila, columna) {
    return this.obstaculos.has(this._clave(fila, columna))
  }

  contienePaquete(fila, columna) {
    return this.paquetesRestantes.has(this._clave(fila, columna))
  }

  /** Devuelve el contenido REAL de una celda (uso exclusivo del ambiente/sensores). */
  contenidoDeCelda(fila, columna) {
    if (!this.estaDentroDelTablero(fila, columna)) return CONTENIDO.FUERA_DEL_TABLERO
    if (this.contieneObstaculo(fila, columna)) return CONTENIDO.OBSTACULO
    if (this.contienePaquete(fila, columna)) return CONTENIDO.PAQUETE
    return CONTENIDO.VACIO
  }

  /** Elimina el paquete de la celda indicada (efecto de la acción RECOGER). */
  quitarPaquete(fila, columna) {
    this.paquetesRestantes.delete(this._clave(fila, columna))
  }

  quedanPaquetes() {
    return this.paquetesRestantes.size > 0
  }

  paquetesRecogidosHastaAhora() {
    return this.totalPaquetesIniciales - this.paquetesRestantes.size
  }

  /**
   * Recorre (BFS) todas las celdas libres alcanzables desde una posición de
   * partida, sin atravesar obstáculos ni salir del tablero. Se usa para
   * validar en el editor que ningún paquete quede en una región del
   * laberinto desconectada de donde inicia el agente.
   */
  celdasAlcanzablesDesde(inicio) {
    const visitadas = new Set()
    const cola = [inicio]
    visitadas.add(this._clave(inicio.fila, inicio.columna))
    const direcciones = [[-1, 0], [1, 0], [0, -1], [0, 1]]

    while (cola.length > 0) {
      const actual = cola.shift()
      for (const [df, dc] of direcciones) {
        const f = actual.fila + df
        const c = actual.columna + dc
        const clave = this._clave(f, c)
        if (!this.estaDentroDelTablero(f, c)) continue
        if (this.contieneObstaculo(f, c)) continue
        if (visitadas.has(clave)) continue
        visitadas.add(clave)
        cola.push({ fila: f, columna: c })
      }
    }
    return visitadas
  }

  /**
   * Versión completa de la validación: además de exigir una celda libre
   * adyacente, comprueba que el paquete esté en la misma región conectada
   * (sin obstáculos de por medio) que la posición inicial del agente.
   * Devuelve la lista de paquetes que el agente nunca podría alcanzar.
   */
  validarPaquetesInalcanzablesDesdeInicio() {
    const alcanzables = this.celdasAlcanzablesDesde(this.posicionInicialAgente)
    const inalcanzables = []
    for (const clave of this.paquetesRestantes) {
      if (!alcanzables.has(clave)) {
        const [fila, columna] = clave.split(',').map(Number)
        inalcanzables.push({ fila, columna })
      }
    }
    return inalcanzables
  }

  clonarParaSimulacion() {
    const paquetes = [...this.paquetesRestantes].map(c => {
      const [fila, columna] = c.split(',').map(Number)
      return { fila, columna }
    })
    const obstaculos = [...this.obstaculos].map(c => {
      const [fila, columna] = c.split(',').map(Number)
      return { fila, columna }
    })
    return new Entorno(this.filas, this.columnas, paquetes, obstaculos, this.posicionInicialAgente)
  }
}
