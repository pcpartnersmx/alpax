import React from 'react';
import { FaCheckCircle, FaInfoCircle, FaTimes } from 'react-icons/fa';

interface AssignmentDetail {
    orderNumber: string;
    orderItemId: string;
    assignedQuantity: number;
    pendingBefore: number;
    pendingAfter: number;
}

interface Assignment {
    batchItemId: string;
    productName: string;
    totalQuantity: number;
    assignedQuantity: number;
    remainingQuantity: number;
    assignments: AssignmentDetail[];
    error?: string;
}

interface AssignmentSummaryModalProps {
    isOpen: boolean;
    onClose: () => void;
    assignments: Assignment[];
    batchNumber: string;
}

const AssignmentSummaryModal: React.FC<AssignmentSummaryModalProps> = ({
    isOpen,
    onClose,
    assignments,
    batchNumber
}) => {
    if (!isOpen) return null;

    const totalAssigned = assignments.reduce((sum, assignment) => sum + assignment.assignedQuantity, 0);
    const totalRemaining = assignments.reduce((sum, assignment) => sum + assignment.remainingQuantity, 0);

    return (
        <div className="fixed inset-0 bg-[#0000006b] flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-[#2A3182]">
                        Resumen de Asignaciones Automáticas
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 transition-colors"
                    >
                        <FaTimes size={24} />
                    </button>
                </div>

                <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                        <FaInfoCircle className="text-blue-600" />
                        <span className="font-semibold text-blue-800">Lote: {batchNumber}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                            <span className="font-medium text-blue-700">Total Asignado:</span>
                            <span className="ml-2 text-blue-800 font-bold">{totalAssigned.toLocaleString()}</span>
                        </div>
                        <div>
                            <span className="font-medium text-blue-700">Total Restante:</span>
                            <span className="ml-2 text-blue-800 font-bold">{totalRemaining.toLocaleString()}</span>
                        </div>
                        <div>
                            <span className="font-medium text-blue-700">Productos:</span>
                            <span className="ml-2 text-blue-800 font-bold">{assignments.length}</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    {assignments.map((assignment, index) => (
                        <div key={assignment.batchItemId} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-lg font-semibold text-gray-800">
                                    {assignment.productName}
                                </h3>
                                {assignment.error ? (
                                    <span className="text-red-600 text-sm font-medium">
                                        Error: {assignment.error}
                                    </span>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <FaCheckCircle className="text-green-500" />
                                        <span className="text-green-600 text-sm font-medium">
                                            Asignado: {assignment.assignedQuantity.toLocaleString()}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-3 gap-4 mb-3 text-sm">
                                <div>
                                    <span className="text-gray-600">Cantidad Total:</span>
                                    <span className="ml-2 font-medium">{assignment.totalQuantity.toLocaleString()}</span>
                                </div>
                                <div>
                                    <span className="text-gray-600">Asignado:</span>
                                    <span className="ml-2 font-medium text-green-600">
                                        {assignment.assignedQuantity.toLocaleString()}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-gray-600">Restante:</span>
                                    <span className="ml-2 font-medium text-orange-600">
                                        {assignment.remainingQuantity.toLocaleString()}
                                    </span>
                                </div>
                            </div>

                            {assignment.assignments.length > 0 && (
                                <div>
                                    <h4 className="font-medium text-gray-700 mb-2">Detalle de Asignaciones:</h4>
                                    <div className="space-y-2">
                                        {assignment.assignments.map((detail, detailIndex) => (
                                            <div key={detailIndex} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-sm font-medium text-gray-800">
                                                        Pedido {detail.orderNumber}
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        Asignado: {detail.assignedQuantity.toLocaleString()}
                                                    </span>
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    <span>Antes: {detail.pendingBefore.toLocaleString()}</span>
                                                    <span className="mx-1">→</span>
                                                    <span>Después: {detail.pendingAfter.toLocaleString()}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {assignment.remainingQuantity > 0 && (
                                <div className="mt-3 p-2 bg-orange-50 border border-orange-200 rounded">
                                    <span className="text-sm text-orange-700">
                                        ⚠️ Quedan {assignment.remainingQuantity.toLocaleString()} unidades sin asignar. 
                                        No hay pedidos pendientes para este producto.
                                    </span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div className="flex justify-end mt-6">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-[#2A3182] text-white rounded-lg hover:bg-[#1a1f5a] transition-colors"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AssignmentSummaryModal; 