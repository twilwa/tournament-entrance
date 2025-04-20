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
    const { messages, model = "arliai/qwq-32b-arliai-rpr-v1:free" } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Invalid messages format" });
    }

    const completion = await openai.chat.completions.create({
      model: model, // Use the model requested or default to QwQ
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
    const { messages, model = "arliai/qwq-32b-arliai-rpr-v1:free", fallbackModel = "deepseek/deepseek-chat-v3-0324:free", reasoning } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Invalid messages format" });
    }

    // Set up streaming response
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    // Include reasoning exclude/inclusion flags if provided
    const createOpts: any = {
      model: model,
      messages,
      temperature: 0.7,
      stream: true,
      max_tokens: 800,
    };
    if (reasoning !== undefined) {
      createOpts.reasoning = reasoning;
    }
    const stream = await openai.chat.completions.create(createOpts);

    let hasContent = false;
    let accumulatedContent = "";

    for await (const chunk of stream) {
      // Get content from delta
      const delta = chunk.choices[0]?.delta || {};
      const content = delta.content || "";
      
      // Check if we have actual content
      if (content && content.trim()) {
        hasContent = true;
        accumulatedContent += content;
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      } else {
        // Try to access reasoning through any available property
        // This is a workaround since 'reasoning' is not in the type definition
        const anyDelta = delta as any;
        if (anyDelta.reasoning && typeof anyDelta.reasoning === 'string') {
          accumulatedContent += anyDelta.reasoning;
          res.write(`data: ${JSON.stringify({ content: anyDelta.reasoning })}\n\n`);
        }
      }
    }

    // If no content was generated, try the fallback model
    if (!hasContent || accumulatedContent.trim() === "") {
      res.write(`data: ${JSON.stringify({ content: "Switching to fallback model..." })}\n\n`);
      
      const fallbackCompletion = await openai.chat.completions.create({
        model: fallbackModel,
        messages,
        temperature: 0.7,
        stream: false,
        max_tokens: 800
      });
      
      const fallbackContent = fallbackCompletion.choices[0]?.message.content || "";
      res.write(`data: ${JSON.stringify({ content: fallbackContent })}\n\n`);
    }

    res.write(`data: [DONE]\n\n`);
    res.end();
  } catch (error: any) {
    console.error("AI streaming error:", error);
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
  }
}