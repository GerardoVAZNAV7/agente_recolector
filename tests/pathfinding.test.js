// ============================================================================
// PRUEBAS DEL NUCLEO: pathfinding (A* y Dijkstra) e integracion con el agente
// ----------------------------------------------------------------------------
// Se ejecuta con:  npm test
// No usa dependencias externas: runner casero con assert de node.
// ============================================================================

import assert from 'node:assert/strict'
import { Entorno } from '../src/core/entorno.js'
import { buscarConDijkstra } from '../src/core/dijkstra.js'
import { buscarConAStar } from '../src/core/astar.js'
import { Simulador, MODO_BUSQUEDA } from '../src/core/simulador.js'

let pasadas = 0
let fallidas = 0

function prueba(nombre, fn) {
  try {
    fn()
    pasadas++
    console.log(`  OK   ${nombre}`)
  } catch (error) {
    fallidas++
    console.log(`  FAIL ${nombre}`)
    console.log(`       ${error.message}`)
  }
}

function crearEntorno(filas, columnas, paquetes, obstaculos, inicio = { fila: 0, columna: 0 }) {
  return new Entorno(filas, columnas, paquetes, obstaculos, inicio)
}

/** Verifica que una ruta sea continua, empiece en origen, termine en destino y no pise obstáculos. */
function rutaValida(res, origen, destino, entorno) {
  assert.ok(res.exito, 'la búsqueda debió tener éxito')
  assert.ok(res.ruta.length >= 2, 'la ruta debe tener al menos origen y destino')
  const a = res.ruta[0]
  const b = res.ruta[res.ruta.length - 1]
  assert.deepEqual(a, { fila: origen.fila, columna: origen.columna }, 'la ruta debe empezar en el origen')
  assert.deepEqual(b, { fila: destino.fila, columna: destino.columna }, 'la ruta debe terminar en el destino')
  for (let i = 0; i < res.ruta.length; i++) {
    const p = res.ruta[i]
    assert.ok(!entorno.contieneObstaculo(p.fila, p.columna), 'la ruta no debe pisar un obstáculo')
    assert.ok(entorno.estaDentroDelTablero(p.fila, p.columna), 'la ruta no debe salir del tablero')
    if (i > 0) {
      const q = res.ruta[i - 1]
      const dist = Math.abs(p.fila - q.fila) + Math.abs(p.columna - q.columna)
      assert.equal(dist, 1, 'cada paso de la ruta debe ser adyacente (4 direcciones)')
    }
  }
}

console.log('\n=== Pathfinding: Dijkstra y A* ===\n')

// 1) Cuadrícula sin obstáculos y con un paquete alcanzable
prueba('1. Sin obstáculos: A* y Dijkstra llegan y coinciden en costo', () => {
  const entorno = crearEntorno(5, 5, [{ fila: 4, columna: 4 }], [], { fila: 0, columna: 0 })
  const origen = { fila: 0, columna: 0 }
  const destino = { fila: 4, columna: 4 }
  const d = buscarConDijkstra(origen, destino, entorno)
  const a = buscarConAStar(origen, destino, entorno)
  rutaValida(d, origen, destino, entorno)
  rutaValida(a, origen, destino, entorno)
  assert.equal(d.costoTotal, 8, 'costo Manhattan = 8')
  assert.equal(a.costoTotal, 8, 'A* debe dar el mismo costo óptimo')
  assert.equal(d.pasos, 8)
  assert.equal(a.pasos, 8)
})

// 2) Cuadrícula con obstáculos que obligan a rodearlos
prueba('2. Con obstáculos que obligan a rodear: rutas válidas y mismo costo', () => {
  const obstaculos = [{ fila: 1, columna: 0 }, { fila: 1, columna: 1 }, { fila: 1, columna: 2 }, { fila: 1, columna: 3 }]
  const entorno = crearEntorno(5, 5, [{ fila: 4, columna: 4 }], obstaculos, { fila: 0, columna: 0 })
  const origen = { fila: 0, columna: 0 }
  const destino = { fila: 4, columna: 4 }
  const d = buscarConDijkstra(origen, destino, entorno)
  const a = buscarConAStar(origen, destino, entorno)
  rutaValida(d, origen, destino, entorno)
  rutaValida(a, origen, destino, entorno)
  assert.equal(d.costoTotal, a.costoTotal, 'ambos deben obtener el mismo costo óptimo')
})

// 3) Varias rutas posibles con costos diferentes (obstáculo intermedio fuerza desvío)
prueba('3. Varias rutas posibles: el costo óptimo se mantiene', () => {
  const obstaculos = [{ fila: 0, columna: 1 }, { fila: 1, columna: 1 }]
  const entorno = crearEntorno(4, 4, [], obstaculos, { fila: 0, columna: 0 })
  const origen = { fila: 0, columna: 0 }
  const destino = { fila: 0, columna: 3 }
  const d = buscarConDijkstra(origen, destino, entorno)
  const a = buscarConAStar(origen, destino, entorno)
  rutaValida(d, origen, destino, entorno)
  rutaValida(a, origen, destino, entorno)
  assert.equal(d.costoTotal, a.costoTotal)
})

// 4) Paquete junto al agente (destino adyacente)
prueba('4. Destino adyacente: ruta de 1 movimiento', () => {
  const entorno = crearEntorno(3, 3, [], [], { fila: 1, columna: 1 })
  const origen = { fila: 1, columna: 1 }
  const destino = { fila: 1, columna: 2 }
  const d = buscarConDijkstra(origen, destino, entorno)
  const a = buscarConAStar(origen, destino, entorno)
  assert.equal(d.pasos, 1)
  assert.equal(a.pasos, 1)
  assert.equal(d.costoTotal, 1)
})

// 5) Cuadrícula donde el paquete es inaccesible
prueba('5. Paquete inaccesible: exito=false y sin ruta', () => {
  // Muro vertical completo en la columna 2
  const obstaculos = []
  for (let f = 0; f < 5; f++) obstaculos.push({ fila: f, columna: 2 })
  const entorno = crearEntorno(5, 5, [{ fila: 4, columna: 4 }], obstaculos, { fila: 0, columna: 0 })
  const origen = { fila: 0, columna: 0 }
  const destino = { fila: 0, columna: 4 }
  const d = buscarConDijkstra(origen, destino, entorno)
  const a = buscarConAStar(origen, destino, entorno)
  assert.equal(d.exito, false, 'Dijkstra debe reportar inalcanzable')
  assert.equal(a.exito, false, 'A* debe reportar inalcanzable')
  assert.equal(d.ruta.length, 0)
  assert.equal(a.ruta.length, 0)
})

// 6) No atravesar obstáculos ni salir del tablero (borde rodeado)
prueba('6. Reglas de movimiento: no atraviesa bordes del tablero', () => {
  const entorno = crearEntorno(3, 3, [], [], { fila: 0, columna: 0 })
  const origen = { fila: 0, columna: 0 }
  const destino = { fila: 2, columna: 2 }
  const d = buscarConDijkstra(origen, destino, entorno)
  rutaValida(d, origen, destino, entorno)
})

// 11) Comparación de costos entre ambos algoritmos
prueba('11. Comparación: mismo costo óptimo en mapa enrejado', () => {
  const obstaculos = []
  for (let f = 0; f < 8; f++) {
    if (f % 2 === 0) obstaculos.push({ fila: f, columna: 4 })
  }
  const entorno = crearEntorno(9, 9, [], obstaculos, { fila: 0, columna: 0 })
  const origen = { fila: 0, columna: 0 }
  const destino = { fila: 8, columna: 8 }
  const d = buscarConDijkstra(origen, destino, entorno)
  const a = buscarConAStar(origen, destino, entorno)
  assert.equal(d.exito, true)
  assert.equal(a.exito, true)
  assert.equal(d.costoTotal, a.costoTotal, 'costos óptimos deben coincidir')
  console.log(`       [info] expandidos -> Dijkstra: ${d.nodosExpandidos}, A*: ${a.nodosExpandidos}`)
})

// 12) La heurística de A* no debe expandir MÁS nodos que Dijkstra en un mapa abierto
prueba('A* no expande más nodos que Dijkstra en mapa abierto', () => {
  const entorno = crearEntorno(15, 15, [], [], { fila: 0, columna: 0 })
  const origen = { fila: 0, columna: 0 }
  const destino = { fila: 14, columna: 14 }
  const d = buscarConDijkstra(origen, destino, entorno)
  const a = buscarConAStar(origen, destino, entorno)
  assert.ok(a.nodosExpandidos <= d.nodosExpandidos, `A* (${a.nodosExpandidos}) no debe superar a Dijkstra (${d.nodosExpandidos})`)
  assert.equal(d.costoTotal, a.costoTotal)
})

console.log('\n=== Integración con el agente recolector ===\n')

// 7) Varios paquetes recogidos consecutivamente con A* y con Dijkstra
prueba('7. Recolecta todos los paquetes alcanzables (A*)', () => {
  const paquetes = [{ fila: 0, columna: 3 }, { fila: 3, columna: 0 }, { fila: 4, columna: 4 }]
  const entorno = crearEntorno(6, 6, paquetes, [], { fila: 2, columna: 2 })
  const sim = new Simulador(entorno, MODO_BUSQUEDA.ASTAR)
  sim.ejecutarHastaElFinal()
  assert.equal(sim.paquetesRecogidos, 3, 'debe recoger los 3 paquetes')
  assert.equal(sim.motivoFin, 'TODOS_LOS_PAQUETES')
})

prueba('7b. Recolecta todos los paquetes alcanzables (Dijkstra)', () => {
  const paquetes = [{ fila: 0, columna: 3 }, { fila: 3, columna: 0 }, { fila: 4, columna: 4 }]
  const entorno = crearEntorno(6, 6, paquetes, [], { fila: 2, columna: 2 })
  const sim = new Simulador(entorno, MODO_BUSQUEDA.DIJKSTRA)
  sim.ejecutarHastaElFinal()
  assert.equal(sim.paquetesRecogidos, 3)
  assert.equal(sim.motivoFin, 'TODOS_LOS_PAQUETES')
})

// 9) Actualización del estado tras recoger un paquete
prueba('9. El paquete recogido deja de estar pendiente', () => {
  const entorno = crearEntorno(3, 3, [{ fila: 0, columna: 2 }], [], { fila: 0, columna: 0 })
  const sim = new Simulador(entorno, MODO_BUSQUEDA.ASTAR)
  sim.ejecutarHastaElFinal()
  assert.equal(entorno.contienePaquete(0, 2), false, 'el paquete debe eliminarse del entorno')
  assert.equal(sim.paquetesRecogidos, 1)
})

// 6b) No recolectar dos veces y no quedar atrapado
prueba('6b. No recolecta dos veces ni queda atrapado', () => {
  const entorno = crearEntorno(4, 4, [{ fila: 0, columna: 1 }, { fila: 1, columna: 0 }], [], { fila: 0, columna: 0 })
  const sim = new Simulador(entorno, MODO_BUSQUEDA.DIJKSTRA)
  sim.ejecutarHastaElFinal()
  assert.equal(sim.paquetesRecogidos, 2, 'cada paquete se recoge exactamente una vez')
})

// 8) Obstáculos que dividen el mapa en regiones desconectadas
prueba('8. Mapa dividido: recoge lo alcanzable y termina sin colgarse', () => {
  const obstaculos = []
  for (let f = 0; f < 6; f++) obstaculos.push({ fila: f, columna: 3 })
  const paquetes = [{ fila: 1, columna: 1 }, { fila: 1, columna: 5 }] // el segundo es inalcanzable
  const entorno = crearEntorno(6, 6, paquetes, obstaculos, { fila: 0, columna: 0 })
  const sim = new Simulador(entorno, MODO_BUSQUEDA.ASTAR)
  sim.ejecutarHastaElFinal()
  assert.equal(sim.paquetesRecogidos, 1, 'solo el paquete alcanzable')
  assert.ok(sim.terminado, 'la simulación debe terminar de forma controlada')
  console.log(`       [info] motivo fin = ${sim.motivoFin}`)
})

// 6c) Ausencia total de paquetes -> directo a terminar
prueba('Ausencia de paquetes: no hay nada que recoger', () => {
  const entorno = crearEntorno(3, 3, [], [], { fila: 0, columna: 0 })
  const sim = new Simulador(entorno, MODO_BUSQUEDA.DIJKSTRA)
  sim.ejecutarHastaElFinal()
  assert.equal(sim.paquetesRecogidos, 0)
  assert.ok(sim.terminado)
})

console.log(`\nResultado: ${pasadas} pasadas, ${fallidas} fallidas\n`)
if (fallidas > 0) process.exit(1)
