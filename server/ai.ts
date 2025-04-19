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

    // Modify the system message to include thinking tokens instruction
    const modifiedMessages = messages.map(msg => {
      if (msg.role === 'system') {
        return {
          ...msg,
          content: `${msg.content}\n\nAlways start your responses with a <think> section where you reason through your answer. End this section with </think>. The user won't see this part, but it helps you organize your thoughts. After the thinking section, provide your actual response.`
        };
      }
      return msg;
    });

    const completion = await openai.chat.completions.create({
      model: "arliai/qwq-32b-arliai-rpr-v1:free", // The model requested
      messages: modifiedMessages,
      temperature: 0.5, // Lower temperature for more focused responses
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

    // Modify the system message to include thinking tokens instruction
    const modifiedMessages = messages.map(msg => {
      if (msg.role === 'system') {
        return {
          ...msg,
          content: `${msg.content}\n\nAlways start your responses with a <think> section where you reason through your answer. End this section with </think>. The user won't see this part, but it helps you organize your thoughts. After the thinking section, provide your actual response.`
        };
      }
      return msg;
    });

    // Set up streaming response
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const stream = await openai.chat.completions.create({
      model: "arliai/qwq-32b-arliai-rpr-v1:free", // The model requested
      messages: modifiedMessages,
      temperature: 0.5, // Lower temperature for more focused responses
      stream: true,
      max_tokens: 800
    });

    // To collect the thinking section and filter it out for display
    let isInThinkingBlock = false;
    let fullResponse = '';

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || "";
      if (content) {
        fullResponse += content;
        
        // Check for thinking block transition
        if (content.includes('<think>')) {
          isInThinkingBlock = true;
          res.write(`data: ${JSON.stringify({ thinking: true })}\n\n`);
        } else if (content.includes('</think>')) {
          isInThinkingBlock = false;
          res.write(`data: ${JSON.stringify({ thinking: false })}\n\n`);
        } else if (!isInThinkingBlock) {
          // Only stream content that's not in the thinking block
          res.write(`data: ${JSON.stringify({ content })}\n\n`);
        }
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