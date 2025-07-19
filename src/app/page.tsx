"use client"
import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import Table from './components/Essentials/Table'
import Input from './components/Essentials/Input'
import Select from './components/Essentials/Select'
import { FaSearch, FaEdit, FaTrash, FaExclamationTriangle, FaStickyNote, FaLink, FaFilePdf } from 'react-icons/fa'
import { useAssignments } from '@/hooks/useAssignments'
import { useUpdate } from '@/contexts/UpdateContext'
import NotesModal from './components/NotesModal'
import { useNotes } from '@/hooks/useNotes'

// Definir tipos para los datos
interface Product {
  id: string
  name: string
  code: string
  description: string
  quantity: number
  area: {
    id: string
    name: string
    description: string
    status: string
  }
}

interface BatchItemOrderItem {
  id: string
  quantity: number
  orderItem: {
    id: string
    order: {
      orderNumber: string
    }
  }
}

interface BatchItem {
  id: string
  quantity: number
  product: Product
  batchItemOrderItems?: BatchItemOrderItem[]
}

interface Container {
  id: string
  containerCode: string
  name: string
  description: string
  batchItems: BatchItem[]
}

interface Batch {
  id: string
  batchNumber: string
  name: string
  description: string
  status: string
  createdAt: string
  updatedAt: string
  containers: Container[]
}

interface SalidasData {
  batches: Batch[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

interface TableRow {
  folio: string
  area: string
  clave: string
  pedido: string
  lote: string
  fecha: string
  hora: string
  cantidad: number // Cantidad asignada a este pedido específico
  cantidadProducto: number // Cantidad del producto
  id: string
  productId: string
  batchItem: BatchItem
  container: Container
  batch: Batch
}

const page = () => {
  const [salidas, setSalidas] = useState<SalidasData | null>(null)
  const [filteredData, setFilteredData] = useState<TableRow[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filtroFecha, setFiltroFecha] = useState('')
  const [filtroClave, setFiltroClave] = useState('')
  const [filtroPedido, setFiltroPedido] = useState('')
  const [filtroLote, setFiltroLote] = useState('')
  const [loading, setLoading] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [selectedBatchItem, setSelectedBatchItem] = useState<any>(null)
  const [pendingOrders, setPendingOrders] = useState<any[]>([])
  const [selectedOrderItem, setSelectedOrderItem] = useState<any>(null)
  const [assignQuantity, setAssignQuantity] = useState('')
  const [showNotesModal, setShowNotesModal] = useState(false)
  const [selectedBatchItemForNotes, setSelectedBatchItemForNotes] = useState<any>(null)
  const [batchItemsWithNotes, setBatchItemsWithNotes] = useState<Set<string>>(new Set())

  const { getPendingOrders, assignBatchToOrder, loading: assignLoading } = useAssignments()
  const { shouldUpdateBitacora, markUpdated } = useUpdate();
  const { getNotes } = useNotes();

  const handleOpenNotes = (batchItem: BatchItem) => {
    setSelectedBatchItemForNotes(batchItem)
    setShowNotesModal(true)
  }

  const handleCloseNotes = () => {
    setShowNotesModal(false)
    setSelectedBatchItemForNotes(null)
  }

  // Función para descargar PDF de la salida
  const handleDownloadPDF = async (row: TableRow) => {
    try {
      // Preparar los datos para el PDF
      const pdfData = {
        batchData: {
          batchNumber: row.batch.batchNumber,
          name: row.batch.name,
          description: row.batch.description
        },
        items: [{
          productName: row.batchItem.product.name,
          productCode: row.batchItem.product.code,
          lote: row.batch.name,
          quantity: row.batchItem.quantity,
          containers: [row.container.containerCode],
          orderNumber: row.batchItem.batchItemOrderItems?.[0]?.orderItem?.order?.orderNumber || 'Sin asignar'
        }]
      };

      const response = await fetch('/api/lotes/pdf-generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pdfData)
      });

      if (response.ok) {
        const pdfBlob = await response.blob();
        const url = window.URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `salida-${row.batch.batchNumber}-${row.batchItem.product.code}-${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        // Mostrar mensaje de éxito con toast
        toast.success('PDF descargado exitosamente');
      } else {
        console.error('Error generando PDF');
        toast.error('Error al generar el PDF');
      }
    } catch (error) {
      console.error('Error descargando PDF:', error);
      toast.error('Error al descargar el PDF');
    }
  };

  // Función para cargar las notas de todos los batch items
  const loadBatchItemsNotes = async () => {
    try {
      const response = await getNotes({
        type: 'BATCH_ITEM_NOTE'
      });

      if (response.success) {
        const itemsWithNotes = new Set<string>();
        response.data.forEach(note => {
          // Extraer el batch item ID del contenido de la nota
          const match = note.content.match(/\[batch_item_([^\]]+)\]/);
          if (match) {
            itemsWithNotes.add(match[1]);
          }
        });
        setBatchItemsWithNotes(itemsWithNotes);
      }
    } catch (error) {
      console.error('Error cargando notas:', error);
    }
  };

  const getSalidas = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/lotes")
      const { data } = await response.json()
      setSalidas(data)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getSalidas()
  }, [])

  // Cargar notas cuando se monta el componente
  useEffect(() => {
    loadBatchItemsNotes()
  }, [])

  // Recarga automática cuando se crea un pedido o salida
  useEffect(() => {
    if (shouldUpdateBitacora) {
      getSalidas().then(() => markUpdated('bitacora'))
      loadBatchItemsNotes() // También recargar notas
    }
  }, [shouldUpdateBitacora, markUpdated])

  const handleAssignSubmit = async () => {
    if (!selectedOrderItem || !assignQuantity || !selectedBatchItem) {
      alert('Por favor complete todos los campos')
      return
    }

    const quantity = parseInt(assignQuantity)
    if (quantity <= 0) {
      alert('La cantidad debe ser mayor a 0')
      return
    }

    try {
      const result = await assignBatchToOrder({
        batchItemId: selectedBatchItem.id,
        orderItemId: selectedOrderItem.id,
        quantity: quantity
      })

      if (result.success) {
        alert('Salida asignada al pedido exitosamente')
        setShowAssignModal(false)
        setSelectedBatchItem(null)
        setPendingOrders([])
        setSelectedOrderItem(null)
        setAssignQuantity('')
        getSalidas() // Recargar datos
      } else {
        alert('Error al asignar: ' + result.error)
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error al asignar salida al pedido')
    }
  }

  // Preparar datos para la tabla
  const prepareTableData = (): TableRow[] => {
    const tableRows: TableRow[] = []

    salidas?.batches?.forEach((batch: Batch) => {
      batch.containers?.forEach((container: Container) => {
        container.batchItems?.forEach((item: BatchItem) => {
          const fecha = new Date(batch.createdAt)

          // Si hay pedidos asignados, crear una fila por cada pedido
          if (item.batchItemOrderItems && item.batchItemOrderItems.length > 0) {
            item.batchItemOrderItems.forEach((bioi) => {
              tableRows.push({
                folio: batch.batchNumber,
                area: item.product.area.name,
                clave: item.product.code,
                pedido: bioi.orderItem.order.orderNumber,
                lote: batch.name,
                fecha: fecha.toLocaleDateString('es-ES'),
                hora: fecha.toLocaleTimeString('es-ES', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true
                }),
                cantidad: bioi.quantity, // Mostrar la cantidad asignada a este pedido específico
                cantidadProducto: item.product.quantity || 0, // Cantidad del producto
                id: item.id,
                productId: item.product.id,
                batchItem: item, // Guardar referencia al batch item completo
                container: container, // Guardar referencia al container
                batch: batch // Guardar referencia al batch
              })
            })
          } else {
            // Si no hay pedidos asignados, crear una fila con "Sin asignar"
            tableRows.push({
              folio: batch.batchNumber,
              area: item.product.area.name,
              clave: item.product.code,
              pedido: 'Sin asignar',
              lote: batch.name,
              fecha: fecha.toLocaleDateString('es-ES'),
              hora: fecha.toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
              }),
              cantidad: item.quantity,
              cantidadProducto: item.product.quantity || 0, // Cantidad del producto
              id: item.id,
              productId: item.product.id,
              batchItem: item, // Guardar referencia al batch item completo
              container: container, // Guardar referencia al container
              batch: batch // Guardar referencia al batch
            })
          }
        })
      })
    })

    return tableRows
  }

  // Aplicar filtros
  useEffect(() => {
    const allData = prepareTableData()
    let filtered = [...allData]

    // Filtro por término de búsqueda general
    if (searchTerm) {
      filtered = filtered.filter(row =>
        Object.values(row).some(value =>
          value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    }

    // Filtro por fecha
    if (filtroFecha) {
      filtered = filtered.filter(row => row.fecha.includes(filtroFecha))
    }

    // Filtro por clave
    if (filtroClave) {
      filtered = filtered.filter(row =>
        row.clave.toLowerCase().includes(filtroClave.toLowerCase())
      )
    }

    // Filtro por pedido
    if (filtroPedido) {
      filtered = filtered.filter(row =>
        row.pedido.toLowerCase().includes(filtroPedido.toLowerCase())
      )
    }

    // Filtro por lote
    if (filtroLote) {
      filtered = filtered.filter(row =>
        row.lote.toLowerCase().includes(filtroLote.toLowerCase())
      )
    }

    setFilteredData(filtered)
  }, [salidas, searchTerm, filtroFecha, filtroClave, filtroPedido, filtroLote])

  const columns = [
    { key: 'folio', title: 'FOLIO', width: 'w-24' },
    { key: 'area', title: 'AREA', width: 'w-20' },
    { key: 'clave', title: 'CLAVE', width: 'w-16' },
    { key: 'pedido', title: 'PEDIDO', width: 'w-20' },
    { key: 'lote', title: 'LOTE', width: 'w-16' },
    { key: 'fecha', title: 'FECHA', width: 'w-20' },
    { key: 'hora', title: 'HORA', width: 'w-16' },
    { key: 'cantidad', title: 'CANT. ASIGNADA', width: 'w-24' },
    { key: 'paquetesSalidos', title: 'PAQUETES SALIDOS', width: 'w-24' },
    { key: 'otros', title: 'OTROS', width: 'w-20' }
  ]

  const tableBody = filteredData.map((row, index) => (
    <motion.tr
      key={index}
      className={`border-b ${index % 2 === 0 ? 'bg-white' : 'bg-[#F4F4F7]'}`}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <td className="px-3 py-4 text-sm text-left">{row.folio}</td>
      <td className="px-3 py-4 text-sm text-left">{row.area}</td>
      <td className="px-3 py-4 text-sm text-left">{row.clave}</td>
      <td className="px-3 py-4 text-sm text-left">{row.pedido || 'Sin asignar'}</td>
      <td className="px-3 py-4 text-sm text-left">{row.lote}</td>
      <td className="px-3 py-4 text-sm text-left">{row.fecha}</td>
      <td className="px-3 py-4 text-sm text-left">{row.hora}</td>
      <td className="px-3 py-4 text-sm text-right">{row.cantidad.toLocaleString()}</td>
      <td className="px-3 py-4 text-sm text-right">{row.cantidadProducto > 0 ? Math.floor(row.cantidad / row.cantidadProducto).toLocaleString() : '-'}</td>
      <td className="px-3 py-4 text-sm text-center">
        <div className="flex items-center space-x-2 justify-center">
          <motion.div
            whileHover={{ scale: 1.2, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            transition={{ duration: 0.2 }}
            onClick={() => handleOpenNotes(row.batchItem)}
          >
            <FaStickyNote className={`cursor-pointer ${batchItemsWithNotes.has(row.id) ? 'text-yellow-500' : 'text-gray-400'}`} title={batchItemsWithNotes.has(row.id) ? 'Ver/Editar Nota' : 'Agregar Nota'} />
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.2, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            transition={{ duration: 0.2 }}
            onClick={() => handleDownloadPDF(row)}
          >
            <FaFilePdf className="text-red-500 cursor-pointer" title="Descargar PDF de la salida" />
          </motion.div>
          {/* <motion.div
            whileHover={{ scale: 1.2, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            <FaEdit className="text-blue-500 cursor-pointer" title="Editar" />
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.2, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            <FaTrash className="text-red-500 cursor-pointer" title="Eliminar" />
          </motion.div> */}
        </div>
      </td>
    </motion.tr>
  ))

  // Opciones para los filtros
  const fechasUnicas = [...new Set(prepareTableData().map(row => row.fecha))]
  const clavesUnicas = [...new Set(prepareTableData().map(row => row.clave))]
  const pedidosUnicos = [...new Set(prepareTableData().map(row => row.pedido))]
  const lotesUnicos = [...new Set(prepareTableData().map(row => row.lote))]

  return (
    <motion.div
      className="min-h-screen bg-[#F4F4F7] flex items-start justify-center px-2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="w-full p-8">
        <motion.div
          className="bg-white p-8 rounded-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Barra superior con filtros y buscador */}
          <motion.div
            className="flex justify-between items-center mb-6"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            {/* Filtros dropdown */}
            <div className="flex space-x-4">
              <div className='w-[150px]'>
                <Select
                  options={fechasUnicas.map(fecha => ({ value: fecha, label: fecha }))}
                  placeholder="Fecha"
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFiltroFecha(e.target.value)}
                  value={filtroFecha}
                  className="border-[#2a3182] border-2 w-[400px]"
                  label=""
                  name="fecha"
                  id="fecha"
                  required={false}
                  disabled={false}
                  defaultValue=""
                />
              </div>
              <div className='w-[150px]'>
                <Select
                  options={clavesUnicas.map(clave => ({ value: clave, label: clave }))}
                  placeholder="Clave"
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFiltroClave(e.target.value)}
                  value={filtroClave}
                  className="border-[#2a3182] border-2 w-[400px]"
                  label=""
                  name="clave"
                  id="clave"
                  required={false}
                  disabled={false}
                  defaultValue=""
                />
              </div>

              <div className='w-[150px]'>
                <Select
                  options={pedidosUnicos.map(pedido => ({ value: pedido, label: pedido }))}
                  placeholder="Pedido"
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFiltroPedido(e.target.value)}
                  value={filtroPedido}
                  className="border-[#2a3182] border-2"
                  label=""
                  name="pedido"
                  id="pedido"
                  required={false}
                  disabled={false}
                  defaultValue=""
                />
              </div>
              <div className='w-[150px]'>
                <Select
                  options={lotesUnicos.map(lote => ({ value: lote, label: lote }))}
                  placeholder="Lote"
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFiltroLote(e.target.value)}
                  value={filtroLote}
                  className="border-[#2a3182] border-2"
                  label=""
                  name="lote"
                  id="lote"
                  required={false}
                  disabled={false}
                  defaultValue=""
                />
              </div>
            </div>

            {/* Buscador */}
            <div className="relative w-[400px]">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border-[#2a3182] w-full border-2 rounded-lg outline-none text-black"
              />
            </div>
          </motion.div>

          {/* Tabla */}
          {loading ? (
            <motion.div
              className="space-y-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {[...Array(6)].map((_, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center space-x-4 p-4 bg-gray-100 rounded-lg"
                >
                  <div className="h-4 bg-gray-300 rounded w-20 animate-pulse"></div>
                  <div className="h-4 bg-gray-300 rounded w-32 animate-pulse"></div>
                  <div className="h-4 bg-gray-300 rounded w-24 animate-pulse"></div>
                  <div className="h-4 bg-gray-300 rounded w-40 animate-pulse"></div>
                </motion.div>
              ))}
            </motion.div>
          ) : filteredData.length > 0 ? (
            <motion.div
              className="rounded-[8px] overflow-hidden border border-[#E5E7EB]"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.5 }}
            >
              <table className="min-w-full text-base table-fixed">
                <thead>
                  <tr className="bg-[#2A3182] text-white">
                    {columns.map((column, index) => (
                      <th key={index} className={`py-2 px-3 font-bold ${column.width} ${column.key === 'otros' ? 'text-center' :
                        column.key === 'cantidad' || column.key === 'paquetesSalidos' ? 'text-right' :
                          'text-left'
                        }`}>
                        {column.title}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tableBody}
                </tbody>
              </table>
            </motion.div>
          ) : (
            <motion.div
              className="text-center py-8 text-gray-500 bg-white rounded-lg border"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              {salidas?.batches && salidas.batches.length > 0
                ? 'No se encontraron resultados con los filtros aplicados'
                : 'No hay datos de salidas disponibles'
              }
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Modal de Asignación */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-[#2A3182]">
              Asignar Salida a Pedido
            </h2>

            {selectedBatchItem && (
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-2">Información de la Salida:</h3>
                <p><strong>Producto:</strong> {selectedBatchItem.product.name}</p>
                <p><strong>Código:</strong> {selectedBatchItem.product.code}</p>
                <p><strong>Cantidad Disponible:</strong> {selectedBatchItem.quantity.toLocaleString()}</p>
                <p><strong>Lote:</strong> {selectedBatchItem.container.batch.batchNumber}</p>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Seleccionar Pedido:</label>
              <select
                className="w-full p-2 border border-gray-300 rounded-lg"
                onChange={(e) => {
                  const orderItem = pendingOrders
                    .flatMap(order => order.orderItems)
                    .find(item => item.id === e.target.value)
                  setSelectedOrderItem(orderItem)
                }}
                value={selectedOrderItem?.id || ''}
              >
                <option value="">Seleccione un pedido...</option>
                {pendingOrders.map((order) => (
                  <optgroup key={order.id} label={`Pedido: ${order.orderNumber} (${order.status})`}>
                    {order.orderItems.map((item: any) => {
                      const pendingQty = item.quantity - (item.completedQuantity || 0)
                      return (
                        <option key={item.id} value={item.id}>
                          {item.product.name} - Pendiente: {pendingQty.toLocaleString()} / Total: {item.quantity.toLocaleString()}
                        </option>
                      )
                    })}
                  </optgroup>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Cantidad a Asignar:</label>
              <input
                type="number"
                className="w-full p-2 border border-gray-300 rounded-lg"
                value={assignQuantity}
                onChange={(e) => setAssignQuantity(e.target.value)}
                placeholder="Ingrese la cantidad"
                min="1"
                max={selectedBatchItem?.quantity || 0}
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowAssignModal(false)
                  setSelectedBatchItem(null)
                  setPendingOrders([])
                  setSelectedOrderItem(null)
                  setAssignQuantity('')
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleAssignSubmit}
                disabled={assignLoading || !selectedOrderItem || !assignQuantity}
                className="px-4 py-2 bg-[#2A3182] text-white rounded-lg hover:bg-[#1a1f5a] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {assignLoading ? 'Asignando...' : 'Asignar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Notas */}
      <NotesModal
        isOpen={showNotesModal}
        onClose={handleCloseNotes}
        batchItem={selectedBatchItemForNotes}
        onNoteAdded={() => {
          // Recargar notas para actualizar el estado de los iconos
          loadBatchItemsNotes()
        }}
      />
    </motion.div>
  )
}

export default page