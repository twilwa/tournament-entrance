// AI Service for client-side interaction with the OpenRouter API

// Define message structure for chat
export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export type ChatCompletionResponse = {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
};

// Function to send a chat request (non-streaming)
export async function sendChatRequest(
  messages: Message[], 
  model: string = 'arliai/qwq-32b-arliai-rpr-v1:free'
): Promise<string> {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ messages, model }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Failed to get response');
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || '';
}

// Define callback types for streaming
type ChunkCallback = (chunk: string, isReasoning?: boolean) => void;
type DoneCallback = () => void;
type ErrorCallback = (error: Error) => void;

// Initialize a streaming chat request
export function streamChatRequest(
  messages: Message[],
  onChunk: ChunkCallback,
  onDone: DoneCallback,
  onError: ErrorCallback,
  model: string = 'arliai/qwq-32b-arliai-rpr-v1:free',
  reasoningExclude: boolean = true
) {
  // Create a fetch request for streaming
  let controller: AbortController | null = new AbortController();
  const { signal } = controller;

  (async () => {
    try {
      // Build streaming request body, excluding reasoning tokens if requested
      const body: any = { messages, model };
      // Body expects reasoning:{exclude:boolean}
      body.reasoning = { exclude: reasoningExclude };
      
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to get streaming response');
      }

      // Read the stream
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Stream reader not available');
      }

      const decoder = new TextDecoder();

      // Process the stream
      while (true) {
        if (!controller) break; // If aborted
        
        const { done, value } = await reader.read();
        if (done) break;

        // Decode the chunk
        const chunk = decoder.decode(value, { stream: true });
        
        // Process SSE format
        const lines = chunk.split('\n\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.substring(6); // Remove 'data: ' prefix
            
            if (dataStr === '[DONE]') {
              // Streaming complete
              if (controller) {
                reader.cancel();
                controller = null;
                onDone();
              }
              return;
            }
            
            try {
              const data = JSON.parse(dataStr);
              // Check for content or reasoning specifically
              if (data.content) {
                onChunk(data.content, false);
              } else if (data.reasoning) {
                // Explicitly mark reasoning chunks
                onChunk(data.reasoning, true);
              }
              if (data.error) {
                throw new Error(data.error);
              }
            } catch (parseError) {
              // If it's not JSON, treat it as a raw text chunk
              if (dataStr && dataStr !== '[DONE]') {
                onChunk(dataStr, false);
              }
            }
          }
        }
      }

      // If we get here without seeing [DONE], complete anyway
      if (controller) {
        controller = null;
        onDone();
      }
    } catch (err: unknown) {
      const error = err as Error;
      if (error instanceof Error && error.name === 'AbortError') {
        // Intentional abort, not an error
        return;
      }
      console.error('Streaming error:', error);
      onError(error instanceof Error ? error : new Error(String(error)));
      controller = null;
    }
  })();

  // Return a function to abort the fetch
  return () => {
    if (controller) {
      controller.abort();
      controller = null;
    }
  };
}