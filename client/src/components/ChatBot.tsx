import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface ChatBotProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChatBot({ isOpen, onClose }: ChatBotProps) {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([
    { role: 'assistant', content: 'Hm? What? Hidden, behi--mirage? No, no, nothing of the sort. Who are you? What do you want?' },
  ]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [userInfo, setUserInfo] = useState({
    interests: false,
    skills: false,
    background: false,
    dreams: false
  });

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    // Add user message to chat
    const userMessage = { role: 'user' as const, content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsThinking(true);

    try {
      // In a real implementation, this would call the OpenAI API
      // For now, we'll simulate a response based on the content
      
      // Check if we need to ask about specific information
      let response = '';
      let updatedInfo = {...userInfo};
      
      if (!userInfo.interests && input.length > 10) {
        response = "Interesting... but I'm more curious about what truly captivates you. What are your interests? What technological domains make your circuits buzz with excitement?";
        updatedInfo.interests = true;
      } 
      else if (!userInfo.skills && userInfo.interests) {
        response = "I see. And what skills have you developed? What tools or languages do you wield in this digital landscape?";
        updatedInfo.skills = true;
      }
      else if (!userInfo.background && userInfo.skills) {
        response = "Hmm, yes, impressive. Tell me about your background—how you came to be here, wandering these digital streets?";
        updatedInfo.background = true;
      }
      else if (!userInfo.dreams && userInfo.background) {
        response = "I sense there's something you've always wanted to create, but perhaps lacked the means or knowledge. What is it? What have you dreamed of building?";
        updatedInfo.dreams = true;
      }
      else if (userInfo.dreams) {
        response = "Ah, I see it now. You might just belong here after all. The Arena awaits minds like yours. Here: https://arena.x-ware.online - They'll be expecting you.";
      }
      else {
        // Default responses for other cases
        const defaultResponses = [
          "Hm? Interesting... tell me more about yourself.",
          "The digital sidewalk hides many secrets. But so do you, I suspect.",
          "You know, I once built a bridge out of code. Led nowhere and everywhere... What about you?",
          "Most passers-by don't notice the patterns. But you... you might be different.",
          "The Arena? Never heard of it. What makes you think such a place exists?"
        ];
        response = defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
      }
      
      setUserInfo(updatedInfo);
      
      // Simulate API delay
      setTimeout(() => {
        setMessages(prev => [...prev, { role: 'assistant', content: response }]);
        setIsThinking(false);
      }, 1500);
      
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
            {messages.map((message, index) => (
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
            {isThinking && (
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
              />
              <button
                onClick={handleSendMessage}
                disabled={isThinking}
                className="bg-[#00FF41]/20 text-[#00FF41] px-4 py-2 rounded hover:bg-[#00FF41]/30 focus:outline-none"
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