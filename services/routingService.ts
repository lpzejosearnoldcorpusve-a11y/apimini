// Servicio de rutas y busqueda con OpenStreetMap Nominatim
import type { Coordenada, RouteOption, RoutePlanRequest, SearchResult } from "@/types/routing"
import type { Estacion, Minibus, Teleferico } from "@/types/transport"
import { combinedRoutingService } from "./combinedRoutingService"

const NOMINATIM_API = "https://nominatim.openstreetmap.org"

// Calcular distancia entre dos puntos (Haversine)
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000 // Radio de la tierra en metros
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// Encontrar punto mas cercano en una ruta
function findClosestPoint(point: Coordenada, route: Coordenada[]): { index: number; distance: number } {
  let minDist = Number.POSITIVE_INFINITY
  let minIndex = 0
  route.forEach((coord, i) => {
    const dist = calculateDistance(point.lat, point.lng, coord.lat, coord.lng)
    if (dist < minDist) {
      minDist = dist
      minIndex = i
    }
  })
  return { index: minIndex, distance: minDist }
}

// Encontrar estacion mas cercana
function findClosestStation(point: Coordenada, stations: Estacion[]): { station: Estacion; distance: number } | null {
  if (stations.length === 0) return null
  let minDist = Number.POSITIVE_INFINITY
  let closest: Estacion = stations[0]
  stations.forEach((station) => {
    const dist = calculateDistance(point.lat, point.lng, station.lat, station.lng)
    if (dist < minDist) {
      minDist = dist
      closest = station
    }
  })
  return { station: closest, distance: minDist }
}

export const routingService = {
  // Buscar lugares con Nominatim
  async searchPlaces(query: string): Promise<SearchResult[]> {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout

      // More comprehensive search for La Paz, Bolivia
      const searchQuery = `${encodeURIComponent(query)} La Paz Bolivia`
      const response = await fetch(
        `${NOMINATIM_API}/search?q=${searchQuery}&format=json&limit=15&addressdetails=1&bounded=1&viewbox=-68.3,-16.4,-68.0,-16.6&countrycodes=BO`,
        {
          headers: {
            "Accept-Language": "es",
            "User-Agent": "MiniApp/1.0"
          },
          signal: controller.signal
        },
      )

      clearTimeout(timeoutId)

      // Handle rate limiting (418) or other errors gracefully
      if (response.status === 418 || response.status === 429) {
        console.warn(`Nominatim API rate limited (status: ${response.status}), falling back to local search`)
        return []
      }

      if (!response.ok) {
        console.warn(`Nominatim API returned ${response.status}: ${response.statusText}`)
        return []
      }

      const data = await response.json()
      return data.map((item: any) => ({
        id: item.place_id.toString(),
        name: item.name || item.display_name.split(",")[0],
        displayName: item.display_name,
        lat: Number.parseFloat(item.lat),
        lng: Number.parseFloat(item.lon),
        type: "place" as const,
      }))
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.warn("Nominatim search timed out")
      } else {
        console.warn("Error searching places with Nominatim, falling back to local search:", error)
      }
      // Return empty array instead of throwing to allow transport search to work
      return []
    }
  },

  // Buscar estaciones de transporte
  searchTransportStations(query: string, minibuses: Minibus[], telefericos: Teleferico[]): SearchResult[] {
    const results: SearchResult[] = []
    const lowerQuery = query.toLowerCase()

    // Buscar en estaciones de teleferico - más completo
    telefericos.forEach((tel) => {
      // Buscar en el nombre de la línea
      if (tel.nombre.toLowerCase().includes(lowerQuery) ||
          "teleferico".includes(lowerQuery) ||
          "cable".includes(lowerQuery)) {
        const midPoint = tel.estaciones[Math.floor(tel.estaciones.length / 2)]
        if (midPoint) {
          results.push({
            id: tel.id,
            name: tel.nombre,
            displayName: `Línea ${tel.nombre} - Teleférico`,
            lat: midPoint.lat,
            lng: midPoint.lng,
            type: "stop",
            transportType: "teleferico",
            lineInfo: tel.nombre,
          })
        }
      }

      // Buscar en estaciones individuales
      tel.estaciones.forEach((est) => {
        if (est.nombre.toLowerCase().includes(lowerQuery) ||
            "estacion".includes(lowerQuery) ||
            "parada".includes(lowerQuery)) {
          results.push({
            id: est.id,
            name: est.nombre,
            displayName: `${est.nombre} - ${tel.nombre}`,
            lat: est.lat,
            lng: est.lng,
            type: "station",
            transportType: "teleferico",
            lineInfo: tel.nombre,
          })
        }
      })
    })

    // Buscar en rutas de minibus - más completo
    minibuses.forEach((mini) => {
      // Buscar por nombre de ruta, línea, sindicato
      if (
        mini.rutaNombre.toLowerCase().includes(lowerQuery) ||
        mini.linea.toLowerCase().includes(lowerQuery) ||
        mini.sindicato.toLowerCase().includes(lowerQuery) ||
        "minibus".includes(lowerQuery) ||
        "bus".includes(lowerQuery) ||
        "micro".includes(lowerQuery) ||
        "pumakatari".includes(lowerQuery)
      ) {
        const midPoint = mini.ruta[Math.floor(mini.ruta.length / 2)]
        if (midPoint) {
          results.push({
            id: mini.id,
            name: `Línea ${mini.linea}`,
            displayName: `${mini.rutaNombre} - ${mini.sindicato}`,
            lat: midPoint.lat,
            lng: midPoint.lng,
            type: "stop",
            transportType: "minibus",
            lineInfo: mini.linea,
          })
        }
      }

      // Buscar por nombre de ruta del minibus
      if (mini.rutaNombre && mini.rutaNombre.toLowerCase().includes(lowerQuery)) {
        results.push({
          id: `${mini.id}-route`,
          name: mini.rutaNombre,
          displayName: `${mini.rutaNombre} - Línea ${mini.linea}`,
          lat: mini.ruta[0]?.lat || 0,
          lng: mini.ruta[0]?.lng || 0,
          type: "stop",
          transportType: "minibus",
          lineInfo: mini.linea,
        })
      }
    })

    // Eliminar duplicados y limitar resultados
    const uniqueResults = results.filter((result, index, self) =>
      index === self.findIndex(r => r.id === result.id)
    )

    return uniqueResults.slice(0, 15)
  },

  // Algoritmo de planificacion de rutas
  planRoute(request: RoutePlanRequest, minibuses: Minibus[], telefericos: Teleferico[]): RouteOption[] {
    const options: RouteOption[] = []
    const { origin, destination, originName, destinationName } = request

    // Distancia directa
    const directDistance = calculateDistance(origin.lat, origin.lng, destination.lat, destination.lng)
    const walkSpeed = 80 // metros por minuto

    // Opcion 1: Caminar directo (si es cercano)
    if (directDistance < 2000) {
      options.push({
        id: "walk-direct",
        totalDuration: Math.ceil(directDistance / walkSpeed),
        totalCost: 0,
        totalDistance: directDistance,
        transfers: 0,
        segments: [
          {
            id: "walk-1",
            type: "walk",
            from: { name: originName || "Tu ubicacion", lat: origin.lat, lng: origin.lng },
            to: { name: destinationName || "Destino", lat: destination.lat, lng: destination.lng },
            duration: Math.ceil(directDistance / walkSpeed),
            distance: directDistance,
            cost: 0,
            instructions: `Caminar ${Math.round(directDistance)}m hasta ${destinationName || "destino"}`,
            coordinates: [origin, destination],
          },
        ],
      })
    }

    // Opcion 2: Buscar minibus directo
    minibuses.forEach((mini) => {
      const closestToOrigin = findClosestPoint(origin, mini.ruta)
      const closestToDest = findClosestPoint(destination, mini.ruta)

      // Si ambos puntos estan cerca de la ruta (< 500m) y el destino esta despues del origen
      if (
        closestToOrigin.distance < 500 &&
        closestToDest.distance < 500 &&
        closestToDest.index > closestToOrigin.index
      ) {
        const routeSegment = mini.ruta.slice(closestToOrigin.index, closestToDest.index + 1)
        let routeDistance = 0
        for (let i = 0; i < routeSegment.length - 1; i++) {
          routeDistance += calculateDistance(
            routeSegment[i].lat,
            routeSegment[i].lng,
            routeSegment[i + 1].lat,
            routeSegment[i + 1].lng,
          )
        }

        const walkToStop = closestToOrigin.distance
        const walkFromStop = closestToDest.distance
        const busTime = Math.ceil(routeDistance / 300) // 300m/min en bus
        const walkTime = Math.ceil((walkToStop + walkFromStop) / walkSpeed)

        options.push({
          id: `minibus-${mini.id}`,
          totalDuration: walkTime + busTime + 5, // +5 min espera
          totalCost: 2, // Bs. 2 tarifa minibus
          totalDistance: walkToStop + routeDistance + walkFromStop,
          transfers: 0,
          recommended: true,
          segments: [
            {
              id: "walk-to-stop",
              type: "walk",
              from: { name: originName || "Tu ubicacion", lat: origin.lat, lng: origin.lng },
              to: {
                name: "Parada",
                lat: mini.ruta[closestToOrigin.index].lat,
                lng: mini.ruta[closestToOrigin.index].lng,
              },
              duration: Math.ceil(walkToStop / walkSpeed),
              distance: walkToStop,
              cost: 0,
              instructions: `Caminar ${Math.round(walkToStop)}m a la parada`,
              coordinates: [origin, mini.ruta[closestToOrigin.index]],
            },
            {
              id: "bus-segment",
              type: "minibus",
              from: {
                name: "Parada",
                lat: mini.ruta[closestToOrigin.index].lat,
                lng: mini.ruta[closestToOrigin.index].lng,
              },
              to: { name: "Bajada", lat: mini.ruta[closestToDest.index].lat, lng: mini.ruta[closestToDest.index].lng },
              line: `Linea ${mini.linea}`,
              color: "#0891b2",
              duration: busTime,
              distance: routeDistance,
              cost: 2,
              instructions: `Tomar Linea ${mini.linea} (${mini.sindicato}) hacia ${mini.rutaNombre}`,
              coordinates: routeSegment,
            },
            {
              id: "walk-from-stop",
              type: "walk",
              from: {
                name: "Bajada",
                lat: mini.ruta[closestToDest.index].lat,
                lng: mini.ruta[closestToDest.index].lng,
              },
              to: { name: destinationName || "Destino", lat: destination.lat, lng: destination.lng },
              duration: Math.ceil(walkFromStop / walkSpeed),
              distance: walkFromStop,
              cost: 0,
              instructions: `Caminar ${Math.round(walkFromStop)}m al destino`,
              coordinates: [mini.ruta[closestToDest.index], destination],
            },
          ],
        })
      }
    })

    // Opcion 3: Buscar teleferico
    telefericos.forEach((tel) => {
      const allStations = tel.estaciones.sort((a, b) => a.orden - b.orden)
      const closestOriginStation = findClosestStation(origin, allStations)
      const closestDestStation = findClosestStation(destination, allStations)

      if (
        closestOriginStation &&
        closestDestStation &&
        closestOriginStation.distance < 800 &&
        closestDestStation.distance < 800 &&
        closestOriginStation.station.orden !== closestDestStation.station.orden
      ) {
        const fromStation = closestOriginStation.station
        const toStation = closestDestStation.station
        const stationsInRoute = allStations
          .filter((s) =>
            fromStation.orden < toStation.orden
              ? s.orden >= fromStation.orden && s.orden <= toStation.orden
              : s.orden <= fromStation.orden && s.orden >= toStation.orden,
          )
          .sort((a, b) => (fromStation.orden < toStation.orden ? a.orden - b.orden : b.orden - a.orden))

        const teleDistance = Math.abs(toStation.orden - fromStation.orden) * 1000 // estimado
        const walkToStation = closestOriginStation.distance
        const walkFromStation = closestDestStation.distance
        const teleTime = stationsInRoute.length * 3 // 3 min por estacion
        const walkTime = Math.ceil((walkToStation + walkFromStation) / walkSpeed)

        options.push({
          id: `teleferico-${tel.id}`,
          totalDuration: walkTime + teleTime + 3,
          totalCost: 3, // Bs. 3 tarifa teleferico
          totalDistance: walkToStation + teleDistance + walkFromStation,
          transfers: 0,
          segments: [
            {
              id: "walk-to-station",
              type: "walk",
              from: { name: originName || "Tu ubicacion", lat: origin.lat, lng: origin.lng },
              to: { name: fromStation.nombre, lat: fromStation.lat, lng: fromStation.lng },
              duration: Math.ceil(walkToStation / walkSpeed),
              distance: walkToStation,
              cost: 0,
              instructions: `Caminar ${Math.round(walkToStation)}m a estacion ${fromStation.nombre}`,
              coordinates: [origin, { lat: fromStation.lat, lng: fromStation.lng }],
            },
            {
              id: "tele-segment",
              type: "teleferico",
              from: { name: fromStation.nombre, lat: fromStation.lat, lng: fromStation.lng },
              to: { name: toStation.nombre, lat: toStation.lat, lng: toStation.lng },
              line: tel.nombre,
              color: tel.color,
              duration: teleTime,
              distance: teleDistance,
              cost: 3,
              instructions: `Tomar ${tel.nombre} de ${fromStation.nombre} a ${toStation.nombre}`,
              coordinates: stationsInRoute.map((s) => ({ lat: s.lat, lng: s.lng })),
            },
            {
              id: "walk-from-station",
              type: "walk",
              from: { name: toStation.nombre, lat: toStation.lat, lng: toStation.lng },
              to: { name: destinationName || "Destino", lat: destination.lat, lng: destination.lng },
              duration: Math.ceil(walkFromStation / walkSpeed),
              distance: walkFromStation,
              cost: 0,
              instructions: `Caminar ${Math.round(walkFromStation)}m al destino`,
              coordinates: [{ lat: toStation.lat, lng: toStation.lng }, destination],
            },
          ],
        })
      }
    })

    // Ordenar por duracion
    return options.sort((a, b) => a.totalDuration - b.totalDuration).slice(0, 5)
  },

  // Planificar rutas combinadas (minibus + teleferico)
  planCombinedRoutes(request: RoutePlanRequest, minibuses: Minibus[], telefericos: Teleferico[]): RouteOption[] {
    return combinedRoutingService.generateCombinedOptions(
      request.origin,
      request.destination,
      minibuses,
      telefericos
    )
  },

  // Obtener todas las opciones de rutas (directas + combinadas)
  planAllRoutes(request: RoutePlanRequest, minibuses: Minibus[], telefericos: Teleferico[]): RouteOption[] {
    const directRoutes = this.planRoute(request, minibuses, telefericos)
    const combinedRoutes = this.planCombinedRoutes(request, minibuses, telefericos)

    // Combinar opciones y ordenar por duración
    const allOptions = [...directRoutes, ...combinedRoutes]
    return allOptions.sort((a, b) => a.totalDuration - b.totalDuration).slice(0, 8)
  },
}

