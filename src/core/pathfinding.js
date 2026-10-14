// Interfaz común para algoritmos de búsqueda de caminos
// Respeta las reglas del proyecto: 4 direcciones, sin atravesar obstáculos, dentro de límites
// Costos de movimiento: uniforme (mismo costo para todos los movimientos válidos)

import { celdaDestino, DIRECCIONES } from './percepcion.js'
import { CONTENIDO } from './entorno.js'

export const MOVIMIENTO_COSTO = 1 // costo uniforme según el proyecto

export const DIRECCIONES_4 = [
  DIRECCIONES.ARRIBA,
  DIRECCIONES.ABAJO,
  DIRECCIONES.IZQUIERDA,
  DIRECCIONES.DERECHA
]

export function esCeldaTransitable(entorno, fila, columna) {
  if (!entorno.estaDentroDelTablero(fila, columna)) {
    return false
  }
  if (entorno.contieneObstaculo(fila, columna)) {
    return false
  }
  return true
}

export function reconstruirRuta(origen, destino, predecesores) {
  const ruta = []
  let actual = { fila: destino.fila, columna: destino.columna }
  const visitadosEnReconstruccion = new Set()
  
  // Reconstruir desde destino hacia origen usando predecesores
  while (!(actual.fila === origen.fila && actual.columna === origen.columna)) {
    const clave = `${actual.fila},${actual.columna}`
    if (visitadosEnReconstruccion.has(clave)) {
      // Evitar ciclos en ruta reconstruida
      return { exito: false, ruta: [] }
    }
    visitadosEnReconstruccion.add(clave)
    ruta.push({ fila: actual.fila, columna: actual.columna })
    const padre = predecesores.get(clave)
    if (!padre) {
      return { exito: false, ruta: [] }
    }
    actual = padre
  }
  ruta.push({ fila: origen.fila, columna: origen.columna })
  // Invertir para obtener ruta desde origen hacia destino
  ruta.reverse()
  return { exito: true, ruta }
}

export function obtenerVecinosTransitables(entorno, posicion) {
  const vecinos = []
  for (const dir of DIRECCIONES_4) {
    const nf = posicion.fila + dir.fila
    const nc = posicion.columna + dir.columna
    if (esCeldaTransitable(entorno, nf, nc)) {
      vecinos.push({ fila: nf, columna: nc })
    }
  }
  return vecinos
}