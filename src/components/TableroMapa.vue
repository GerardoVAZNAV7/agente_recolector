<script setup>
import { computed } from 'vue'
import { SIMBOLOS, CONTENIDO } from '../core/entorno.js'

const props = defineProps({
  modo: { type: String, required: true }, // 'editor' | 'simulacion'
  vista: { type: String, default: 'global' }, // 'global' | 'robot'
  filas: { type: Number, required: true },
  columnas: { type: Number, required: true },
  cuadriculaEditor: { type: Array, default: () => [] },
  posicionInicialAgente: { type: Object, default: null },
  simulador: { type: Object, default: null }
})

const emit = defineEmits(['pintar-celda'])

// Tipo logico de cada celda para pintarla (editor, simulacion o memoria).
const tipoDeCelda = computed(() => {
  const filas = []
  for (let f = 0; f < props.filas; f++) {
    const fila = []
    for (let c = 0; c < props.columnas; c++) {
      fila.push(calcularTipo(f, c))
    }
    filas.push(fila)
  }
  return filas
})

function calcularTipo(f, c) {
  if (props.modo === 'editor') {
    if (
      props.posicionInicialAgente &&
      props.posicionInicialAgente.fila === f &&
      props.posicionInicialAgente.columna === c
    ) {
      return 'AGENTE'
    }
    const valor = props.cuadriculaEditor?.[f]?.[c]
    if (valor === SIMBOLOS.PAQUETE) return 'PAQUETE'
    if (valor === SIMBOLOS.OBSTACULO) return 'OBSTACULO'
    return 'VACIO'
  }

  // modo simulacion
  const sim = props.simulador
  if (!sim) return 'VACIO'

  const esAgente = sim.posicionAgente.fila === f && sim.posicionAgente.columna === c
  if (esAgente) return 'AGENTE'

  if (props.vista === 'global') {
    const contenido = sim.entorno.contenidoDeCelda(f, c)
    if (contenido === CONTENIDO.PAQUETE) return 'PAQUETE'
    if (contenido === CONTENIDO.OBSTACULO) return 'OBSTACULO'
    return sim.memoria.fueVisitada(f, c) ? 'VISITADA' : 'VACIO'
  }

  // vista robot: solo lo que el agente ha descubierto
  const conocido = sim.memoria.mapaConocido[f][c]
  if (conocido === CONTENIDO.DESCONOCIDO) return 'DESCONOCIDA'
  if (conocido === CONTENIDO.PAQUETE) return 'PAQUETE'
  if (conocido === CONTENIDO.OBSTACULO) return 'OBSTACULO'
  return sim.memoria.fueVisitada(f, c) ? 'VISITADA' : 'VACIO'
}

function alClicarCelda(f, c) {
  if (props.modo !== 'editor') return
  emit('pintar-celda', f, c)
}
</script>

<template>
  <div
    class="tablero"
    :style="{ '--cols': columnas, '--filas': filas }"
    :class="{ 'tablero--editable': modo === 'editor' }"
  >
    <div
      v-for="(fila, f) in tipoDeCelda"
      :key="f"
      class="fila-tablero"
    >
      <div
        v-for="(tipo, c) in fila"
        :key="c"
        class="celda"
        :class="`celda--${tipo.toLowerCase()}`"
        @click="alClicarCelda(f, c)"
      >
        <span v-if="tipo === 'PAQUETE'" class="marca marca--paquete">P</span>
        <span v-else-if="tipo === 'OBSTACULO'" class="marca marca--obstaculo">✕</span>
        <span v-else-if="tipo === 'AGENTE'" class="marca marca--agente">A</span>
        <span v-else-if="tipo === 'DESCONOCIDA'" class="marca marca--desconocida">?</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tablero {
  display: grid;
  grid-template-rows: repeat(var(--filas), 1fr);
  gap: 2px;
  background: var(--onyx);
  border: 2px solid var(--onyx);
  padding: 2px;
  width: 100%;
  aspect-ratio: var(--cols) / var(--filas);
}

.fila-tablero {
  display: grid;
  grid-template-columns: repeat(var(--cols), 1fr);
  gap: 2px;
}

.celda {
  background: var(--bone);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  min-width: 0;
  min-height: 0;
}

.tablero--editable .celda {
  cursor: pointer;
}
.tablero--editable .celda:hover {
  background: var(--bone-dim);
}

.celda--visitada {
  background: #e6e0d3;
}

.celda--desconocida {
  background: repeating-linear-gradient(
    45deg,
    var(--onyx-soft),
    var(--onyx-soft) 4px,
    #262626 4px,
    #262626 8px
  );
}

.marca {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: clamp(9px, 2.4vw, 18px);
  line-height: 1;
}

.marca--paquete {
  color: var(--bone);
  background: var(--fern);
  width: 68%;
  height: 68%;
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.marca--obstaculo {
  color: var(--bone);
  background: var(--rust);
  width: 68%;
  height: 68%;
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.marca--agente {
  color: var(--onyx);
  background: var(--honey);
  width: 72%;
  height: 72%;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 0 2px var(--onyx);
}

.marca--desconocida {
  color: var(--bone);
  opacity: 0.7;
}
</style>
