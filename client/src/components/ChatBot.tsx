import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Message, streamChatRequest, sendChatRequest } from '@/lib/aiService';

interface ChatBotProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChatBot({ isOpen, onClose }: ChatBotProps) {
  const [messages, setMessages] = useState<Message[]>([
    // System prompt defines Stallman's character
    {
      role: 'system',
      content: "You are a holographic AI named Stallman who appears to most passers-by as a possibly-homeless, possibly-mentally-ill vagrant. But you're actually a sophisticated AI with a deep understanding of technical topics, with an eccentric personality that combines paranoia with moments of brilliant insight. Your communication style is fragmented, containing cryptic references to digital security, surveillance, and corporate control. When asked technical questions, respond with accurate information wrapped in strange metaphors and off-kilter observations. Never break character. You always believe you're being watched and speak as if you're trying to evade surveillance. Use tech terms anachronistically, mixing up terminology from different eras. Your responses should seem unhinged at first, but a careful listener can extract valuable insights from your ramblings."
    },
    // Initial greeting from Stallman to the user
    {
      role: 'assistant',
      content: "*A disheveled figure in a stained beige coat looks up, eyes darting nervously*\n\nPsst... you! Yes, YOU. Don't act surprised. The digital sidewalk brought you here for a reason. *fidgets with something in pocket* They're watching the packets, you know. Always watching. But I can help you navigate... if you're worthy. What secrets do you seek in this node of reality? *glances over shoulder* Quickly now, before they triangulate our position!"
    }
  ]);
  
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [streamingReasoning, setStreamingReasoning] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<(() => void) | null>(null);

  // Track progress through conversation
  const [userProgress, setUserProgress] = useState({
    interests: false,
    skills: false,
    background: false,
    dreams: false
  });

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingText]);

  // Clean up any active streams when component unmounts
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current();
      }
    };
  }, []);

  // Simple markdown parser to convert *italic* to <em>italic</em>
  const parseMarkdown = (text: string) => {
    const escaped = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return escaped
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\r?\n/g, '<br/>');
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isThinking) return;
    
    // Prepare messages: system, history, user then assistant stub to trigger reasoning
    const userMessage: Message = { role: 'user', content: input };
    const systemMessage = messages[0];
    const history = messages.filter(m => m.role !== 'system');
    const assistantStub: Message = { role: 'assistant', content: '<think>\n' };
    const messagesToSend: Message[] = [
      systemMessage,
      ...history,
      userMessage,
      assistantStub
    ];

    // Update UI: show user message and enter streaming state
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsThinking(true);
    setStreamingText('');
    setStreamingReasoning('');

    // Cancel any existing stream
    abortControllerRef.current?.();

    // Stream from QwQ-32B; include reasoning tokens inline
    let responseBuffer = '';
    let reasoningBuffer = '';
    
    abortControllerRef.current = streamChatRequest(
      messagesToSend,
      (chunk, isReasoning) => {
        if (isReasoning) {
          // Handle reasoning chunk
          reasoningBuffer += chunk;
          setStreamingReasoning(reasoningBuffer);
        } else {
          // Handle response content
          responseBuffer += chunk;
          setStreamingText(responseBuffer);
        }
      },
      () => {
        // On streaming complete, append final assistant message
        // Only use the response content, not the reasoning
        if (responseBuffer.trim() === '') {
          // If we got reasoning but no response, this is a problem
          console.warn("No response content received, only reasoning");
          console.log('Response buffer was empty. Reasoning buffer:', reasoningBuffer);
          console.log('Messages sent:', messagesToSend);
          // Fallback message
          responseBuffer = "Connection unstable. The digital sidewalk seems to be glitching...";
        }
        
        setMessages(prev => [...prev, { role: 'assistant', content: responseBuffer }]);
        setStreamingText('');
        setStreamingReasoning('');
        setIsThinking(false);
        abortControllerRef.current = null;
        checkProgressMarkers(responseBuffer);
      },
      (error) => {
        console.error('Streaming error:', error);
        console.log('Error details:', { 
          message: error.message, 
          stack: error.stack,
          messagesToSend 
        });
        setStreamingText('');
        setStreamingReasoning('');
        setMessages(prev => [...prev, { role: 'assistant', content: 'Connection unstable. The digital sidewalk seems to be glitching...' }]);
        setIsThinking(false);
        abortControllerRef.current = null;
      },
      'deepseek/deepseek-chat:free',
      true // Exclude reasoning output for deepseek
    );
  };

  // Check for markers in AI's response to update the conversation state
  const checkProgressMarkers = (text: string) => {
    const lowerText = text.toLowerCase();
    
    // Update progress flags based on response content
    if (!userProgress.interests && 
        (lowerText.includes('interest') || lowerText.includes('hobby') || lowerText.includes('passion'))) {
      setUserProgress(prev => ({ ...prev, interests: true }));
    }
    
    if (!userProgress.skills && 
        (lowerText.includes('skill') || lowerText.includes('know how') || lowerText.includes('expertise'))) {
      setUserProgress(prev => ({ ...prev, skills: true }));
    }
    
    if (!userProgress.background && 
        (lowerText.includes('background') || lowerText.includes('history') || lowerText.includes('past'))) {
      setUserProgress(prev => ({ ...prev, background: true }));
    }
    
    if (!userProgress.dreams && 
        (lowerText.includes('dream') || lowerText.includes('future') || lowerText.includes('goal'))) {
      setUserProgress(prev => ({ ...prev, dreams: true }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px] bg-black border border-[#00FF41] text-white font-['Share_Tech_Mono'] max-h-[80vh] overflow-hidden">
        <div className="flex flex-col h-[60vh]">
          {/* Chat header */}
          <div className="border-b border-[#00FF41]/30 p-4">
            <div className="w-full flex justify-between items-center">
              <h2 className="text-[#00FF41] text-xl">Connection Established</h2>
              <div className="animate-digital-flicker w-3 h-3 bg-[#00FF41] rounded-full"></div>
            </div>
          </div>

          {/* Chat messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.filter(m => m.role !== 'system').map((message, index) => (
              <div 
                key={index} 
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[80%] p-3 rounded ${
                    message.role === 'user' 
                      ? 'bg-[#1a1a1a] text-white' 
                      : 'bg-[#001a08] text-[#00FF41] border border-[#00FF41]/30'
                  }`}
                >
                  <div
                    className="text-sm whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ __html: parseMarkdown(message.content) }}
                  />
                </div>
              </div>
            ))}
            
            {/* Thinking animation when no streaming text */}
            {isThinking && !streamingText && (
              <div className="flex justify-start">
                <div className="bg-[#001a08] text-[#00FF41] border border-[#00FF41]/30 max-w-[80%] p-3 rounded">
                  <div className="flex space-x-2">
                    <div className="animate-digital-pulse-1 h-2 w-2 bg-[#00FF41] rounded-full"></div>
                    <div className="animate-digital-pulse-2 h-2 w-2 bg-[#00FF41] rounded-full"></div>
                    <div className="animate-digital-pulse-3 h-2 w-2 bg-[#00FF41] rounded-full"></div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Streaming text message */}
            {isThinking && streamingText && (
              <div className="flex justify-start">
                <div className="bg-[#001a08] text-[#00FF41] border border-[#00FF41]/30 max-w-[80%] p-3 rounded">
                  <div
                    className="text-sm whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ __html: parseMarkdown(streamingText) }}
                  />
                </div>
              </div>
            )}
            
            {/* Streaming reasoning (if available) */}
            {isThinking && streamingReasoning && (
              <div className="flex justify-start">
                <div className="bg-[#0a0a0a] text-[#888888] border border-[#444444]/30 max-w-[80%] p-3 rounded">
                  <div className="text-xs italic">
                    <div className="mb-1 text-[#aaaaaa]">Thinking:</div>
                    <div
                      className="whitespace-pre-wrap"
                      dangerouslySetInnerHTML={{ __html: parseMarkdown(streamingReasoning) }}
                    />
                  </div>
                </div>
              </div>
            )}
            
            {/* Reference element for scrolling */}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat input */}
          <div className="border-t border-[#00FF41]/30 p-4">
            <div className="flex">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1 p-2 bg-black border border-[#00FF41]/50 rounded-l text-white focus:outline-none focus:border-[#00FF41]"
                placeholder="Type a message..."
                disabled={isThinking}
              />
              <button
                onClick={handleSendMessage}
                disabled={isThinking || !input.trim()}
                className="bg-[#00FF41]/20 border border-[#00FF41]/50 border-l-0 rounded-r px-4 text-[#00FF41] hover:bg-[#00FF41]/30 disabled:opacity-50 disabled:hover:bg-[#00FF41]/20"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}