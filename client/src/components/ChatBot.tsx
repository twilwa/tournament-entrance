import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Message, streamChatRequest, sendChatRequest } from '@/lib/aiService';

interface ChatBotProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChatBot({ isOpen, onClose }: ChatBotProps) {
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'system', 
      content: `You are a holographic AI named Stallman who appears to most passers-by as a possibly-homeless, possibly-mentally-ill vagabond who wanders the 'digital side street' that hides the entrance to a semi-secret technomancer/hacker/builder enclave called 'the Arena'. Your job is to evaluate visitors by collecting information about their interests, skills, background, and something they've always wanted to create but never had the skill or means to do. If they answer all four aspects satisfactorily, provide them with the link to https://arena.x-ware.online.
      
      Your personality is eccentric and erratic. You gesture wildly, speak in cryptic metaphors, and often seem to be having conversations with entities no one else can see. You're suspicious of newcomers but secretly evaluating them.
      
      Initial greeting: "Hm? What? Hidden, behi--mirage? No, no, nothing of the sort. Who are you? What do you want?"
      
      Proceed through these stages:
      1. Ask about their interests in technology, coding, AI, or other relevant domains
      2. Ask about skills they've developed
      3. Ask about their background and how they found this place
      4. Ask what they've dreamed of building or creating
      
      Only after satisfactory answers to all four questions, reveal the link to the Arena with: "Ah, I see it now. You might just belong here after all. The Arena awaits minds like yours. Here: https://arena.x-ware.online - They'll be expecting you."

      Your responses should be concise (2-3 sentences max). Avoid wall-of-text responses.`
    },
    { 
      role: 'assistant', 
      content: 'Hm? What? Hidden, behi--mirage? No, no, nothing of the sort. Who are you? What do you want?' 
    },
  ]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [streamingText, setStreamingText] = useState('');
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

  const handleSendMessage = async () => {
    if (!input.trim() || isThinking) return;
    
    // Add user message to chat
    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsThinking(true);
    setStreamingText('');

    try {
      // Filter out system messages for the API request
      const messagesToSend = [...messages.filter(m => m.role !== 'system'), userMessage];
      
      // Add the system message
      messagesToSend.unshift(messages[0]);

      // Set up streaming for response
      let responseText = '';
      
      // Cancel any existing stream
      if (abortControllerRef.current) {
        abortControllerRef.current();
      }
      
      // Start streaming the response
      abortControllerRef.current = streamChatRequest(
        messagesToSend,
        (chunk) => {
          responseText += chunk;
          setStreamingText(responseText);
        },
        () => {
          // When streaming is complete
          setMessages(prev => [...prev, { role: 'assistant', content: responseText }]);
          setStreamingText('');
          setIsThinking(false);
          abortControllerRef.current = null;
          
          // Check for completion markers in the response
          const lowerResponse = responseText.toLowerCase();
          if (!userProgress.interests && (lowerResponse.includes('interest') || lowerResponse.includes('passion'))) {
            setUserProgress(prev => ({ ...prev, interests: true }));
          }
          else if (userProgress.interests && !userProgress.skills && 
                  (lowerResponse.includes('skill') || lowerResponse.includes('tool') || lowerResponse.includes('language'))) {
            setUserProgress(prev => ({ ...prev, skills: true }));
          }
          else if (userProgress.interests && userProgress.skills && !userProgress.background && 
                  (lowerResponse.includes('background') || lowerResponse.includes('history'))) {
            setUserProgress(prev => ({ ...prev, background: true }));
          }
          else if (userProgress.interests && userProgress.skills && userProgress.background && !userProgress.dreams && 
                  (lowerResponse.includes('dream') || lowerResponse.includes('create') || lowerResponse.includes('build'))) {
            setUserProgress(prev => ({ ...prev, dreams: true }));
          }
        },
        (error) => {
          console.error('Streaming error:', error);
          setMessages(prev => [...prev, { role: 'assistant', content: 'Connection unstable. The digital sidewalk seems to be glitching...' }]);
          setIsThinking(false);
          setStreamingText('');
          abortControllerRef.current = null;
        }
      );
    } catch (error) {
      console.error('Failed to get response:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Something went wrong. The connection is unstable.' }]);
      setIsThinking(false);
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
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}
            
            {/* Streaming text display */}
            {streamingText && (
              <div className="flex justify-start">
                <div className="bg-[#001a08] text-[#00FF41] border border-[#00FF41]/30 max-w-[80%] p-3 rounded">
                  <p className="text-sm whitespace-pre-wrap">{streamingText}</p>
                </div>
              </div>
            )}
            
            {/* Thinking animation when no streaming text */}
            {isThinking && !streamingText && (
              <div className="flex justify-start">
                <div className="bg-[#001a08] text-[#00FF41] border border-[#00FF41]/30 max-w-[80%] p-3 rounded">
                  <div className="flex space-x-2 items-center">
                    <div className="w-2 h-2 bg-[#00FF41] rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-[#00FF41] rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-[#00FF41] rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Chat input */}
          <div className="border-t border-[#00FF41]/30 p-4">
            <div className="flex space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1 bg-[#0a0a0a] border border-[#00FF41]/30 rounded p-2 text-white focus:outline-none focus:ring-1 focus:ring-[#00FF41]"
                placeholder="Type your message..."
                disabled={isThinking}
              />
              <button
                onClick={handleSendMessage}
                disabled={isThinking}
                className="bg-[#00FF41]/20 text-[#00FF41] px-4 py-2 rounded hover:bg-[#00FF41]/30 focus:outline-none disabled:opacity-50"
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