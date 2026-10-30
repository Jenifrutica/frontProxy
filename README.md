# Frontend · MIRU

## Cómo se aplican los requisitos

| Requisito | Cómo se aplica | Archivo |
|---|---|---|
| Dashboard con 3 tarjetas: total de llamadas, tasa de éxito y tiempo promedio | Cada tarjeta consume `/api/metrics/summary` y muestra el total, `1 - errorRate` como tasa de éxito y `avgResponseMs` como tiempo promedio. | `ServiceCard.tsx` |
| Gráfica de líneas con las últimas 20 llamadas por servicio y su tiempo de respuesta | `LatencyChart` toma los últimos 20 registros de cada servicio, los ordena cronológicamente y los dibuja con Recharts en tres gráficas pequeñas. | `LatencyChart.tsx` |
| Tabla de logs en tiempo real con polling cada 3 segundos: `requestId`, servicio, operación, duración y estado | `usePolling` programa la siguiente petición 3 segundos después de que termina la anterior, sin solaparlas, y se pausa cuando la pestaña está oculta. La tabla pinta esas cinco columnas. | `usePolling.ts` + `LogTable.tsx` |
| Filtros por servicio, estado (`SUCCESS`/`ERROR`) y rango de fechas | `LogFilters` construye los query params `service`, `status`, `from` y `to`; al cambiar un filtro se reinicia la página a 0. | `LogFilters.tsx` + `App.tsx` |
| Botón “Simular carga” que dispara el endpoint y actualiza el dashboard | El botón hace `POST /api/metrics/simulate-load`, se deshabilita mientras corre y muestra el resumen de generadas, exitosas y fallidas. El polling recoge los nuevos logs. | `Header.tsx` |
| Clic en un log para expandir parámetros de entrada y respuesta completa | Cada fila es expandible y muestra `inputParams`, `responseJson` y, si el estado es `ERROR`, el tipo, mensaje y stack resumido. | `LogTable.tsx` |
| Indicador visual en rojo cuando la tasa de error supera el 15% | `errorRate > 0.15` activa la clase `is-degraded`: borde rojo, etiqueta `DEGRADADO` y nodo rojo en la topología. | `ServiceCard.tsx` + `TopologyMap.tsx` |

**Extras incluidos:** interfaz en español, código en inglés, topología en vivo con pulsos por llamada, animaciones de entrada y de fila nueva, diseño responsive y respeto por `prefers-reduced-motion`.

## Despliegue

El front se despliega desde el Blueprint del repositorio `backProxy`, que crea el servicio `jenilarper-proxy-app` usando el `Dockerfile` de este repositorio. Es una única URL pública:

```
https://jenilarper-proxy-app.onrender.com
```

No requiere CNAME ni dominio propio. El servidor `server.mjs` sirve el build y enruta `/api/services/*` y `/api/metrics/*` a los cuatro servicios del backend.

### Local

```bash
npm install
npm run dev
```

Vite enruta `/api/services/inventory` a `localhost:8081`, `/api/services/orders` a `localhost:8082`, `/api/services/payments` a `localhost:8083` y `/api/metrics` a `localhost:8084`.

Producción local:

```bash
npm run build
node server.mjs
```
