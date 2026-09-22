# 🤖 Agente Recolector - Simulador de Almacén

Simulador web interactivo construido con **Vue 3** y **Vite**. Permite diseñar entornos personalizados de almacén (grid, obstáculos, paquetes y posición inicial) y ejecutar simulaciones de navegación con un **agente inteligente autónomo** basado en reglas, mapeo parcial y exploración con backtracking.

---

## 🚀 Inicio Rápido (Quickstart)

Sigue estos pasos para clonar, ejecutar y probar la aplicación en tu entorno local.

### Requisitos Previos
* **Node.js**: v16.0.0 o superior
* **npm**: v7.0.0 o superior (o pnpm/yarn)

---

### 1. Clonar e Instalar

```bash
# Clonar el repositorio
git clone https://github.com/GerardoVAZNAV7/agente_recolector.git

# Entrar al directorio
cd agente_recolector

# Instalar dependencias
npm install
```

---

### 2. Ejecutar en Modo Desarrollo

```bash
npm run dev
```

Abre la aplicación en tu navegador en la dirección local que indique la consola (habitualmente `http://localhost:5173`).

---

### 3. Compilación para Producción (Opcional)

Para generar la versión optimizada de producción y previsualizarla:

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

```text
. . . P .
. X . . .
A . . X P
. . P . .
. X . . .
```

* **Dimensiones:** 5×5
* **Agente (A):** Fila 2, Columna 0
* **Paquetes (P):** (0,3), (2,4), (3,2)
* **Obstáculos (X):** (1,1), (2,3), (4,1)

---

## 🧠 Algoritmo de Decisión del Agente

La lógica del agente es independiente de la interfaz y se ejecuta bajo la siguiente arquitectura:

* **Estrategia:** Basada en reglas de prioridad.
* **Percepción:** Sensores del entorno inmediato.
* **Memoria Interna:** Registro de celdas visitadas, mapa parcial conocido y relaciones de nodos para retroceso (*backtracking*).

---

## 📁 Estructura del Proyecto

```text
src/
├── core/                  # Núcleo de lógica pura del agente (JS)
│   ├── entorno.js         # Estado y reglas del almacén
│   ├── percepcion.js      # Sensores del agente
│   ├── memoria.js         # Mapa conocido y backtracking
│   ├── decision.js        # Motor de reglas y prioridad
│   ├── accion.js          # Actuadores (mover / recoger)
│   ├── rendimiento.js     # Sistema de puntuación
│   └── simulador.js       # Bucle principal de simulación
├── composables/
│   └── useSimulador.js    # Estado reactivo para la interfaz
├── components/            # UI components (Vue 3)
│   ├── TableroMapa.vue    # Visualizador y editor del mapa
│   ├── PanelRediseno.vue  # Herramientas de edición
│   ├── PanelPuntuacion.vue# Métricas en vivo
│   └── PanelMemoria.vue   # Inspección de la memoria interna
├── App.vue
└── main.js
```