// ============================================================================
// COMPOSABLE: usarSimulador
// ----------------------------------------------------------------------------
// Puente reactivo entre el nucleo del agente (src/core) y los componentes
// Vue. Solo maneja el estado de la app (modo editor/simulacion, reproduccion
// automatica, animacion de exploracion, etc.). No tiene logica de decision.
// ============================================================================

import { reactive, ref, computed } from 'vue'
import { Entorno, CONTENIDO, SIMBOLOS } from '../core/entorno.js'
import { Simulador, MAX_ACCIONES, MODO_BUSQUEDA } from '../core/simulador.js'

const HERRAMIENTAS = {
  PAQUETE: 'PAQUETE',
  OBSTACULO: 'OBSTACULO',
  AGENTE: 'AGENTE',
  BORRAR: 'BORRAR'
}

function mapaVacio(filas, columnas) {
  return Array.from({ length: filas }, () => Array.from({ length: columnas }, () => SIMBOLOS.VACIO))
}

export function usarSimulador() {
  // ---------------- Estado del editor de mapas ----------------
  const dimensiones = reactive({ filas: 6, columnas: 8 })
  const cuadricula = ref(mapaVacio(dimensiones.filas, dimensiones.columnas))
  const posicionInicialAgente = ref({ fila: 2, columna: 0 })
  const herramientaActiva = ref(HERRAMIENTAS.PAQUETE)
  const errorValidacion = ref('')

  const modo = ref('editor') // 'editor' | 'simulacion'
  const vistaActual = ref('global') // 'global' (mapa real) | 'robot' (solo lo descubierto)

  // ---------------- Estado de la simulacion ----------------
  const simulador = ref(null)
  const reproduciendo = ref(false)
  const velocidadMs = ref(200) // mas rapido para que se aprecie la animacion de nodos
  let temporizador = null
  const modoBusqueda = ref(MODO_BUSQUEDA.REACTIVO)

  // Resultado de la comparacion A* vs Dijkstra (recoleccion completa)
  const comparacion = ref(null)

  function redimensionar(filas, columnas) {
    filas = Math.max(3, Math.min(20, filas))
    columnas = Math.max(3, Math.min(20, columnas))
    dimensiones.filas = filas
    dimensiones.columnas = columnas
    cuadricula.value = mapaVacio(filas, columnas)
    if (posicionInicialAgente.value.fila >= filas) posicionInicialAgente.value.fila = 0
    if (posicionInicialAgente.value.columna >= columnas) posicionInicialAgente.value.columna = 0
    errorValidacion.value = ''
    comparacion.value = null
  }

  function seleccionarHerramienta(herramienta) {
    herramientaActiva.value = herramienta
  }

  /** Click en una celda del editor: colocar la herramienta activa. */
  function pintarCelda(fila, columna) {
    if (herramientaActiva.value === HERRAMIENTAS.AGENTE) {
      posicionInicialAgente.value = { fila, columna }
      // El agente no puede iniciar sobre un obstaculo ni un paquete.
      cuadricula.value[fila][columna] = SIMBOLOS.VACIO
      comparacion.value = null
      return
    }

    const simbolo = {
      [HERRAMIENTAS.PAQUETE]: SIMBOLOS.PAQUETE,
      [HERRAMIENTAS.OBSTACULO]: SIMBOLOS.OBSTACULO,
      [HERRAMIENTAS.BORRAR]: SIMBOLOS.VACIO
    }[herramientaActiva.value]

    // No dejar un obstaculo justo donde inicia el agente.
    if (
      simbolo === SIMBOLOS.OBSTACULO &&
      fila === posicionInicialAgente.value.fila &&
      columna === posicionInicialAgente.value.columna
    ) {
      return
    }

    cuadricula.value[fila][columna] = simbolo
    comparacion.value = null
  }

  function limpiarMapa() {
    cuadricula.value = mapaVacio(dimensiones.filas, dimensiones.columnas)
    errorValidacion.value = ''
    comparacion.value = null
  }

  function construirEntorno() {
    const paquetes = []
    const obstaculos = []
    cuadricula.value.forEach((filaArr, f) => {
      filaArr.forEach((valor, c) => {
        if (valor === SIMBOLOS.PAQUETE) paquetes.push({ fila: f, columna: c })
        if (valor === SIMBOLOS.OBSTACULO) obstaculos.push({ fila: f, columna: c })
      })
    })
    return new Entorno(dimensiones.filas, dimensiones.columnas, paquetes, obstaculos, posicionInicialAgente.value)
  }

  /** Valida el mapa y arranca la simulacion con el modo de busqueda indicado. */
  function iniciarSimulacion(comboModo = MODO_BUSQUEDA.REACTIVO) {
    const entornoBorrador = construirEntorno()

    if (entornoBorrador.totalPaquetesIniciales === 0) {
      errorValidacion.value = 'Coloca al menos un paquete antes de iniciar.'
      return false
    }

    if (comboModo === MODO_BUSQUEDA.REACTIVO) {
      const inalcanzables = entornoBorrador.validarPaquetesInalcanzablesDesdeInicio()
      if (inalcanzables.length > 0) {
        errorValidacion.value =
          `Hay ${inalcanzables.length} paquete(s) que el agente nunca podría alcanzar desde su ` +
          `posición inicial (ej. fila ${inalcanzables[0].fila}, columna ${inalcanzables[0].columna}). ` +
          `Revisa que no queden aislados por obstáculos.`
        return false
      }
    }

    errorValidacion.value = ''
    modoBusqueda.value = comboModo
    simulador.value = new Simulador(entornoBorrador, comboModo)
    modo.value = 'simulacion'
    vistaActual.value = 'global'
    return true
  }

  function iniciarConDijkstra() {
    return iniciarSimulacion(MODO_BUSQUEDA.DIJKSTRA)
  }

  function iniciarConAStar() {
    return iniciarSimulacion(MODO_BUSQUEDA.ASTAR)
  }

  /**
   * Ejecuta el MISMO mapa con Dijkstra y con A* (recoleccion completa) y
   * guarda los resumenes para mostrarlos en una tabla comparativa.
   */
  function compararAlgoritmos() {
    const base = construirEntorno()
    if (base.totalPaquetesIniciales === 0) {
      errorValidacion.value = 'Coloca al menos un paquete antes de comparar.'
      comparacion.value = null
      return false
    }
    errorValidacion.value = ''

    const correr = (modo) => {
      const sim = new Simulador(base.clonarParaSimulacion(), modo)
      sim.ejecutarHastaElFinal()
      return sim.resumen()
    }

    comparacion.value = {
      dijkstra: correr(MODO_BUSQUEDA.DIJKSTRA),
      astar: correr(MODO_BUSQUEDA.ASTAR)
    }
    return true
  }

  /** Un avance: primero la animacion de exploracion, luego el paso del agente. */
  function avanzarUnidad() {
    const sim = simulador.value
    if (!sim || sim.terminado) return
    // Fase A: crece la exploracion (nodos descubiertos / expandidos).
    if (sim.animandoExploracion) {
      sim.avanzarExploracion()
      return
    }
    // Fase B: la ruta queda iluminada durante un tick antes de moverse.
    if (sim.mostrandoRuta) {
      sim.mostrandoRuta = false
      return
    }
    // Fase C: el agente sigue la ruta.
    sim.paso()
  }

  function pasoManual() {
    avanzarUnidad()
  }

  function alternarReproduccion() {
    if (!simulador.value) return
    if (reproduciendo.value) {
      pausar()
      return
    }
    reproduciendo.value = true
    temporizador = setInterval(() => {
      if (!simulador.value || simulador.value.terminado) {
        pausar()
        return
      }
      avanzarUnidad()
    }, velocidadMs.value)
  }

  function pausar() {
    reproduciendo.value = false
    if (temporizador) {
      clearInterval(temporizador)
      temporizador = null
    }
  }

  function redisenarMapa() {
    pausar()
    simulador.value = null
    comparacion.value = null
    modo.value = 'editor'
  }

  function reiniciarMismoMapa() {
    pausar()
    iniciarSimulacion(modoBusqueda.value)
  }

  return {
    // editor
    HERRAMIENTAS,
    dimensiones,
    cuadricula,
    posicionInicialAgente,
    herramientaActiva,
    errorValidacion,
    redimensionar,
    seleccionarHerramienta,
    pintarCelda,
    limpiarMapa,

    // navegación de modo/vista
    modo,
    vistaActual,

    // simulación
    simulador,
    reproduciendo,
    velocidadMs,
    MAX_ACCIONES,
    MODO_BUSQUEDA,
    modoBusqueda,
    comparacion,
    iniciarSimulacion,
    iniciarConDijkstra,
    iniciarConAStar,
    compararAlgoritmos,
    pasoManual,
    alternarReproduccion,
    pausar,
    redisenarMapa,
    reiniciarMismoMapa,

    // reexport útil para componentes
    CONTENIDO,
    SIMBOLOS
  }
}
