import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaSave } from 'react-icons/fa';
import { useNotes } from '@/hooks/useNotes';
import Modal from './Essentials/Modal';

interface NotesModalProps {
    isOpen: boolean;
    onClose: () => void;
    batchItem: any;
    onNoteAdded?: () => void;
}

interface Note {
    id: string;
    content: string;
    type: string;
    createdAt: string;
    user: {
        name: string;
        email: string;
    };
}

const NotesModal: React.FC<NotesModalProps> = ({
    isOpen,
    onClose,
    batchItem,
    onNoteAdded
}) => {
    const [notes, setNotes] = useState<Note[]>([]);
    const [newNote, setNewNote] = useState('');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const { getNotes, createNote, loading: notesLoading } = useNotes();

    // Cargar notas existentes cuando se abre el modal
    useEffect(() => {
        if (isOpen && batchItem) {
            loadNotes();
        }
    }, [isOpen, batchItem]);

    const loadNotes = async () => {
        if (!batchItem) return;

        setLoading(true);
        try {
            // Buscar notas relacionadas con este batch item
            // Para notas de batch items, no usar orderId
            const response = await getNotes({
                type: 'BATCH_ITEM_NOTE'
            });

            // Filtrar las notas que correspondan a este batch item específico
            if (response.success) {
                const filteredNotes = response.data.filter(note =>
                    note.content.includes(`[batch_item_${batchItem.id}]`)
                );
                setNotes(filteredNotes);
            }


        } catch (error) {
            console.error('Error cargando notas:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveNote = async () => {
        if (!newNote.trim() || !batchItem) return;

        setSaving(true);
        try {
            // Crear la nota con el identificador del batch item en el contenido
            const noteWithIdentifier = `[batch_item_${batchItem.id}] ${newNote}`;
            const result = await createNote({
                content: noteWithIdentifier,
                type: 'BATCH_ITEM_NOTE'
                // No usar orderId para notas de batch items
            });

            if (result.success) {
                setNewNote('');
                await loadNotes(); // Recargar notas
                onNoteAdded?.(); // Notificar que se agregó una nota
            } else {
                alert('Error al guardar la nota: ' + result.error);
            }
        } catch (error) {
            console.error('Error guardando nota:', error);
            alert('Error al guardar la nota');
        } finally {
            setSaving(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (!isOpen) return null;

    const modalBody = (
        <div className="w-full max-h-[70vh] overflow-y-auto">
            {/* Nueva nota */}
            <div className="mb-6">
                <div className='flex flex-col gap-2'>
                    <textarea
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        placeholder="Nueva nota ..."
                        className="flex-1 p-3 border h-24 border-gray-300 rounded-lg resize-none"
                        rows={3}
                    />
                    <div className='flex justify-end'>
                        <button
                            onClick={handleSaveNote}
                            disabled={!newNote.trim() || saving}
                            className="px-4 w-[30%] justify-center h-9 mt-auto bg-[#2A3182] text-white rounded-lg hover:bg-[#1a1f5a] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {saving ? (
                                <>
                                    Guardando...
                                </>
                            ) : (
                                <>
                                    Agregar
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Lista de notas existentes */}
            <div className='text-start'>
                <h3 className="font-semibold mb-3 text-[#2A3182]">Notas Existentes:</h3>

                {loading ? (
                    <div className="space-y-3">
                        {[...Array(3)].map((_, index) => (
                            <div key={index} className="animate-pulse">
                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                            </div>
                        ))}
                    </div>
                ) : notes.length > 0 ? (
                    <div className="space-y-4 max-h-[200px] overflow-y-auto">
                        {notes.map((note) => (
                            <motion.div
                                key={note.id}
                                className="p-4 border border-gray-200 rounded-lg bg-white"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-[#2A3182]">
                                            {note.user.name}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            {formatDate(note.createdAt)}
                                        </span>
                                    </div>
                                </div>
                                <p className="text-gray-700 whitespace-pre-wrap">
                                    {note.content.replace(/^\[batch_item_[^\]]+\]\s*/, '')}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        <p>No hay notas disponibles</p>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <Modal
            title={`Notas`}
            classNameTitle='pb-2 text-start'
            className='!py-5 w-[25%]'
            message=""
            classNameMessage='hidden'
            body={modalBody}
            onClose={onClose}
        />
    );
};

export default NotesModal; 