import OpenAI from "openai";
import type { Request, Response } from "express";

// Initialize OpenAI client with OpenRouter config
const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY || "",
  baseURL: "https://openrouter.ai/api/v1",
  defaultHeaders: {
    "HTTP-Referer": "https://the-arena.repl.co",
    // Required for OpenRouter
    "X-Title": "The Arena"
  }
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
    const { 
      messages, 
      model = "arliai/qwq-32b-arliai-rpr-v1:free", 
      fallbackModel = "deepseek/deepseek-chat-v3-0324", 
      reasoning 
    } = req.body;

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

    // Handle both boolean and object formats for backward compatibility
    if (reasoning !== undefined) {
      if (typeof reasoning === 'object' && reasoning !== null) {
        // New format: { exclude: boolean }
        createOpts.reasoning = reasoning;
      } else if (typeof reasoning === 'boolean') {
        // Old format: boolean (true = include, false = exclude)
        createOpts.reasoning = { exclude: !reasoning };
      } else {
        // Default to exclude
        createOpts.reasoning = { exclude: true };
      }
    }

    const stream = await openai.chat.completions.create(createOpts);

    let hasContent = false;
    let reasoningContent = '';
    let actualContent = '';

    for await (const chunk of stream) {
      // Get content from delta
      const delta = chunk.choices[0]?.delta || {};
      const content = delta.content || "";
      
      // Check if we have actual content
      if (content && content.trim()) {
        hasContent = true;
        actualContent += content;
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      } else {
        // Try to access reasoning through any available property
        const anyDelta = delta as any;
        if (anyDelta.reasoning && typeof anyDelta.reasoning === 'string') {
          reasoningContent += anyDelta.reasoning;
          // Send reasoning content with a special property
          res.write(`data: ${JSON.stringify({ reasoning: anyDelta.reasoning })}\n\n`);
        }
      }
    }

    // If no content was generated, try the fallback model
    if (!hasContent || actualContent.trim() === "") {
      // If we have reasoning but no content, that's strange - log it
      if (reasoningContent.trim() !== "") {
        console.warn("Received reasoning but no content from model, switching to fallback");
      }
      
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