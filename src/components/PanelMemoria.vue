<script setup>
import { computed } from 'vue'
import { CONTENIDO } from '../core/entorno.js'

const props = defineProps({
  simulador: { type: Object, default: null }
})

const filasMapaConocido = computed(() => {
  if (!props.simulador) return []
  return props.simulador.memoria.mapaConocido.map(fila =>
    fila.map(valor => {
      if (valor === CONTENIDO.DESCONOCIDO) return '?'
      if (valor === CONTENIDO.PAQUETE) return 'P'
      if (valor === CONTENIDO.OBSTACULO) return 'X'
      return '.'
    })
  )
})

const etiquetaAccion = (accion) => {
  if (!accion) return '—'
  if (accion.tipo === 'RECOGER') return 'RECOGER'
  return `MOVER ${accion.direccion}${accion.esBacktracking ? ' (backtracking)' : ''}${accion.desdeRuta ? ' (ruta)' : ''}`
}

const etiquetaEvento = {
  PAQUETE_RECOGIDO: 'paquete recogido (+10)',
  MOVIMIENTO_VALIDO: 'movimiento (-1)',
  INTENTO_SALIR_TABLERO: 'intento de salir (-5)',
  INTENTO_CHOCAR_OBSTACULO: 'intento de choque (-5)',
  SIN_ACCION: 'sin acción'
}
</script>

<template>
  <section class="panel">
    <h2 class="rotulo panel__titulo">Memoria</h2>

    <div v-if="!simulador" class="vacio">
      Datos de la memoria interna del agente.
    </div>

    <template v-else>
      <div class="bloque">
        <span class="rotulo etiqueta">Posición actual</span>
        <p class="dato-mono">
          (fila {{ simulador.posicionAgente.fila }}, col {{ simulador.posicionAgente.columna }})
        </p>
      </div>

      <div class="bloque">
        <span class="rotulo etiqueta">Última decisión</span>
        <p class="dato-mono">{{ etiquetaAccion(simulador.ultimaAccion) }}</p>
        <p class="dato-mono dato-mono--tenue">
          {{ etiquetaEvento[simulador.ultimoEvento] || '—' }}
        </p>
      </div>

      <div class="bloque">
        <span class="rotulo etiqueta">Celdas visitadas</span>
        <p class="dato-mono">{{ simulador.memoria.visitadas.size }}</p>
      </div>

      <div class="bloque">
        <span class="rotulo etiqueta">Mapa conocido</span>
        <pre class="mapa-conocido"><span v-for="(fila, f) in filasMapaConocido" :key="f">{{ fila.join(' ') }}
</span></pre>
      </div>
    </template>
  </section>
</template>