# Agente Recolector

Simulador web (Vue 3 + Vite) de un agente recolector de paquetes en un
almacén, para la Actividad 4 de Agentes Inteligentes (Unidad II).

Permite **diseñar cualquier mapa** desde la interfaz (dimensiones, paquetes,
obstáculos y posición inicial del agente) y correr sobre él la misma
estrategia de decisión, sin tocar el código, tal como pide la práctica.

## Estrategia implementada

Agente basado en reglas + mapa interno parcial + memoria de posiciones
visitadas + exploración con backtracking (ver `estrategia_agente_recolector.md`
original y `src/core/decision.js`).

## Ejecutar en local

```bash
npm install
npm run dev
```

Abre la URL que te muestre la terminal (por defecto `http://localhost:5173`).

Build de producción:

```bash
npm run build
npm run preview
```

## Subir a GitHub

```bash
git init
git add .
git commit -m "Agente recolector: simulación inicial"
git branch -M main
git remote add origin (https://github.com/GerardoVAZNAV7/agente_recolector.git)
git push -u origin main
```
## Estructura del proyecto

```
src/
  core/                   ← lógica del agente, en archivos separados y en español
    entorno.js            ← el almacén real (grid, paquetes, obstáculos)
    percepcion.js         ← percibir(): sensores del agente
    memoria.js            ← mapa conocido, visitadas, relación padre (backtracking)
    decision.js           ← decidir(): reglas de prioridad de la estrategia
    accion.js             ← actuar(): actuadores (mover / recoger)
    rendimiento.js        ← tabla oficial de puntuación
    simulador.js           ← orquesta el ciclo ENTORNO→SENSORES→...→ENTORNO
  composables/
    useSimulador.js        ← puente reactivo entre el núcleo y la interfaz
  components/
    BarraSuperior.vue
    TableroMapa.vue        ← cuadrícula (editor y visor de simulación)
    PanelRediseno.vue      ← herramientas para construir el mapa
    PanelPuntuacion.vue    ← tabla de puntos en vivo
    PanelMemoria.vue       ← mapa conocido / bitácora del agente
    BarraControles.vue
  App.vue
  main.js
```

## Cómo probar los 3 escenarios de la práctica sin tocar el código

En modo "Rediseño", crea un mapa de 5×5 y coloca los objetos usando la
paleta (Paquete / Obstáculo / Inicio agente) para reproducir cada escenario
del enunciado. Por ejemplo, el Escenario 1:

```
. . . P .
. X . . .
A . . X P
. . P . .
. X . . .
```

= dimensiones 5×5, agente en (fila 2, col 0), paquetes en (0,3) (2,4) (3,2),
obstáculos en (1,1) (2,3) (4,1). Repite el mismo proceso para los
escenarios 2 y 3, corre "Iniciar simulación" y registra los resultados que
muestra el panel "Tabla de puntos" (paquetes recogidos, movimientos,
penalizaciones y puntuación final) — la lógica de decisión (`decision.js`)
es siempre la misma, solo cambia el mapa.

## Validación de mapas

Antes de iniciar, el editor rechaza mapas con paquetes totalmente rodeados
de obstáculos o bordes (inalcanzables), para evitar simulaciones que nunca
puedan terminar de recolectar todo.
