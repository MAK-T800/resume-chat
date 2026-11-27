// app/api/chat/route.ts
import { NextRequest } from "next/server";
import {
  GoogleGenAI,
  ThinkingLevel,
  type Content,
  type GenerateContentResponse,
} from "@google/genai";
import { buildSystemPrompt } from "@/lib/systemPrompt";
import { checkIp, checkDaily } from "@/lib/rateLimit";

const MAX_LEN = 1500;
const MODELS = [
  "gemma-4-31b-it",
  "gemma-4-26b-a4b-it",
  "gemini-3.5-flash-lite",
];
const UNAVAILABLE_MESSAGE =
  "The assistant is temporarily unavailable. Please try again in a little while.";

function visibleText(response: GenerateContentResponse): string {
  return (response.candidates ?? [])
    .flatMap((candidate) => candidate.content?.parts ?? [])
    .filter((part) => !part.thought)
    .map((part) => part.text ?? "")
    .join("");
}

export async function POST(req: NextRequest) {
  const key = process.env.GOOGLE_AI_API_KEY;
  if (!key) {
    return json({ error: "Server misconfigured: missing API key." }, 500);
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  if (!checkIp(ip).ok) {
    return json({ error: "Too many messages. Please try again in a few minutes." }, 429);
  }
  if (!checkDaily().ok) {
    return json({ error: "Daily limit reached. Please try again tomorrow." }, 429);
  }

  let body: { messages?: { role: string; content: string }[] };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid request body." }, 400);
  }

  const messages = Array.isArray(body.messages) ? body.messages : [];
  const last = messages[messages.length - 1];
  if (!last || last.role !== "user" || !last.content?.trim()) {
    return json({ error: "Missing user message." }, 400);
  }
  if (last.content.length > MAX_LEN) {
    return json({ error: `Message too long (max ${MAX_LEN} characters).` }, 400);
  }

  const contents: Content[] = messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));
  const ai = new GoogleGenAI({ apiKey: key });

  const encoder = new TextEncoder();
  for (const model of MODELS) {
    try {
      const responseStream = await ai.models.generateContentStream({
        model,
        contents,
        config: {
          systemInstruction: buildSystemPrompt(),
          temperature: 0.4,
          maxOutputTokens: 600,
          ...(model.startsWith("gemma-4-")
            ? {
                thinkingConfig: {
                  thinkingLevel: ThinkingLevel.MINIMAL,
                  includeThoughts: false,
                },
              }
            : {}),
        },
      });
      const iterator = responseStream[Symbol.asyncIterator]();
      let firstText = "";

      while (!firstText) {
        const next = await iterator.next();
        if (next.done) break;
        firstText = visibleText(next.value);
      }

      if (!firstText) {
        throw new Error("Model completed without visible response text.");
      }

      const stream = new ReadableStream<Uint8Array>({
        start(controller) {
          controller.enqueue(encoder.encode(firstText));
          void streamRemaining(iterator, controller, model, encoder);
        },
      });

      return new Response(stream, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-store, no-transform",
        },
      });
    } catch (err) {
      console.error(`Chat model ${model} failed before response text:`, err);
    }
  }

  return json({ error: UNAVAILABLE_MESSAGE }, 503);
}

async function streamRemaining(
  iterator: AsyncIterator<GenerateContentResponse>,
  controller: ReadableStreamDefaultController<Uint8Array>,
  model: string,
  encoder: TextEncoder
) {
  try {
    while (true) {
      const next = await iterator.next();
      if (next.done) break;
      const text = visibleText(next.value);
      if (text) controller.enqueue(encoder.encode(text));
    }
    controller.close();
  } catch (err) {
    console.error(`Chat model ${model} stream interrupted:`, err);
    controller.error(new Error("The response stream was interrupted."));
  }
}

function json(obj: unknown, status: number) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
