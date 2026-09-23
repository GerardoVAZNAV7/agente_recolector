// ============================================================================
// SIMULADOR
// ----------------------------------------------------------------------------
// Orquesta el ciclo del agente, un paso (turno) a la vez, para que la
// interfaz pueda reproducirlo automáticamente o paso a paso:
//
//   ENTORNO → SENSORES → PERCEPCIÓN → MEMORIA → DECISIÓN → ACCIÓN →
//   MEDIDA DE RENDIMIENTO → ENTORNO
//
// Esta clase es el "programa del agente" (la función que transforma
// percepciones en acciones) puesto en marcha turno a turno.
// ============================================================================

import { percibir } from './percepcion.js'
import { MemoriaAgente } from './memoria.js'
import { decidir } from './decision.js'
import { actuar, EVENTO } from './accion.js'
import { puntosPorEvento, esPenalizacion, esMovimiento, BONO_TODOS_LOS_PAQUETES } from './rendimiento.js'

export const MAX_ACCIONES = 50

export class Simulador {
  /** @param {import('./entorno.js').Entorno} entorno */
  constructor(entorno) {
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
    this.registro = [] // bitácora legible para el panel de memoria / depuración
  }

  /** Ejecuta un único turno del ciclo del agente. Devuelve el resumen del turno. */
  paso() {
    if (this.terminado) return null

    // --- SENSORES / PERCEPCIÓN ---
    const percepcion = percibir(this.entorno, this.posicionAgente)
    this.memoria.actualizarConPercepcion(percepcion)

    // --- DECISIÓN ---
    const accion = decidir(percepcion, this.memoria)

    // --- ACCIÓN / ACTUADORES ---
    const posicionAntes = this.posicionAgente
    const { nuevaPosicion, evento } = actuar(this.entorno, this.posicionAgente, accion)

    if (evento === EVENTO.PAQUETE_RECOGIDO) {
      this.memoria.marcarPaqueteRecogido(this.posicionAgente.fila, this.posicionAgente.columna)
      this.paquetesRecogidos += 1
    }
    if (esMovimiento(evento)) {
      this.movimientos += 1
      // Mantiene la pila de recorrido (ver memoria.js) para que el
      // backtracking siga siempre el camino realmente caminado.
      if (accion.esBacktracking) {
        this.memoria.desapilarOrigen()
      } else {
        this.memoria.apilarOrigen(posicionAntes)
      }
    }
    if (esPenalizacion(evento)) this.penalizaciones += 1

    this.posicionAgente = nuevaPosicion

    // --- MEDIDA DE RENDIMIENTO ---
    this.puntuacion += puntosPorEvento(evento)
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

    // --- CONDICIONES DE TÉRMINO ---
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

  /** Ejecuta pasos hasta terminar (o hasta un tope de seguridad). */
  ejecutarHastaElFinal() {
    let seguridad = MAX_ACCIONES + 5
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
      motivoFin: this.motivoFin
    }
  }
}
