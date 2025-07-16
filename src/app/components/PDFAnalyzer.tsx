'use client';

import { useState } from 'react';
import { Button } from '@/app/components/ui/button';

interface AnalysisResult {
    orden: number;
    productos: Array<{
        codigo: string;
        cantidad: number;
    }>;
}

interface PDFResponse {
    success: boolean;
    message: string;
    fileName: string;
    fileSize: number;
    fileType: string;
    numPages: number;
    fullText: string;
    info: any;
    analysis: AnalysisResult;
}

export default function PDFAnalyzer() {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<PDFResponse | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile && selectedFile.type === 'application/pdf') {
            setFile(selectedFile);
            setError(null);
        } else {
            setError('Por favor selecciona un archivo PDF válido');
            setFile(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return;

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/api/pedido/pdf', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (data.success) {
                setResult(data);
            } else {
                setError(data.error || 'Error procesando el archivo');
            }
        } catch (err) {
            setError('Error de conexión');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6 text-center">Analizador de PDF</h1>
            
            <form onSubmit={handleSubmit} className="mb-8">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <input
                        type="file"
                        accept=".pdf"
                        onChange={handleFileChange}
                        className="hidden"
                        id="pdf-upload"
                    />
                    <label htmlFor="pdf-upload" className="cursor-pointer">
                        <div className="text-gray-600">
                            <p className="text-lg mb-2">
                                {file ? `Archivo seleccionado: ${file.name}` : 'Haz clic para seleccionar un PDF'}
                            </p>
                            {file && (
                                <p className="text-sm text-gray-500">
                                    Tamaño: {(file.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                            )}
                        </div>
                    </label>
                </div>

                {error && (
                    <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                        {error}
                    </div>
                )}

                <div className="mt-4 text-center">
                    <Button
                        type="submit"
                        disabled={!file || loading}
                        className="px-6 py-2"
                    >
                        {loading ? 'Procesando...' : 'Analizar PDF'}
                    </Button>
                </div>
            </form>

            {result && (
                <div className="space-y-6">
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                        <strong>¡Éxito!</strong> {result.message}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white p-4 rounded-lg shadow">
                            <h3 className="text-lg font-semibold mb-3">Información del Archivo</h3>
                            <div className="space-y-2 text-sm">
                                <p><strong>Nombre:</strong> {result.fileName}</p>
                                <p><strong>Tamaño:</strong> {(result.fileSize / 1024 / 1024).toFixed(2)} MB</p>
                                <p><strong>Tipo:</strong> {result.fileType}</p>
                                <p><strong>Páginas:</strong> {result.numPages}</p>
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-lg shadow">
                            <h3 className="text-lg font-semibold mb-3">Análisis de OpenAI</h3>
                            {result.analysis && typeof result.analysis === 'object' && 'orden' in result.analysis ? (
                                <div className="space-y-2">
                                    <p><strong>Orden:</strong> {result.analysis.orden}</p>
                                    <p><strong>Productos:</strong></p>
                                    <ul className="list-disc list-inside ml-4">
                                        {result.analysis.productos?.map((producto, index) => (
                                            <li key={index}>
                                                Código: {producto.codigo}, Cantidad: {producto.cantidad}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ) : (
                                <div className="text-gray-600">
                                    <p>Respuesta cruda:</p>
                                    <pre className="text-xs bg-gray-100 p-2 rounded mt-2 overflow-auto">
                                        {JSON.stringify(result.analysis, null, 2)}
                                    </pre>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg shadow">
                        <h3 className="text-lg font-semibold mb-3">Texto Extraído del PDF</h3>
                        <div className="bg-gray-100 p-4 rounded max-h-64 overflow-y-auto">
                            <pre className="text-sm whitespace-pre-wrap">{result.fullText}</pre>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 