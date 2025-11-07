import { generateNfeData } from '../../../server/pdfGenerator';

export const POST = async ({ request }: { request: Request }) => {
  try {
    const xmlContent = await request.text();
    if (!xmlContent) {
      return new Response('Corpo da requisição está vazio.', { status: 400 });
    }

    const pdfBlob = await generateNfeData(xmlContent);

    if (pdfBlob) {
      return new Response(JSON.stringify(pdfBlob), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } else {
      return new Response('Falha ao gerar o PDF.', { status: 500 });
    }
  } catch (error) {
    console.error("Erro na API de geração de PDF:", error);
    return new Response('Erro interno do servidor.', { status: 500 });
  }
};