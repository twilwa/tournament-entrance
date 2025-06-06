import { Plugin } from 'vite';
import OpenAI from 'openai';

export function apiPlugin(): Plugin {
  let openai: OpenAI;
  
  const initOpenAI = () => {
    if (!openai) {
      const apiKey = process.env.OPENAI_API_KEY || process.env.OPENROUTER_API_KEY || "";
      console.log('🔑 Initializing OpenAI client with API key:', apiKey ? 'SET' : 'NOT SET');
      
      openai = new OpenAI({
        apiKey,
        baseURL: "https://openrouter.ai/api/v1",
        defaultHeaders: {
          "HTTP-Referer": "https://the-arena.repl.co",
          "X-Title": "The Arena"
        }
      });
    }
    return openai;
  };
  return {
    name: 'api-plugin',
    configureServer(server) {
      server.middlewares.use('/api/chat/stream', async (req, res, next) => {
        if (req.method !== 'POST') return next();

        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', async () => {
          try {
            const { messages, model = "deepseek/deepseek-chat:free", reasoning } = JSON.parse(body);
            
            console.log('🟡 Vite API: Streaming chat request:', { model, messageCount: messages?.length });

            // Set up streaming response
            res.setHeader("Content-Type", "text/event-stream");
            res.setHeader("Cache-Control", "no-cache");
            res.setHeader("Connection", "keep-alive");

            const createOpts: any = {
              model,
              messages,
              temperature: 0.7,
              stream: true,
              max_tokens: 800,
            };

            if (reasoning !== undefined) {
              createOpts.reasoning = reasoning;
            }

            try {
              const client = initOpenAI();
              const stream = await client.chat.completions.create(createOpts);
              
              for await (const chunk of stream) {
                const delta = chunk.choices[0]?.delta || {};
                const content = delta.content || "";
                
                if (content) {
                  res.write(`data: ${JSON.stringify({ content })}\n\n`);
                }
              }
              
              res.write(`data: [DONE]\n\n`);
              res.end();
            } catch (error: any) {
              console.error('❌ OpenRouter error:', error);
              res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
              res.end();
            }
          } catch (error: any) {
            console.error('❌ Request parsing error:', error);
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'Invalid request' }));
          }
        });
      });

      server.middlewares.use('/api/chat', async (req, res, next) => {
        if (req.method !== 'POST') return next();

        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', async () => {
          try {
            const { messages, model = "deepseek/deepseek-chat:free" } = JSON.parse(body);
            
            console.log('🔵 Vite API: Chat request:', { model, messageCount: messages?.length });

            const client = initOpenAI();
            const completion = await client.chat.completions.create({
              model,
              messages,
              temperature: 0.7,
              stream: false,
              max_tokens: 800
            });

            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(completion));
          } catch (error: any) {
            console.error('❌ Chat error:', error);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: error.message }));
          }
        });
      });
    }
  };
}