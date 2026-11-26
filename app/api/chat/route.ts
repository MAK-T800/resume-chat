// app/api/chat/route.ts
import { NextRequest } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { buildSystemPrompt } from "@/lib/systemPrompt";
import { checkIp, checkDaily } from "@/lib/rateLimit";

const MAX_LEN = 1500;

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

  // Build Gemini chat history. Gemini uses roles "user" and "model".
  const history = messages.slice(0, -1).map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const genAI = new GoogleGenerativeAI(key);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    systemInstruction: buildSystemPrompt(),
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: 600,
    },
  });

  const chat = model.startChat({ history });

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const result = await chat.sendMessageStream(last.content);
        for await (const chunk of result.stream) {
          const text = chunk.text();
          if (text) controller.enqueue(encoder.encode(text));
        }
      } catch (err) {
        console.error("Gemini stream error:", err);
        controller.enqueue(
          encoder.encode(
            "\n\n[Sorry — something went wrong on my side. Please try again, or reach out via the contact links.]"
          )
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

function json(obj: unknown, status: number) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
