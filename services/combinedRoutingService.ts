import type { Coordenada, RouteOption, RouteSegment } from "@/types/routing"
import type { Estacion, Minibus, Teleferico } from "@/types/transport"

/**
 * Servicio para crear rutas combinadas (minibus + teleféricos)
 * Útil para viajes que requieren cambiar de medio de transporte
 */

interface TransportNode {
  id: string
  name: string
  lat: number
  lng: number
  type: "minibus" | "teleferico" | "location"
  lineInfo?: string
  color?: string
}

interface CombinedRoute {
  segments: RouteSegment[]
  totalDuration: number
  totalCost: number
  transfers: number
}

// Calcular distancia entre dos puntos (Haversine en metros)
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000 // Radio de la tierra en metros
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// Calcular tiempo estimado en minutos basado en distancia
function estimateDuration(distanceMeters: number, transportType: "walk" | "minibus" | "teleferico"): number {
  const speeds: { [key: string]: number } = {
    walk: 1.4, // m/s
    minibus: 5, // m/s promedio en La Paz
    teleferico: 4, // m/s
  }
  return Math.round((distanceMeters / speeds[transportType]) / 60)
}

export const combinedRoutingService = {
  /**
   * Encontrar punto más cercano en una ruta
   */
  findClosestPointInRoute(
    point: Coordenada,
    route: Coordenada[]
  ): { index: number; distance: number; coordinate: Coordenada } {
    let minDist = Number.POSITIVE_INFINITY
    let minIndex = 0
    let closestCoord = route[0]

    route.forEach((coord, i) => {
      const dist = calculateDistance(point.lat, point.lng, coord.lat, coord.lng)
      if (dist < minDist) {
        minDist = dist
        minIndex = i
        closestCoord = coord
      }
    })

    return { index: minIndex, distance: minDist, coordinate: closestCoord }
  },

  /**
   * Encontrar estación de teleférico más cercana
   */
  findClosestTeleficoStation(
    point: Coordenada,
    teleferico: Teleferico
  ): { station: Estacion; distance: number } | null {
    if (teleferico.estaciones.length === 0) return null

    let minDist = Number.POSITIVE_INFINITY
    let closest = teleferico.estaciones[0]

    teleferico.estaciones.forEach((station) => {
      const dist = calculateDistance(point.lat, point.lng, station.lat, station.lng)
      if (dist < minDist) {
        minDist = dist
        closest = station
      }
    })

    return { station: closest, distance: minDist }
  },

  /**
   * Buscar teleféricos que se crucen con una ruta de minibus
   * Perfecto para encontrar puntos de transferencia
   */
  findIntersectionPoints(
    minibusRoute: Coordenada[],
    teleferico: Teleferico,
    maxDistanceM: number = 500 // 500 metros de radio
  ): Array<{
    minibusPoint: { coordinate: Coordenada; index: number }
    teleficoStation: Estacion
    distance: number
  }> {
    const intersections = []

    // Para cada estación del teleférico
    for (const station of teleferico.estaciones) {
      // Buscar el punto más cercano en la ruta del minibus
      const closest = this.findClosestPointInRoute(
        { lat: station.lat, lng: station.lng },
        minibusRoute
      )

      // Si está dentro del radio de intersección
      if (closest.distance <= maxDistanceM) {
        intersections.push({
          minibusPoint: { coordinate: closest.coordinate, index: closest.index },
          teleficoStation: station,
          distance: closest.distance,
        })
      }
    }

    return intersections
  },

  /**
   * Crear ruta combinada: Minibus → Teleférico
   */
  createMinibusToTeleficoRoute(
    originPoint: Coordenada,
    destinationPoint: Coordenada,
    minibus: Minibus,
    teleferico: Teleferico,
    intersectionDistance: number
  ): CombinedRoute | null {
    const segments: RouteSegment[] = []
    let totalDuration = 0
    let totalCost = 0

    // Encontrar punto de entrada del minibus más cercano al origen
    const minibusEntry = this.findClosestPointInRoute(originPoint, minibus.ruta)
    const minibusEntryDist = calculateDistance(
      originPoint.lat,
      originPoint.lng,
      minibusEntry.coordinate.lat,
      minibusEntry.coordinate.lng
    )

    // 1. Segmento a pie hasta la parada del minibus
    if (minibusEntryDist > 50) {
      const walkDuration = estimateDuration(minibusEntryDist, "walk")
      segments.push({
        id: `walk-to-minibus-${minibus.id}`,
        type: "walk",
        from: {
          name: "Tu ubicación",
          lat: originPoint.lat,
          lng: originPoint.lng,
        },
        to: {
          name: `Parada ${minibusEntry.index + 1}`,
          lat: minibusEntry.coordinate.lat,
          lng: minibusEntry.coordinate.lng,
        },
        duration: walkDuration,
        distance: minibusEntryDist,
        instructions: `Camina ${Math.round(minibusEntryDist)} metros hacia la parada del minibus`,
        coordinates: [originPoint, minibusEntry.coordinate],
      })
      totalDuration += walkDuration
    }

    // 2. Buscar punto de transferencia (donde se cruza minibus con teleférico)
    const transferPoints = this.findIntersectionPoints(minibus.ruta, teleferico, intersectionDistance)

    if (transferPoints.length === 0) {
      return null // No hay conexión posible
    }

    // Usar el primer punto de transferencia
    const transfer = transferPoints[0]

    // 3. Segmento en minibus
    const minibusRoutePortion = minibus.ruta.slice(
      minibusEntry.index,
      transfer.minibusPoint.index + 1
    )

    if (minibusRoutePortion.length > 0) {
      const distanceMinibus = this.calculateRouteDistance(minibusRoutePortion)
      const durationMinibus = estimateDuration(distanceMinibus, "minibus")

      segments.push({
        id: `minibus-${minibus.id}-transfer`,
        type: "minibus",
        line: minibus.linea,
        color: "#0891b2",
        from: {
          name: `Parada inicio ${minibus.linea}`,
          lat: minibusRoutePortion[0].lat,
          lng: minibusRoutePortion[0].lng,
        },
        to: {
          name: transfer.teleficoStation.nombre,
          lat: transfer.minibusPoint.coordinate.lat,
          lng: transfer.minibusPoint.coordinate.lng,
        },
        duration: durationMinibus,
        distance: distanceMinibus,
        cost: 2.5, // Tarifa estándar minibus
        frequency: "Cada 5-10 minutos",
        instructions: `Toma minibus línea ${minibus.linea} hasta ${transfer.teleficoStation.nombre}`,
        coordinates: minibusRoutePortion,
      })
      totalDuration += durationMinibus
      totalCost += 2.5
    }

    // 4. Caminata desde parada del minibus a estación del teleférico
    const walkToTelefico = calculateDistance(
      transfer.minibusPoint.coordinate.lat,
      transfer.minibusPoint.coordinate.lng,
      transfer.teleficoStation.lat,
      transfer.teleficoStation.lng
    )

    if (walkToTelefico > 20) {
      const walkDuration = estimateDuration(walkToTelefico, "walk")
      segments.push({
        id: `walk-to-teleferico-${teleferico.id}`,
        type: "walk",
        from: {
          name: `Parada minibus ${minibus.linea}`,
          lat: transfer.minibusPoint.coordinate.lat,
          lng: transfer.minibusPoint.coordinate.lng,
        },
        to: {
          name: transfer.teleficoStation.nombre,
          lat: transfer.teleficoStation.lat,
          lng: transfer.teleficoStation.lng,
        },
        duration: walkDuration,
        distance: walkToTelefico,
        instructions: `Camina hacia estación ${transfer.teleficoStation.nombre}`,
        coordinates: [transfer.minibusPoint.coordinate, { lat: transfer.teleficoStation.lat, lng: transfer.teleficoStation.lng }],
      })
      totalDuration += walkDuration
    }

    // 5. Buscar estación de destino en el teleférico más cercana al destino
    const teleficoDestination = this.findClosestTeleficoStation(destinationPoint, teleferico)

    if (!teleficoDestination) {
      return null
    }

    // Encontrar índice de estaciones para el segmento del teleférico
    const stationIndexFrom = teleferico.estaciones.findIndex(
      (s) => s.id === transfer.teleficoStation.id
    )
    const stationIndexTo = teleferico.estaciones.findIndex(
      (s) => s.id === teleficoDestination.station.id
    )

    if (stationIndexFrom >= 0 && stationIndexTo >= 0 && stationIndexFrom !== stationIndexTo) {
      // 6. Segmento en teleférico
      const teleficoCoordinates = teleferico.estaciones
        .slice(
          Math.min(stationIndexFrom, stationIndexTo),
          Math.max(stationIndexFrom, stationIndexTo) + 1
        )
        .map((s) => ({ lat: s.lat, lng: s.lng }))

      const distanceTeleferico = this.calculateRouteDistance(teleficoCoordinates)
      const durationTeleferico = estimateDuration(distanceTeleferico, "teleferico")

      segments.push({
        id: `teleferico-${teleferico.id}-transfer`,
        type: "teleferico",
        color: teleferico.color,
        from: {
          name: transfer.teleficoStation.nombre,
          lat: transfer.teleficoStation.lat,
          lng: transfer.teleficoStation.lng,
        },
        to: {
          name: teleficoDestination.station.nombre,
          lat: teleficoDestination.station.lat,
          lng: teleficoDestination.station.lng,
        },
        duration: durationTeleferico,
        distance: distanceTeleferico,
        cost: 3.0, // Tarifa estándar teleférico
        frequency: "Continuo",
        instructions: `Toma el teleférico ${teleferico.nombre} hasta ${teleficoDestination.station.nombre}`,
        coordinates: teleficoCoordinates,
      })
      totalDuration += durationTeleferico
      totalCost += 3.0
    }

    // 7. Caminata final hacia el destino
    const finalWalkDist = calculateDistance(
      teleficoDestination.station.lat,
      teleficoDestination.station.lng,
      destinationPoint.lat,
      destinationPoint.lng
    )

    if (finalWalkDist > 20) {
      const walkDuration = estimateDuration(finalWalkDist, "walk")
      segments.push({
        id: "walk-to-destination",
        type: "walk",
        from: {
          name: teleficoDestination.station.nombre,
          lat: teleficoDestination.station.lat,
          lng: teleficoDestination.station.lng,
        },
        to: {
          name: "Tu destino",
          lat: destinationPoint.lat,
          lng: destinationPoint.lng,
        },
        duration: walkDuration,
        distance: finalWalkDist,
        instructions: `Camina hacia tu destino`,
        coordinates: [{ lat: teleficoDestination.station.lat, lng: teleficoDestination.station.lng }, destinationPoint],
      })
      totalDuration += walkDuration
    }

    return {
      segments,
      totalDuration,
      totalCost,
      transfers: 1,
    }
  },

  /**
   * Calcular distancia total de una ruta
   */
  calculateRouteDistance(coordinates: Coordenada[]): number {
    let totalDistance = 0
    for (let i = 0; i < coordinates.length - 1; i++) {
      totalDistance += calculateDistance(
        coordinates[i].lat,
        coordinates[i].lng,
        coordinates[i + 1].lat,
        coordinates[i + 1].lng
      )
    }
    return totalDistance
  },

  /**
   * Generar opciones de rutas combinadas para una búsqueda
   */
  generateCombinedOptions(
    origin: Coordenada,
    destination: Coordenada,
    minibuses: Minibus[],
    telefericos: Teleferico[]
  ): RouteOption[] {
    const options: RouteOption[] = []

    // Probar combinaciones de minibus → teleférico
    for (const minibus of minibuses) {
      for (const teleferico of telefericos) {
        const combinedRoute = this.createMinibusToTeleficoRoute(
          origin,
          destination,
          minibus,
          teleferico,
          800 // Radio de 800 metros para intersecciones
        )

        if (combinedRoute && combinedRoute.segments.length > 0) {
          options.push({
            id: `combined-${minibus.id}-${teleferico.id}`,
            totalDuration: combinedRoute.totalDuration,
            totalCost: combinedRoute.totalCost,
            totalDistance: this.calculateTotalDistance(combinedRoute.segments),
            transfers: combinedRoute.transfers,
            segments: combinedRoute.segments,
            recommended: combinedRoute.totalDuration < 60, // Recomendar si es menos de 1 hora
            comfortScore: 4,
            reliabilityScore: 4,
            overallRating: 4,
            departureTime: new Date().toISOString(),
            arrivalTime: new Date(Date.now() + combinedRoute.totalDuration * 60000).toISOString(),
          })
        }
      }
    }

    // Ordenar por tiempo total
    options.sort((a, b) => a.totalDuration - b.totalDuration)

    return options
  },

  /**
   * Calcular distancia total de todos los segmentos
   */
  calculateTotalDistance(segments: RouteSegment[]): number {
    return segments.reduce((sum, segment) => sum + (segment.distance || 0), 0)
  },
}
