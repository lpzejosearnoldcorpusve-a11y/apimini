# Rutas Combinadas - Minibus + Teleférico

## 📋 Descripción General

Las rutas combinadas permiten crear itinerarios inteligentes que combinan **minibuses y teleféricos** para ofrecer opciones de viaje más completas y eficientes en La Paz.

## 🎯 Características Principales

### 1. **Detección Automática de Conexiones**
- Encuentra puntos donde la ruta de un minibus se cruza con estaciones de teleférico
- Radio configurable de intersección (predeterminado: 800 metros)
- Calcula la distancia exacta entre puntos

### 2. **Generación de Segmentos**
Cada ruta combinada está compuesta por segmentos ordenados:
- 🚶 **Caminata inicial** - Desde tu ubicación a la parada del minibus
- 🚌 **Minibus** - Viaje hasta el punto de transferencia
- 🚶 **Caminata intermedia** - De la parada del minibus a la estación del teleférico
- 🚡 **Teleférico** - Viaje hasta la estación más cercana al destino
- 🚶 **Caminata final** - Desde la estación del teleférico al destino

### 3. **Cálculos Inteligentes**
- **Duración**: Basada en distancias y velocidades promedio
  - Caminata: 1.4 m/s
  - Minibus: 5 m/s
  - Teleférico: 4 m/s
- **Costo**: Suma de tarifas (Minibus: Bs. 2.5, Teleférico: Bs. 3.0)
- **Distancia**: Total en metros

## 📁 Estructura de Archivos

```
services/
├── combinedRoutingService.ts      # Servicio de rutas combinadas
└── routingService.ts               # Actualizado para incluir rutas combinadas

components/routes/
└── CombinedRouteCard.tsx           # Componente visual para mostrar rutas

types/
└── routing.ts                      # Tipos (RouteOption, RouteSegment, etc.)
```

## 🔧 Funciones Principales

### `combinedRoutingService.findIntersectionPoints()`
Busca puntos donde una ruta de minibus se cruza con estaciones de teleférico.

```typescript
const intersections = combinedRoutingService.findIntersectionPoints(
  minibusRoute,          // Array de coordenadas
  teleferico,            // Objeto Teleferico
  500                    // Radio en metros
)
```

**Retorna:**
```typescript
{
  minibusPoint: { coordinate: Coordenada, index: number }
  teleficoStation: Estacion
  distance: number // metros
}[]
```

### `combinedRoutingService.createMinibusToTeleficoRoute()`
Crea una ruta completa combinada.

```typescript
const route = combinedRoutingService.createMinibusToTeleficoRoute(
  origin,              // Coordenadas de inicio
  destination,         // Coordenadas de destino
  minibus,            // Objeto Minibus
  teleferico,         // Objeto Teleferico
  800                 // Radio de intersección
)
```

**Retorna:**
```typescript
{
  segments: RouteSegment[]
  totalDuration: number    // minutos
  totalCost: number        // Bs.
  transfers: number        // 1 para combinadas
} | null
```

### `combinedRoutingService.generateCombinedOptions()`
Genera todas las opciones de rutas combinadas para un viaje.

```typescript
const options = combinedRoutingService.generateCombinedOptions(
  origin,
  destination,
  minibuses,
  telefericos
)
```

### `routingService.planAllRoutes()`
Planifica TODAS las opciones (directas + combinadas).

```typescript
const allRoutes = routingService.planAllRoutes(
  {
    origin: { lat, lng },
    destination: { lat, lng }
  },
  minibuses,
  telefericos
)
```

## 📊 Ejemplo de Respuesta

```typescript
{
  id: "combined-mini-001-tele-001",
  totalDuration: 45,           // minutos
  totalCost: 5.5,              // Bs.
  totalDistance: 8500,         // metros
  transfers: 1,
  recommended: true,
  segments: [
    {
      id: "walk-to-minibus-001",
      type: "walk",
      duration: 5,
      distance: 420,
      coordinates: [...],
      instructions: "Camina 420 metros hacia la parada del minibus"
    },
    {
      id: "minibus-001-transfer",
      type: "minibus",
      line: "100",
      color: "#0891b2",
      duration: 20,
      distance: 6200,
      cost: 2.5,
      coordinates: [...],
      instructions: "Toma minibus línea 100 hasta Estación Central"
    },
    {
      id: "walk-to-teleferico-001",
      type: "walk",
      duration: 3,
      distance: 240,
      coordinates: [...],
      instructions: "Camina hacia la estación del teleférico"
    },
    {
      id: "teleferico-001-transfer",
      type: "teleferico",
      line: "Rojo",
      color: "#FF0000",
      duration: 12,
      distance: 1800,
      cost: 3.0,
      coordinates: [...],
      instructions: "Toma teleférico Rojo hasta La Paz"
    },
    {
      id: "walk-to-destination",
      type: "walk",
      duration: 5,
      distance: 280,
      coordinates: [...],
      instructions: "Camina hacia tu destino"
    }
  ]
}
```

## 🎨 Visualización en la App

El componente `CombinedRouteCard` muestra:

```
┌─────────────────────────────────────────────────┐
│ 🔄 Ruta Combinada    45 min | Bs. 5.50 | 1 trans. │
├─────────────────────────────────────────────────┤
│                                                   │
│ 🚌 Minibus Línea 100                    20 min   │
│    ↓                                             │
│ 🚡 Teleférico Rojo                      12 min   │
│                                                   │
│ ⭐ Recomendada                                    │
│ Distancia: 8.5 km                               │
│                                                   │
└─────────────────────────────────────────────────┘
```

## 🔄 Flujo de Integración

1. **Usuario busca ruta** (origen → destino)
2. **`routingService.planAllRoutes()`** se ejecuta
3. Se generan opciones:
   - Rutas directas (minibus solo, teleférico solo)
   - Rutas combinadas (minibus → teleférico)
4. Se ordena por duración
5. Se muestran hasta 8 opciones en `RouteOptionsSheet`
6. Usuario selecciona ruta combinada
7. Se muestra con `CombinedRouteCard`

## ⚙️ Configuración

### Parámetros Ajustables

```typescript
// En combinedRoutingService.ts

// Radio de intersección entre transportes
const INTERSECTION_RADIUS = 800  // metros

// Velocidades promedio
const SPEEDS = {
  walk: 1.4,           // m/s
  minibus: 5,          // m/s
  teleferico: 4        // m/s
}

// Tarifas
const FARES = {
  minibus: 2.5,        // Bs.
  teleferico: 3.0      // Bs.
}
```

## 📈 Ventajas

✅ **Opciones más variadas** - Más alternativas para el usuario
✅ **Mejor cobertura** - Llega a zonas que un solo transporte no alcanza
✅ **Optimizado** - Selecciona rutas rápidas y económicas
✅ **Visual** - Muestra claramente todos los segmentos
✅ **Inteligente** - Detecta automáticamente puntos de conexión

## 🔮 Mejoras Futuras

- [ ] Agregar PumaKatari a combinaciones
- [ ] Considerar horarios en tiempo real
- [ ] Predecir congestión y ajustar tiempos
- [ ] Guardar rutas favoritas combinadas
- [ ] Notificaciones de cambios de ruta
- [ ] Integración con pago RFID

## 📝 Notas

- Las rutas combinadas se generan **en el servidor** para obtener siempre datos frescos
- Se consideran solo **combinaciones cercanas** (máx 1.5 km de distancia)
- Se recomienda la ruta si la duración es < 60 minutos
- Se limita a mostrar **máximo 8 opciones** (4 directas + 4 combinadas)
