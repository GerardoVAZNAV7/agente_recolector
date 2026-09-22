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

---

## 🎮 Guía de Uso del Simulador

No necesitas modificar el código fuente para probar diferentes comportamientos o mapas. La interfaz permite interactuar directamente con la simulación:

1. **Modo Rediseño (Diseño de Mapas):**
   * Configura las dimensiones de la cuadrícula.
   * Utiliza la paleta de herramientas para agregar o remover:
     * 📦 **Paquetes**: Objetivos a recolectar.
     * 🚧 **Obstáculos**: Bloqueos que el agente debe esquivar.
     * 🤖 **Agente**: Punto de inicio.
   * *Nota:* El sistema valida automáticamente que no existan paquetes inalcanzables.

2. **Ejecutar Simulación:**
   * Haz clic en **"Iniciar simulación"**.
   * Observa la toma de decisiones en tiempo real, la bitácora de memoria del agente y la tabla de puntuación/rendimiento.

---

## 📐 Ejemplo: Configuración de Escenarios

Puedes reproducir un escenario clásico de prueba de 5×5 directamente desde la interfaz:

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