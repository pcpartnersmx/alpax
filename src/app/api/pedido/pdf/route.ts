// @ts-ignore
import pdf from 'pdf-parse';
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

export const maxDuration = 30;


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

        // Analizar el texto con OpenAI
        const result = await streamText({
            model: openai('gpt-4o'),
            messages: [
                {
                    role: 'system',
                    content: `
                        Eres un asistente que analiza textos. Proporciona un Json con la siguiente información(No. de orden y productos)
                        {
                            "orden": 200
                            "productos": [
                            {
                            "codigo": "S039",
                            "cantidad": 7342,
                            },
                            {
                            "codigo": "S039",
                            "cantidad": 7342,
                        }]
                        }
                    `
                },
                {
                    role: 'user',
                    content: fullText
                }
            ],
            maxTokens: 1500,
            temperature: 0.3
        });

        // Obtener el resultado completo
        let analysisResult = '';
        for await (const chunk of result.textStream) {
            analysisResult += chunk;
        }

        // Intentar parsear el JSON de la respuesta
        let parsedAnalysis;
        try {
            // Buscar JSON en la respuesta (puede estar rodeado de texto)
            const jsonMatch = analysisResult.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                parsedAnalysis = JSON.parse(jsonMatch[0]);
            } else {
                parsedAnalysis = { rawResponse: analysisResult };
            }
        } catch (parseError) {
            console.error('Error parsing OpenAI response:', parseError);
            parsedAnalysis = { rawResponse: analysisResult };
        }

        return Response.json({
            success: true,
            message: 'PDF procesado correctamente',
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            numPages: data.numpages,
            fullText: fullText.trim(),
            info: data.info,
            analysis: parsedAnalysis
        });
    } catch (error) {
        console.error('Error procesando archivo:', error);
        return Response.json({ success: false, error: 'Error procesando archivo' }, { status: 500 });
    }
}