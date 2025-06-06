import OpenAI from "openai";
import type { Request, Response } from "express";

// Check for API key at module load time
console.log("🔑 OpenAI/OpenRouter API Key status:", process.env.OPENAI_API_KEY ? "SET" : "NOT SET");
if (!process.env.OPENAI_API_KEY) {
  console.warn("⚠️  OPENAI_API_KEY is not set. AI features will not work properly.");
  console.warn("⚠️  For OpenRouter, set OPENAI_API_KEY to your OpenRouter API key.");
}

// Initialize OpenAI client with OpenRouter config
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
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

    console.log("🔵 Non-streaming chat request:", {
      model,
      messageCount: messages?.length,
      lastMessage: messages?.[messages.length - 1]
    });

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

    console.log("✅ Non-streaming response received:", {
      model: completion.model,
      choices: completion.choices.length,
      content: completion.choices[0]?.message?.content?.slice(0, 100) + "..."
    });

    res.json(completion);
  } catch (error: any) {
    console.error("❌ AI request error:", error);
    res.status(500).json({ 
      error: "Failed to process AI request", 
      details: error.message 
    });
  }
}

// Handler for streaming chat completion
export async function handleStreamingChatCompletion(req: Request, res: Response) {
  console.log("🟡 Streaming chat request started at", new Date().toISOString());
  console.log("📥 Request headers:", req.headers);
  console.log("📥 Request body:", JSON.stringify(req.body, null, 2));
  
  try {
    const { 
      messages, 
      model = "deepseek/deepseek-chat:free", 
      fallbackModel = "deepseek/deepseek-chat:free", 
      reasoning 
    } = req.body;

    console.log("📊 Request details:", {
      model,
      fallbackModel,
      reasoning,
      messageCount: messages?.length,
      lastUserMessage: messages?.filter((m: any) => m.role === 'user').slice(-1)[0]?.content?.slice(0, 100),
      systemPrompt: messages?.[0]?.role === 'system' ? messages[0].content.slice(0, 200) + "..." : "None"
    });

    if (!messages || !Array.isArray(messages)) {
      console.log("❌ Invalid messages format");
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

    console.log("🚀 Sending request to OpenRouter with options:", {
      model: createOpts.model,
      reasoning: createOpts.reasoning,
      messageCount: createOpts.messages.length,
      temperature: createOpts.temperature,
      maxTokens: createOpts.max_tokens,
      apiKey: process.env.OPENAI_API_KEY ? 'SET' : 'NOT SET',
      baseURL: openai.baseURL
    });
    console.log("📋 Full messages array:", JSON.stringify(createOpts.messages, null, 2));

    console.log("🔄 Creating OpenAI stream...");
    const stream = await openai.chat.completions.create(createOpts) as any;
    console.log("✅ Stream created successfully");

    let hasContent = false;
    let reasoningContent = '';
    let actualContent = '';
    let chunkCount = 0;

    console.log("📡 Starting to process stream chunks...");

    for await (const chunk of stream) {
      chunkCount++;
      
      // Get content from delta
      const delta = chunk.choices[0]?.delta || {};
      const content = delta.content || "";
      
      // Log every chunk for debugging
      console.log(`📦 Chunk ${chunkCount}:`, {
        hasContent: !!content,
        contentLength: content.length,
        contentPreview: content.slice(0, 50),
        deltaKeys: Object.keys(delta),
        fullDelta: JSON.stringify(delta),
        chunkData: JSON.stringify(chunk)
      });
      
      // Check if we have actual content
      if (content && content.trim()) {
        hasContent = true;
        actualContent += content;
        console.log(`✨ Sending content chunk ${chunkCount}: "${content}"`);
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      } else {
        // Try to access reasoning through any available property
        const anyDelta = delta as any;
        if (anyDelta.reasoning && typeof anyDelta.reasoning === 'string') {
          reasoningContent += anyDelta.reasoning;
          console.log(`🧠 Reasoning chunk ${chunkCount}: "${anyDelta.reasoning.slice(0, 50)}..."`);
          // Send reasoning content with a special property
          res.write(`data: ${JSON.stringify({ reasoning: anyDelta.reasoning })}\n\n`);
        } else if (Object.keys(delta).length > 0) {
          console.log(`❓ Unknown delta type in chunk ${chunkCount}:`, delta);
        }
      }
    }

    console.log("📈 Stream processing complete:", {
      totalChunks: chunkCount,
      hasContent,
      actualContentLength: actualContent.length,
      reasoningContentLength: reasoningContent.length,
      actualContentPreview: actualContent.slice(0, 100),
      reasoningContentPreview: reasoningContent.slice(0, 100)
    });

    // If no content was generated, try the fallback model
    if (!hasContent || actualContent.trim() === "") {
      console.log("⚠️ No content received from primary model, switching to fallback");
      
      // If we have reasoning but no content, that's strange - log it
      if (reasoningContent.trim() !== "") {
        console.warn("🤔 Received reasoning but no content from model, switching to fallback");
        console.log("🧠 Full reasoning content:", reasoningContent);
      }
      
      res.write(`data: ${JSON.stringify({ content: "Switching to fallback model..." })}\n\n`);
      
      console.log("🔄 Calling fallback model:", fallbackModel);
      
      const fallbackCompletion = await openai.chat.completions.create({
        model: fallbackModel,
        messages,
        temperature: 0.7,
        stream: false,
        max_tokens: 800
      });
      
      const fallbackContent = fallbackCompletion.choices[0]?.message.content || "";
      console.log("🔄 Fallback response:", {
        model: fallbackCompletion.model,
        contentLength: fallbackContent.length,
        contentPreview: fallbackContent.slice(0, 100)
      });
      
      res.write(`data: ${JSON.stringify({ content: fallbackContent })}\n\n`);
    }

    console.log("✅ Sending [DONE] signal");
    res.write(`data: [DONE]\n\n`);
    res.end();
  } catch (error: any) {
    console.error("❌ AI streaming error:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
      response: error.response?.data || error.response,
      status: error.response?.status,
      statusText: error.response?.statusText
    });
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
  }
}