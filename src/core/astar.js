// Implementación de A* para búsqueda de caminos informada
// f(n) = g(n) + h(n)
// Heurística: Distancia Manhattan (admisible para 4 direcciones con costo uniforme)

import { MOVIMIENTO_COSTO, obtenerVecinosTransitables, reconstruirRuta } from './pathfinding.js'

export function heuristicaManhattan(origen, destino) {
  return Math.abs(origen.fila - destino.fila) + Math.abs(origen.columna - destino.columna)
}

export class AStar {
  constructor(heuristica = heuristicaManhattan) {
    this.heuristica = heuristica
    this.heap = []
  }

  _clave(fila, columna) {
    return `${fila},${columna}`
  }

  _push(nodo) {
    this.heap.push(nodo)
    let i = this.heap.length - 1
    while (i > 0) {
      const p = Math.floor((i - 1) / 2)
      if (this.heap[i].f >= this.heap[p].f) break
      ;[this.heap[i], this.heap[p]] = [this.heap[p], this.heap[i]]
      i = p
    }
  }

  _pop() {
    if (this.heap.length === 0) return null
    const raiz = this.heap[0]
    const ultimo = this.heap.pop()
    if (this.heap.length > 0) {
      this.heap[0] = ultimo
      let i = 0
      const n = this.heap.length
      while (true) {
        let menor = i
        const izq = 2 * i + 1
        const der = 2 * i + 2
        if (izq < n && this.heap[izq].f < this.heap[menor].f) menor = izq
        if (der < n && this.heap[der].f < this.heap[menor].f) menor = der
        if (menor === i) break
        ;[this.heap[i], this.heap[menor]] = [this.heap[menor], this.heap[i]]
        i = menor
      }
    }
    return raiz
  }

  _estaVacia() {
    return this.heap.length === 0
  }

  buscar(origen, destino, entorno) {
    const inicio = performance.now()
    const g = new Map()
    const f = new Map()
    const predecesores = new Map()
    const enAbiertos = new Set()
    const nodosExpandidos = new Set()
    const nodosDescubiertos = new Set()
    const explorationTrace = []
    const addedExpanded = new Set()
    const addedDiscovered = new Set()

    const claveOrigen = this._clave(origen.fila, origen.columna)
    const claveDestino = this._clave(destino.fila, destino.columna)

    g.set(claveOrigen, 0)
    const fOrigen = this.heuristica(origen, destino)
    f.set(claveOrigen, fOrigen)
    this._push({ fila: origen.fila, columna: origen.columna, f: fOrigen, g: 0 })
    enAbiertos.add(claveOrigen)
    nodosDescubiertos.add(claveOrigen)
    if (!addedDiscovered.has(claveOrigen)) {
      addedDiscovered.add(claveOrigen)
      explorationTrace.push({ fila: origen.fila, columna: origen.columna, tipo: 'DESCUBIERTO' })
    }

    while (!this._estaVacia()) {
      const actual = this._pop()
      if (!actual) break
      const claveActual = this._clave(actual.fila, actual.columna)
      enAbiertos.delete(claveActual)

      nodosExpandidos.add(claveActual)
      if (!addedExpanded.has(claveActual)) {
        addedExpanded.add(claveActual)
        explorationTrace.push({ fila: actual.fila, columna: actual.columna, tipo: 'EXPANDIDO' })
      }

      if (claveActual === claveDestino) {
        const recon = reconstruirRuta(origen, destino, predecesores)
        const tiempo = performance.now() - inicio
        return {
          exito: recon.exito,
          ruta: recon.ruta,
          nodosExpandidos: nodosExpandidos.size,
          nodosDescubiertos: nodosDescubiertos.size,
          costoTotal: g.get(claveDestino) ?? 0,
          pasos: recon.ruta.length > 0 ? recon.ruta.length - 1 : 0,
          tiempoMs: tiempo,
          explorationTrace
        }
      }

      const vecinos = obtenerVecinosTransitables(entorno, { fila: actual.fila, columna: actual.columna })
      for (const vecino of vecinos) {
        const claveVecino = this._clave(vecino.fila, vecino.columna)
        if (!nodosDescubiertos.has(claveVecino)) {
          nodosDescubiertos.add(claveVecino)
        }
        if (!addedDiscovered.has(claveVecino)) {
          addedDiscovered.add(claveVecino)
          explorationTrace.push({ fila: vecino.fila, columna: vecino.columna, tipo: 'DESCUBIERTO' })
        }
        const nuevoG = (g.get(claveActual) ?? Infinity) + MOVIMIENTO_COSTO
        if (nuevoG < (g.get(claveVecino) ?? Infinity)) {
          g.set(claveVecino, nuevoG)
          const nuevoF = nuevoG + this.heuristica(vecino, destino)
          f.set(claveVecino, nuevoF)
          predecesores.set(claveVecino, { fila: actual.fila, columna: actual.columna })
          this._push({ fila: vecino.fila, columna: vecino.columna, f: nuevoF, g: nuevoG })
          if (!enAbiertos.has(claveVecino)) {
            enAbiertos.add(claveVecino)
          }
        }
      }
    }

    const reconFinal = reconstruirRuta(origen, destino, predecesores)
    const tiempoFinal = performance.now() - inicio
    const costoDestino = g.get(claveDestino)
    return {
      exito: reconFinal.exito,
      ruta: reconFinal.ruta,
      nodosExpandidos: nodosExpandidos.size,
      nodosDescubiertos: nodosDescubiertos.size,
      costoTotal: costoDestino ?? 0,
      pasos: reconFinal.ruta.length > 0 ? reconFinal.ruta.length - 1 : 0,
      tiempoMs: tiempoFinal,
      explorationTrace
    }
  }
}

export function buscarConAStar(origen, destino, entorno) {
  const a = new AStar()
  return a.buscar(origen, destino, entorno)
}