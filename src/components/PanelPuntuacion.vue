<script setup>
import { computed } from 'vue'

const props = defineProps({
  simulador: { type: Object, default: null },
  maxAcciones: { type: Number, required: true }
})

const resumen = computed(() => (props.simulador ? props.simulador.resumen() : null))

const motivoLegible = {
  TODOS_LOS_PAQUETES: 'Todos los paquetes recolectados (+20)',
  LIMITE_ACCIONES: 'Límite de 50 acciones alcanzado',
  AGENTE_ATRAPADO: 'El agente quedó sin movimientos posibles'
}
</script>

<template>
  <section class="panel">
    <h2 class="rotulo panel__titulo">Tabla de puntos</h2>

    <div v-if="!resumen" class="vacio">Inicia la simulación para ver la puntuación.</div>

    <dl v-else class="lista-datos">
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
  opacity: 0.55;
}
.lista-datos {
  margin: 0;
}
.fila-dato {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding: 6px 0;
  border-bottom: 1px dashed var(--linea);
  font-size: 12px;
}
.fila-dato dt {
  color: var(--onyx);
  opacity: 0.7;
}
.fila-dato dd {
  margin: 0;
  font-weight: 600;
  color: var(--onyx);
}
.fila-dato--destacada {
  margin-top: 4px;
  border-bottom: none;
  border-top: 1.5px solid var(--onyx);
  padding-top: 8px;
}
.fila-dato--destacada dd {
  font-family: var(--font-display);
  font-size: 20px;
  color: var(--slate);
}
.estado-fin {
  margin: 10px 0 0;
  font-size: 11px;
  padding: 8px;
  background: var(--fern);
  color: var(--bone);
  border: 1.5px solid var(--onyx);
}
</style>
