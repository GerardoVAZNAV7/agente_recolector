// ============================================================================
// SIMULADOR
// ----------------------------------------------------------------------------
// Orquesta el ciclo del agente turno a turno:
//   entorno, sensores, percepcion, memoria, decision, accion, rendimiento.
// Es el "programa del agente" en marcha: paso a paso o automatico.
//
// Modos de busqueda:
//   REACTIVO  -> estrategia original basada en reglas (decision.js)
//   DIJKSTRA  -> ruta de costo minimo (sin heuristica)
//   ASTAR     -> ruta informada f(n) = g(n) + h(n) con heuristica Manhattan
// En los modos DIJKSTRA/ASTAR se calcula la ruta hacia el siguiente paquete
// (seleccionados con el criterio determinista de _encontrarPaqueteObjetivo) y
// se sigue paso a paso. La animacion de exploracion se controla con
// explorationTrace / avanzarExploracion().
// ============================================================================

import { percibir } from './percepcion.js'
import { MemoriaAgente } from './memoria.js'
import { decidir } from './decision.js'
import { actuar, EVENTO, CONTENIDO } from './accion.js'
import { puntosPorEvento, esPenalizacion, esMovimiento, BONO_TODOS_LOS_PAQUETES } from './rendimiento.js'
import { buscarConDijkstra } from './dijkstra.js'
import { buscarConAStar } from './astar.js'

export const MAX_ACCIONES = 1000 // amplio para permitir la exploracion con pathfinding

export const MODO_BUSQUEDA = {
  REACTIVO: 'REACTIVO',
  DIJKSTRA: 'DIJKSTRA',
  ASTAR: 'ASTAR'
}

export class Simulador {
  /** @param {import('./entorno.js').Entorno} entorno */
  constructor(entorno, modoBusqueda = MODO_BUSQUEDA.REACTIVO) {
    this.entorno = entorno
    this.posicionAgente = { ...entorno.posicionInicialAgente }
    this.memoria = new MemoriaAgente(entorno.filas, entorno.columnas)

    this.puntuacion = 0
    this.acciones = 0
    this.movimientos = 0
    this.penalizaciones = 0
    this.paquetesRecogidos = 0

    this.terminado = false
    this.motivoFin = null // 'TODOS_LOS_PAQUETES' | 'LIMITE_ACCIONES' | 'AGENTE_ATRAPADO'

    this.ultimaPercepcion = null
    this.ultimaAccion = null
    this.ultimoEvento = null
    this.registro = [] // bitacora legible para el panel de memoria

    // Pathfinding
    this.modoBusqueda = modoBusqueda
    this.rutaActual = []
    this.indiceRuta = 0
    this.paqueteObjetivo = null
    this.buscandoRuta = false
    this.ultimaBusqueda = null // resultado de la ultima busqueda
    this.nodosExpandidos = 0
    this.nodosDescubiertos = 0
    this.costoTotalRuta = 0
    this.tiempoBusquedaMs = 0
    this.algoritmoUsado = null

    // Animacion de exploracion (nodos considerados por el algoritmo)
    this.explorationTrace = []
    this.explorationIndex = 0
    this.animandoExploracion = false
    this.mostrandoRuta = false // pausa breve para iluminar la ruta antes de moverse

    // Acumuladores de TODAS las busquedas (para comparar A* vs Dijkstra
    // sobre la recoleccion completa, no solo la ultima busqueda).
    this.totalNodosExpandidos = 0
    this.totalNodosDescubiertos = 0
    this.totalTiempoBusquedaMs = 0
    this.totalCostoRuta = 0
    this.busquedasRealizadas = 0

    // Paquetes que ya se comprobo que no son alcanzables (el entorno es
    // estatico, asi que no vuelven a serlo). Evita recalcularlos en bucle.
    this.paquetesInalcanzables = new Set()
  }

  _clave(f, c) {
    return `${f},${c}`
  }

  /**
   * Selecciona el siguiente paquete objetivo con un criterio determinista
   * (menor fila y, en empate, menor columna). Se mantiene independiente del
   * algoritmo de busqueda.
   */
  _encontrarPaqueteObjetivo() {
    const paquetes = []
    for (const clave of this.entorno.paquetesRestantes) {
      if (this.paquetesInalcanzables.has(clave)) continue
      const [f, c] = clave.split(',').map(Number)
      paquetes.push({ fila: f, columna: c })
    }
    if (paquetes.length === 0) return null
    paquetes.sort((a, b) => {
      if (a.fila !== b.fila) return a.fila - b.fila
      return a.columna - b.columna
    })
    return paquetes[0]
  }

  _obtenerDireccionEntre(desde, hasta) {
    if (hasta.fila === desde.fila - 1 && hasta.columna === desde.columna) return 'ARRIBA'
    if (hasta.fila === desde.fila + 1 && hasta.columna === desde.columna) return 'ABAJO'
    if (hasta.columna === desde.columna - 1 && hasta.fila === desde.fila) return 'IZQUIERDA'
    if (hasta.columna === desde.columna + 1 && hasta.fila === desde.fila) return 'DERECHA'
    return null
  }

  _avanzarRuta() {
    if (!this.rutaActual || this.indiceRuta >= this.rutaActual.length - 1) {
      return null
    }
    const siguiente = this.rutaActual[this.indiceRuta + 1]
    const dir = this._obtenerDireccionEntre(this.posicionAgente, siguiente)
    if (!dir) return null
    return { tipo: 'MOVER', direccion: dir, desdeRuta: true }
  }

  _limpiarRuta() {
    this.rutaActual = []
    this.indiceRuta = 0
    this.paqueteObjetivo = null
    this.buscandoRuta = false
    this.mostrandoRuta = false
  }

  /** Ejecuta un unico turno del ciclo del agente. Devuelve el resumen del turno. */
  paso() {
    if (this.terminado) return null

    // SENSORES Y PERCEPCION
    const percepcion = percibir(this.entorno, this.posicionAgente)
    this.memoria.actualizarConPercepcion(percepcion)

    let accion = null

    if (this.modoBusqueda === MODO_BUSQUEDA.REACTIVO) {
      // Comportamiento original intacto.
      accion = decidir(percepcion, this.memoria)
    } else {
      accion = this._decidirConPathfinding(percepcion)
    }

    // ACCION y ACTUADORES
    const posicionAntes = this.posicionAgente
    const { nuevaPosicion, evento } = actuar(this.entorno, this.posicionAgente, accion)

    if (evento === EVENTO.PAQUETE_RECOGIDO) {
      this.memoria.marcarPaqueteRecogido(this.posicionAgente.fila, this.posicionAgente.columna)
      this.paquetesRecogidos += 1
      this._limpiarRuta()
    }
    if (esMovimiento(evento)) {
      this.movimientos += 1
      // Si avance a celda nueva, apilo de donde vengo; si retrocedi, desapilo.
      if (accion && accion.esBacktracking) {
        this.memoria.desapilarOrigen()
      } else {
        this.memoria.apilarOrigen(posicionAntes)
      }
    }
    if (esPenalizacion(evento)) this.penalizaciones += 1

    this.posicionAgente = nuevaPosicion

    // MEDIDA DE RENDIMIENTO
    this.puntuacion += puntosPorEvento(evento)
    // Solo contar como accion los eventos que realmente "gastan" un turno.
    if (accion && accion.tipo === 'OBSERVAR') {
      // No incrementa acciones, no termina por "sin accion".
      this.ultimaAccion = accion
      this.ultimaPercepcion = percepcion
      this.ultimoEvento = 'CALCULANDO'
      const entradaBitacora = {
        turno: this.acciones,
        accion,
        evento: 'CALCULANDO',
        posicion: { ...this.posicionAgente },
        puntuacion: this.puntuacion
      }
      this.registro.push(entradaBitacora)
      if (this.registro.length > 200) this.registro.shift()
      // Si ya no quedan paquetes, terminar con bono.
      if (!this.entorno.quedanPaquetes()) {
        this.puntuacion += BONO_TODOS_LOS_PAQUETES
        this.terminado = true
        this.motivoFin = 'TODOS_LOS_PAQUETES'
      }
      return entradaBitacora
    }
    this.acciones += 1

    this.ultimaPercepcion = percepcion
    this.ultimaAccion = accion
    this.ultimoEvento = evento

    const entradaBitacora = {
      turno: this.acciones,
      accion,
      evento,
      posicion: { ...this.posicionAgente },
      puntuacion: this.puntuacion
    }
    this.registro.push(entradaBitacora)
    if (this.registro.length > 200) this.registro.shift()

    // CONDICIONES DE TERMINO
    if (!this.entorno.quedanPaquetes()) {
      this.puntuacion += BONO_TODOS_LOS_PAQUETES
      this.terminado = true
      this.motivoFin = 'TODOS_LOS_PAQUETES'
    } else if (this.acciones >= MAX_ACCIONES) {
      this.terminado = true
      this.motivoFin = 'LIMITE_ACCIONES'
    } else if (accion === null) {
      this.terminado = true
      this.motivoFin = 'AGENTE_ATRAPADO'
    }

    return entradaBitacora
  }

  /** Rama de decision para los modos con algoritmo de busqueda. */
  _decidirConPathfinding(percepcion) {
    // 1. Si estamos sobre un paquete, recogerlo.
    if (percepcion.actual === CONTENIDO.PAQUETE) {
      return { tipo: 'RECOGER' }
    }

    // 2. Si no hay ruta activa, calcular una hacia el siguiente paquete.
    //    Si un paquete resulta inalcanzable se descarta y se intenta el
    //    siguiente, sin bloquear ni entrar en bucle.
    if (this.rutaActual.length === 0) {
      let objetivo = this._encontrarPaqueteObjetivo()
      while (objetivo) {
        this.paqueteObjetivo = objetivo
        let res
        if (this.modoBusqueda === MODO_BUSQUEDA.DIJKSTRA) {
          res = buscarConDijkstra(this.posicionAgente, objetivo, this.entorno)
          this.algoritmoUsado = 'DIJKSTRA'
        } else {
          res = buscarConAStar(this.posicionAgente, objetivo, this.entorno)
          this.algoritmoUsado = 'ASTAR'
        }
        this.ultimaBusqueda = res
        this.explorationTrace = res && res.explorationTrace ? [...res.explorationTrace] : []
        this.explorationIndex = 0
        this.animandoExploracion = this.explorationTrace.length > 0
        this.mostrandoRuta = false

        // Acumular metrica de esta busqueda (exitosa o no) para la
        // comparacion de recoleccion completa.
        if (res) {
          this.totalNodosExpandidos += res.nodosExpandidos || 0
          this.totalNodosDescubiertos += res.nodosDescubiertos || 0
          this.totalTiempoBusquedaMs += res.tiempoMs || 0
          this.busquedasRealizadas += 1
        }

        if (res && res.exito && res.ruta.length > 1) {
          this.rutaActual = res.ruta
          this.indiceRuta = 0
          this.nodosExpandidos = res.nodosExpandidos
          this.nodosDescubiertos = res.nodosDescubiertos
          this.costoTotalRuta = res.costoTotal
          this.tiempoBusquedaMs = res.tiempoMs
          this.totalCostoRuta += res.costoTotal
          // Si hay una traza de exploracion, esperamos a que se anime antes
          // de ejecutar el primer movimiento de la ruta.
          if (this.animandoExploracion) {
            return { tipo: 'OBSERVAR' }
          }
          const accionRuta = this._avanzarRuta()
          if (accionRuta) {
            this.indiceRuta++
            return accionRuta
          }
          return { tipo: 'RECOGER' }
        }

        // No alcanzable: descartarlo para siempre y probar el siguiente.
        this.paquetesInalcanzables.add(this._clave(objetivo.fila, objetivo.columna))
        objetivo = this._encontrarPaqueteObjetivo()
      }

      this._limpiarRuta()
      return null // no queda ningun paquete alcanzable: fin controlado
    }

    // 3. Seguir la ruta calculada.
    const accionRuta = this._avanzarRuta()
    if (accionRuta) {
      this.indiceRuta++
      return accionRuta
    }

    // Ruta agotada: recoger si estamos sobre el paquete, o recalcular.
    this._limpiarRuta()
    if (percepcion.actual === CONTENIDO.PAQUETE) {
      return { tipo: 'RECOGER' }
    }
    return decidir(percepcion, this.memoria)
  }

  /** Ejecuta pasos hasta terminar (con un tope de seguridad). */
  ejecutarHastaElFinal() {
    let seguridad = MAX_ACCIONES + 100
    while (!this.terminado && seguridad > 0) {
      this.paso()
      seguridad -= 1
    }
  }

  resumen() {
    return {
      paquetesRecogidos: this.paquetesRecogidos,
      totalPaquetes: this.entorno.totalPaquetesIniciales,
      movimientos: this.movimientos,
      penalizaciones: this.penalizaciones,
      acciones: this.acciones,
      puntuacion: this.puntuacion,
      terminado: this.terminado,
      motivoFin: this.motivoFin,
      algoritmoUsado: this.algoritmoUsado,
      modoBusqueda: this.modoBusqueda,
      nodosExpandidos: this.nodosExpandidos,
      nodosDescubiertos: this.nodosDescubiertos,
      costoTotalRuta: this.costoTotalRuta,
      tiempoBusquedaMs: Math.round(this.tiempoBusquedaMs * 1000) / 1000,
      rutaLongitud: this.rutaActual.length,
      paqueteObjetivo: this.paqueteObjetivo,
      // Totales de todas las busquedas (recoleccion completa)
      totalNodosExpandidos: this.totalNodosExpandidos,
      totalNodosDescubiertos: this.totalNodosDescubiertos,
      totalTiempoBusquedaMs: Math.round(this.totalTiempoBusquedaMs * 1000) / 1000,
      totalCostoRuta: this.totalCostoRuta,
      busquedasRealizadas: this.busquedasRealizadas
    }
  }

  // --- API para la visualizacion / animacion -------------------------------

  getRutaActual() {
    return this.rutaActual
  }

  getExplorationTrace() {
    return this.explorationTrace
  }

  getExplorationIndex() {
    return this.explorationIndex
  }

  avanzarExploracion() {
    if (this.explorationIndex < this.explorationTrace.length) {
      this.explorationIndex++
    }
    if (this.explorationIndex >= this.explorationTrace.length) {
      this.animandoExploracion = false
      // La ruta ya esta calculada: iluminarla antes de que el agente avance.
      this.mostrandoRuta = this.rutaActual.length > 0
    }
  }

  resetExploracion() {
    this.explorationTrace = []
    this.explorationIndex = 0
    this.animandoExploracion = false
    this.mostrandoRuta = false
  }
}
