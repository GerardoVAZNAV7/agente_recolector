<script setup>
defineProps({
  titulo: { type: String, default: 'Agente Recolector' }
})
</script>

<template>
  <header class="cabecera">
    <h1 class="rotulo cabecera__titulo">{{ titulo }}</h1>
    <span class="cabecera__nota">ciclo percepción → acción</span>
  </header>
</template>

<style scoped>
.cabecera {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  background: var(--bone);
  border: 2px solid var(--onyx);
  border-bottom: none;
  border-radius: 10px 10px 0 0;
  padding: 13px 16px;
}

.cabecera__titulo {
  margin: 0;
  font-size: 14px;
  letter-spacing: 0.06em;
}

.cabecera__nota {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--onyx);
  opacity: 0.5;
}
</style>