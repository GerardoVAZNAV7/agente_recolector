# Apoyo para el reporte (Partes 1, 4 y 9)

Contenido listo para pegar en el PDF de entrega. Las Partes 7 y 8 (resultados
y análisis de racionalidad) deben completarse después de correr los tres
escenarios en la app, porque dependen de lo que realmente ocurra.

## Parte 1 — Especificación REAS

| Elemento | Descripción |
|---|---|
| **R — Medida de rendimiento** | Puntos por paquete recogido (+10) y por completar la recolección (+20 extra), penalizando cada movimiento (-1) y cada intento inválido de salir del tablero o chocar un obstáculo (-5 cada uno). El agente busca maximizar la puntuación total, no solo recoger paquetes. |
| **E — Entorno** | Una cuadrícula 2D de tamaño configurable con celdas vacías, paquetes y obstáculos, parcialmente observable (el agente no conoce el mapa completo de antemano), estático (nada se mueve salvo el agente) y determinista. |
| **A — Actuadores** | Cuatro movimientos (ARRIBA, ABAJO, IZQUIERDA, DERECHA) y la acción RECOGER, que retira el paquete de la celda donde está parado el agente. |
| **S — Sensores** | En cada turno, el agente percibe el contenido de su celda actual y de las cuatro celdas adyacentes (vacío, paquete, obstáculo o fuera del tablero). No percibe nada más allá de eso. |

## Parte 4 — Preguntas de diseño

**¿Qué información utiliza el agente para decidir?**
Únicamente su percepción del turno actual (celda actual y las cuatro
adyacentes) y su memoria interna acumulada: el mapa parcial que ha
descubierto, el conjunto de posiciones visitadas y la relación "padre" que
le permite reconstruir el camino de regreso.

**¿Cómo determina qué acción realizar cuando existen varias posibilidades?**
Usa un sistema de prioridades (ver `src/core/decision.js`): recoger > ir
hacia un paquete adyacente > evitar obstáculos/bordes > moverse hacia
territorio que abre celdas desconocidas > preferir celdas libres no
visitadas > backtracking. Cuando dos direcciones empatan en prioridad,
desempata con un orden fijo (ARRIBA > DERECHA > ABAJO > IZQUIERDA) para que
el comportamiento sea reproducible.

**¿Qué hará cuando ninguna de sus reglas anteriores se cumpla?**
Si ninguna celda adyacente es transitable o todas ya fueron visitadas sin
nada nuevo por explorar, el agente hace *backtracking*: retrocede un paso
siguiendo la relación padre guardada en su memoria hasta llegar a una zona
con posibilidades de exploración. Si ni siquiera eso es posible (agente
completamente atrapado), la simulación termina por esa causa.

## Parte 9 — Elementos del agente en el código

| Concepto | Elemento en el programa |
|---|---|
| Agente | `Simulador` (src/core/simulador.js), que mantiene `posicionAgente` y ejecuta el ciclo turno a turno |
| Entorno | Clase `Entorno` (src/core/entorno.js): la cuadrícula real, paquetes y obstáculos |
| Sensor | `percibir()` (src/core/percepcion.js): lee del `Entorno` la celda actual y las 4 adyacentes |
| Percepción | El objeto que retorna `percibir()`: `{ posicion, actual, arriba, abajo, izquierda, derecha }`, usado para actualizar la memoria y para decidir |
| Actuador | `actuar()` (src/core/accion.js): aplica la acción sobre el `Entorno` (mover o recoger) |
| Acción | Los valores `{tipo:'MOVER', direccion}` / `{tipo:'RECOGER'}` que produce `decidir()` |
| Función del agente | `decidir()` (src/core/decision.js): transforma percepción + memoria en una acción, siguiendo las reglas de prioridad de la estrategia |
| Medida de rendimiento | `rendimiento.js`: traduce cada evento (`PAQUETE_RECOGIDO`, `MOVIMIENTO_VALIDO`, etc.) en puntos, acumulados en `Simulador.puntuacion` |

## Parte 7 — Tabla de resultados (completar tras correr los 3 escenarios)

| Escenario | Paquetes recogidos | Movimientos | Penalizaciones | Puntuación final |
|---|---:|---:|---:|---:|
| 1 | | | | |
| 2 | | | | |
| 3 | | | | |
