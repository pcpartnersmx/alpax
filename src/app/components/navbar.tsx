'use client'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { toast } from 'react-toastify'
import Modal from './Essentials/Modal'
import Input from './Essentials/Input'
import Select from './Essentials/Select'
import Table from './Essentials/Table'
import TagsInput from './Essentials/TagsInput'
import { Combobox } from './ui/combobox'
import { FaFile, FaFileUpload, FaPlus, FaSpinner, FaTrash, FaTimes } from 'react-icons/fa'
import { useOrders } from '@/hooks/useOrders'
import { useBatches } from '@/hooks/useBatches'
import { useUpdate } from '@/contexts/UpdateContext'
import AssignmentSummaryModal from './AssignmentSummaryModal'


const Navbar = () => {
    const pathname = usePathname();
    const { data: session, status } = useSession();
    const { createOrder, loading: orderLoading } = useOrders();
    const { createBatch, loading: batchLoading } = useBatches();
    const { triggerUpdate } = useUpdate();
    const [showPedidoModal, setShowPedidoModal] = useState(false);
    const [showLoteModal, setShowLoteModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState<{
        producto: string;
        lote: string;
        cantidad: string;
        contenedores: string[];
    }>({
        producto: '',
        lote: '',
        cantidad: '',
        contenedores: []
    });
    const [batchNumber, setBatchNumber] = useState<string>('');
    const [loteItems, setLoteItems] = useState<{
        producto: string;
        lote: string;
        cantidad: string;
        contenedores: string[];
        codigo: string;
        id: string;
        productName: string;
    }[]>([]);
    const [errors, setErrors] = useState({
        producto: '',
        lote: '',
        cantidad: '',
        contenedores: ''
    });
    const [pedidoForm, setPedidoForm] = useState<{ numeroPedido: string; producto: string; cantidad: string }>({
        numeroPedido: '',
        producto: '',
        cantidad: ''
    });
    const [pedidoErrors, setPedidoErrors] = useState<{ numeroPedido: string; producto: string; cantidad: string }>({
        numeroPedido: '',
        producto: '',
        cantidad: ''
    });
    const [pedidoItems, setPedidoItems] = useState<{ producto: string; cantidad: string; codigo: string; id: string }[]>([]);
    const [productos, setProductos] = useState<{ id: string; code: string; name: string; area: string }[]>([]);
    const [loadingProductos, setLoadingProductos] = useState(false);
    const [archivoPDF, setArchivoPDF] = useState<File | null>(null);
    const [archivoNombre, setArchivoNombre] = useState<string>("");
    const [isDragOver, setIsDragOver] = useState(false);

    // Fetch productos from API
    useEffect(() => {
        const fetchProductos = async () => {
            setLoadingProductos(true);
            try {
                const response = await fetch('/api/productos');
                if (response.ok) {
                    const data = await response.json();
                    if (data.success) {
                        setProductos(data.data);
                    } else {
                        console.error('Error fetching productos:', data.error);
                    }
                } else {
                    console.error('Error fetching productos:', response.statusText);
                }
            } catch (error) {
                console.error('Error fetching productos:', error);
            } finally {
                setLoadingProductos(false);
            }
        };

        fetchProductos();
    }, []);

    // Remove auto-add effect - we'll handle adding products manually

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        if (!e || !e.target) return;
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user types
        setErrors(prev => ({
            ...prev,
            [name]: ''
        }));
    };

    const validateForm = () => {
        const newErrors = {
            producto: '',
            lote: '',
            cantidad: '',
            contenedores: ''
        };
        let isValid = true;

        if (!formData.producto) {
            newErrors.producto = 'Debe seleccionar un producto';
            isValid = false;
        }
        if (!formData.lote) {
            newErrors.lote = 'El lote es requerido';
            isValid = false;
        }
        if (!formData.cantidad || isNaN(Number(formData.cantidad)) || Number(formData.cantidad) <= 0) {
            newErrors.cantidad = 'Ingrese una cantidad válida';
            isValid = false;
        }
        if (!formData.contenedores || formData.contenedores.length === 0) {
            newErrors.contenedores = 'Debe agregar al menos un contenedor';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleAddLoteItem = () => {
        let valid = true;
        let errors = { producto: '', lote: '', cantidad: '', contenedores: '' };

        if (!formData.producto) {
            errors.producto = 'Seleccione un producto';
            valid = false;
        }
        if (!formData.lote || formData.lote.trim() === '') {
            errors.lote = 'El lote es requerido';
            valid = false;
        }
        if (!formData.cantidad || isNaN(Number(formData.cantidad)) || Number(formData.cantidad) <= 0) {
            errors.cantidad = 'Ingrese una cantidad válida';
            valid = false;
        }
        if (!formData.contenedores || formData.contenedores.length === 0) {
            errors.contenedores = 'Debe agregar al menos un contenedor';
            valid = false;
        }

        setErrors(errors);
        if (!valid) return;

        const productoObj = productos.find(p => p.id === formData.producto);

        setLoteItems(prev => [
            ...prev,
            {
                producto: productoObj ? productoObj.name : '',
                lote: formData.lote,
                cantidad: formData.cantidad,
                contenedores: [...formData.contenedores],
                codigo: productoObj ? productoObj.code : '',
                id: formData.producto,
                productName: productoObj ? productoObj.name : ''
            }
        ]);

        // Limpiar lote, cantidad y contenedores, mantener producto
        setFormData(prev => ({ 
            ...prev, 
            lote: '', 
            cantidad: '',
            contenedores: []
        }));
        setErrors(prev => ({ 
            ...prev, 
            lote: '', 
            cantidad: '',
            contenedores: ''
        }));
    };

    const handleRemoveLoteItem = (index: number) => {
        setLoteItems(prev => prev.filter((_, i) => i !== index));
    };

    const handleEditLoteItem = (index: number) => {
        const item = loteItems[index];
        setFormData({
            producto: item.id,
            lote: item.lote,
            cantidad: item.cantidad,
            contenedores: [...item.contenedores]
        });
        // Remove the item being edited
        setLoteItems(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        // Validar que haya productos en el lote
        if (loteItems.length === 0) {
            alert('Debe agregar al menos un producto al lote');
            return;
        }

        // Validar que todos los productos tengan su lote
        const productosSinLote = loteItems.filter(item => !item.lote || item.lote.trim() === '');
        if (productosSinLote.length > 0) {
            toast.error('Todos los productos deben tener un número de lote');
            return;
        }

        setIsSubmitting(true);
        try {
            // Preparar los datos para enviar al API
            const batchData = {
                name: `Salida - ${new Date().toLocaleString()}`,
                description: `Salida creada el ${new Date().toLocaleString()}`,
                items: loteItems.map(item => ({
                    productId: item.id,
                    productCode: item.codigo,
                    productName: item.productName,
                    lotNumber: item.lote,
                    quantity: parseInt(item.cantidad),
                    containers: item.contenedores
                }))
            };

            const result = await createBatch(batchData);

            if (result.success) {
                // Limpiar el formulario y cerrar el modal
                setShowLoteModal(false);
                setFormData({ producto: '', lote: '', cantidad: '', contenedores: [] });
                setLoteItems([]);
                setErrors({ producto: '', lote: '', cantidad: '', contenedores: '' });
                setBatchNumber('');

                // Disparar actualización de todas las páginas
                triggerUpdate('all');

                // Mostrar mensaje de éxito con información de asignaciones
                let successMessage = `${result.data?.totalBatches || 1} lote(s) creado(s) exitosamente`;

                if (result.data?.assignments && result.data.assignments.length > 0) {
                    const totalAssigned = result.data.assignments.reduce((sum: number, assignment: any) =>
                        sum + assignment.assignedQuantity, 0
                    );

                    if (totalAssigned > 0) {
                        successMessage += `\nSe asignaron automáticamente ${totalAssigned.toLocaleString()} unidades a pedidos pendientes`;

                        // Mostrar modal con detalles de asignaciones
                        setAssignmentData({
                            assignments: result.data.assignments,
                            batchNumber: result.data.batchNumber || 'N/A'
                        });
                        setShowAssignmentModal(true);
                    }
                }

                toast.success(successMessage);

                // Generar y descargar PDF
                if (result.data && result.data.batchNumber) {
                    try {
                        const batchNumber = result.data.batchNumber;
                        const pdfData = {
                            batchData: {
                                batchNumber: batchNumber,
                                name: batchData.name,
                                description: batchData.description
                            },
                            items: loteItems.map(item => ({
                                productName: item.productName,
                                productCode: item.codigo,
                                lote: item.lote,
                                quantity: parseInt(item.cantidad),
                                containers: item.contenedores,
                                orderNumber: '3948' // Valor por defecto, se puede modificar si es necesario
                            }))
                        };

                        const pdfResponse = await fetch('/api/lotes/pdf-generate', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(pdfData)
                        });

                        if (pdfResponse.ok) {
                            const pdfBlob = await pdfResponse.blob();
                            const url = window.URL.createObjectURL(pdfBlob);
                            const link = document.createElement('a');
                            link.href = url;
                            link.download = `salida-producto-${batchNumber}-${new Date().toISOString().split('T')[0]}.pdf`;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                            window.URL.revokeObjectURL(url);
                            
                            toast.success('PDF descargado exitosamente');
                        } else {
                            console.error('Error generando PDF');
                            toast.error('Error al generar el PDF');
                        }
                    } catch (pdfError) {
                        console.error('Error descargando PDF:', pdfError);
                        toast.error('Error al descargar el PDF');
                    }
                }
            } else {
                // Mostrar error
                toast.error(`Error al crear los lotes: ${result.error}`);
            }
        } catch (error) {
            console.error('Error al crear los lotes:', error);
            toast.error('Error al crear los lotes. Por favor, inténtalo de nuevo.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handlePedidoInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        if (!e || !e.target) return;
        const { name, value } = e.target;
        setPedidoForm(prev => ({ ...prev, [name]: value }));
        setPedidoErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleAddPedidoItem = () => {
        let valid = true;
        let errors = { numeroPedido: '', producto: '', cantidad: '' };

        if (!pedidoForm.producto) {
            errors.producto = 'Seleccione un producto';
            valid = false;
        }
        if (!pedidoForm.cantidad || isNaN(Number(pedidoForm.cantidad)) || Number(pedidoForm.cantidad) <= 0) {
            errors.cantidad = 'Ingrese una cantidad válida';
            valid = false;
        }

        setPedidoErrors(errors);
        if (!valid) return;

        const productoObj = productos.find(p => p.id === pedidoForm.producto);

        setPedidoItems(prev => [
            ...prev,
            {
                producto: productoObj ? productoObj.name : '',
                cantidad: Number(pedidoForm.cantidad).toLocaleString(),
                codigo: productoObj ? productoObj.code : '',
                id: productoObj ? productoObj.id : ''
            }
        ]);
        // Solo limpiar producto y cantidad, mantener el número de pedido
        setPedidoForm(prev => ({ ...prev, producto: '', cantidad: '' }));
        // Limpiar errores de producto y cantidad
        setPedidoErrors(prev => ({ ...prev, producto: '', cantidad: '' }));
    };

    const handleRemovePedidoItem = (index: number) => {
        const removedItem = pedidoItems[index];
        setPedidoItems(prev => prev.filter((_, i) => i !== index));
        toast.success(`Producto "${removedItem.producto}" eliminado del pedido`);
    };

    const handleSubmitPedido = async () => {
        // Validar número de pedido
        if (!pedidoForm.numeroPedido.trim()) {
            setPedidoErrors(prev => ({ ...prev, numeroPedido: 'El número de pedido es requerido' }));
            return;
        }

        // Validar que haya productos en el pedido
        if (pedidoItems.length === 0) {
            alert('Debe agregar al menos un producto al pedido');
            return;
        }

        setIsSubmitting(true);
        try {
            // Preparar los datos para enviar al API
            const orderData = {
                orderNumber: pedidoForm.numeroPedido.trim(),
                items: pedidoItems.map(item => ({
                    productId: item.id,
                    quantity: parseInt(item.cantidad.replace(/,/g, ''))
                })),
                pdfUrl: archivoNombre ? `/uploads/${archivoNombre}` : undefined
            };

            const result = await createOrder(orderData);

            if (result.success) {
                // Limpiar el formulario y cerrar el modal
                setShowPedidoModal(false);
                setPedidoForm({ numeroPedido: '', producto: '', cantidad: '' });
                setPedidoItems([]);
                setPedidoErrors({ numeroPedido: '', producto: '', cantidad: '' });
                setArchivoPDF(null);
                setArchivoNombre("");
                setPdfString(null);
                setPdfAnalysis(null);

                // Disparar actualización de todas las páginas
                triggerUpdate('all');

                // Mostrar mensaje de éxito
                toast.success('Pedido creado exitosamente');
            } else {
                // Mostrar error
                toast.error(`Error al crear el pedido: ${result.error}`);
            }
        } catch (error) {
            console.error('Error al crear el pedido:', error);
            toast.error('Error al crear el pedido. Por favor, inténtalo de nuevo.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const totalCantidad = pedidoItems.reduce((sum, item) => sum + Number(item.cantidad.replace(/,/g, '')), 0);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const handleDrop = async (e: React.DragEvent) => {
        console.log("mandando pdf")
        e.preventDefault();
        setIsDragOver(false);

        const files = Array.from(e.dataTransfer.files);
        const pdfFile = files.find(file => file.type === 'application/pdf');

        if (pdfFile) {
            setArchivoPDF(pdfFile);
            setArchivoNombre(pdfFile.name);

            // Crear FormData para enviar el archivo
            const formData = new FormData();
            formData.append('file', pdfFile);

            try {
                setPdfStringLoading(true);
                const response = await fetch('/api/pedido/pdf', {
                    method: 'POST',
                    body: formData
                });
                const data = await response.json();
                if (data.success) {
                    setPdfString(data.fullText);
                    setPdfAnalysis(data.analysis);
                } else {
                    setPdfString(null);
                    setPdfAnalysis(null);
                    console.error('Error procesando archivo:', data.error);
                    toast.error('Error procesando el PDF');
                }
            } catch (error) {
                setPdfString(null);
                setPdfAnalysis(null);
                console.error('Error enviando archivo:', error);
                toast.error('Error enviando el archivo');
            } finally {
                setPdfStringLoading(false);
            }
        } else {
            alert('Por favor, arrastra solo archivos PDF');
        }
    };



    const [pdfString, setPdfString] = useState<string | null>(null);
    const [pdfAnalysis, setPdfAnalysis] = useState<any>(null);
    const [pdfStringLoading, setPdfStringLoading] = useState<boolean>(false);
    const [showAssignmentModal, setShowAssignmentModal] = useState(false);
    const [assignmentData, setAssignmentData] = useState<any>(null);






    // Auto-fill form when PDF analysis is complete
    useEffect(() => {
        if (pdfAnalysis && pdfAnalysis.orden && pdfAnalysis.productos) {
            // Set order number
            setPedidoForm(prev => ({ ...prev, numeroPedido: pdfAnalysis.orden.toString() }));

            // Add products to the list
            const newPedidoItems = pdfAnalysis.productos.map((producto: any) => {
                const productoObj = productos.find(p => p.code === producto.codigo);
                return {
                    producto: productoObj ? productoObj.name : producto.codigo,
                    cantidad: producto.cantidad.toString(),
                    codigo: producto.codigo,
                    id: productoObj ? productoObj.id : ''
                };
            }).filter((item: any) => item.id); // Only add products that exist in our database

            setPedidoItems(newPedidoItems);

            // Clear the PDF string to show the form
            setPdfString(null);

            // Show success message
            toast.success(`PDF analizado: Orden ${pdfAnalysis.orden} con ${pdfAnalysis.productos.length} productos`);
        }
    }, [pdfAnalysis, productos]);



    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        console.log("mandando pdf")
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.type === 'application/pdf') {
                setArchivoPDF(file);
                setArchivoNombre(file.name);

                // Crear FormData para enviar el archivo
                const formData = new FormData();
                formData.append('file', file);

                try {
                    setPdfStringLoading(true);
                    const response = await fetch('/api/pedido/pdf', {
                        method: 'POST',
                        body: formData
                    });
                    const data = await response.json();
                    console.log('Respuesta del servidor:', data);

                    if (data.success) {
                        console.log('Archivo procesado correctamente:', data.fileName);
                        setPdfString(data.fullText);
                        setPdfAnalysis(data.analysis);
                    } else {
                        console.error('Error procesando archivo:', data.error);
                        toast.error('Error procesando el PDF');
                    }
                } catch (error) {
                    console.error('Error enviando archivo:', error);
                    toast.error('Error enviando el archivo');
                } finally {
                    setPdfStringLoading(false);
                }
            } else {
                alert('Por favor, selecciona solo archivos PDF');
                e.target.value = '';
            }
        } else {
            setArchivoPDF(null);
            setArchivoNombre("");
        }
    };

    console.log('pdfString:', pdfString); // DEPURACIÓN: Verificar valor de pdfString

    return (
        <>
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm p-4 flex items-center justify-between">
                {/* Logo */}
                <div className='flex gap-12 pl-4'>
                    <Link href="/" className="flex items-center gap-2 min-w-[120px]">
                        <img src="/favicon.jpeg" alt="logo" className="w-10 h-10" />
                    </Link>
                    {/* Menú */}
                    <div className="flex gap-8 items-center">
                        <Link href="/" className={`text-[#2A3182] text-xl hover:border-b-3 border-[#2A3182] !h-[30px] font-medium ${pathname === '/' ? 'border-b-3 border-[#2A3182] font-semibold' : ''}`}>Bitácora</Link>
                        <Link href="/salidas" className={`text-[#2A3182] text-xl hover:border-b-3 border-[#2A3182] !h-[30px] font-medium ${pathname.startsWith('/salidas') ? 'border-b-3 border-[#2A3182] font-semibold' : ''}`}>Salidas</Link>
                        <Link href="/pedidos" className={`text-[#2A3182] text-xl hover:border-b-3 border-[#2A3182] !h-[30px] font-medium ${pathname.startsWith('/pedidos') ? 'border-b-3 border-[#2A3182] font-semibold' : ''}`}>Pedidos</Link>
                        <Link href="/resumen" className={`text-[#2A3182] text-xl hover:border-b-3 border-[#2A3182] !h-[30px] font-medium ${pathname === '/resumen' ? 'border-b-3 border-[#2A3182] font-semibold' : ''}`}>Productos</Link>
                    </div>
                </div>
                {/* Botones y avatar */}
                <div className="flex items-center gap-10">
                    {session ? (
                        <>
                            <div className='flex gap-4 '>
                                <button
                                    onClick={() => setShowPedidoModal(true)}
                                    className="bg-[#E6E6A8] text-[#2A3182] font-semibold px-4 py-2 rounded cursor-pointer hover:bg-[#cccc95] transition"
                                >
                                    Nuevo Pedido
                                </button>
                                <button
                                    onClick={() => setShowLoteModal(true)}
                                    className="bg-[#E6E6A8] text-[#2A3182] font-semibold px-4 py-2 rounded cursor-pointer hover:bg-[#cccc95] transition"
                                >
                                    Nueva Salida
                                </button>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 capitalize rounded-full bg-[#2A3182] flex items-center justify-center text-white font-bold">
                                    {session.user?.name?.charAt(0) || session.user?.email?.charAt(0) || 'U'}
                                </div>
                                <button
                                    onClick={() => signOut()}
                                    className="text-[#2A3182] cursor-pointer hover:text-red-600 transition-colors text-sm font-medium"
                                >
                                    Cerrar Sesión
                                </button>
                            </div>
                        </>
                    ) : (
                        <Link
                            href="/login"
                            className="bg-[#2A3182] text-white font-semibold px-4 py-2 rounded cursor-pointer hover:bg-[#232966] transition"
                        >
                            Iniciar Sesión
                        </Link>
                    )}
                </div>
            </nav>

            {/* Modal para Nuevo Pedido */}
            {showPedidoModal && (
                <Modal
                    title={"Nuevo Pedido"}
                    classNameTitle="text-start whitespace-pre-line text-3xl"
                    message=""
                    onClose={() => {
                        setShowPedidoModal(false);
                        setPedidoForm({ numeroPedido: '', producto: '', cantidad: '' });
                        setPedidoErrors({ numeroPedido: '', producto: '', cantidad: '' });
                        setPedidoItems([]);
                        setPdfString(null);
                        setPdfAnalysis(null);
                        setArchivoPDF(null);
                        setArchivoNombre("");
                    }}
                    size="md"
                    className={`w-[800px]`}
                    body={
                        <div
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            className={`w-full h-full transition-all duration-200 ${isDragOver ? 'bg-blue-50 border-4 border-blue-400 shadow-2xl flex flex-col items-center justify-center min-h-[500px]' : ''}`}
                        >
                            {isDragOver ? (
                                <div className="flex flex-col items-center justify-center w-full h-full py-24">
                                    <FaFileUpload className="w-20 h-20 text-blue-400 mb-6 animate-bounce" />
                                    <span className="text-2xl font-bold text-blue-700 mb-2">¡Suelta el archivo PDF aquí!</span>
                                    <span className="text-lg text-blue-500">El pedido se adjuntará automáticamente</span>
                                </div>
                            ) : <>
                                {
                                    pdfStringLoading ? (
                                        <div className="flex flex-col items-center justify-center w-full h-full py-24">
                                            <FaSpinner className="w-20 h-20 text-blue-400 mb-6 animate-spin" />
                                            <span className="text-2xl font-bold text-blue-700 mb-2">Cargando archivo...</span>
                                        </div>
                                    ) : (typeof pdfString === 'string') ? (
                                        <div className="flex flex-col items-center justify-center w-full h-full py-24">
                                            <FaSpinner className="w-20 h-20 text-blue-400 mb-6 animate-spin" />
                                            <span className="text-2xl font-bold text-blue-700 mb-2">Analizando PDF...</span>
                                            <span className="text-lg text-blue-500">Procesando con inteligencia artificial</span>
                                        </div>
                                    ) : (

                                        <div
                                            className="w-full p-2 md:p-4 flex flex-col gap-6">
                                            {/* Número de pedido */}
                                            <div className="flex flex-col gap-1 text-start">
                                                <Input
                                                    type="text"
                                                    name="numeroPedido"
                                                    label='No. de Pedido'
                                                    placeholder="Número de pedido"
                                                    defaultValue={pedidoForm.numeroPedido}
                                                    onChange={(value: string | number) => {
                                                        setPedidoForm(prev => ({ ...prev, numeroPedido: String(value) }));
                                                        setPedidoErrors(prev => ({ ...prev, numeroPedido: '' }));
                                                    }}
                                                // className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:border-[#2A3182] focus:ring-2 focus:ring-[#2A3182]/20 transition w-full text-lg"
                                                />
                                                {pedidoErrors.numeroPedido && (
                                                    <span className="text-xs text-red-500 mt-1">{pedidoErrors.numeroPedido}</span>
                                                )}
                                            </div>
                                            {/* <hr className="my-2 border-gray-200" /> */}
                                            {/* Agregar producto */}
                                            <div className="flex flex-col gap-2">
                                                <div className="flex flex-col md:flex-row gap-2 items-end">
                                                    <div className="flex-1 flex flex-col gap-1">
                                                        <Combobox
                                                            items={loadingProductos ? [{ value: '', label: 'Cargando productos...' }] : productos.map(p => ({
                                                                value: p.id,
                                                                label: `${p.code} - ${p.name}`
                                                            }))}
                                                            value={pedidoForm.producto}
                                                            onChange={(value) => {
                                                                setPedidoForm(prev => ({ ...prev, producto: value }));
                                                                setPedidoErrors(prev => ({ ...prev, producto: '' }));
                                                            }}
                                                            placeholder="Selecciona un producto"
                                                        />
                                                        {pedidoErrors.producto && (
                                                            <span className="text-xs text-red-500 mt-1">{pedidoErrors.producto}</span>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 flex flex-col gap-1">
                                                        {/* <label className="text-xs text-gray-600 font-semibold mb-1" htmlFor="cantidad">Cantidad</label> */}
                                                        <Input
                                                            label=" "
                                                            type="number"
                                                            name="cantidad"
                                                            placeholder="Ingrese la cantidad"
                                                            defaultValue={pedidoForm.cantidad}
                                                            onChange={(value: string | number) => {
                                                                setPedidoForm(prev => ({ ...prev, cantidad: String(value) }));
                                                                setPedidoErrors(prev => ({ ...prev, cantidad: '' }));
                                                            }}
                                                            // className={`bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:border-[#2A3182] focus:ring-2 focus:ring-[#2A3182]/20 transition w-full text-lg ${pedidoErrors.cantidad ? 'border-red-500' : ''}`}
                                                            disabled={isSubmitting}
                                                            min="1"
                                                        />
                                                        {pedidoErrors.cantidad && (
                                                            <span className="text-xs text-red-500 mt-1">{pedidoErrors.cantidad}</span>
                                                        )}
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={handleAddPedidoItem}
                                                        className="bg-[#2A3182] w-12 h-12 flex-shrink-0 cursor-pointer hover:bg-[#232966] transition text-white rounded-lg flex items-center justify-center mt-0 md:mt-6 shadow-md"
                                                        title="Agregar producto al pedido"
                                                    >
                                                        <FaPlus size={20} />
                                                    </button>
                                                </div>
                                                {pedidoItems.length > 0 && (
                                                    <div className="mb-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700 flex items-center gap-2">
                                                        <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                                        {pedidoItems.length} producto{pedidoItems.length > 1 ? 's' : ''} agregado{pedidoItems.length > 1 ? 's' : ''}
                                                        {pdfAnalysis && (
                                                            <span className="text-green-600 font-medium"> (desde PDF)</span>
                                                        )}
                                                        . Puedes continuar agregando más productos o crear el pedido.
                                                    </div>
                                                )}
                                            </div>
                                            {/* Tabla de productos agregados */}
                                            <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm max-h-[200px] overflow-y-auto">
                                                <table className="w-full text-sm">
                                                    <thead className="sticky top-0 bg-gray-100 z-10">
                                                        <tr>
                                                            <th className="px-3 py-2 text-start font-semibold">Código</th>
                                                            <th className="px-3 py-2 text-start font-semibold">Producto</th>
                                                            <th className="px-3 py-2 text-start font-semibold">Cantidad</th>
                                                            <th className="px-3 py-2 text-center font-semibold">Acciones</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {pedidoItems.map((item, idx) => (
                                                            <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                                                                <td className="px-3 py-2">{item.codigo}</td>
                                                                <td className="px-3 py-2 text-start">{item.producto}</td>
                                                                <td className="px-3 py-2">{Number(item.cantidad).toLocaleString()}</td>
                                                                <td className="px-3 py-2 text-center">
                                                                    <button
                                                                        onClick={() => handleRemovePedidoItem(idx)}
                                                                        className="text-red-500 hover:text-red-700 p-1 rounded-full transition border border-transparent hover:border-red-200"
                                                                        title="Eliminar producto"
                                                                    >
                                                                        <FaTrash className="w-5 h-5" />
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                        {pedidoItems.length > 0 && (
                                                            <tr className="border-t border-gray-200 bg-blue-50">
                                                                <td colSpan={2} className="px-3 py-2 font-semibold text-right">Total:</td>
                                                                <td className="px-3 py-2 font-semibold">{totalCantidad.toLocaleString()}</td>
                                                                <td></td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                            {/* Input de archivo y botones */}
                                            <div
                                                className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mt-2">
                                                <div className="flex-1">
                                                </div>

                                                <div className="flex gap-2 flex-wrap justify-end md:justify-end mt-2 md:mt-0">
                                                    {pedidoItems.length > 0 && (
                                                        <button
                                                            className="px-4 py-2 rounded-lg bg-red-100 text-red-600 font-semibold hover:bg-red-200 transition flex items-center gap-2"
                                                            onClick={() => {
                                                                setPedidoItems([]);
                                                                setPedidoForm({ numeroPedido: '', producto: '', cantidad: '' });
                                                                setPedidoErrors({ numeroPedido: '', producto: '', cantidad: '' });
                                                                setPdfString(null);
                                                                setPdfAnalysis(null);
                                                                setArchivoPDF(null);
                                                                setArchivoNombre("");
                                                            }}
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                                            Limpiar Todo
                                                        </button>
                                                    )}
                                                    <button
                                                        className="cursor-pointer px-4 py-2 rounded bg-gray-100 text-[#2A3182] font-semibold hover:bg-gray-200 transition"
                                                        onClick={() => setShowPedidoModal(false)}
                                                    >
                                                        Cancelar
                                                    </button>

                                                    <div className='flex flex-col gap-2'>
                                                        <input type="file" name="archivoPDF" id="archivoPDF" accept="application/pdf" className="hidden" onChange={handleFileSelect} />
                                                        <button
                                                            className={`font-semibold px-4 py-2 rounded cursor-pointer transition flex items-center gap-2 ${pdfAnalysis
                                                                ? 'bg-green-600 text-white hover:bg-green-700'
                                                                : archivoPDF
                                                                    ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                                                                    : 'bg-red-600 text-white hover:bg-red-700'
                                                                }`}
                                                            onClick={() => document.getElementById('archivoPDF')?.click()}
                                                        >
                                                            <FaFileUpload className="text-white" />
                                                            {pdfAnalysis ? 'PDF ✓' : archivoPDF ? 'PDF ⏳' : 'PDF'}
                                                        </button>
                                                    </div>
                                                    <button
                                                        className="cursor-pointer px-4 py-2 rounded bg-[#2A3182] text-white font-semibold hover:bg-[#232966] transition disabled:opacity-50"
                                                        onClick={handleSubmitPedido}
                                                        disabled={isSubmitting || orderLoading}
                                                    >
                                                        {isSubmitting || orderLoading ? 'Procesando...' : 'Crear Pedido'}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                }
                            </>}
                        </div>
                    }
                />
            )}

            {/* Modal para Nuevo Lote */}
            {showLoteModal && (
                <Modal
                    title="Nueva Salida - Crear Lotes"
                    classNameTitle='text-start text-3xl'
                    message="Agrega los productos que conformarán los lotes de esta salida. Cada producto será un lote independiente."
                    onClose={() => {
                        setShowLoteModal(false);
                        setFormData({ producto: '', lote: '', cantidad: '', contenedores: [] });
                        setErrors({ producto: '', lote: '', cantidad: '', contenedores: '' });
                        setLoteItems([]);
                        setBatchNumber('');
                    }}
                    size="xl"
                    body={
                        <div className="w-full p-2">

                            {/* Formulario para agregar productos */}
                            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Agregar Lote</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className='text-start'>
                                        <label className="text-sm font-medium text-gray-700 mb-2 block">Producto</label>
                                        <Combobox
                                            items={loadingProductos ? [{ value: '', label: 'Cargando productos...' }] : productos.map(p => ({
                                                value: p.id,
                                                label: `${p.code} - ${p.name}`
                                            }))}
                                            value={formData.producto}
                                            onChange={(value) => {
                                                setFormData(prev => ({ ...prev, producto: value }));
                                                setErrors(prev => ({ ...prev, producto: '' }));
                                            }}
                                            placeholder="Selecciona un producto"
                                        />
                                        {errors.producto && (
                                            <p className="text-red-500 text-xs mt-1">{errors.producto}</p>
                                        )}
                                    </div>
                                    <div className='text-start'>
                                        <label className="text-sm font-medium text-gray-700 mb-2 block" htmlFor="lote">
                                            Número de Lote <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="lote"
                                            id="lote"
                                            placeholder="Ej: L001-2024, BATCH-001"
                                            value={formData.lote}
                                            onChange={e => {
                                                setFormData(prev => ({ ...prev, lote: e.target.value }));
                                                setErrors(prev => ({ ...prev, lote: '' }));
                                            }}
                                            className={`w-full px-3 bg-white py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2A3182]/20 transition text-lg ${errors.lote ? 'border-red-500' : 'border-gray-200'}`}
                                            disabled={isSubmitting}
                                        />
                                        {errors.lote && (
                                            <p className="text-red-500 text-xs mt-1">{errors.lote}</p>
                                        )}
                                    </div>
                                    <div className='text-start'>
                                        <label className="text-sm font-medium text-gray-700 mb-2 block" htmlFor="cantidad">Cantidad</label>
                                        <input
                                            type="number"
                                            name="cantidad"
                                            id="cantidad"
                                            placeholder="Cantidad"
                                            value={formData.cantidad}
                                            onChange={e => {
                                                setFormData(prev => ({ ...prev, cantidad: e.target.value }));
                                                setErrors(prev => ({ ...prev, cantidad: '' }));
                                            }}
                                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2A3182]/20 transition text-lg ${errors.cantidad ? 'border-red-500' : 'border-gray-200'}`}
                                            disabled={isSubmitting}
                                            min="1"
                                        />
                                        {errors.cantidad && (
                                            <p className="text-red-500 text-xs mt-1">{errors.cantidad}</p>
                                        )}
                                    </div>
                                    <div className='text-start'>
                                        <label className="text-sm font-medium text-gray-700 mb-2 block">Contenedores</label>
                                        <TagsInput
                                            placeholder="Escribe código de contenedor y presiona Enter"
                                            value={formData.contenedores}
                                            onChange={(tags: string[]) => {
                                                setFormData(prev => ({ ...prev, contenedores: tags }));
                                                setErrors(prev => ({ ...prev, contenedores: '' }));
                                            }}
                                            disabled={isSubmitting}
                                            maxTags={10}
                                        />
                                        {errors.contenedores && (
                                            <p className="text-red-500 text-xs mt-1">{errors.contenedores}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Botón para agregar producto */}
                            <div className="flex justify-end mb-6">
                                <button
                                    type="button"
                                    onClick={handleAddLoteItem}
                                    className="bg-[#2A3182] text-white font-semibold px-6 py-3 rounded-lg hover:bg-[#232966] transition flex items-center gap-2 disabled:opacity-50 shadow-md"
                                    disabled={isSubmitting || !formData.producto}
                                >
                                    <FaPlus size={16} />
                                    Agregar Lote
                                </button>
                            </div>



                            {/* Mensaje de productos agregados */}
                            {/* {loteItems.length > 0 && (
                                <div className="mb-4 p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700 flex items-center gap-2">
                                    <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                    {loteItems.length} producto{loteItems.length > 1 ? 's' : ''} en el lote. Selecciona un producto del combobox para agregar más o haz clic en una fila para editar.
                                </div>
                            )} */}

                            {/* Mensaje cuando se está editando */}
                            {/* {formData.producto && loteItems.some(item => item.id === formData.producto) && (
                                <div className="mb-4 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-700 flex items-center gap-2">
                                    <svg className="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
                                    Editando producto. Los cambios se aplican automáticamente en la tabla.
                                </div>
                            )} */}

                            {/* Tabla de lotes agregados */}
                            {loteItems.length > 0 && (
                                <div className="mb-6 border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                                        <h3 className="text-lg font-semibold text-gray-800">Lotes en la Salida ({loteItems.length})</h3>
                                    </div>
                                    <div className="overflow-x-auto max-h-[200px] overflow-y-auto">
                                        <table className="w-full">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lote</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contenedores</th>
                                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {loteItems.map((item, idx) => (
                                                    <tr
                                                        key={idx}
                                                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                                                        onClick={() => handleEditLoteItem(idx)}
                                                        title="Haz clic para editar este lote"
                                                    >
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.codigo}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.productName}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{item.lote}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{Number(item.cantidad).toLocaleString()}</td>
                                                        <td className="px-6 py-4 text-sm text-gray-900">
                                                            <div className="flex flex-wrap gap-1">
                                                                {item.contenedores.map((container, index) => (
                                                                    <span
                                                                        key={index}
                                                                        className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-indigo-100 text-indigo-800 border border-indigo-200"
                                                                    >
                                                                        {container}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-center" onClick={(e) => e.stopPropagation()}>
                                                            <div className="flex gap-2 justify-center">
                                                                                                    <button
                                        onClick={() => handleEditLoteItem(idx)}
                                        className="text-indigo-600 hover:text-indigo-900 p-1.5 rounded-md transition-colors hover:bg-indigo-50"
                                        title="Editar lote"
                                    >
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                    </svg>
                                                                </button>
                                                                <button
                                                                    onClick={() => handleRemoveLoteItem(idx)}
                                                                    className="text-red-600 hover:text-red-900 p-1.5 rounded-md transition-colors hover:bg-red-50"
                                                                    title="Eliminar lote"
                                                                >
                                                                    <FaTrash size={14} />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Botones de acción */}
                            <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                                <div className="flex gap-3">
                                    {formData.producto && (
                                        <button
                                            className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition flex items-center gap-2"
                                            onClick={() => {
                                                setFormData({ producto: '', lote: '', cantidad: '', contenedores: [] });
                                                setErrors({ producto: '', lote: '', cantidad: '', contenedores: '' });
                                            }}
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                            </svg>
                                            Limpiar Formulario
                                        </button>
                                    )}
                                    {loteItems.length > 0 && (
                                        <button
                                            className="px-4 py-2 rounded-lg bg-red-50 text-red-600 font-medium hover:bg-red-100 transition flex items-center gap-2"
                                            onClick={() => {
                                                setLoteItems([]);
                                                setFormData({ producto: '', lote: '', cantidad: '', contenedores: [] });
                                                setErrors({ producto: '', lote: '', cantidad: '', contenedores: '' });
                                                setBatchNumber('');
                                            }}
                                        >
                                            <FaTrash size={14} />
                                            Limpiar Todo
                                        </button>
                                    )}
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        className="px-6 py-2 rounded-lg bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition disabled:opacity-50"
                                        onClick={() => setShowLoteModal(false)}
                                        disabled={isSubmitting}
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        className="px-6 py-2 rounded-lg bg-[#2A3182] text-white font-semibold hover:bg-[#232966] transition disabled:opacity-50 flex items-center gap-2 shadow-md"
                                        onClick={handleSubmit}
                                        disabled={isSubmitting || batchLoading || loteItems.length === 0}
                                    >
                                        {isSubmitting || batchLoading ? (
                                            <>
                                                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Procesando...
                                            </>
                                        ) : `Crear ${loteItems.length} Lote(s)`}
                                    </button>
                                </div>
                            </div>
                        </div>
                    }
                />
            )}

            {/* Modal de Resumen de Asignaciones */}
            {showAssignmentModal && assignmentData && (
                <AssignmentSummaryModal
                    isOpen={showAssignmentModal}
                    onClose={() => {
                        setShowAssignmentModal(false);
                        setAssignmentData(null);
                    }}
                    assignments={assignmentData.assignments}
                    batchNumber={assignmentData.batchNumber}
                />
            )}
        </>
    )
}

export default Navbar