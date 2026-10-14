<script setup>
import { computed } from 'vue'

const props = defineProps({
  simulador: { type: Object, default: null },
  maxAcciones: { type: Number, required: true }
})

const resumen = computed(() => (props.simulador ? props.simulador.resumen() : null))

const motivoLegible = {
  TODOS_LOS_PAQUETES: 'Todos los paquetes recolectados (+20)',
  LIMITE_ACCIONES: 'Límite de acciones alcanzado',
  AGENTE_ATRAPADO: 'El agente quedó sin movimientos posibles'
}
</script>

<template>
  <section class="panel">
    <h2 class="rotulo panel__titulo">Tabla de puntos y métricas</h2>

    <div v-if="!resumen" class="vacio">Inicia la simulación para ver la puntuación y métricas.</div>

    <dl v-else class="lista-datos">
      <div class="fila-dato">
        <dt>Algoritmo</dt>
        <dd>{{ resumen.modoBusqueda }}</dd>
      </div>
      <div class="fila-dato" v-if="resumen.algoritmoUsado">
        <dt>Último algoritmo búsqueda</dt>
        <dd>{{ resumen.algoritmoUsado }}</dd>
      </div>
      <div class="fila-dato">
        <dt>Paquetes recogidos</dt>
        <dd>{{ resumen.paquetesRecogidos }} / {{ resumen.totalPaquetes }}</dd>
      </div>
      <div class="fila-dato">
        <dt>Movimientos</dt>
        <dd>{{ resumen.movimientos }}</dd>
      </div>
      <div class="fila-dato">
        <dt>Penalizaciones</dt>
        <dd>{{ resumen.penalizaciones }}</dd>
      </div>
      <div class="fila-dato">
        <dt>Acciones</dt>
        <dd>{{ resumen.acciones }} / {{ maxAcciones }}</dd>
      </div>
      <div class="fila-dato" v-if="resumen.nodosExpandidos !== undefined">
        <dt>Nodos expandidos</dt>
        <dd>{{ resumen.nodosExpandidos }}</dd>
      </div>
      <div class="fila-dato" v-if="resumen.nodosDescubiertos !== undefined">
        <dt>Nodos descubiertos</dt>
        <dd>{{ resumen.nodosDescubiertos }}</dd>
      </div>
      <div class="fila-dato" v-if="resumen.costoTotalRuta !== undefined">
        <dt>Costo total ruta</dt>
        <dd>{{ resumen.costoTotalRuta }}</dd>
      </div>
      <div class="fila-dato" v-if="resumen.tiempoBusquedaMs !== undefined">
        <dt>Tiempo búsqueda (ms)</dt>
        <dd>{{ resumen.tiempoBusquedaMs }}</dd>
      </div>
      <div class="fila-dato fila-dato--destacada">
        <dt>Puntuación</dt>
        <dd>{{ resumen.puntuacion }}</dd>
      </div>
    </dl>

    <p v-if="resumen?.terminado" class="estado-fin">
      {{ motivoLegible[resumen.motivoFin] || 'Simulación finalizada' }}
    </p>
  </section>
</template>