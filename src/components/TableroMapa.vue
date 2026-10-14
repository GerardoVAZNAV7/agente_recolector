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

// Mapa de la animacion de exploracion: clave "f,c" -> tipo ('EXPANDIDO' | 'DESCUBIERTO')
const mapaExploracion = computed(() => {
  const mapa = new Map()
  const sim = props.simulador
  if (!sim || !sim.explorationTrace || sim.explorationIndex <= 0) return mapa
  const visibles = sim.explorationTrace.slice(0, sim.explorationIndex)
  for (const t of visibles) {
    // El ultimo estado de cada celda gana (expandido > descubierto).
    const clave = `${t.fila},${t.columna}`
    if (t.tipo === 'EXPANDIDO' || !mapa.has(clave)) {
      mapa.set(clave, t.tipo)
    }
  }
  return mapa
})

const celdasRuta = computed(() => {
  const set = new Set()
  const sim = props.simulador
  if (!sim || !sim.getRutaActual) return set
  for (const p of sim.getRutaActual()) set.add(`${p.fila},${p.columna}`)
  return set
})

// La ruta se oculta MIENTRAS crece la exploracion y se ilumina despues.
const mostrarRuta = computed(() => {
  const sim = props.simulador
  if (!sim || !sim.getRutaActual) return false
  return !sim.animandoExploracion && sim.getRutaActual().length > 0
})

// Contador en vivo de la exploracion (nodos considerados).
const conteoExploracion = computed(() => {
  const sim = props.simulador
  if (!sim || !sim.explorationTrace) return null
  const visibles = sim.explorationTrace.slice(0, sim.explorationIndex)
  let descubiertos = 0
  let expandidos = 0
  for (const t of visibles) {
    if (t.tipo === 'EXPANDIDO') expandidos++
    else descubiertos++
  }
  return { descubiertos, expandidos, total: sim.explorationTrace.length }
})

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

  const clave = `${f},${c}`
  const enRuta = mostrarRuta.value && celdasRuta.value.has(clave)
  const enExploracion = mapaExploracion.value.has(clave)

  if (props.vista === 'global') {
    // Paquetes y obstaculos reales por encima de todo.
    const contenido = sim.entorno.contenidoDeCelda(f, c)
    if (contenido === CONTENIDO.PAQUETE) return 'PAQUETE'
    if (contenido === CONTENIDO.OBSTACULO) return 'OBSTACULO'
    // La ruta iluminada tiene prioridad sobre la exploracion.
    if (enRuta) return 'RUTA'
    if (enExploracion) return mapaExploracion.value.get(clave)
    return sim.memoria.fueVisitada(f, c) ? 'VISITADA' : 'VACIO'
  }

  // vista robot: solo lo que el agente ha descubierto
  const conocido = sim.memoria.mapaConocido[f][c]
  if (conocido === CONTENIDO.DESCONOCIDO) return 'DESCONOCIDA'
  if (conocido === CONTENIDO.PAQUETE) return 'PAQUETE'
  if (conocido === CONTENIDO.OBSTACULO) return 'OBSTACULO'
  if (enRuta) return 'RUTA'
  if (enExploracion) return mapaExploracion.value.get(clave)
  return sim.memoria.fueVisitada(f, c) ? 'VISITADA' : 'VACIO'
}

function alClicarCelda(f, c) {
  if (props.modo !== 'editor') return
  emit('pintar-celda', f, c)
}
</script>

<template>
  <div class="tablero-wrap" :class="{ 'tablero-wrap--compacta': modo === 'simulacion' }">
    <div class="marco-tablero">
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
            <span v-else-if="tipo === 'RUTA'" class="marca marca--ruta">•</span>
            <span v-else-if="tipo === 'EXPANDIDO'" class="marca marca--expandido">⊗</span>
            <span v-else-if="tipo === 'DESCUBIERTO'" class="marca marca--descubierto">○</span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="modo === 'simulacion'" class="leyenda">
      <span class="leyenda__item"><i class="sw sw--agente"></i>Agente</span>
      <span class="leyenda__item"><i class="sw sw--paquete"></i>Paquete</span>
      <span class="leyenda__item"><i class="sw sw--obstaculo"></i>Obstáculo</span>
      <span class="leyenda__item"><i class="sw sw--descubierto"></i>Descubierto</span>
      <span class="leyenda__item"><i class="sw sw--expandido"></i>Expandido</span>
      <span class="leyenda__item"><i class="sw sw--ruta"></i>Ruta óptima</span>
    </div>

    <div v-if="modo === 'simulacion' && conteoExploracion && conteoExploracion.total > 0" class="estado-animacion">
      <template v-if="simulador?.animandoExploracion">
        Explorando… descubiertos <b>{{ conteoExploracion.descubiertos }}</b> · expandidos <b>{{ conteoExploracion.expandidos }}</b>
      </template>
      <template v-else>
        Nodos totales: expandidos <b>{{ conteoExploracion.expandidos }}</b> · descubiertos <b>{{ conteoExploracion.descubiertos }}</b>
      </template>
    </div>
  </div>
</template>

<style scoped>
.tablero-wrap {
  width: 100%;
}

.marco-tablero {
  width: 100%;
}

/* En simulacion el tablero se reduce para que se vean tablero y botones. */
.tablero-wrap--compacta .marco-tablero {
  display: flex;
  justify-content: center;
}
.tablero-wrap--compacta .tablero {
  width: min(100%, calc((100vh - 300px) * var(--cols) / var(--filas)));
}

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

/* Exploracion en tonos de la paleta (slate). */
.celda--descubierto {
  background: #cfe0f5;
}
.celda--expandido {
  background: #8fb3d9;
}

/* Ruta optima "iluminada" en dorado honey de la paleta. */
.celda--ruta {
  background: #f0c94b;
  box-shadow: inset 0 0 6px rgba(220, 167, 13, 0.85);
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

.marca--ruta {
  color: var(--onyx);
  font-size: clamp(14px, 3vw, 22px);
  font-weight: 700;
}

.marca--expandido {
  color: #0f2f52;
  font-size: clamp(12px, 2.6vw, 18px);
}

.marca--descubierto {
  color: #1e3a5f;
  font-size: clamp(13px, 2.8vw, 18px);
}

.leyenda {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 8px;
  font-size: 10px;
  color: var(--onyx);
  opacity: 0.8;
}
.leyenda__item {
  display: flex;
  align-items: center;
  gap: 5px;
}
.sw {
  width: 12px;
  height: 12px;
  display: inline-block;
  border: 1px solid var(--onyx);
}
.sw--agente {
  background: var(--honey);
  border-radius: 50%;
}
.sw--paquete {
  background: var(--fern);
}
.sw--obstaculo {
  background: var(--rust);
}
.sw--descubierto {
  background: #cfe0f5;
}
.sw--expandido {
  background: #8fb3d9;
}
.sw--ruta {
  background: #f0c94b;
}

.estado-animacion {
  margin-top: 6px;
  font-size: 11px;
  letter-spacing: 0.02em;
  color: var(--onyx);
  background: var(--bone-dim);
  border: 1.5px solid var(--onyx);
  padding: 6px 10px;
  display: inline-block;
}
.estado-animacion b {
  color: var(--slate);
}

@media (max-width: 860px) {
  .tablero-wrap--compacta .tablero {
    width: 100%;
  }
}
</style>
