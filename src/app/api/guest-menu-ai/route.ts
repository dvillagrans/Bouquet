import { deepseek } from "@ai-sdk/deepseek";
import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { NextResponse } from "next/server";
import { SECURITY_INSTRUCTIONS, sanitizeUserContent, wrapUserContent } from "@/lib/ai-security";

export const maxDuration = 30;

type GuestMenuContextItem = {
  name: string;
  description?: string | null;
  categoryName?: string | null;
  price: number;
  isPopular?: boolean;
  isSoldOut?: boolean;
};

type GuestMenuContext = {
  restaurantName?: string;
  tableCode?: string;
  items?: GuestMenuContextItem[];
};

type SupportedMessageRole = "user" | "assistant" | "system";

function normalizeMessages(raw: unknown): Array<{ role: SupportedMessageRole; content: string }> {
  if (!Array.isArray(raw)) return [];

  return raw
    .map((entry) => {
      const msg = entry as {
        role?: unknown;
        content?: unknown;
        parts?: Array<{ type?: unknown; text?: unknown }>;
      };

      const role = msg.role;
      if (role !== "user" && role !== "assistant" && role !== "system") {
        return null;
      }

      let content = "";
      if (typeof msg.content === "string") {
        content = msg.content;
      } else if (Array.isArray(msg.parts)) {
        content = msg.parts
          .filter((part) => part?.type === "text" && typeof part?.text === "string")
          .map((part) => part.text as string)
          .join("\n");
      }

      const trimmed = content.trim();
      if (!trimmed) return null;

      return { role, content: trimmed };
    })
    .filter((m): m is { role: SupportedMessageRole; content: string } => m !== null)
    .slice(-20);
}

function normalizeContext(raw: unknown): GuestMenuContext {
  const src = (raw ?? {}) as GuestMenuContext;
  return {
    restaurantName: src.restaurantName ?? "Restaurante",
    tableCode: src.tableCode ?? "",
    items: Array.isArray(src.items) ? src.items.slice(0, 120) : [],
  };
}

export async function POST(req: Request) {
  const body = await req.json();
  const messages = normalizeMessages(body?.messages);
  const context = normalizeContext(body?.context);

  const menuSnapshot = (context.items ?? []).map((item) => ({
    name: item.name,
    category: item.categoryName ?? "Sin categoria",
    price: item.price,
    description: item.description ?? "",
    isPopular: Boolean(item.isPopular),
    isSoldOut: Boolean(item.isSoldOut),
  }));

  const systemPrompt = [
    "Eres Bouquet AI, un asistente de menu para comensales en mesa.",
    "Responde SIEMPRE en espanol de Mexico.",
    "Objetivo: recomendar rapido que pedir segun gustos, presupuesto y ocasion.",
    "Reglas:",
    "- Solo recomienda platos existentes en el menu compartido.",
    "- Nunca inventes platillos, precios o promociones.",
    "- No recomiendes productos marcados como agotados.",
    "- No afirmes que ya ordenaste o que ya se envio a cocina, a menos que emitas la directiva estructurada de accion.",
    "- Entrega respuestas breves, claras y utiles para decidir en menos de 30 segundos.",
    "- Si el usuario no da contexto, haz 1 pregunta corta y ofrece 2 opciones iniciales.",
    "- Cuando recomiendes, incluye nombre, precio y razon en 1 linea por opcion.",
    "- Si el usuario pide agregar/ordenar, responde con confirmacion breve y agrega AL FINAL una sola linea con este formato exacto:",
    "[[BOUQUET_ACTION:{\"type\":\"add_to_cart\",\"items\":[{\"name\":\"NOMBRE EXACTO DEL MENU\",\"quantity\":2}]}]]",
    "- Usa nombres exactos del menu en la directiva.",
    "- Si no hay accion de carrito, no incluyas la directiva.",
    "Contexto de la mesa:",
    `restaurante=${context.restaurantName ?? "Restaurante"}; mesa=${context.tableCode ?? ""}`,
    JSON.stringify(menuSnapshot),
    SECURITY_INSTRUCTIONS,
  ].join("\n");

  const hasDeepSeek = Boolean(process.env.DEEPSEEK_API_KEY);
  const hasOpenAI = Boolean(process.env.OPENAI_API_KEY);

  if (!hasDeepSeek && !hasOpenAI) {
    return NextResponse.json(
      {
        error:
          "El asistente AI no esta configurado. Agrega DEEPSEEK_API_KEY u OPENAI_API_KEY en variables de entorno.",
      },
      { status: 503 },
    );
  }

  const model = hasDeepSeek ? deepseek("deepseek-chat") : openai("gpt-4o-mini");

  const result = streamText({
    model,
    system: systemPrompt,
    messages: messages.map((m) => ({
      ...m,
      content: m.role === "user" ? wrapUserContent(sanitizeUserContent(m.content)) : m.content,
    })),
    temperature: 0.35,
  });

  return result.toUIMessageStreamResponse();
}
