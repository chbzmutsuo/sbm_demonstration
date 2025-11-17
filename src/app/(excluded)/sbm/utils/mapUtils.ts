'use client'

export function generateGoogleMapsUrl(stops: DeliveryRouteStopType[]): string {
  if (stops.length < 2) return ''

  const origin = `${stops[0].lat},${stops[0].lng}`
  const destination = `${stops[stops.length - 1].lat},${stops[stops.length - 1].lng}`
  const waypoints = stops
    .slice(1, -1)
    .map(stop => `${stop.lat},${stop.lng}`)
    .join('|')

  const params = new URLSearchParams({
    api: '1',
    origin,
    destination,
    waypoints,
    travelmode: 'driving',
  })

  return `https://www.google.com/maps/dir/?${params.toString()}`
}
