<script setup>
defineProps({
  modo: { type: String, required: true },
  reproduciendo: { type: Boolean, required: true },
  terminado: { type: Boolean, default: false },
  vista: { type: String, default: 'global' }
})

const emit = defineEmits([
  'iniciar',
  'paso',
  'alternar-reproduccion',
  'redisenar',
  'reiniciar',
  'cambiar-vista'
])
</script>

<template>
  <div class="controles">
    <button v-if="modo === 'editor'" class="boton boton--principal" @click="emit('iniciar')">
      ▶ Iniciar simulación
    </button>

    <template v-else>
      <button class="boton" @click="emit('paso')" :disabled="reproduciendo || terminado">
        ⏭ Paso a paso
      </button>
      <button class="boton" @click="emit('alternar-reproduccion')" :disabled="terminado">
        {{ reproduciendo ? '⏸ Pausar' : '▶ Reproducir' }}
      </button>
      <button class="boton" @click="emit('reiniciar')">↺ Reiniciar mapa actual</button>

      <div class="grupo-vista">
        <button
          class="boton-vista"
          :class="{ activa: vista === 'global' }"
          @click="emit('cambiar-vista', 'global')"
        >
          Vista global
        </button>
        <button
          class="boton-vista"
          :class="{ activa: vista === 'robot' }"
          @click="emit('cambiar-vista', 'robot')"
        >
          Vista robot
        </button>
      </div>
    </template>

    <button class="boton boton--fantasma" @click="emit('redisenar')">✎ Rediseñar mapa</button>
  </div>
</template>

<style scoped>
.controles {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  border: 2px solid var(--onyx);
  border-top: none;
  background: var(--bone);
  padding: 12px;
  border-radius: 0 0 10px 10px;
}
.boton {
  border: 1.5px solid var(--onyx);
  background: var(--bone);
  color: var(--onyx);
  padding: 8px 14px;
  font-size: 12px;
  font-weight: 600;
}
.boton:hover:not(:disabled) {
  background: var(--bone-dim);
}
.boton:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.boton--principal {
  background: var(--fern);
  color: var(--bone);
  border-color: var(--fern);
}
.boton--fantasma {
  margin-left: auto;
  background: transparent;
  border-color: var(--onyx);
  opacity: 0.75;
}
.grupo-vista {
  display: flex;
  border: 1.5px solid var(--slate);
  overflow: hidden;
}
.boton-vista {
  border: none;
  background: var(--bone);
  color: var(--slate);
  padding: 8px 12px;
  font-size: 11px;
  font-weight: 600;
}
.boton-vista.activa {
  background: var(--slate);
  color: var(--bone);
}
</style>
