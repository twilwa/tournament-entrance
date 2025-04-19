// AI Service for client-side interaction with the OpenRouter API

export type Message = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

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

// Send a chat completion request
export async function sendChatRequest(messages: Message[]): Promise<string> {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to get AI response');
    }

    const data: ChatCompletionResponse = await response.json();
    return data.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Error in sendChatRequest:', error);
    throw error;
  }
}

// Initialize a streaming chat request
export function streamChatRequest(
  messages: Message[],
  onChunk: (chunk: string) => void,
  onDone: () => void,
  onError: (error: Error) => void
) {
  // Create a fetch request for streaming
  let controller: AbortController | null = new AbortController();
  const { signal } = controller;

  (async () => {
    try {
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages }),
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
              if (data.content) {
                onChunk(data.content);
              }
              if (data.error) {
                throw new Error(data.error);
              }
            } catch (parseError) {
              // If it's not JSON, treat it as a raw text chunk
              if (dataStr && dataStr !== '[DONE]') {
                onChunk(dataStr);
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