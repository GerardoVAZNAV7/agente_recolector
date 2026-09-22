<script setup>
import { computed } from 'vue'
import { usarSimulador } from './composables/useSimulador.js'

import BarraSuperior from './components/BarraSuperior.vue'
import TableroMapa from './components/TableroMapa.vue'
import PanelRediseno from './components/PanelRediseno.vue'
import PanelPuntuacion from './components/PanelPuntuacion.vue'
import PanelMemoria from './components/PanelMemoria.vue'
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
  iniciarSimulacion,
  pasoManual,
  alternarReproduccion,
  redisenarMapa,
  reiniciarMismoMapa
} = usarSimulador()

const terminado = computed(() => simulador.value?.terminado ?? false)
</script>

<template>
  <div class="app-shell">
    <BarraSuperior titulo="Agente" />

    <main class="contenido">
      <section class="columna-mapa">
        <div class="encabezado-mapa">
          <h1 class="rotulo titulo-mapa">Mapa Agente</h1>
          <span v-if="modo === 'editor'" class="pista">modo diseño</span>
          <span v-else class="pista">
            {{ vistaActual === 'global' ? 'vista global (mapa real)' : 'vista robot (solo lo descubierto)' }}
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
      </aside>
    </main>
  </div>
</template>

<style scoped>
.app-shell {
  width: min(1180px, 100%);
  font-family: var(--font-mono);
}

.contenido {
  display: grid;
  grid-template-columns: minmax(0, 1.55fr) minmax(260px, 0.95fr);
  gap: 16px;
  background: var(--bone);
  border: 2px solid var(--onyx);
  border-top: none;
  padding: 16px;
}

.columna-mapa {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.encabezado-mapa {
  display: flex;
  align-items: baseline;
  gap: 10px;
}
.titulo-mapa {
  margin: 0;
  font-size: 15px;
}
.pista {
  font-size: 10px;
  color: var(--onyx);
  opacity: 0.55;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.columna-lateral {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

@media (max-width: 860px) {
  .contenido {
    grid-template-columns: 1fr;
  }
}
</style>
