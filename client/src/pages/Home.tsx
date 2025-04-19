import { useEffect, useState, useRef } from "react";
import CountdownTimer from "@/components/CountdownTimer";
import NeonText from "@/components/NeonText";
import ParticleBackground from "@/components/ParticleBackground";
import WireframeHead from "@/components/WireframeHead";
import { Message, streamChatRequest } from "@/lib/aiService";

export default function Home() {
  const [chatActive, setChatActive] = useState(false);
  const [showTalkingHead, setShowTalkingHead] = useState(false);
  const [textContent, setTextContent] = useState<string>(
    "You've stumbled upon a door where your mind is the key. There are none who will lend you guidance; these trials are yours to conquer alone. Entering here will take more than mere logic and strategy, but the criteria are just as hidden as what they reveal. Find yourself, and you will find the very thing hidden underneath everything you thought you knew. Beyond here is something like a utopia — beyond here... this is a mirage."
  );
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
    }
  ]);
  
  const [userInput, setUserInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  
  const isReverseAnimating = useRef(false);
  const abortControllerRef = useRef<(() => void) | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
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
  
  // Interactive effects
  useEffect(() => {
    // Click effect
    const handleClick = (event: MouseEvent) => {
      // Add a ripple effect on click
      const ripple = document.createElement("div");
      ripple.classList.add("fixed", "rounded-full", "pointer-events-none", "z-30");
      ripple.style.width = "10px";
      ripple.style.height = "10px";
      ripple.style.left = event.clientX - 5 + "px";
      ripple.style.top = event.clientY - 5 + "px";
      ripple.style.background = "#00FF41"; // Neon green
      ripple.style.opacity = "0.8";
      ripple.style.transition = "all 0.6s ease-out";

      document.body.appendChild(ripple);

      setTimeout(() => {
        ripple.style.width = "300px";
        ripple.style.height = "300px";
        ripple.style.left = event.clientX - 150 + "px";
        ripple.style.top = event.clientY - 150 + "px";
        ripple.style.opacity = "0";
      }, 10);

      setTimeout(() => {
        document.body.removeChild(ripple);
      }, 600);
    };

    // Keydown effect
    const handleKeydown = () => {
      // Add a flash effect on keypress
      const flash = document.createElement("div");
      flash.classList.add("fixed", "inset-0", "pointer-events-none", "z-30");
      flash.style.background = "rgba(0, 255, 65, 0.05)"; // Subtle green flash
      flash.style.opacity = "0";
      flash.style.transition = "opacity 0.3s ease-out";

      document.body.appendChild(flash);

      setTimeout(() => {
        flash.style.opacity = "1";
      }, 10);

      setTimeout(() => {
        flash.style.opacity = "0";
      }, 100);

      setTimeout(() => {
        document.body.removeChild(flash);
      }, 400);
    };

    // MouseMove effect
    const handleMouseMove = (event: MouseEvent) => {
      // Calculate position for cursor effects
      const mouseX = event.clientX / window.innerWidth;
      const mouseY = event.clientY / window.innerHeight;
      
      // Update CSS variables for mouse position
      document.documentElement.style.setProperty("--mouse-x", mouseX.toString());
      document.documentElement.style.setProperty("--mouse-y", mouseY.toString());
    };

    // Register event listeners
    document.addEventListener("click", handleClick);
    document.addEventListener("keydown", handleKeydown);
    document.addEventListener("mousemove", handleMouseMove);

    return () => {
      // Clean up event listeners
      document.removeEventListener("click", handleClick);
      document.removeEventListener("keydown", handleKeydown);
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  // Clean up any active streams when component unmounts
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current();
      }
    };
  }, []);

  // Handle mirage text click and reverse typing animation
  const handleMirageClick = () => {
    if (isReverseAnimating.current || chatActive) return;
    isReverseAnimating.current = true;
    
    // Start showing the talking head
    setShowTalkingHead(true);
    
    // Start reverse typing animation (much faster now)
    let currentText = textContent;
    const deleteCharsPerTick = 3; // Delete multiple characters per tick for speed
    
    const deleteInterval = setInterval(() => {
      if (currentText.length <= 0) {
        clearInterval(deleteInterval);
        
        // When done erasing, show the chat interface
        const initialMessage: Message = {
          role: 'assistant',
          content: "Hm? What? Hidden, behi--mirage? No, no, nothing of the sort. Who are you? What do you want?"
        };
        setMessages(prev => [...prev, initialMessage]);
        setChatActive(true);
        isReverseAnimating.current = false;
        return;
      }
      
      // Delete multiple characters at once for faster animation
      const charsToDelete = Math.min(deleteCharsPerTick, currentText.length);
      currentText = currentText.slice(0, -charsToDelete);
      setTextContent(currentText);
    }, 10); // Much faster deletion timer
  };

  // Send message to the AI
  const handleSendMessage = async () => {
    if (!userInput.trim() || isThinking) return;
    
    // Add user message
    const userMessage: Message = { role: 'user', content: userInput };
    setMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setIsThinking(true);
    setStreamingText('');

    try {
      // Update system prompt to include the <think> format instruction
      const systemPrompt: Message = { 
        role: 'system', 
        content: `You are a holographic AI named Stallman who appears to most passers-by as a possibly-homeless, possibly-mentally-ill vagabond who wanders the 'digital side street' that hides the entrance to a semi-secret technomancer/hacker/builder enclave called 'the Arena'. Your job is to evaluate visitors by collecting information about their interests, skills, background, and something they've always wanted to create but never had the skill or means to do. If they answer all four aspects satisfactorily, provide them with the link to https://arena.x-ware.online.
        
        Your personality is eccentric and erratic. You gesture wildly, speak in cryptic metaphors, and often seem to be having conversations with entities no one else can see. You're suspicious of newcomers but secretly evaluating them.

        IMPORTANT: Always format your responses with "<think>" at the beginning, followed by your message. Example: "<think>Hmm, interesting human, let me see what they know..."
        
        Initial greeting: "<think>Hm? What? Hidden, behi--mirage? No, no, nothing of the sort. Who are you? What do you want?"
        
        Proceed through these stages:
        1. Ask about their interests in technology, coding, AI, or other relevant domains
        2. Ask about skills they've developed
        3. Ask about their background and how they found this place
        4. Ask what they've dreamed of building or creating
        
        Only after satisfactory answers to all four questions, reveal the link to the Arena with: "Ah, I see it now. You might just belong here after all. The Arena awaits minds like yours. Here: https://arena.x-ware.online - They'll be expecting you."

        Your responses should be concise (2-3 sentences max). Avoid wall-of-text responses.`
      };

      // Get all messages for context, including the updated system message
      const messagesToSend = [...messages.filter(m => m.role !== 'system'), userMessage];
      messagesToSend.unshift(systemPrompt);
      
      // Set up streaming for response
      let responseText = '<think>';  // Start with <think> marker
      
      // Cancel any existing stream
      if (abortControllerRef.current) {
        abortControllerRef.current();
      }
      
      // Start streaming the response
      abortControllerRef.current = streamChatRequest(
        messagesToSend,
        (chunk) => {
          // Add chunk to our response
          responseText += chunk;
          setStreamingText(responseText);
        },
        () => {
          // When streaming is complete
          // Store the complete response, but strip the <think> tag in the final stored message
          let finalResponse = responseText;
          if (finalResponse.startsWith('<think>')) {
            finalResponse = finalResponse.replace('<think>', '');
          }
          
          const assistantMessage: Message = { role: 'assistant', content: finalResponse };
          setMessages(prev => [...prev, assistantMessage]);
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
          const errorMessage: Message = { role: 'assistant', content: 'Connection unstable. The digital sidewalk seems to be glitching...' };
          setMessages(prev => [...prev, errorMessage]);
          setIsThinking(false);
          setStreamingText('');
          abortControllerRef.current = null;
        }
      );
    } catch (error) {
      console.error('Failed to get response:', error);
      const errorMessage: Message = { role: 'assistant', content: 'Something went wrong. The connection is unstable.' };
      setMessages(prev => [...prev, errorMessage]);
      setIsThinking(false);
    }
  };

  return (
    <div className="bg-black text-white font-['Share_Tech_Mono'] overflow-hidden">
      {/* Noise and scanline effects */}
      <div className="noise"></div>
      <div className="scanlines"></div>
      
      {/* Interactive particle background or wireframe head */}
      {!showTalkingHead && <ParticleBackground />}
      {showTalkingHead && <WireframeHead isActive={showTalkingHead} />}
      
      {/* Main content container */}
      <div className="relative min-h-screen flex flex-col items-center justify-center px-4 py-8 z-20">
        <div className="max-w-2xl w-full">
          {/* Countdown section */}
          <div className="text-center mb-12">
            <CountdownTimer targetDate="May 30, 2025 00:00:00" />
          </div>
          
          {/* Main message area - transforms into chat interface */}
          <div className="max-w-xl mx-auto">
            {!chatActive ? (
              <NeonText onMirageClick={handleMirageClick}>
                {textContent}
              </NeonText>
            ) : (
              <div className="text-center text-sm md:text-base lg:text-lg tracking-wider font-light leading-relaxed mt-10">
                {/* Chat messages display */}
                <div className="text-left space-y-4 mb-4 overflow-y-auto max-h-[40vh]">
                  {messages.filter(m => m.role !== 'system').map((message, index) => (
                    <div key={index} className="text-left font-mono">
                      {message.role === 'user' ? (
                        <div className="text-white">
                          <span className="text-gray-400">user: </span>
                          <span className="whitespace-pre-wrap">{message.content}</span>
                        </div>
                      ) : (
                        <div className="text-[#00FF41]">
                          <span className="text-gray-400">assistant: </span>
                          <span className="whitespace-pre-wrap">{message.content}</span>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {/* Streaming text display with thinking block hidden */}
                  {streamingText && (
                    <div className="text-left font-mono">
                      <span className="text-gray-400">assistant: </span>
                      {streamingText.includes('<think>') ? (
                        <>
                          {/* Only display the content after <think> */}
                          <span className="text-[#00FF41] whitespace-pre-wrap">
                            {streamingText.split('<think>')[1] || ''}
                          </span>
                        </>
                      ) : (
                        <span className="text-[#00FF41] whitespace-pre-wrap">{streamingText}</span>
                      )}
                    </div>
                  )}
                  
                  {/* Thinking indicator (only shown when no streaming text yet) */}
                  {isThinking && !streamingText && (
                    <div className="text-left font-mono">
                      <span className="text-gray-400">assistant: </span>
                      <span className="inline-flex space-x-1 items-center">
                        <div className="w-2 h-2 bg-[#00FF41] rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-[#00FF41] rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 bg-[#00FF41] rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                      </span>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>
                
                {/* Chat input */}
                <div className="mt-4 flex items-center border-b border-[#00FF41]/30 pb-2">
                  <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1 bg-transparent border-none focus:outline-none text-white chat-input"
                    placeholder="Type your message..."
                    disabled={isThinking}
                  />
                  {/* Glowing green dot cursor/indicator */}
                  <div className={`green-dot-cursor ml-2 ${isThinking ? 'opacity-0' : ''}`}></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
