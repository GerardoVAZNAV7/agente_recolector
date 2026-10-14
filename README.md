# 🤖 Agente Recolector - Simulador de Almacén

Simulador web interactivo construido con **Vue 3** y **Vite**. Permite diseñar entornos personalizados de almacén (grid, obstáculos, paquetes y posición inicial) y ejecutar simulaciones de navegación con un **agente inteligente autónomo**.

El agente puede ejecutarse de tres formas:

1. **Reactivo** – estrategia original basada en reglas, mapeo parcial y exploración con backtracking.
2. **Dijkstra** – búsqueda de camino de costo mínimo (sin heurística).
3. **A\*** – búsqueda informada con `f(n)=g(n)+h(n)` y heurística Manhattan.

> El agente **solo recoge paquetes**. No entrega paquetes, no tiene destinos de entrega ni almacenes.

---

## 🚀 Inicio Rápido (Quickstart)

### Requisitos Previos
* **Node.js**: v16.0.0 o superior
* **npm**: v7.0.0 o superior

### 1. Clonar e Instalar

```bash
git clone https://github.com/GerardoVAZNAV7/agente_recolector.git
cd agente_recolector
npm install
```

### 2. Ejecutar en Modo Desarrollo

```bash
npm run dev
```

Abre la aplicación en el navegador en la dirección local que indique la consola (habitualmente `http://localhost:5173`).

### 3. Compilación para Producción (Opcional)

```bash
npm run build
npm run preview
```

---

## 🧭 Modos de búsqueda

Al estar en modo **diseño**, la barra de controles ofrece:

* **▶ Recolectar (Reactivo)** – comportamiento original del agente.
* **▶ Con Dijkstra** – calcula una ruta de costo mínimo hacia cada paquete usando el costo acumulado `g(n)`. **No usa heurística**.
* **▶ Con A\*** – calcula la ruta con `f(n)=g(n)+h(n)` usando la **distancia Manhattan** como heurística.

Todos respetan las mismas reglas: **4 direcciones** (arriba, abajo, izquierda, derecha), **sin atravesar obstáculos**, **sin salir del tablero**, **sin diagonales**. La **selección del siguiente paquete** se mantiene independiente del algoritmo de búsqueda.

### ¿Cómo se selecciona el siguiente paquete?

El criterio es determinista y simple: se toma el paquete pendiente con **menor fila** y, en empate, **menor columna**. Si un paquete resulta **inalcanzable**, se descarta (el entorno es estático) y se pasa al siguiente; si no queda ninguno alcanzable, la simulación termina de forma controlada.

### Animación de exploración

Durante la ejecución con A\* o Dijkstra se muestra **cómo crece la búsqueda**:

* ○ **Nodos descubiertos** (candidatos considerados)
* ⊗ **Nodos expandidos** (procesados por el algoritmo)
* • **Ruta calculada** (camino óptimo hacia el paquete objetivo)

La animación avanza nodo a nodo antes de que el agente recorra la ruta, para comparar visualmente el comportamiento de cada algoritmo.

---

## 📊 Comparar A\* y Dijkstra

```bash
npm run comparar
```

Ejecuta los **mismos escenarios** con ambos algoritmos y muestra:

- Paquetes recogidos, movimientos, acciones, puntuación y tiempo total.
- **Nodos expandidos** y **nodos descubiertos**.
- **Costo total de la ruta**.
- Diferencia de nodos expandidos (para ver cuándo la heurística de A\* ayuda).

Ejemplo real de salida (mapa abierto 12×12):

```
Dijkstra -> expandidos 144  descubiertos 144  costo 22
A*       -> expandidos  99  descubiertos 128  costo 22  (A* exploró 45 nodos menos)
```

Para el mismo objetivo y con costos positivos, **ambos obtienen el mismo costo óptimo**; A\* suele expandir menos nodos gracias a la heurística.

---

## 🧪 Pruebas

```bash
npm test
```

Verifican: rutas válidas, mismo costo óptimo entre algoritmos, paquete inaccesible, obstáculos, recolección consecutiva, ausencia de doble recolección, respeto de límites, regiones desconectadas y ausencia de regresiones.

---

## 📚 Documentación académica

Consulta **[docs/DOCUMENTACION_ACADEMICA.md](docs/DOCUMENTACION_ACADEMICA.md)** para la explicación de A\*, Dijkstra, la heurística, las condiciones de optimalidad y un ejemplo práctico con cuadrícula pequeña.

---

## 📁 Estructura del proyecto

```text
src/
  core/                   ← lógica del agente y algoritmos de búsqueda
    entorno.js            ← grid, paquetes, obstáculos
    percepcion.js         ← sensores del agente (4 direcciones)
    memoria.js            ← mapa conocido, visitadas, backtracking
    decision.js           ← estrategia reactiva original
    accion.js             ← actuadores (mover / recoger)
    rendimiento.js        ← tabla de puntuación
    simulador.js          ← orquesta el ciclo + modos Dijkstra/A*
    pathfinding.js        ← interfaz común de búsqueda
    dijkstra.js           ← Dijkstra (min-heap + traza de exploración)
    astar.js              ← A* con heurística Manhattan
  composables/
    useSimulador.js        ← puente reactivo (reproducción, animación)
  components/
    BarraSuperior.vue
    TableroMapa.vue        ← cuadrícula + nodos explorados + ruta + leyenda
    PanelRediseno.vue      ← herramientas para construir el mapa
    PanelPuntuacion.vue    ← métricas (incl. nodos expandidos/descubiertos)
    PanelMemoria.vue       ← mapa conocido / bitácora del agente
    BarraControles.vue     ← botones Reactivo / Dijkstra / A*
  App.vue
  main.js
tests/
  pathfinding.test.js      ← pruebas automáticas (npm test)
  comparar.js              ← comparación de algoritmos (npm run comparar)
docs/
  DOCUMENTACION_ACADEMICA.md
```

---

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

## 🧠 Algoritmo de Decisión del Agente (modo reactivo)

* **Estrategia:** Basada en reglas de prioridad (> recoger > paquete adyacente > evitar obstáculos > frontera desconocida > celdas nuevas > backtracking).
* **Percepción:** Sensores del entorno inmediato (celda actual + 4 vecinas).
* **Memoria Interna:** mapa parcial conocido, celdas visitadas y relaciones para retroceso (*backtracking*).
* **Desempate fijo:** ARRIBA > DERECHA > ABAJO > IZQUIERDA.

El modo reactivo no calcula la ruta completa; en los modos A\*/Dijkstra se añade planificación de ruta sobre la misma cuadrícula y reglas.
