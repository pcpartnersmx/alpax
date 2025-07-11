// @ts-ignore
import pdf from 'pdf-parse';

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return Response.json({ success: false, error: 'No se recibió ningún archivo' }, { status: 400 });
        }

        console.log('Archivo recibido:', file.name, file.size, file.type);

        // Convertir el archivo a Buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Extraer texto del PDF usando pdf-parse
        const data = await pdf(buffer).then((data: any) => {
            console.log(data)
            return data
        })

        console.log('PDF procesado, número de páginas:', data.numpages);

        // Obtener el texto completo
        const fullText = data.text;

        return Response.json({
            success: true,
            message: 'PDF procesado correctamente',
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            numPages: data.numpages,
            fullText: fullText.trim(),
            info: data.info
        });
    } catch (error) {
        console.error('Error procesando archivo:', error);
        return Response.json({ success: false, error: 'Error procesando archivo' }, { status: 500 });
    }
}