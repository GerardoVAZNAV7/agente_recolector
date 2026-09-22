<script setup>
const props = defineProps({
  filas: { type: Number, required: true },
  columnas: { type: Number, required: true },
  herramientaActiva: { type: String, required: true },
  HERRAMIENTAS: { type: Object, required: true },
  error: { type: String, default: '' }
})

const emit = defineEmits(['redimensionar', 'seleccionar-herramienta', 'limpiar'])

function alCambiarFilas(evento) {
  emit('redimensionar', Number(evento.target.value), props.columnas)
}
function alCambiarColumnas(evento) {
  emit('redimensionar', props.filas, Number(evento.target.value))
}
</script>

<template>
  <section class="panel">
    <h2 class="rotulo panel__titulo">Rediseño</h2>

    <div class="campo">
      <span class="rotulo">Dimensión del mapa</span>
      <div class="dimensiones">
        <label class="dimension-item">
          <span>largo</span>
          <input type="number" min="3" max="20" :value="filas" @change="alCambiarFilas" />
        </label>
        <label class="dimension-item">
          <span>ancho</span>
          <input type="number" min="3" max="20" :value="columnas" @change="alCambiarColumnas" />
        </label>
      </div>
    </div>

    <div class="campo">
      <span class="rotulo">Objetos</span>
      <div class="herramientas">
        <button
          class="herramienta"
          :class="{ activa: herramientaActiva === HERRAMIENTAS.PAQUETE }"
          @click="emit('seleccionar-herramienta', HERRAMIENTAS.PAQUETE)"
        >
          <span class="muestra muestra--paquete">P</span>
          Paquete
        </button>
        <button
          class="herramienta"
          :class="{ activa: herramientaActiva === HERRAMIENTAS.OBSTACULO }"
          @click="emit('seleccionar-herramienta', HERRAMIENTAS.OBSTACULO)"
        >
          <span class="muestra muestra--obstaculo">✕</span>
          Obstáculo
        </button>
        <button
          class="herramienta"
          :class="{ activa: herramientaActiva === HERRAMIENTAS.AGENTE }"
          @click="emit('seleccionar-herramienta', HERRAMIENTAS.AGENTE)"
        >
          <span class="muestra muestra--agente">A</span>
          Inicio agente
        </button>
        <button
          class="herramienta"
          :class="{ activa: herramientaActiva === HERRAMIENTAS.BORRAR }"
          @click="emit('seleccionar-herramienta', HERRAMIENTAS.BORRAR)"
        >
          <span class="muestra muestra--borrar">·</span>
          Borrar
        </button>
      </div>
    </div>

    <button class="boton-secundario" @click="emit('limpiar')">Vaciar mapa</button>

    <p v-if="error" class="mensaje-error">{{ error }}</p>
    <p class="ayuda">Clic en el tablero para colocar la herramienta seleccionada.</p>
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
.campo {
  margin-bottom: 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.dimensiones {
  display: flex;
  gap: 10px;
}
.dimension-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 11px;
  color: var(--onyx);
  opacity: 0.75;
}
.dimension-item input {
  border: 1.5px solid var(--onyx);
  background: var(--bone);
  padding: 5px 6px;
  font-size: 13px;
  color: var(--onyx);
}
.herramientas {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
}
.herramienta {
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1.5px solid var(--onyx);
  background: var(--bone);
  padding: 6px 8px;
  font-size: 11px;
  color: var(--onyx);
  text-align: left;
}
.herramienta.activa {
  background: var(--slate);
  color: var(--bone);
  border-color: var(--slate);
}
.muestra {
  width: 18px;
  height: 18px;
  min-width: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 11px;
  border-radius: 3px;
  border: 1.5px solid var(--onyx);
}
.muestra--paquete {
  background: var(--fern);
  color: var(--bone);
}
.muestra--obstaculo {
  background: var(--rust);
  color: var(--bone);
}
.muestra--agente {
  background: var(--honey);
  color: var(--onyx);
  border-radius: 50%;
}
.muestra--borrar {
  background: var(--bone);
  color: var(--onyx);
}
.boton-secundario {
  width: 100%;
  border: 1.5px solid var(--onyx);
  background: var(--bone);
  padding: 7px;
  font-size: 11px;
  color: var(--onyx);
  margin-bottom: 8px;
}
.boton-secundario:hover {
  background: var(--bone-dim);
}
.mensaje-error {
  font-size: 11px;
  color: var(--bone);
  background: var(--rust);
  border: 1.5px solid var(--onyx);
  padding: 6px 8px;
  margin: 0 0 8px;
}
.ayuda {
  font-size: 10px;
  color: var(--onyx);
  opacity: 0.55;
  margin: 0;
}
</style>
