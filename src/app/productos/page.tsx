'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import Table from '../components/Essentials/Table';
import Input from '../components/Essentials/Input';
import { FaSearch, FaEdit, FaTrash, FaPlus, FaStickyNote } from 'react-icons/fa';
import Modal from '../components/Essentials/Modal';
import { Combobox } from '../components/ui/combobox';

const columns = [
  { key: "area", title: "AREA" },
  { key: "code", title: "CÓDIGO" },
  { key: "name", title: "PRODUCTO" },
  { key: "acciones", title: "OTROS" },
];

interface Product {
  id: string;
  name: string;
  code: string;
  area: string;
  areaId: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

interface Area {
  id: string;
  name: string;
  description?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default function ProductosPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [areaId, setAreaId] = useState('');
  const [description, setDescription] = useState('');
  const [filterArea, setFilterArea] = useState('');
  const [filterCode, setFilterCode] = useState('');
  const [filterName, setFilterName] = useState('');
  const [productos, setProductos] = useState<Product[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAreaModal, setShowAreaModal] = useState(false);
  const [newAreaName, setNewAreaName] = useState('');
  const [newAreaDescription, setNewAreaDescription] = useState('');

  const filteredProductos = productos.filter((producto) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      producto.area.toLowerCase().includes(searchLower) ||
      producto.code.toLowerCase().includes(searchLower) ||
      producto.name.toLowerCase().includes(searchLower);

    const matchesArea = !filterArea || producto.area === filterArea;
    const matchesCode = !filterCode || producto.code === filterCode;
    const matchesName = !filterName || producto.name === filterName;

    return matchesSearch && matchesArea && matchesCode && matchesName;
  });

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const handleAddProduct = () => {
    setShowModal(true);
  };

  // Fetch productos and areas on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch productos
        const productosResponse = await fetch('/api/productos');
        if (productosResponse.ok) {
          const result = await productosResponse.json();
          if (result.success) {
            setProductos(result.data);
          } else {
            console.error('Error en la respuesta de productos:', result.message);
          }
        } else {
          console.error('Error en la petición de productos:', productosResponse.status);
        }

        // Fetch areas
        const areasResponse = await fetch('/api/areas');
        if (areasResponse.ok) {
          const areasResult = await areasResponse.json();
          if (areasResult.success) {
            setAreas(areasResult.data);
          } else {
            console.error('Error en la respuesta de áreas:', areasResult.message);
          }
        } else {
          console.error('Error en la petición de áreas:', areasResponse.status);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCloseModal = () => {
    setShowModal(false);
    setName('');
    setCode('');
    setAreaId('');
    setDescription('');
  };

  const reloadProductos = async () => {
    try {
      const response = await fetch('/api/productos');
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setProductos(result.data);
        }
      }
    } catch (error) {
      console.error('Error reloading productos:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      });

      if (response.ok) {
        const result = await response.json();
        // Recargar la lista completa para asegurar consistencia
        await reloadProductos();
        handleCloseModal();
        // Mostrar mensaje de éxito
        toast.success('Producto creado exitosamente');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Error al crear el producto');
      }
    } catch (error) {
      console.error('Error creating product:', error);
      toast.error('Error al crear el producto');
    }
  };

  const handleCreateArea = async (e: React.FormEvent) => {
    e.preventDefault();
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
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // Recargar las áreas
          const areasResponse = await fetch('/api/areas');
          if (areasResponse.ok) {
            const areasResult = await areasResponse.json();
            if (areasResult.success) {
              setAreas(areasResult.data);
            }
          }
          setShowAreaModal(false);
          setNewAreaName('');
          setNewAreaDescription('');
          toast.success('Área creada exitosamente');
        }
      } else {
        const error = await response.json();
        toast.error(error.error || 'Error al crear el área');
      }
    } catch (error) {
      console.error('Error creating area:', error);
      toast.error('Error al crear el área');
    }
  };

  return (
    <motion.div 
      className="min-h-screen p-10 bg-[#f3f4f6]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        className="bg-white rounded-lg shadow-sm mx-auto px-4 sm:px-6 lg:px-8 py-8"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <div className="mb-7">
          <motion.div 
            className="flex justify-between items-center mb-4"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className="text-xl font-semibold text-gray-800">
              Productos ({filteredProductos.length} de {productos.length})
            </h2>
          </motion.div>
          <motion.div 
            className="flex justify-between items-center"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="flex items-center gap-2">
              <motion.select
                className="border-2 border-[#282b7e] rounded text-[#282b7e] font-semibold px-3 py-2"
                value={filterArea}
                onChange={(e) => setFilterArea(e.target.value)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <option value="">Todas las áreas</option>
                {areas.map((area) => (
                  <option key={area.id} value={area.name}>
                    {area.name}
                  </option>
                ))}
              </motion.select>
              <motion.select
                className="border-2 border-[#282b7e] rounded text-[#282b7e] font-semibold px-3 py-2"
                value={filterCode}
                onChange={(e) => setFilterCode(e.target.value)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <option value="">Todas las claves</option>
                {[...new Set(productos.map(p => p.code))].map((code) => (
                  <option key={code} value={code}>
                    {code}
                  </option>
                ))}
              </motion.select>
              <motion.select
                className="border-2 border-[#282b7e] rounded text-[#282b7e] font-semibold px-3 py-2"
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <option value="">Todos los productos</option>
                {[...new Set(productos.map(p => p.name))].map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </motion.select>
            </div>
            <div className="flex items-center gap-4">
              <Input
                placeholder="Buscar productos..."
                className="border-2 border-[#282b7e] rounded text-[#282b7e] font-semibold"
                type="search"
                label=""
                onChange={handleSearch}
              />
              <motion.button
                className="flex cursor-pointer items-center gap-2 bg-[#282b7e] text-white px-4 py-2 rounded-lg hover:bg-[#1f2160] transition-colors duration-150"
                onClick={handleAddProduct}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
              >
                <FaPlus className="h-4 w-4" />
                <span>Nuevo Producto</span>
              </motion.button>
            </div>
          </motion.div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <motion.div 
              className="text-center py-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div 
                className="inline-block rounded-full h-8 w-8 border-b-2 border-[#282b7e]"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              ></motion.div>
              <p className="mt-2 text-gray-600">Cargando productos...</p>
            </motion.div>
          ) : filteredProductos.length === 0 ? (
            <motion.div 
              className="text-center py-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-gray-500 text-lg">
                {productos.length === 0 
                  ? 'No hay productos registrados. Crea el primer producto usando el botón "Nuevo Producto".'
                  : 'No se encontraron productos con los filtros aplicados.'
                }
              </p>
            </motion.div>
          ) : (
            <Table
              columns={columns}
              body={
                <AnimatePresence>
                  {filteredProductos.map((producto, index) => (
                    <motion.tr 
                      key={producto.id} 
                      className="hover:bg-gray-50 border transition-colors duration-150"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ 
                        duration: 0.3, 
                        delay: index * 0.05,
                        ease: "easeOut"
                      }}
                      whileHover={{ 
                        scale: 1.01,
                        backgroundColor: "#f9fafb",
                        transition: { duration: 0.2 }
                      }}
                    >
                      <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900">{producto.area}</td>
                      <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900">{producto.code}</td>
                      <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900">{producto.name}</td>
                      <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900 w-[10%]">
                        <div className="flex items-center gap-3 justify-center">
                          <motion.div
                            whileHover={{ scale: 1.2, rotate: 5 }}
                            whileTap={{ scale: 0.9 }}
                            transition={{ duration: 0.2 }}
                          >
                                                            <FaStickyNote className="text-yellow-500 cursor-pointer" title="Agregar nota" />
                          </motion.div>
                          <motion.div
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
                          </motion.div>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              }
            />
          )}
        </div>
      </motion.div>

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
                      className="flex-1 px-3 py-2 border rounded bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#282b7e] focus:border-transparent"
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
                      className="px-3 py-2 bg-[#282b7e] text-white rounded hover:bg-[#1f2160] transition-colors duration-150"
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
                    className="w-full px-3 py-2 border rounded bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#282b7e] focus:border-transparent"
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
                    className="w-full px-3 py-2 border rounded bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#282b7e] focus:border-transparent"
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
                    className="w-full px-3 py-2 border rounded bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#282b7e] focus:border-transparent"
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
                    className="bg-[#282b7e] text-white px-6 py-2 rounded-lg hover:bg-[#1f2160]"
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
                    className="w-full px-3 py-2 border rounded bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#282b7e] focus:border-transparent"
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
                    className="w-full px-3 py-2 border rounded bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#282b7e] focus:border-transparent"
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
                    className="bg-[#282b7e] text-white px-6 py-2 rounded-lg hover:bg-[#1f2160]"
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
  );
} 