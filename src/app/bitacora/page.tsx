'use client';
import Input from "../components/Essentials/Input";
import Select from "../components/Essentials/Select";
import { FaStickyNote, FaEdit, FaTrash, FaSearch, FaSort, FaSortUp, FaSortDown } from "react-icons/fa";
import { useState, useEffect } from "react";
import { DatePickerWithRange } from "../components/ui/datePickerRange";
import { DateRange } from "react-day-picker";
import Modal from "../components/Essentials/Modal";
import { useBitacora, BitacoraItem } from "@/hooks/useBitacora";
import { useUpdate } from "@/contexts/UpdateContext";

const columns = [
  { key: "folio", title: "FOLIO" },
  { key: "area", title: "AREA" },
  { key: "clave", title: "CLAVE" },
  { key: "pedido", title: "PEDIDO" },
  { key: "lote", title: "LOTE" },
  { key: "fecha", title: "FECHA" },
  { key: "hora", title: "HORA" },
  { key: "cantidad", title: "CANTIDAD" },
  { key: "otros", title: "OTROS" },
];



const filtros = [
  { label: "Clave", value: "clave" },
  { label: "Pedido", value: "pedido" },
  { label: "Lote", value: "lote" },
];

type FiltrosKeys = "clave" | "pedido" | "lote";

export default function BitacoraPage() {
  const { getBitacora, loading } = useBitacora();
  const { shouldUpdateBitacora, markUpdated } = useUpdate();
  const [data, setData] = useState<BitacoraItem[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [filtrosValues, setFiltrosValues] = useState<Record<FiltrosKeys, string>>({
    clave: "",
    pedido: "",
    lote: "",
  });
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'ascending' | 'descending' } | null>(null);
  const [showNotaModal, setShowNotaModal] = useState(false);
  const [nota, setNota] = useState("");

  const handleFiltroChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFiltrosValues((prev) => ({ ...prev, [name as FiltrosKeys]: value }));
  };

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const handleSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortedData = (data: typeof filteredData) => {
    if (!sortConfig) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key as keyof typeof a];
      const bValue = b[sortConfig.key as keyof typeof b];

      if (aValue < bValue) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
  };

  const filteredData = data.filter((row) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      row.folio.toLowerCase().includes(searchLower) ||
      row.area.toLowerCase().includes(searchLower) ||
      row.clave.toLowerCase().includes(searchLower) ||
      row.pedido.toLowerCase().includes(searchLower) ||
      row.lote.toLowerCase().includes(searchLower) ||
      row.fecha.toLowerCase().includes(searchLower) ||
      row.hora.toLowerCase().includes(searchLower) ||
      row.cantidad.toLowerCase().includes(searchLower);

    // Filter by date range if selected
    if (dateRange?.from && dateRange?.to) {
      const rowDate = new Date(row.fecha.split('/').reverse().join('-'));
      return matchesSearch && rowDate >= dateRange.from && rowDate <= dateRange.to;
    }

    return matchesSearch;
  });

  const sortedData = getSortedData(filteredData);

  // Cargar datos iniciales
  useEffect(() => {
    const fetchData = async () => {
      const params: any = {
        page: pagination.page,
        limit: pagination.limit,
      };

      if (dateRange?.from && dateRange?.to) {
        params.startDate = dateRange.from.toISOString();
        params.endDate = dateRange.to.toISOString();
      }

      if (searchTerm) {
        params.search = searchTerm;
      }

      const result = await getBitacora(params);
      if (result.success) {
        setData(result.data);
        setPagination(result.pagination);
      }
    };

    fetchData();
  }, [pagination.page, pagination.limit, dateRange, searchTerm]);

  // Escuchar actualizaciones automáticas
  useEffect(() => {
    if (shouldUpdateBitacora) {
      const fetchData = async () => {
        const params: any = {
          page: pagination.page,
          limit: pagination.limit,
        };

        if (dateRange?.from && dateRange?.to) {
          params.startDate = dateRange.from.toISOString();
          params.endDate = dateRange.to.toISOString();
        }

        if (searchTerm) {
          params.search = searchTerm;
        }

        const result = await getBitacora(params);
        if (result.success) {
          setData(result.data);
          setPagination(result.pagination);
        }
        markUpdated('bitacora');
      };

      fetchData();
    }
  }, [shouldUpdateBitacora, markUpdated, pagination.page, pagination.limit, dateRange, searchTerm]);

  const getSortIcon = (columnKey: string) => {
    if (!sortConfig || sortConfig.key !== columnKey) {
      return <FaSort className="ml-1 h-3 w-3 text-white" />;
    }
    return sortConfig.direction === 'ascending' ? 
      <FaSortUp className="ml-1 h-3 w-3 text-white" /> : 
      <FaSortDown className="ml-1 h-3 w-3 text-white" />;
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] p-10">
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#282b7e]"></div>
              <span>Cargando bitácora...</span>
            </div>
          </div>
        </div>
      )}
      {/* Modal para nueva nota */}
      {showNotaModal && (
        <Modal
          title="Nota"
          message={""}
          classNameTitle="text-start"
          className="p-0 w-[20%]"
          onClose={() => setShowNotaModal(false)}
          size="sm"
          body={
            <form className="w-full flex flex-col gap-4 items-center">
              <div className="w-full text-left">
                <label className="block text-base font-semibold mb-2" htmlFor="nota-textarea">Nota</label>
                <textarea
                  id="nota-textarea"
                  className="w-full min-h-[120px] max-h-[200px] border rounded-lg p-3 bg-gray-100 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#282b7e] resize-none"
                  placeholder="Agrega nota"
                  value={nota}
                  onChange={e => setNota(e.target.value)}
                />
              </div>
              <div className="flex justify-end w-full gap-4 mt-2">
                <button
                  type="button"
                  className="text-gray-500 hover:text-gray-700 px-4 py-2 rounded"
                  onClick={() => setShowNotaModal(false)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-[#282b7e] text-white px-6 py-2 rounded font-semibold hover:bg-[#1e2366]"
                  onClick={e => {
                    e.preventDefault();
                    // Aquí puedes manejar el guardado de la nota
                    setShowNotaModal(false);
                    setNota("");
                  }}
                >
                  Agregar
                </button>
              </div>
            </form>
          }
        />
      )}
      {/* Fin Modal */}
      <div className="bg-white rounded-lg shadow-sm mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters and Search Section */}
        <div className="mb-7">
          <div className="flex justify-between">
            <div className="w-[40%] flex gap-4">
              <div className="w-full">
                <DatePickerWithRange 
                  className="w-full"
                  onChange={(range) => handleDateRangeChange(range)}
                />
              </div>
              {filtros.map((f) => (
                <div className="w-full" key={f.value}>
                  <Select
                    options={[{ value: "", label: f.label }]}
                    name={f.value}
                    id={f.value}
                    className="border-[#282b7e] border-2 shadow text-[#282b7e] font-semibold"
                    defaultValue=""
                    label=""
                    onChange={handleFiltroChange}
                    value={filtrosValues[f.value as FiltrosKeys]}
                    required={false}
                    disabled={false}
                    placeholder={f.label}
                  />
                </div>
              ))}
            </div>
            <div className="w-[20%]">
              <Input
                placeholder="Buscar en la bitácora..."
                className="border-2 border-[#282b7e] rounded text-[#282b7e] font-semibold"
                type="search"
                label=""
                onChange={handleSearch}
              />
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {sortedData.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-lg">No se encontraron resultados para tu búsqueda</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-[#282b7e]">
                  <tr>
                    {columns.map((column) => (
                      <th
                        key={column.key}
                        scope="col"
                        className={`px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer ${
                          column.key === 'cantidad' || column.key === 'otros' ? 'w-[100px] text-center' : ''
                        }`}
                        onClick={() => handleSort(column.key)}
                      >
                        <div className={`flex items-center ${column.key === 'cantidad' || column.key === 'otros' ? 'justify-center' : ''}`}>
                          {column.title}
                          {getSortIcon(column.key)}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900">{row.folio}</td>
                      <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900">{row.area}</td>
                      <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900">{row.clave}</td>
                      <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900">{row.pedido}</td>
                      <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900">{row.lote}</td>
                      <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900">{row.fecha}</td>
                      <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900">{row.hora}</td>
                      <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900 text-right w-[100px]">{row.cantidad}</td>
                      <td className="px-6 py-2 whitespace-nowrap text-sm w-[100px]">
                        <div className="flex gap-3 justify-center items-center">
                          <button 
                          onClick={() => {
                            setShowNotaModal(true);
                          }}
                          className="cursor-pointer p-2 text-yellow-500 hover:text-yellow-600 hover:bg-yellow-50 rounded-full transition-colors duration-150">
                                                            <FaStickyNote className="h-4 w-4" />
                          </button>
                          <button className="cursor-pointer p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full transition-colors duration-150">
                                                            <FaEdit className="h-4 w-4" />
                          </button>
                          <button className="cursor-pointer p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full transition-colors duration-150">
                            <FaTrash className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 