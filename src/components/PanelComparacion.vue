<script setup>
import { computed } from 'vue'

const props = defineProps({
  comparacion: { type: Object, default: null },
  maxAcciones: { type: Number, required: true }
})

const motivoLegible = {
  TODOS_LOS_PAQUETES: 'Todos los paquetes',
  LIMITE_ACCIONES: 'Límite de acciones',
  AGENTE_ATRAPADO: 'Sin paquetes alcanzables'
}

// Cada fila: etiqueta, valor Dijkstra, valor A*, y diferencia (A* - Dijkstra).
const filas = computed(() => {
  const c = props.comparacion
  if (!c) return []
  const d = c.dijkstra
  const a = c.astar
  const diff = (va, vb) => {
    if (typeof va === 'number' && typeof vb === 'number') {
      const dif = vb - va
      return dif > 0 ? `+${dif}` : `${dif}`
    }
    return '—'
  }
  return [
    { etiqueta: 'Paquetes recogidos', d: `${d.paquetesRecogidos}/${d.totalPaquetes}`, a: `${a.paquetesRecogidos}/${a.totalPaquetes}`, dif: '—' },
    { etiqueta: 'Movimientos', d: d.movimientos, a: a.movimientos, dif: diff(d.movimientos, a.movimientos) },
    { etiqueta: 'Acciones', d: `${d.acciones}/${props.maxAcciones}`, a: `${a.acciones}/${props.maxAcciones}`, dif: diff(d.acciones, a.acciones) },
    { etiqueta: 'Nodos expandidos', d: d.totalNodosExpandidos, a: a.totalNodosExpandidos, dif: diff(d.totalNodosExpandidos, a.totalNodosExpandidos), destacar: true },
    { etiqueta: 'Nodos descubiertos', d: d.totalNodosDescubiertos, a: a.totalNodosDescubiertos, dif: diff(d.totalNodosDescubiertos, a.totalNodosDescubiertos) },
    { etiqueta: 'Búsquedas realizadas', d: d.busquedasRealizadas, a: a.busquedasRealizadas, dif: diff(d.busquedasRealizadas, a.busquedasRealizadas) },
    { etiqueta: 'Costo total de rutas', d: d.totalCostoRuta, a: a.totalCostoRuta, dif: diff(d.totalCostoRuta, a.totalCostoRuta) },
    { etiqueta: 'Tiempo búsqueda (ms)', d: d.totalTiempoBusquedaMs, a: a.totalTiempoBusquedaMs, dif: diff(d.totalTiempoBusquedaMs, a.totalTiempoBusquedaMs) },
    { etiqueta: 'Puntuación', d: d.puntuacion, a: a.puntuacion, dif: diff(d.puntuacion, a.puntuacion) },
    { etiqueta: 'Fin', d: motivoLegible[d.motivoFin] || '—', a: motivoLegible[a.motivoFin] || '—', dif: '—' }
  ]
})

const ahorroNodos = computed(() => {
  const c = props.comparacion
  if (!c) return null
  return c.dijkstra.totalNodosExpandidos - c.astar.totalNodosExpandidos
})
</script>

<template>
  <section class="panel">
    <h2 class="rotulo panel__titulo">A* VS Dijkstra</h2>

    <div v-if="!comparacion" class="vacio">
      Pulsa <b>⚖ A* VS Dijkstra</b> para comparar ambos algoritmos sobre este mismo mapa.
    </div>

    <template v-else>
      <div class="tabla-scroll">
        <table class="tabla">
          <thead>
            <tr>
              <th>Métrica</th>
              <th>Dijkstra</th>
              <th>A*</th>
              <th>Dif.</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="f in filas" :key="f.etiqueta" :class="{ destacada: f.destacar }">
              <td class="etiqueta">{{ f.etiqueta }}</td>
              <td class="valor">{{ f.d }}</td>
              <td class="valor">{{ f.a }}</td>
              <td class="dif">{{ f.dif }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p class="nota">
        Ambas columnas usan el <b>mismo mapa</b> y la <b>misma estrategia</b> de selección de
        paquetes. La diferencia se calcula como <b>A* − Dijkstra</b>.
      </p>

      <p v-if="ahorroNodos !== null" class="conclusion">
        A* exploró
        <b>{{ ahorroNodos >= 0 ? ahorroNodos + ' nodos menos' : Math.abs(ahorroNodos) + ' nodos más' }}</b>
        que Dijkstra en la recolección completa.
      </p>
    </template>
  </section>
</template>

<style scoped>
.panel {
  border: 2px solid var(--onyx);
  background: var(--bone);
  padding: 14px;
}
.panel__titulo {
  margin: 0 0 12px;
  border-bottom: 1.5px solid var(--onyx);
  padding-bottom: 8px;
}
.vacio {
  font-size: 11px;
  color: var(--onyx);
  opacity: 0.7;
}
.tabla-scroll {
  overflow-x: auto;
}
.tabla {
  width: 100%;
  border-collapse: collapse;
  font-size: 11px;
}
.tabla th {
  text-align: right;
  font-family: var(--font-display);
  text-transform: uppercase;
  font-size: 9px;
  letter-spacing: 0.04em;
  padding: 5px 4px;
  border-bottom: 1.5px solid var(--onyx);
}
.tabla th:first-child {
  text-align: left;
}
.tabla td {
  padding: 5px 4px;
  border-bottom: 1px dashed var(--linea);
  text-align: right;
}
.tabla td.etiqueta {
  text-align: left;
  opacity: 0.8;
}
.tabla td.valor {
  font-weight: 600;
}
.tabla tr.destacada td {
  background: #fff4cf;
}
.tabla td.dif {
  color: var(--slate);
  font-weight: 600;
}
.nota {
  margin: 10px 0 0;
  font-size: 10px;
  color: var(--onyx);
  opacity: 0.7;
}
.conclusion {
  margin: 8px 0 0;
  font-size: 11px;
  padding: 8px;
  background: var(--slate);
  color: var(--bone);
  border: 1.5px solid var(--onyx);
}
</style>
