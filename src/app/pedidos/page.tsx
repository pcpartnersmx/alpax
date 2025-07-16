"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Table from "../components/Essentials/Table";
import Modal from "../components/Essentials/Modal";
import { FaRegEdit, FaRegTrashAlt, FaBoxOpen, FaStickyNote } from "react-icons/fa";
import { IoDocumentOutline } from "react-icons/io5";
import { useOrders } from "@/hooks/useOrders";
import { Order } from "@/types/pedido";

const columns = [
  { key: "pedido", title: "PEDIDO" },
  { key: "fecha", title: "FECHA" },
  { key: "otros", title: "OTROS" },
];

// Skeleton loader component
const TableSkeleton = () => (
  <div className="space-y-3">
    {[...Array(8)].map((_, index) => (
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
      </motion.div>
    ))}
  </div>
);

export default function PedidosPage() {
  const { getOrders, loading } = useOrders();
  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [currentNote, setCurrentNote] = useState("");
  const [selectedOrderForNotes, setSelectedOrderForNotes] = useState<Order | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
      };
      const res = await getOrders(params);
      if (res.success) {
        setOrders(res.data);
        setPagination(res.pagination);
      }
    };
    fetchOrders();
  }, [pagination.page, pagination.limit]);

  const handleNotesClick = (order: Order, event: React.MouseEvent) => {
    event.stopPropagation();
    setSelectedOrderForNotes(order);
    setCurrentNote(order.orderNotes || "");
    setShowNotesModal(true);
  };

  const handleSaveNote = async () => {
    if (selectedOrderForNotes) {
      // Aquí puedes implementar la lógica para guardar la nota en la base de datos
      console.log("Guardando nota:", currentNote, "para pedido:", selectedOrderForNotes.id);

      // Actualizar el pedido en el estado local
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === selectedOrderForNotes.id
            ? { ...order, orderNotes: currentNote }
            : order
        )
      );

      // Si el pedido seleccionado es el mismo, actualizarlo también
      if (selectedOrder?.id === selectedOrderForNotes.id) {
        setSelectedOrder(prev => prev ? { ...prev, orderNotes: currentNote } : null);
      }

      setShowNotesModal(false);
      setSelectedOrderForNotes(null);
      setCurrentNote("");
    }
  };

  const handleCloseNotesModal = () => {
    setShowNotesModal(false);
    setSelectedOrderForNotes(null);
    setCurrentNote("");
  };

  // Solo mostrar una fila por pedido (no por item)
  const tableRows = orders.map((order) => (
    <tr
      key={order.id}
      className={` border-b cursor-pointer ${selectedOrder?.id === order.id ? "bg-[#dada99] hover:bg-[#eeeea8]" : "hover:bg-[#f5f5fa]"}`}
      onClick={() => setSelectedOrder(order)}
    >
      <td className="px-6 py-2 font-semibold">{order.orderNumber}</td>
      <td className="px-6 py-2">{new Date(order.createdAt).toLocaleDateString()}</td>
      <td className="px-6 py-2 flex gap-3 items-center">
        <FaStickyNote
          className={`cursor-pointer ${order.orderNotes ? "text-yellow-500" : "text-gray-400"}`}
          title={order.orderNotes ? "Ver/Editar Nota" : "Agregar Nota"}
          onClick={(e) => handleNotesClick(order, e)}
        />
        <FaRegEdit className="text-blue-500 cursor-pointer" title="Editar" />
        <FaRegTrashAlt className="text-red-500 cursor-pointer" title="Eliminar" />
      </td>
    </tr>
  ));

  // Tabla detalle del pedido seleccionado
  const detalleColumns = [
    { key: "clave", title: "CLAVE" },
    { key: "producto", title: "PRODUCTO" },
    { key: "departamento", title: "DEPARTAMENTO" },
    { key: "cantidad", title: "Cant. PEDIDO" },
    { key: "completado", title: "COMPLETADO" },
    { key: "restante", title: "RESTANTE" },
  ];

  // Obtener cantidad completada del item del pedido
  function getCompletado(orderItem: any) {
    return orderItem.completedQuantity || 0;
  }

  function getRestante(cantidad: number, completado: number) {
    return cantidad - completado;
  }

  return (
    <div className="p-6 min-h-screen bg-[#f5f5fa]">
      <div className="flex gap-6">
        {/* Tabla de pedidos */}
        <div className="w-[420px] bg-white rounded-xl shadow p-4 border">
          {loading ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <div className="h-6 bg-gray-300 rounded w-20 animate-pulse"></div>
                <div className="h-6 bg-gray-300 rounded w-16 animate-pulse"></div>
              </div>
              <TableSkeleton />
            </div>
          ) : (
            <Table columns={columns} body={tableRows} />
          )}
        </div>

        {/* Panel de detalle */}
        <motion.div 
          className="flex-1 bg-white rounded-xl shadow p-4 border min-h-[600px]"
          initial={{ opacity: 0, x: 20 }}
          animate={{ 
            opacity: selectedOrder ? 1 : 0.7, 
            x: selectedOrder ? 0 : 20 
          }}
          transition={{ 
            duration: 0.3, 
            ease: "easeOut",
            staggerChildren: 0.1
          }}
        >
          {!selectedOrder ? (
            <motion.div 
              className="flex flex-col items-center justify-center w-full h-full"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              <span className="text-xl text-[#8c8cb2] mb-4">Selecciona un pedido para ver información</span>
              <FaBoxOpen size={80} className="text-[#8c8cb2]" />
            </motion.div>
          ) : (
            <motion.div 
              className="w-full"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <motion.table 
                className="w-full text-sm border rounded overflow-hidden"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <thead className="bg-gray-400 text-white">
                  <tr>
                    {detalleColumns.map((col) => (
                      <th key={col.key} className="p-2 text-left font-semibold">{col.title}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.orderItems.map((item, idx) => {
                    const completado = getCompletado(item);
                    const restante = getRestante(item.quantity, completado);
                    let restanteColor = "bg-green-500";
                    if (restante > 0) restanteColor = "bg-yellow-500";
                    if (restante < 0) restanteColor = "bg-red-500";
                    return (
                      <motion.tr
                        key={item.id}
                        className={idx % 2 === 0 ? "bg-[#f5f5fa]" : "bg-white"}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ 
                          duration: 0.3, 
                          delay: 0.3 + (idx * 0.05),
                          ease: "easeOut"
                        }}
                      >
                        <td className="p-2">{item.product.code}</td>
                        <td className="p-2">{item.product.name}</td>
                        <td className="p-2">{item.product.area?.name || "-"}</td>
                        <td className="p-2">{item.quantity.toLocaleString()}</td>
                        <td className="p-2">{completado.toLocaleString()}</td>
                        <td className={`p-2 text-white text-center font-bold rounded ${restanteColor}`}>{restante > 0 ? restante : 0}</td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </motion.table>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Modal de Notas */}
      {showNotesModal && (
        <Modal
          title={"Nota"}
          message={""}
          size="sm"
          onClose={handleCloseNotesModal}
          classNameTitle="text-start"
          body={
            <div className="w-full px-2">
              <div className="text-left mb-2">
                <label htmlFor="nota" className="block text-base font-semibold text-gray-700 mb-1">Nota</label>
              </div>
              <textarea
                id="nota"
                value={currentNote}
                onChange={(e) => setCurrentNote(e.target.value)}
                placeholder="Escribe la nota aquí..."
                className="w-full h-28 p-3 bg-[#f5f6fa] border border-gray-200 rounded-lg text-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-[#2d2e83]"
              />
              <div className="flex justify-end gap-4 mt-6">
                <button
                  onClick={handleCloseNotesModal}
                  className="px-4 py-2 cursor-pointer text-gray-500 font-medium rounded hover:bg-gray-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveNote}
                  className="px-5 py-2 cursor-pointer bg-[#2d2e83] text-white font-semibold rounded hover:bg-[#23235e] transition-colors"
                >
                  Agregar
                </button>
              </div>
            </div>
          }
        />
      )}
    </div>
  );
} 