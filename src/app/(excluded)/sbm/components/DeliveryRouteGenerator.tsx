// 'use client'

// import React, {useState, useEffect} from 'react'
// import {Route, Navigation, MapPin, Clock, CheckCircle, AlertCircle, RotateCcw, ExternalLink, GripVertical} from 'lucide-react'
// import {DragDropContext, Droppable, Draggable, DropResult} from 'react-beautiful-dnd'

// import {optimizeRoute} from '../(builders)/mapServices'
// import {generateGoogleMapsUrl} from '../utils/mapUtils'
// import {formatDate} from '@cm/class/Days/date-utils/formatters'

// interface DeliveryRouteGeneratorProps {
//   selectedGroup: DeliveryGroupType
//   groupReservations: ReservationType[]
//   onRouteUpdate: (group: DeliveryGroupType) => void
// }

// export const DeliveryRouteGenerator: React.FC<DeliveryRouteGeneratorProps> = ({
//   selectedGroup,
//   groupReservations,
//   onRouteUpdate,
// }) => {
//   const [routeStops, setRouteStops] = useState<DeliveryRouteStopType[]>([])
//   const [isGenerating, setIsGenerating] = useState(false)
//   const [error, setError] = useState<string | null>(null)
//   const [mapUrl, setMapUrl] = useState<string>('')

//   useEffect(() => {
//     if (selectedGroup.optimizedRoute && selectedGroup.optimizedRoute.length > 0) {
//       setRouteStops(selectedGroup.optimizedRoute)
//       setMapUrl(generateGoogleMapsUrl(selectedGroup.optimizedRoute))
//     } else {
//       const stops = groupReservations.map((reservation, index) => ({
//         id: `stop-${reservation.id}`,
//         sbmDeliveryGroupId: selectedGroup.id!,
//         sbmReservationId: reservation.id!,
//         customerName: reservation.customerName!,
//         address: `${reservation.prefecture}${reservation.city}${reservation.street}${reservation.building || ''}`,
//         estimatedArrival: reservation.deliveryDate,
//         deliveryOrder: index + 1,
//         deliveryCompleted: reservation.deliveryCompleted || false,
//         recoveryCompleted: reservation.recoveryCompleted || false,
//         estimatedDuration: 15,
//       }))
//       setRouteStops(stops)
//     }
//   }, [selectedGroup, groupReservations])

//   const generateOptimizedRoute = async () => {
//     if (routeStops.length < 2) {
//       setError('ルート最適化には2件以上の配達先が必要です')
//       return
//     }

//     setIsGenerating(true)
//     setError(null)

//     try {
//       const optimizedStops = await optimizeRoute(routeStops)
//       setRouteStops(optimizedStops)
//       setMapUrl(generateGoogleMapsUrl(optimizedStops))

//       const updatedGroup: DeliveryGroupType = {
//         ...selectedGroup,
//         optimizedRoute: optimizedStops,
//         status: 'route_generated',
//         updatedAt: new Date(),
//       }
//       onRouteUpdate(updatedGroup)
//     } catch (error) {
//       setError('ルート最適化に失敗しました: ' + (error instanceof Error ? error.message : '不明なエラー'))
//     } finally {
//       setIsGenerating(false)
//     }
//   }

//   const handleDragEnd = (result: DropResult) => {
//     if (!result.destination) return

//     const items = Array.from(routeStops)
//     const [reorderedItem] = items.splice(result.source.index, 1)
//     items.splice(result.destination.index, 0, reorderedItem)

//     const reorderedStops = items.map((stop, index) => ({
//       ...stop,
//       deliveryOrder: index + 1,
//     }))

//     setRouteStops(reorderedStops)
//     setMapUrl(generateGoogleMapsUrl(reorderedStops))
//   }

//   const toggleDeliveryStatus = async (stopId: string, field: 'deliveryCompleted' | 'recoveryCompleted') => {
//     const updatedStops = routeStops.map(stop => (stop.id === stopId ? {...stop, [field]: !stop[field]} : stop))
//     setRouteStops(updatedStops)

//     const updatedGroup: DeliveryGroupType = {
//       ...selectedGroup,
//       optimizedRoute: updatedStops,
//       updatedAt: new Date(),
//     }
//     onRouteUpdate(updatedGroup)
//   }

//   return (
//     <div className="space-y-4">
//       <div className="flex items-center justify-between">
//         <h3 className="text-lg font-semibold">配達ルート</h3>
//         <div className="flex gap-2">
//           <button
//             onClick={generateOptimizedRoute}
//             disabled={isGenerating || routeStops.length < 2}
//             className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
//           >
//             <Route className="w-4 h-4" />
//             {isGenerating ? '最適化中...' : 'ルート最適化'}
//           </button>
//           {mapUrl && (
//             <a
//               href={mapUrl}
//               target="_blank"
//               rel="noopener noreferrer"
//               className="flex items-center gap-1 px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
//             >
//               <Navigation className="w-4 h-4" />
//               Googleマップで表示
//               <ExternalLink className="w-3 h-3" />
//             </a>
//           )}
//         </div>
//       </div>

//       {error && (
//         <div className="flex items-center gap-2 p-3 bg-red-100 text-red-700 rounded">
//           <AlertCircle className="w-5 h-5" />
//           {error}
//         </div>
//       )}

//       <DragDropContext onDragEnd={handleDragEnd}>
//         <Droppable droppableId="route-stops">
//           {provided => (
//             <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
//               {routeStops.map((stop, index) => (
//                 <Draggable key={stop.id} draggableId={stop.id!} index={index}>
//                   {provided => (
//                     <div
//                       ref={provided.innerRef}
//                       {...provided.draggableProps}
//                       className="flex items-center gap-3 p-3 bg-white rounded-lg shadow"
//                     >
//                       <div {...provided.dragHandleProps} className="cursor-move">
//                         <GripVertical className="w-5 h-5 text-gray-400" />
//                       </div>
//                       <div className="flex-1">
//                         <div className="flex items-center gap-2">
//                           <MapPin className="w-4 h-4 text-gray-500" />
//                           <span className="font-medium">{stop.customerName}</span>
//                         </div>
//                         <div className="text-sm text-gray-600">{stop.address}</div>
//                         {stop.estimatedArrival && (
//                           <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
//                             <Clock className="w-4 h-4" />
//                             予定時刻: {formatDate(stop.estimatedArrival, 'HH:mm')}
//                             {stop.estimatedDuration && ` (${stop.estimatedDuration}分)`}
//                           </div>
//                         )}
//                       </div>
//                       <div className="flex items-center gap-2">
//                         <button
//                           onClick={() => toggleDeliveryStatus(stop.id!, 'deliveryCompleted')}
//                           className={`p-1 rounded ${
//                             stop.deliveryCompleted ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
//                           }`}
//                           title="配達完了"
//                         >
//                           <CheckCircle className="w-5 h-5" />
//                         </button>
//                         <button
//                           onClick={() => toggleDeliveryStatus(stop.id!, 'recoveryCompleted')}
//                           className={`p-1 rounded ${
//                             stop.recoveryCompleted ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
//                           }`}
//                           title="回収完了"
//                         >
//                           <RotateCcw className="w-5 h-5" />
//                         </button>
//                       </div>
//                     </div>
//                   )}
//                 </Draggable>
//               ))}
//               {provided.placeholder}
//             </div>
//           )}
//         </Droppable>
//       </DragDropContext>
//     </div>
//   )
// }
