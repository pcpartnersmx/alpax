'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import { useProducts } from '@/hooks/useProducts'
import { useOrders } from '@/hooks/useOrders'
import { Product } from '@/hooks/useProducts'
import { Order } from '@/types/pedido'
import { FaBoxOpen, FaPlus } from 'react-icons/fa'
import Modal from '../components/Essentials/Modal'

interface Area {
    id: string;
    name: string;
    description?: string;
    status: string;
    createdAt: string;
    updatedAt: string;
}

function DownloadIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline align-middle"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
    )
}

function RefreshIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline align-middle"><polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0 1 14.13-3.36L23 10M1 14l5.36 5.36A9 9 0 0 0 20.49 15" /></svg>
    )
}

// Skeleton loader component for products table
const ProductsTableSkeleton = () => (
    <div className="space-y-3">
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
    </div>
)

// Skeleton loader component for orders table
const OrdersTableSkeleton = () => (
    <div className="space-y-3">
        {[...Array(4)].map((_, index) => (
            <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center space-x-4 p-4 bg-gray-100 rounded-lg"
            >
                <div className="h-4 bg-gray-300 rounded w-24 animate-pulse"></div>
                <div className="h-4 bg-gray-300 rounded w-20 animate-pulse"></div>
                <div className="h-4 bg-gray-300 rounded w-16 animate-pulse"></div>
                <div className="h-4 bg-gray-300 rounded w-20 animate-pulse"></div>
            </motion.div>
        ))}
    </div>
)

export default function ResumenPage() {
    const { getProducts, loading: productsLoading } = useProducts()
    const { getOrders, loading: ordersLoading } = useOrders()

    const [products, setProducts] = useState<Product[]>([])
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(false)

    // Estados para crear productos
    const [showModal, setShowModal] = useState(false)
    const [name, setName] = useState('')
    const [code, setCode] = useState('')
    const [areaId, setAreaId] = useState('')
    const [description, setDescription] = useState('')
    const [areas, setAreas] = useState<Area[]>([])
    const [showAreaModal, setShowAreaModal] = useState(false)
    const [newAreaName, setNewAreaName] = useState('')
    const [newAreaDescription, setNewAreaDescription] = useState('')

    // Fetch products and all orders on component mount
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            try {
                // Fetch products
                const productsResponse = await getProducts()
                if (productsResponse.success) {
                    setProducts(productsResponse.data)
                } else {
                    console.error('Error fetching products:', productsResponse.error)
                }

                // Fetch all orders (without product filter)
                const ordersResponse = await getOrders({})
                if (ordersResponse.success) {
                    setOrders(ordersResponse.data)
                } else {
                    console.error('Error fetching orders:', ordersResponse.error)
                    setOrders([])
                }

                // Fetch areas
                const areasResponse = await fetch('/api/areas')
                if (areasResponse.ok) {
                    const areasResult = await areasResponse.json()
                    if (areasResult.success) {
                        setAreas(areasResult.data)
                    } else {
                        console.error('Error en la respuesta de áreas:', areasResult.message)
                    }
                } else {
                    console.error('Error en la petición de áreas:', areasResponse.status)
                }
            } catch (error) {
                console.error('Error fetching data:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    // Fetch orders when a product is selected
    const handleProductClick = async (product: Product) => {
        setSelectedProduct(product)
        setLoading(true)

        try {
            const response = await getOrders({ productId: product.id })
            if (response.success) {
                setOrders(response.data)
            } else {
                console.error('Error fetching orders:', response.error)
                setOrders([])
            }
        } catch (error) {
            console.error('Error fetching orders:', error)
            setOrders([])
        } finally {
            setLoading(false)
        }
    }

    const handleRefresh = async () => {
        setLoading(true)
        setSelectedProduct(null) // Deseleccionar el producto
        try {
            const response = await getProducts()
            if (response.success) {
                setProducts(response.data)
            }
            // Cargar todos los pedidos (sin filtro de producto)
            const ordersResponse = await getOrders({})
            if (ordersResponse.success) {
                setOrders(ordersResponse.data)
            }
        } catch (error) {
            console.error('Error refreshing data:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleDownloadPDF = async () => {
        if (!selectedProduct) {
            alert('Por favor selecciona un producto para descargar el PDF')
            return
        }

        try {
            setLoading(true)

            // Create PDF content
            const pdfContent = {
                product: selectedProduct,
                orders: orders,
                generatedAt: new Date().toLocaleString('es-ES')
            }

            // Call the PDF generation API
            const response = await fetch('/api/pedido/pdf-generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(pdfContent)
            })

            if (response.ok) {
                // Get the PDF blob
                const blob = await response.blob()

                // Create download link
                const url = window.URL.createObjectURL(blob)
                const link = document.createElement('a')
                link.href = url
                link.download = `pedidos-${selectedProduct.code}-${new Date().toISOString().split('T')[0]}.pdf`
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
                window.URL.revokeObjectURL(url)
            } else {
                // Try to get error message from response
                let errorMessage = 'Error al generar el PDF'
                try {
                    const errorData = await response.json()
                    errorMessage = errorData.error || errorMessage
                } catch {
                    // If response is not JSON, use default message
                }
                alert(errorMessage)
            }
        } catch (error) {
            console.error('Error downloading PDF:', error)
            alert('Error al descargar el PDF')
        } finally {
            setLoading(false)
        }
    }

    // Funciones para crear productos
    const handleAddProduct = () => {
        setShowModal(true)
    }

    const handleCloseModal = () => {
        setShowModal(false)
        setName('')
        setCode('')
        setAreaId('')
        setDescription('')
    }

    const reloadProductos = async () => {
        try {
            const response = await getProducts()
            if (response.success) {
                setProducts(response.data)
            }
        } catch (error) {
            console.error('Error reloading productos:', error)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const response = await fetch('/api/productos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name,
                    code,
                    areaId,
                    description
                }),
            })

            if (response.ok) {
                const result = await response.json()
                // Recargar la lista completa para asegurar consistencia
                await reloadProductos()
                handleCloseModal()
                // Mostrar mensaje de éxito
                toast.success('Producto creado exitosamente')
            } else {
                const error = await response.json()
                toast.error(error.error || 'Error al crear el producto')
            }
        } catch (error) {
            console.error('Error creating product:', error)
            toast.error('Error al crear el producto')
        }
    }

    const handleCreateArea = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const response = await fetch('/api/areas', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: newAreaName,
                    description: newAreaDescription
                }),
            })

            if (response.ok) {
                const result = await response.json()
                if (result.success) {
                    // Recargar las áreas
                    const areasResponse = await fetch('/api/areas')
                    if (areasResponse.ok) {
                        const areasResult = await areasResponse.json()
                        if (areasResult.success) {
                            setAreas(areasResult.data)
                        }
                    }
                    setShowAreaModal(false)
                    setNewAreaName('')
                    setNewAreaDescription('')
                    toast.success('Área creada exitosamente')
                }
            } else {
                const error = await response.json()
                toast.error(error.error || 'Error al crear el área')
            }
        } catch (error) {
            console.error('Error creating area:', error)
            toast.error('Error al crear el área')
        }
    }

    return (
        <motion.div
            className="min-h-screen bg-[#F4F4F7] flex items-start justify-center px-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <div className="w-full p-8">
                <motion.div
                    className="flex gap-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    {/* Columna principal - Productos */}
                    <motion.div
                        className="flex-1 bg-white p-8 rounded-lg"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                    >
                        <motion.div
                            className="flex items-center gap-4 mb-4"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.4 }}
                        >
                            <h2 className="text-xl font-bold text-[#2A3182]">Productos</h2>
                            <div className="flex-1" />

                            <motion.button
                                className="flex items-center cursor-pointer gap-2 bg-[#2A3182] hover:bg-[#23285e] text-white px-5 h-10 rounded-[8px] text-base font-semibold shadow-sm"
                                onClick={handleDownloadPDF}
                                disabled={loading || !selectedProduct}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <DownloadIcon />
                                <span>Descargar</span>
                            </motion.button>

                            <motion.button
                                className="flex items-center cursor-pointer gap-2 bg-[#2A3182] hover:bg-[#23285e] text-white px-5 h-10 rounded-[8px] text-base font-semibold shadow-sm"
                                onClick={handleRefresh}
                                disabled={loading}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <RefreshIcon />
                                <span>Actualizar</span>
                            </motion.button>

                            <motion.button
                                className="flex items-center cursor-pointer gap-2 bg-[#2A3182] hover:bg-[#23285e] text-white px-5 h-10 rounded-[8px] text-base font-semibold shadow-sm"
                                onClick={handleAddProduct}
                                disabled={loading}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <FaPlus />
                                <span>Nuevo producto</span>
                            </motion.button>
                        </motion.div>

                        {loading && productsLoading ? (
                            <ProductsTableSkeleton />
                        ) : (
                            <motion.div
                                className="rounded-[8px] overflow-hidden border border-[#E5E7EB]"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.4, delay: 0.5 }}
                            >
                                <table className="min-w-full text-base">
                                    <thead>
                                        <tr className="bg-[#2A3182] text-white">
                                            <th className="py-2 px-4 text-left font-bold">CÓDIGO</th>
                                            <th className="py-2 px-4 text-left font-bold">NOMBRE</th>
                                            <th className="py-2 px-4 text-left font-bold">ÁREA</th>
                                            <th className="py-2 px-4 text-left font-bold">DESCRIPCIÓN</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {products.map((product, i) => (
                                            <motion.tr
                                                key={product.id}
                                                className={`cursor-pointer hover:bg-[#E6E5B6] transition-colors ${selectedProduct?.id === product.id ? 'bg-[#E6E5B6]' :
                                                    i % 2 === 0 ? 'bg-white' : 'bg-[#F4F4F7]'
                                                    }`}
                                                onClick={() => handleProductClick(product)}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.6 + (i * 0.05) }}
                                                whileHover={{ scale: 1.01 }}
                                            >
                                                <td className="py-2 px-4 align-middle font-medium">{product.code}</td>
                                                <td className="py-2 px-4 align-middle">{product.name}</td>
                                                <td className="py-2 px-4 align-middle">{product.area}</td>
                                                <td className="py-2 px-4 align-middle">{product.description || '-'}</td>
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                            </motion.div>
                        )}

                        {products.length === 0 && !loading && (
                            <motion.div
                                className="text-center py-8 text-gray-500"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.7 }}
                            >
                                No hay productos disponibles
                            </motion.div>
                        )}
                    </motion.div>

                    {/* Columna pedidos - STICKY */}
                    <motion.div
                        className="w-[480px] min-w-[350px] bg-white p-8 rounded-lg sticky top-20 self-start"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                    >
                        <motion.div
                            className="mb-4"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.5 }}
                        >
                            <h2 className="text-xl font-bold text-[#2A3182] mb-2">
                                Pedidos {selectedProduct ? `- ${selectedProduct.name}` : ''}
                            </h2>
                            {selectedProduct && (
                                <motion.p
                                    className="text-sm text-gray-600 mb-4"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.6 }}
                                >
                                    Mostrando pedidos que contienen el producto: <strong>{selectedProduct.code}</strong>
                                </motion.p>
                            )}
                        </motion.div>

                        {selectedProduct === null ? (
                            <motion.div
                                className="flex flex-col items-center justify-center w-full h-full"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.4 }}
                            >
                                <span className="text-xl text-[#8c8cb2] mb-4">Selecciona un producto para ver información</span>
                                <FaBoxOpen size={80} className="text-[#8c8cb2]" />
                            </motion.div>
                        ) : (
                            loading && ordersLoading ? (
                                <OrdersTableSkeleton />
                            ) : (
                                <motion.div
                                    className="rounded-[8px] overflow-hidden border border-[#E5E7EB]"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.4, delay: 0.7 }}
                                >
                                    <table className="min-w-full text-base">
                                        <thead>
                                            <tr className="bg-[#8B8B8B] text-white">
                                                <th className="py-2 px-4 text-left font-bold">NÚMERO</th>
                                                <th className="py-2 px-4 text-left font-bold">ESTADO</th>
                                                <th className="py-2 px-4 text-left font-bold">CANTIDAD</th>
                                                <th className="py-2 px-4 text-left font-bold">FECHA</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {orders.map((order, i) => {
                                                // Find the specific item for this product if one is selected
                                                const productItem = selectedProduct
                                                    ? order.orderItems.find(item => item.productId === selectedProduct.id)
                                                    : null
                                                return (
                                                    <motion.tr
                                                        key={order.id}
                                                        className={i % 2 === 0 ? 'bg-white' : 'bg-[#F4F4F7]'}
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: 0.8 + (i * 0.05) }}
                                                        whileHover={{ scale: 1.01 }}
                                                    >
                                                        <td className="py-2 px-4 align-middle font-medium">{order.orderNumber}</td>
                                                        <td className="py-2 px-4 align-middle">
                                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                                                order.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                                                                    order.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                                                        'bg-red-100 text-red-800'
                                                                }`}>
                                                                {order.status === 'PENDING' ? 'PENDIENTE' :
                                                                    order.status === 'IN_PROGRESS' ? 'EN PROCESO' :
                                                                        order.status === 'COMPLETED' ? 'COMPLETADO' :
                                                                            'CANCELADO'}
                                                            </span>
                                                        </td>
                                                        <td className="py-2 px-4 align-middle">
                                                            {selectedProduct
                                                                ? (productItem?.quantity || 0)
                                                                : order.orderItems.reduce((total, item) => total + item.quantity, 0)
                                                            }
                                                        </td>
                                                        <td className="py-2 px-4 align-middle text-sm">
                                                            {new Date(order.createdAt).toLocaleDateString('es-ES')}
                                                        </td>
                                                    </motion.tr>
                                                )
                                            })}
                                        </tbody>
                                    </table>
                                </motion.div>
                            )
                        )}

                        {orders.length === 0 && !loading && (
                            <motion.div
                                className="text-center py-8 text-gray-500"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.9 }}
                            >
                                No hay pedidos para este producto
                            </motion.div>
                        )}
                    </motion.div>
                </motion.div>
            </div>

            {/* Modal para crear productos */}
            {showModal && (
                <Modal
                    title="Nuevo Registro"
                    message="Complete los datos del nuevo producto"
                    size="md"
                    className="w-[25%] max-h-[90vh] overflow-y-auto"
                    onClose={handleCloseModal}
                    body={
                        <div className="w-full text-left">
                            <form onSubmit={handleSubmit}>
                                <motion.div
                                    className="mb-4"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    <label className="block text-gray-700 font-semibold mb-1">Área</label>
                                    <div className="flex gap-2">
                                        <select
                                            className="flex-1 px-3 py-2 border rounded bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#2A3182] focus:border-transparent"
                                            value={areaId}
                                            onChange={e => setAreaId(e.target.value)}
                                            required
                                        >
                                            <option value="">Seleccionar área</option>
                                            {areas.map((area) => (
                                                <option key={area.id} value={area.id}>
                                                    {area.name}
                                                </option>
                                            ))}
                                        </select>
                                        <motion.button
                                            type="button"
                                            className="px-3 py-2 bg-[#2A3182] text-white rounded hover:bg-[#23285e] transition-colors duration-150"
                                            onClick={() => setShowAreaModal(true)}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            <FaPlus className="h-4 w-4" />
                                        </motion.button>
                                    </div>
                                </motion.div>
                                <motion.div
                                    className="mb-4"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4 }}
                                >
                                    <label className="block text-gray-700 font-semibold mb-1">Nombre del Producto</label>
                                    <input
                                        className="w-full px-3 py-2 border rounded bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#2A3182] focus:border-transparent"
                                        type="text"
                                        placeholder="Nombre del producto"
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        required
                                    />
                                </motion.div>
                                <motion.div
                                    className="mb-4"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.5 }}
                                >
                                    <label className="block text-gray-700 font-semibold mb-1">Código</label>
                                    <input
                                        className="w-full px-3 py-2 border rounded bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#2A3182] focus:border-transparent"
                                        type="text"
                                        placeholder="Código"
                                        value={code}
                                        onChange={e => setCode(e.target.value)}
                                        required
                                    />
                                </motion.div>
                                <motion.div
                                    className="mb-4"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.6 }}
                                >
                                    <label className="block text-gray-700 font-semibold mb-1">Descripción</label>
                                    <textarea
                                        className="w-full px-3 py-2 border rounded bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#2A3182] focus:border-transparent"
                                        placeholder="Descripción (opcional)"
                                        value={description}
                                        onChange={e => setDescription(e.target.value)}
                                        rows={3}
                                    />
                                </motion.div>
                                <motion.div
                                    className="flex justify-end gap-4"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.7 }}
                                >
                                    <motion.button
                                        type="button"
                                        className="text-gray-500 px-4 py-2 rounded hover:bg-gray-100"
                                        onClick={handleCloseModal}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        Cancelar
                                    </motion.button>
                                    <motion.button
                                        type="submit"
                                        className="bg-[#2A3182] text-white px-6 py-2 rounded-lg hover:bg-[#23285e]"
                                        whileHover={{ scale: 1.05, y: -2 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        Agregar
                                    </motion.button>
                                </motion.div>
                            </form>
                        </div>
                    }
                />
            )}

            {/* Modal para crear áreas */}
            {showAreaModal && (
                <Modal
                    title="Nueva Área"
                    message="Complete los datos de la nueva área"
                    size="md"
                    className="w-[25%] max-h-[90vh] overflow-y-auto"
                    onClose={() => {
                        setShowAreaModal(false);
                        setNewAreaName('');
                        setNewAreaDescription('');
                    }}
                    body={
                        <div className="w-full text-left">
                            <form onSubmit={handleCreateArea}>
                                <motion.div
                                    className="mb-4"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    <label className="block text-gray-700 font-semibold mb-1">Nombre del Área</label>
                                    <input
                                        className="w-full px-3 py-2 border rounded bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#2A3182] focus:border-transparent"
                                        type="text"
                                        placeholder="Nombre del área"
                                        value={newAreaName}
                                        onChange={e => setNewAreaName(e.target.value)}
                                        required
                                    />
                                </motion.div>
                                <motion.div
                                    className="mb-4"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4 }}
                                >
                                    <label className="block text-gray-700 font-semibold mb-1">Descripción</label>
                                    <textarea
                                        className="w-full px-3 py-2 border rounded bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#2A3182] focus:border-transparent"
                                        placeholder="Descripción (opcional)"
                                        value={newAreaDescription}
                                        onChange={e => setNewAreaDescription(e.target.value)}
                                        rows={3}
                                    />
                                </motion.div>
                                <motion.div
                                    className="flex justify-end gap-4"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                >
                                    <motion.button
                                        type="button"
                                        className="text-gray-500 px-4 py-2 rounded hover:bg-gray-100"
                                        onClick={() => {
                                            setShowAreaModal(false);
                                            setNewAreaName('');
                                            setNewAreaDescription('');
                                        }}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        Cancelar
                                    </motion.button>
                                    <motion.button
                                        type="submit"
                                        className="bg-[#2A3182] text-white px-6 py-2 rounded-lg hover:bg-[#23285e]"
                                        whileHover={{ scale: 1.05, y: -2 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        Crear Área
                                    </motion.button>
                                </motion.div>
                            </form>
                        </div>
                    }
                />
            )}
        </motion.div>
    )
}

