# Documentación académica: Agente recolector con A* y Dijkstra

Este documento explica la implementación realizada en este proyecto, conforme a los requisitos solicitados. Está pensado para servir de apoyo en una exposición universitaria sobre Agentes Inteligentes.

---

## 1. A*

### ¿Qué es la búsqueda informada?

La búsqueda informada utiliza conocimiento adicional (una heurística) para estimar lo cerca que está un nodo del objetivo. Esto permite priorizar aquellas rutas más prometedoras y reducir el número de nodos explorados, manteniendo en muchos casos la optimalidad del camino.

En este proyecto A* es utilizado para planificar rutas entre la posición del agente y un paquete objetivo dentro de la cuadrícula.

### Función f(n) = g(n) + h(n)

A* evalúa cada nodo `n` con la función:

`f(n) = g(n) + h(n)`

- **g(n)**: Costo real acumulado desde el origen (posición actual del agente) hasta el nodo `n`.
- **h(n)**: Estimación heurística del costo mínimo para llegar desde `n` hasta el objetivo (paquete seleccionado).
- **f(n)**: Costo estimado total de cualquier ruta que pase por `n` y llegue al objetivo.

A* siempre expande primero el nodo con menor `f(n)`. Esto combina el costo conocido y la estimación hacia el objetivo.

### Cálculo de la heurística en la cuadrícula

Las reglas de movimiento del proyecto son **cuatro direcciones** (ARRIBA, ABAJO, IZQUIERDA, DERECHA). Todos los movimientos válidos tienen **costo uniforme igual a 1**.

Por ello, la heurística seleccionada es **la distancia Manhattan**:

`h(n) = |x_n - x_obj| + |y_n - y_obj|`

**¿Es admisible?**

Sí. Para movimientos en 4 direcciones y costo uniforme (costo >= 1), la distancia Manhattan nunca sobrestima el costo real mínimo para llegar al objetivo. Esto garantiza que, cuando existe una solución, A* encontrará una ruta de **costo mínimo** (óptima).

**Importante**: No se han habilitado movimientos diagonales porque el proyecto no los permite. Si se introdujeran diagonales, habría que cambiar la heurística (ej. Chebyshev o Euclidiana según el costo).

### ¿Cómo encuentra el camino hacia un paquete?

1. Se establece origen = posición actual del agente y destino = posición del paquete seleccionado.
2. Se utiliza una **cola de prioridad** (min-heap) ordenada por `f(n)`.
3. Se mantienen mapas para `g(n)`, `f(n)` y para los **predecesores** de cada nodo.
4. Se expanden únicamente celdas **transitables**: dentro de los límites, no son obstáculos.
5. Para cada vecino se calcula `g(nuevo) = g(actual) + costoMovimiento` (1). Si se encuentra un camino mejor, se actualizan `g`, `f` y predecesor.
6. Cuando se expande el nodo destino, se **reconstruye la ruta** desde origen hacia destino mediante los predecesores (se invierte para obtener el orden correcto).
7. Si el destino no es alcanzable, la búsqueda finaliza con `exito = false`.

### Condiciones para garantizar la optimalidad

A* garantiza una solución óptima (ruta de costo mínimo) cuando:
- Los costos de movimiento son **positivos** (en este proyecto = 1).
- La heurística `h(n)` es **admisible** (no sobrestima el costo real a objetivo). Manhattan cumple esto para 4 direcciones y costo uniforme.
- La heurística es **consistente** (monótona) en este caso también se cumple.

---

## 2. Dijkstra

### ¿Cómo utiliza el costo acumulado?

Dijkstra selecciona, en cada paso, el nodo con **menor costo acumulado g(n)** desde el origen. No utiliza información sobre la distancia restante al objetivo.

Su objetivo es encontrar rutas de **costo mínimo** desde un origen único a todos los nodos alcanzables.

### ¿Cómo explora las celdas?

1. Cola de prioridad (min-heap) ordenada por `g(n)`.
2. `g(origen) = 0`, resto infinito.
3. Mientras haya nodos por explorar: extrae el nodo `u` con menor `g(u)`.
4. Expande sus vecinos transitables `v`: calcula `g(v) = g(u) + costoMovimiento`. Si mejora, actualiza `g(v)`, guarda predecesor y vuelve a insertar/actualizar en la cola.
5. Al alcanzar el destino, el valor `g(destino)` es el **costo mínimo**.
6. Se reconstruye la ruta con los predecesores.

### ¿Por qué no necesita una heurística?

Porque Dijkstra es un algoritmo de **búsqueda no informada**. Su criterio de expansión es puramente el costo recorrido (`g(n)`), sin estimar qué dirección se acerca más al objetivo. Esto hace que explore de forma más uniforme por todas las direcciones con costo similar.

### ¿Cómo garantiza la ruta de costo mínimo?

Dijkstra garantiza la optimalidad **siempre que todos los costos de movimiento son positivos** (>= ε > 0). En este proyecto, con costo uniforme positivo (1), encuentra la ruta de costo mínimo entre origen y destino.

---

## 3. Aplicación al agente recolector

### Representación de la cuadrícula n × m

- La cuadrícula es **n × m** (configurable en el editor). Representada por `Entorno` (`src/core/entorno.js`).
- Se usan **Sets** con clave `fila,columna` para obstáculos y paquetes restantes (búsqueda O(1)).
- Contenidos: `VACIO`, `PAQUETE`, `OBSTACULO`, `AGENTE`, `FUERA_DEL_TABLERO`, `DESCONOCIDO`.

### Consideración de obstáculos

- **No se atraviesan obstáculos**. Cualquier celda marcada como obstáculo (`X`) es no transitable.
- **No se sale de los límites** del tablero.
- Esto se valida en `esCeldaTransitable()` del módulo `pathfinding.js`.

### Selección del siguiente paquete

La selección del siguiente paquete **se mantiene independiente** del algoritmo de búsqueda (tal como se pide). El criterio es **determinista**:

1. Se obtienen todos los paquetes restantes.
2. Se ordenan por `fila`, y en empate por `columna` (menor primero).
3. Se elige ese paquete como **objetivo** para calcular la ruta.

Esto no cambia la estrategia existente del proyecto. En modo reactivo (original) el agente utiliza sus reglas de prioridad para explorar. En modos A*/Dijkstra, calcula una ruta explícita hacia ese objetivo.

### Cálculo y ejecución de la ruta

**Cálculo** (cuando no hay ruta activa):
1. Encontrar siguiente paquete objetivo (no marcado como inalcanzable).
2. Ejecutar `buscarConDijkstra()` o `buscarConAStar()` desde posición actual hasta objetivo.
3. Si existe ruta válida (≥ 2 puntos): almacenar `rutaActual` (orden origen → destino), guardar métricas (nodos expandidos/descubiertos, costo total, tiempo).
4. Si no existe: marcar ese paquete como **inalcanzable permanentemente** (mapa estático) y probar siguiente.

**Ejecución** (seguir la ruta):
1. Mientras hay siguiente paso en la ruta: devolver acción `MOVER` en la dirección correcta (`ARRIBA/ABAJO/IZQUIERDA/DERECHA`).
2. Avanzar índice de ruta.
3. Al llegar a la celda del objetivo (sobre paquete): ejecutar acción `RECOGER`.
4. Limpiar ruta y continuar con siguiente paquete.

### ¿Qué ocurre cuando un paquete es inaccesible?

- Dijkstra/A* devuelven `exito = false` y `ruta = []`.
- El paquete objetivo se añade a `paquetesInalcanzables` (conjunto). Como el entorno es **estático**, no vuelve a buscarse.
- Si quedan otros paquetes alcanzables, el agente pasa al siguiente objetivo.
- Si **no queda ningún paquete alcanzable**, el agente **finaliza de forma controlada** (motivo: `AGENTE_ATRAPADO` en el resumen) sin bloquear ni entrar en bucle.

### ¿Cómo continúa la recolección después de recoger un paquete?

1. Al ejecutar `RECOGER` sobre el paquete: `entorno.quitarPaquete()` elimina ese paquete.
2. Se actualiza memoria (`marcarPaqueteRecogido()` → celda pasa a VACIO en mapa conocido).
3. Se limpia `rutaActual`, `indiceRuta`, `paqueteObjetivo`.
4. En el siguiente paso, se vuelve a buscar el siguiente paquete pendiente (según orden determinista) y se calcula nueva ruta con el algoritmo seleccionado.

---

## 4. Comparación

### Diferencias entre búsqueda informada y no informada

| Aspecto | Búsqueda NO informada (Dijkstra) | Búsqueda INFORMADA (A*) |
|---|---|---|
| **Conocimiento** | Solo costo acumulado `g(n)` | Costo acumulado + estimación `g(n)+h(n)` |
| **Criterio de expansión** | Nodo con menor `g(n)` | Nodo con menor `f(n)=g(n)+h(n)` |
| **Exploración** | Uniforme (en anchura por costo) | Dirigida hacia el objetivo |
| **Eficiencia** | Generalmente explora más nodos | Tiende a explorar menos (gracias a heurística) |
| **Optimalidad** | Garantizada si costos > 0 | Garantizada si `h` es admisible y costos > 0 |

### Diferencias en nodos expandidos y tiempo

- **Dijkstra** expande todos los nodos con `g(n) < costo óptimo` en todas direcciones, por lo que suele tener mayor número de **nodos expandidos**.
- **A*** aprovecha `h(n)` para evitar explorar regiones que claramente no llevan al objetivo, reduciendo los nodos expandidos (y normalmente el tiempo de búsqueda).
- En mapas **abiertos** (sin obstáculos) la reducción es notable. En mapas muy laberínticos puede variar, pero con heurística admisible mantiene optimalidad.

Los resultados experimentales (ver script `npm run comparar`) muestran consistentemente que **A* expande menos nodos** que Dijkstra para el mismo origen/destino, con **mismo costo óptimo**.

### Costo y longitud de las rutas

- **Costo total**: Para el mismo objetivo y con costos positivos, **ambos algoritmos obtienen el MISMO costo óptimo** cuando existen condiciones de optimalidad (A* con heurística admisible).
- **Número de movimientos (pasos)**: Coincide con el costo total en este proyecto (costo 1 por movimiento). Pueden existir rutas distintas con **igual costo óptimo** en caso de empates; ambos devolverán alguna ruta óptima válida.

### Resultados obtenidos en los mismos escenarios

Las pruebas ejecutadas (`npm test` y `npm run comparar`) confirman:

- Costos óptimos idénticos entre A* y Dijkstra en todos los casos probados.
- A* expande **menos nodos** que Dijkstra (reducción visible en mapas abiertos y con obstáculos).
- Ambos algoritmos respetan obstáculos, límites y reglas de 4 direcciones.
- El agente recoge todos los paquetes alcanzables con ambos modos, finalizando de forma controlada cuando hay paquetes inaccesibles.
- No hay regresiones en el comportamiento original (modo `REACTIVO` se mantiene intacto).

---

## 5. Ejemplo sencillo con cuadrícula pequeña

Tomemos un ejemplo concreto para mostrar cómo funcionan ambos.

### Mapa de ejemplo

```
Filas: 4, Columnas: 4
Inicio (Agente): (0,0)
Paquete objetivo: (3,3)
Obstáculos: (1,1), (1,2)
```

Representación visual (fila 0..3, col 0..3):

```
Fila 0: A . . .
Fila 1: . X X .
Fila 2: . . . .
Fila 3: . . . P
```

Es decir, el obstáculo forma una pequeña barrera horizontal en la fila 1 entre columnas 1-2. Hay dos caminos posibles hacia (3,3):

- **Camino superior/borde**: (0,0)-(0,1)-(0,2)-(0,3)-(1,3)-(2,3)-(3,3) → 6 movimientos, costo 6
- **Camino inferior**: (0,0)-(1,0)-(2,0)-(2,1)-(2,2)-(2,3)-(3,3) → 6 movimientos, costo 6 (ambos óptimos aquí)

### A* (con Manhattan)

Orígenes: (0,0), destino (3,3). h(0,0)=6.

A* prioriza nodos con menor f = g + h. Desde (0,0) expande vecinos (0,1) con f=1+5=6 y (1,0) con f=1+5=6 (empate). Gracias a la heurística, tiende a explorar en dirección al objetivo. Termina encontrando una ruta óptima (costo 6). Expande **menos nodos** que Dijkstra porque descarta regiones menos prometedoras.

### Dijkstra (solo g)

Dijkstra expande por costo acumulado creciente. Desde (0,0) expande (0,1) g=1 y (1,0) g=1. Luego continúa expandiendo todos los nodos con g=2, g=3... en todas las direcciones hasta alcanzar (3,3) con g=6. Encuentra **también una ruta óptima** (costo 6), pero suele haber **expandido más nodos** en total (explora ambas ramas con igual costo antes de llegar al objetivo).

**Conclusión del ejemplo:** Ambos obtienen el mismo costo óptimo. A* usa la heurística para guiar la búsqueda (menos nodos expandidos), mientras que Dijkstra garantiza el mínimo explorando uniformemente por costo.

---

## 6. Notas técnicas de implementación

- **Interfaz común**: `pathfinding.js` define funciones compartidas (vecinos transitables, reconstrucción de ruta). Esto evita duplicación entre algoritmos.
- **Cola de prioridad**: Implementación propia de min-heap para Dijkstra y A* (adecuada para cuadrículas pequeñas).
- **Traza de exploración**: Se registran eventos `DESCUBIERTO` y `EXPANDIDO` para cada celda considerada. Esto permite **visualizar cómo va creciendo la toma de decisiones** (animación de exploración) nodo a nodo.
- **Sin romper funcionalidad existente**: El modo original `REACTIVO` (basado en reglas + backtracking) permanece intacto. Se añaden dos nuevos modos: `DIJKSTRA` y `ASTAR`.
- **Selección de paquetes independiente**: El algoritmo de búsqueda no altera la estrategia de elección de siguiente paquete.
- **Manejo de paquetes inaccesibles**: Se marcan permanentemente como inalcanzables (entorno estático) para evitar bucles. El agente continúa con los alcanzables y finaliza controladamente si no quedan alcanzables.

---

## 7. Cómo ejecutar y comparar

```bash
# Instalar dependencias
npm install

# Modo desarrollo (abrir navegador)
npm run dev

# Ejecutar pruebas automáticas
npm test

# Comparar A* vs Dijkstra (métricas reales)
npm run comparar

# Build de producción
npm run build
```

En la interfaz web (modo Editor):
1. Diseñar mapa (paquetes, obstáculos, posición inicial)
2. Pulsar **"Con Dijkstra"** o **"Con A*"** para ejecutar con búsqueda de caminos
3. Usar **Reproducir/Paso a paso** para ver la animación: los nodos **descubiertos** (○) y **expandidos** (⊗) muestran cómo crece la exploración antes de trazar la **ruta** (•)
4. En el panel lateral se muestran métricas: nodos expandidos/descubiertos, costo total, tiempo de búsqueda, algoritmo usado

---

**Heurística utilizada:** Distancia Manhattan (admisible para 4 direcciones, costo uniforme).  
**Garantía óptima:** Sí, bajo condiciones de admisibilidad y costos positivos.
