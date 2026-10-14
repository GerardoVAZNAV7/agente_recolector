// ============================================================================
// COMPARADOR: ejecuta el MISMO mapa y los mismos paquetes con Dijkstra y A*
// ----------------------------------------------------------------------------
// Uso:  npm run comparar
// Muestra nodos expandidos, nodos descubiertos, costo de ruta, tiempo y
// paquetes recogidos de cada algoritmo en escenarios reproducibles.
// ============================================================================

import { Entorno } from '../src/core/entorno.js'
import { Simulador, MODO_BUSQUEDA } from '../src/core/simulador.js'
import { buscarConDijkstra } from '../src/core/dijkstra.js'
import { buscarConAStar } from '../src/core/astar.js'

const scenario = (nombre, filas, columnas, paquetes, obstaculos, inicio) => ({
  nombre, filas, columnas, paquetes, obstaculos, inicio
})

const escenarios = [
  scenario(
    'Mapa abierto 12x12, un paquete en la esquina opuesta',
    12, 12,
    [{ fila: 11, columna: 11 }],
    [],
    { fila: 0, columna: 0 }
  ),
  scenario(
    'Mapa con muro en zig-zag, dos paquetes',
    10, 10,
    [{ fila: 0, columna: 9 }, { fila: 9, columna: 0 }],
    [
      { fila: 2, columna: 1 }, { fila: 2, columna: 2 }, { fila: 2, columna: 3 },
      { fila: 2, columna: 4 }, { fila: 2, columna: 5 }, { fila: 2, columna: 6 }, { fila: 2, columna: 7 },
      { fila: 5, columna: 2 }, { fila: 5, columna: 3 }, { fila: 5, columna: 4 },
      { fila: 5, columna: 5 }, { fila: 5, columna: 6 }, { fila: 5, columna: 7 },
      { fila: 8, columna: 1 }, { fila: 8, columna: 2 }, { fila: 8, columna: 3 }, { fila: 8, columna: 4 }
    ],
    { fila: 5, columna: 0 }
  ),
  scenario(
    'Mapa 8x8 con columnas intermitentes, tres paquetes',
    8, 8,
    [{ fila: 0, columna: 7 }, { fila: 7, columna: 0 }, { fila: 4, columna: 4 }],
    [
      { fila: 0, columna: 3 }, { fila: 1, columna: 3 }, { fila: 2, columna: 3 },
      { fila: 5, columna: 4 }, { fila: 6, columna: 4 }, { fila: 7, columna: 4 },
      { fila: 3, columna: 6 }, { fila: 4, columna: 6 }
    ],
    { fila: 0, columna: 0 }
  )
]

function correrConAlgoritmo(esc, modo) {
  const entorno = new Entorno(esc.filas, esc.columnas, esc.paquetes, esc.obstaculos, esc.inicio)
  const sim = new Simulador(entorno, modo)
  const t0 = performance.now()
  sim.ejecutarHastaElFinal()
  const totalMs = performance.now() - t0
  return sim.resumen ? { ...sim.resumen(), totalMs } : { totalMs }
}

function medirUnaBusqueda(esc, origen, destino, usarAStar) {
  const entorno = new Entorno(esc.filas, esc.columnas, esc.paquetes, esc.obstaculos, esc.inicio)
  return usarAStar
    ? buscarConAStar(origen, destino, entorno)
    : buscarConDijkstra(origen, destino, entorno)
}

console.log('\n==================== COMPARACIÓN A* vs DIJKSTRA ====================\n')

for (const esc of escenarios) {
  console.log(`Escenario: ${esc.nombre}`)
  console.log(`  inicio (${esc.inicio.fila},${esc.inicio.columna})  paquetes: ${esc.paquetes.length}  obstáculos: ${esc.obstaculos.length}`)

  const d = correrConAlgoritmo(esc, MODO_BUSQUEDA.DIJKSTRA)
  const a = correrConAlgoritmo(esc, MODO_BUSQUEDA.ASTAR)

  console.log('  Recolección completa:')
  console.log(`    Dijkstra -> paquetes ${d.paquetesRecogidos}/${d.totalPaquetes}  movimientos ${d.movimientos}  acciones ${d.acciones}  puntuación ${d.puntuacion}  tiempo ${d.totalMs.toFixed(2)} ms`)
  console.log(`    A*       -> paquetes ${a.paquetesRecogidos}/${a.totalPaquetes}  movimientos ${a.movimientos}  acciones ${a.acciones}  puntuación ${a.puntuacion}  tiempo ${a.totalMs.toFixed(2)} ms`)

  // Comparación de una sola búsqueda hacia el primer paquete.
  const destino = esc.paquetes[0]
  const d1 = medirUnaBusqueda(esc, esc.inicio, destino, false)
  const a1 = medirUnaBusqueda(esc, esc.inicio, destino, true)
  console.log(`  Búsqueda única inicio -> (${destino.fila},${destino.columna}):`)
  console.log(`    Dijkstra -> costo ${d1.costoTotal}  expandidos ${d1.nodosExpandidos}  descubiertos ${d1.nodosDescubiertos}  ${d1.tiempoMs.toFixed(3)} ms`)
  console.log(`    A*       -> costo ${a1.costoTotal}  expandidos ${a1.nodosExpandidos}  descubiertos ${a1.nodosDescubiertos}  ${a1.tiempoMs.toFixed(3)} ms`)
  console.log(`    (mismo costo óptimo: ${d1.costoTotal === a1.costoTotal ? 'SÍ' : 'NO'} | A* exploró ${d1.nodosExpandidos - a1.nodosExpandidos} nodos menos)`)
  console.log('')
}

console.log('====================================================================\n')
