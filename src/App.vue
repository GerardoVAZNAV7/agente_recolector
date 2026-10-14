<script setup>
import { computed } from 'vue'
import { usarSimulador } from './composables/useSimulador.js'

import BarraSuperior from './components/BarraSuperior.vue'
import TableroMapa from './components/TableroMapa.vue'
import PanelRediseno from './components/PanelRediseno.vue'
import PanelPuntuacion from './components/PanelPuntuacion.vue'
import PanelMemoria from './components/PanelMemoria.vue'
import PanelComparacion from './components/PanelComparacion.vue'
import BarraControles from './components/BarraControles.vue'

const {
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

  modo,
  vistaActual,

  simulador,
  reproduciendo,
  MAX_ACCIONES,
  MODO_BUSQUEDA,
  iniciarSimulacion,
  iniciarConDijkstra,
  iniciarConAStar,
  comparacion,
  compararAlgoritmos,
  pasoManual,
  alternarReproduccion,
  redisenarMapa,
  reiniciarMismoMapa
} = usarSimulador()

const terminado = computed(() => simulador.value?.terminado ?? false)
</script>

<template>
  <div class="app-shell">
    <BarraSuperior titulo="Agente Recolector - A* y Dijkstra" />

    <main class="contenido">
      <section class="columna-mapa">
        <div class="encabezado-mapa">
          <h1 class="rotulo titulo-mapa">Mapa Agente</h1>
          <span v-if="modo === 'editor'" class="pista">modo diseño</span>
          <span v-else class="pista">
            {{ vistaActual === 'global' ? 'vista global (mapa real)' : 'vista robot (solo lo descubierto)' }}
            <span v-if="simulador?.modoBusqueda === MODO_BUSQUEDA.DIJKSTRA"> | Dijkstra</span>
            <span v-if="simulador?.modoBusqueda === MODO_BUSQUEDA.ASTAR"> | A*</span>
          </span>
        </div>

        <TableroMapa
          :modo="modo"
          :vista="vistaActual"
          :filas="dimensiones.filas"
          :columnas="dimensiones.columnas"
          :cuadricula-editor="cuadricula"
          :posicion-inicial-agente="posicionInicialAgente"
          :simulador="simulador"
          @pintar-celda="pintarCelda"
        />

        <BarraControles
          :modo="modo"
          :reproduciendo="reproduciendo"
          :terminado="terminado"
          :vista="vistaActual"
          @iniciar="iniciarSimulacion"
          @iniciar-dijkstra="iniciarConDijkstra"
          @iniciar-astar="iniciarConAStar"
          @comparar="compararAlgoritmos"
          @paso="pasoManual"
          @alternar-reproduccion="alternarReproduccion"
          @redisenar="redisenarMapa"
          @reiniciar="reiniciarMismoMapa"
          @cambiar-vista="(v) => (vistaActual = v)"
        />
      </section>

      <aside class="columna-lateral">
        <PanelPuntuacion :simulador="simulador" :max-acciones="MAX_ACCIONES" />

        <PanelRediseno
          v-if="modo === 'editor'"
          :filas="dimensiones.filas"
          :columnas="dimensiones.columnas"
          :herramienta-activa="herramientaActiva"
          :HERRAMIENTAS="HERRAMIENTAS"
          :error="errorValidacion"
          @redimensionar="redimensionar"
          @seleccionar-herramienta="seleccionarHerramienta"
          @limpiar="limpiarMapa"
        />

        <PanelMemoria v-else :simulador="simulador" />

        <PanelComparacion :comparacion="comparacion" :max-acciones="MAX_ACCIONES" />
      </aside>
    </main>
  </div>
</template>

<style scoped>
.app-shell {
  width: 100%;
  max-width: 1200px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.contenido {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  gap: 18px;
  align-items: start;
}

.columna-mapa {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
}

.encabezado-mapa {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
}

.titulo-mapa {
  margin: 0;
  color: var(--bone);
  font-size: 15px;
}

.pista {
  font-size: 10px;
  color: var(--bone);
  opacity: 0.65;
}

.columna-lateral {
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-width: 0;
}

@media (max-width: 860px) {
  .contenido {
    grid-template-columns: 1fr;
  }
}
</style>