// ============================================================================
// COMPOSABLE: usarSimulador
// ----------------------------------------------------------------------------
// Puente reactivo entre el núcleo del agente (src/core) y los componentes
// Vue. No contiene lógica de decisión: solo orquesta el estado de la app
// (modo editor / simulación, reproducción automática, etc.).
// ============================================================================

import { reactive, ref, computed } from 'vue'
import { Entorno, CONTENIDO, SIMBOLOS } from '../core/entorno.js'
import { Simulador, MAX_ACCIONES } from '../core/simulador.js'

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

  // ---------------- Estado de la simulación ----------------
  const simulador = ref(null)
  const reproduciendo = ref(false)
  const velocidadMs = ref(350)
  let temporizador = null

  function redimensionar(filas, columnas) {
    filas = Math.max(3, Math.min(20, filas))
    columnas = Math.max(3, Math.min(20, columnas))
    dimensiones.filas = filas
    dimensiones.columnas = columnas
    cuadricula.value = mapaVacio(filas, columnas)
    if (posicionInicialAgente.value.fila >= filas) posicionInicialAgente.value.fila = 0
    if (posicionInicialAgente.value.columna >= columnas) posicionInicialAgente.value.columna = 0
    errorValidacion.value = ''
  }

  function seleccionarHerramienta(herramienta) {
    herramientaActiva.value = herramienta
  }

  /** Click sobre una celda del editor: coloca la herramienta activa. */
  function pintarCelda(fila, columna) {
    if (herramientaActiva.value === HERRAMIENTAS.AGENTE) {
      posicionInicialAgente.value = { fila, columna }
      // El agente no puede iniciar sobre un obstáculo o un paquete.
      cuadricula.value[fila][columna] = SIMBOLOS.VACIO
      return
    }

    const simbolo = {
      [HERRAMIENTAS.PAQUETE]: SIMBOLOS.PAQUETE,
      [HERRAMIENTAS.OBSTACULO]: SIMBOLOS.OBSTACULO,
      [HERRAMIENTAS.BORRAR]: SIMBOLOS.VACIO
    }[herramientaActiva.value]

    // No se puede colocar un obstáculo justo donde inicia el agente.
    if (
      simbolo === SIMBOLOS.OBSTACULO &&
      fila === posicionInicialAgente.value.fila &&
      columna === posicionInicialAgente.value.columna
    ) {
      return
    }

    cuadricula.value[fila][columna] = simbolo
  }

  function limpiarMapa() {
    cuadricula.value = mapaVacio(dimensiones.filas, dimensiones.columnas)
    errorValidacion.value = ''
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

  /** Valida el mapa y, si es correcto, arranca la simulación. */
  function iniciarSimulacion() {
    const entornoBorrador = construirEntorno()

    if (entornoBorrador.totalPaquetesIniciales === 0) {
      errorValidacion.value = 'Coloca al menos un paquete antes de iniciar.'
      return false
    }

    const inalcanzables = entornoBorrador.validarPaquetesInalcanzablesDesdeInicio()
    if (inalcanzables.length > 0) {
      errorValidacion.value =
        `Hay ${inalcanzables.length} paquete(s) que el agente nunca podría alcanzar desde su ` +
        `posición inicial (ej. fila ${inalcanzables[0].fila}, columna ${inalcanzables[0].columna}). ` +
        `Revisa que no queden aislados por obstáculos.`
      return false
    }

    errorValidacion.value = ''
    simulador.value = new Simulador(entornoBorrador)
    modo.value = 'simulacion'
    vistaActual.value = 'global'
    return true
  }

  function pasoManual() {
    if (!simulador.value || simulador.value.terminado) return
    simulador.value.paso()
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
      simulador.value.paso()
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
    modo.value = 'editor'
  }

  function reiniciarMismoMapa() {
    pausar()
    iniciarSimulacion()
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
    iniciarSimulacion,
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
