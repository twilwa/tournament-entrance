import OpenAI from "openai";
import { Request, Response } from "express";

// Configure OpenAI client to use OpenRouter
export const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY || "",
  baseURL: "https://openrouter.ai/api/v1",
  defaultHeaders: {
    "HTTP-Referer": "https://the-arena.repl.co", // Required for OpenRouter
    "X-Title": "The Arena",
  },
});

// Handler for chat completion
export async function handleChatCompletion(req: Request, res: Response) {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Invalid messages format" });
    }

    const completion = await openai.chat.completions.create({
      model: "arliai/qwq-32b-arliai-rpr-v1:free", // The model requested
      messages,
      temperature: 0.7,
      stream: false,
      max_tokens: 800
    });

    res.json(completion);
  } catch (error: any) {
    console.error("AI request error:", error);
    res.status(500).json({ 
      error: "Failed to process AI request", 
      details: error.message 
    });
  }
}

// Handler for streaming chat completion
export async function handleStreamingChatCompletion(req: Request, res: Response) {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Invalid messages format" });
    }

    // Set up streaming response
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const stream = await openai.chat.completions.create({
      model: "arliai/qwq-32b-arliai-rpr-v1:free", // The model requested
      messages,
      temperature: 0.7,
      stream: true,
      max_tokens: 800
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || "";
      if (content) {
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }

    res.write(`data: [DONE]\n\n`);
    res.end();
  } catch (error: any) {
    console.error("AI streaming error:", error);
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
  }
}