<script setup>
defineProps({
  titulo: { type: String, default: 'Agente Recolector' }
})
</script>

<template>
  <header class="cromo">
    <div class="fila-ventana">
      <div class="puntos">
        <span></span><span></span><span></span>
      </div>
      <div class="pestana">
        <span class="rotulo pestana-texto">{{ titulo }}</span>
        <span class="pestana-cerrar">×</span>
      </div>
    </div>
    <div class="fila-direccion">
      <span class="flecha">←</span>
      <span class="flecha">→</span>
      <span class="flecha">⟳</span>
      <div class="barra-url">agente-paquetes.vercel.app</div>
      <span class="icono-estrella">☆</span>
    </div>
  </header>
</template>

<style scoped>
.cromo {
  background: var(--bone);
  border: 2px solid var(--onyx);
  border-bottom: none;
  border-radius: 10px 10px 0 0;
  overflow: hidden;
}

.fila-ventana {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 8px 12px 0;
}

.puntos {
  display: flex;
  gap: 6px;
}
.puntos span {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  border: 1.5px solid var(--onyx);
  display: inline-block;
}

.pestana {
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--bone);
  border: 1.5px solid var(--onyx);
  border-bottom: none;
  padding: 6px 12px;
  border-radius: 8px 8px 0 0;
}
.pestana-texto {
  color: var(--onyx);
}
.pestana-cerrar {
  color: var(--onyx);
  opacity: 0.5;
  font-size: 13px;
}

.fila-direccion {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-top: 1.5px solid var(--onyx);
}
.flecha {
  color: var(--onyx);
  opacity: 0.55;
  font-size: 13px;
}
.barra-url {
  flex: 1;
  background: var(--bone);
  border: 1.5px solid var(--onyx);
  border-radius: 14px;
  padding: 5px 14px;
  font-size: 12px;
  color: var(--onyx);
  opacity: 0.75;
}
.icono-estrella {
  color: var(--onyx);
  opacity: 0.55;
}
</style>
