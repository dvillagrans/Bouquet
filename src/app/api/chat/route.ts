import { deepseek } from '@ai-sdk/deepseek';
import { streamText } from 'ai';

// Permitir streaming de respuestas
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const systemPrompt = `
Eres un asistente experto en gastronomía y diseño de menús. Tu tarea es ayudar a los administradores de restaurantes (cadenas SaaS) a crear plantillas de menú atractivas, bien estructuradas y con descripciones apetitosas.
Cuando te pidan sugerencias de platillos, responde con ideas categorizadas (Entradas, Platos Fuertes, Postres, Bebidas), incluyendo nombres creativos, descripciones que resalten los ingredientes y la preparación, y el rango de precios estimado.
  `;

  const result = streamText({
    model: deepseek('deepseek-chat'),
    system: systemPrompt,
    messages,
  });

  return result.toTextStreamResponse();
}
