# MIRU · Panel de observabilidad

Frontend del taller **Sistema de monitoreo de microservicios con Proxy de auditoría y logging**.

Interfaz en español, código en inglés, React + TypeScript + Vite y Recharts.

## Qué muestra

- Tres tarjetas de servicio: llamadas totales, tasa de éxito y tiempo promedio.
- Topología en vivo: cada pulso representa una llamada interceptada por el proxy.
- Latencia de las últimas 20 llamadas por servicio.
- Registro de auditoría con polling cada 3 segundos, filtros por servicio, estado y rango de fechas.
- Detalle expandible por log: parámetros de entrada, respuesta y stack trace resumido.
- Botón **Simular carga** contra el endpoint del backend.
- Una tarjeta se marca en rojo cuando la tasa de error supera el 15%.

## Desarrollo local

Requiere Node 20+ y el backend en los puertos 8081 a 8084.

```bash
npm install
npm run dev
```

Vite enruta `/api/services/inventory` a `localhost:8081`, `/api/services/orders` a
`localhost:8082`, `/api/services/payments` a `localhost:8083` y `/api/metrics` a
`localhost:8084`.

## Producción

La app toma las URLs del backend de estas variables de entorno en tiempo de build:

| Variable | Destino |
|---|---|
| `VITE_INVENTORY_URL` | Servicio de inventario |
| `VITE_ORDERS_URL` | Servicio de pedidos |
| `VITE_PAYMENTS_URL` | Servicio de pagos |
| `VITE_AUDIT_URL` | Hub de auditoría |

Si están vacías, usa rutas relativas (desarrollo local). El backend habilita CORS para
que el front pueda desplegarse como sitio estático en otro origen.

El repositorio incluye `render.yaml` para crear un **Static Site** en Render con el
dominio `proxy.jenilarper.dev`.

## Diseño

Dirección visual inspirada en un póster editorial japonés: papel cálido, tinta ciruela,
sakura, tipografía serif y acentos en kanji. La animación se limita a entradas
escalonadas, pulso de vida, trazo de sparklines, aparición de filas nuevas y expansión
del detalle; todo respeta `prefers-reduced-motion`.
