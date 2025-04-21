import { useEffect, useState, useRef } from "react";
import CountdownTimer from "@/components/CountdownTimer";
import NeonText from "@/components/NeonText";
import ParticleBackground from "@/components/ParticleBackground";
import TalkingHead from "@/components/TalkingHead";
import { Message, streamChatRequest, sendChatRequest } from "@/lib/aiService";

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
  
  // Language selection state
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [dualResponses, setDualResponses] = useState<{english: string, chinese: string} | null>(null);
  
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
  }, [messages]);
  
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
        setChatActive(true);
        isReverseAnimating.current = false;
        
        // Start dual language initial messages
        handleInitialDualResponses();
        return;
      }
      
      // Delete multiple characters at once for faster animation
      const charsToDelete = Math.min(deleteCharsPerTick, currentText.length);
      currentText = currentText.slice(0, -charsToDelete);
      setTextContent(currentText);
    }, 10); // Much faster deletion timer
  };

  // Handle initial dual responses in English and Chinese
  const handleInitialDualResponses = async () => {
    setIsThinking(true);
    
    // Initial greeting in English
    const initialEnglishPrompt = "Hm? What? Hidden, behi--mirage? No, no, nothing of the sort. Who are you? What do you want?";
    
    // Initial greeting in Chinese
    const initialChinesePrompt = "嗯？什么？隐藏的，幻--幻影？不，不，没有这回事。你是谁？你想要什么？";
    
    // Set initial dual responses
    setDualResponses({
      english: initialEnglishPrompt,
      chinese: initialChinesePrompt
    });
    
    setIsThinking(false);
  };

  // Handle user selecting a language preference
  const handleLanguageSelect = (language: string) => {
    setSelectedLanguage(language);
    
    if (dualResponses) {
      const selectedResponse = language === 'english' ? dualResponses.english : dualResponses.chinese;
      // Add the selected response to the message history
      setMessages(prev => [...prev, { role: 'assistant', content: selectedResponse }]);
      // Clear the dual responses
      setDualResponses(null);
    }
  };

  // Send message to the AI with streaming
  const handleSendMessage = async () => {
    if (!userInput.trim() || isThinking) return;

    // Prepare user message
    const userMessage: Message = { role: 'user', content: userInput };
    
    // Add user message to the chat
    setMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setIsThinking(true);
    
    // If this is the first user message after selecting a language, we don't need dual responses
    if (selectedLanguage) {
      // Regular single response flow - use selected language
      await handleSingleLanguageResponse(userMessage);
    } else {
      // Dual language flow (should not happen if language already selected)
      await handleDualLanguageResponses(userMessage);
    }
  };

  // Handle single language response after language is selected
  const handleSingleLanguageResponse = async (userMessage: Message) => {
    // Cancel any existing stream
    abortControllerRef.current?.();
    
    // Add placeholder assistant message
    setMessages(prev => [...prev, { role: 'assistant', content: '' }]);
    
    // Prepare messages for API
    const baseMessages = messages.filter(m => m.role !== 'system');
    const messagesToSend = [...baseMessages, userMessage, { role: 'assistant', content: '<think>\n' }];
    // Prepend system message at front
    messagesToSend.unshift(messages[0]);
    
    // Start streaming the response
    let responseContent = '';
    let reasoningContent = '';
    
    abortControllerRef.current = streamChatRequest(
      messagesToSend,
      (chunk, isReasoning) => {
        if (isReasoning) {
          // Store reasoning content but don't display it
          reasoningContent += chunk;
          console.log('Reasoning:', chunk);
        } else {
          // Update content displayed to user
          responseContent += chunk;
          setMessages(prev => {
            const copy = [...prev];
            const idx = copy.length - 1;
            copy[idx].content = responseContent;
            return copy;
          });
        }
      },
      () => {
        // Streaming complete
        if (responseContent.trim() === '' && reasoningContent.trim() !== '') {
          console.warn("Only received reasoning, no response content");
          setMessages(prev => {
            const copy = [...prev];
            const idx = copy.length - 1;
            copy[idx].content = 'Connection unstable. The digital sidewalk seems to be glitching...';
            return copy;
          });
        }
        setIsThinking(false);
      },
      (error) => {
        console.error('Streaming error:', error);
        setMessages(prev => {
          const copy = [...prev];
          const idx = copy.length - 1;
          copy[idx].content = 'Connection unstable. The digital sidewalk seems to be glitching...';
          return copy;
        });
        setIsThinking(false);
      },
      'arliai/qwq-32b-arliai-rpr-v1:free',
      false
    );
  };

  // Handle dual language responses
  const handleDualLanguageResponses = async (userMessage: Message) => {
    // Cancel any existing stream
    abortControllerRef.current?.();
    
    const baseMessages = messages.filter(m => m.role !== 'system');
    
    // Create two sets of messages - one for English, one for Chinese
    const englishMessagesToSend = [...baseMessages, userMessage, { role: 'assistant', content: '<think>\n' }];
    const chineseMessagesToSend = [...baseMessages, userMessage, { role: 'assistant', content: '<think>\n请用中文回答\n' }];
    
    // Prepend system message at front for both sets
    englishMessagesToSend.unshift(messages[0]);
    chineseMessagesToSend.unshift(messages[0]);
    
    const englishResponse = { content: '' };
    const chineseResponse = { content: '' };
    let englishComplete = false;
    let chineseComplete = false;
    
    // English stream
    const englishAbortController = streamChatRequest(
      englishMessagesToSend,
      (chunk, isReasoning) => {
        if (!isReasoning) {
          englishResponse.content += chunk;
          // Update dual responses as we stream
          setDualResponses(current => ({
            english: englishResponse.content,
            chinese: current?.chinese || ''
          }));
        }
      },
      () => {
        englishComplete = true;
        if (chineseComplete) setIsThinking(false);
      },
      (error) => {
        console.error('English streaming error:', error);
        englishResponse.content = 'Connection unstable. The digital sidewalk seems to be glitching...';
        englishComplete = true;
        if (chineseComplete) setIsThinking(false);
      },
      'arliai/qwq-32b-arliai-rpr-v1:free',
      false
    );
    
    // Chinese stream
    const chineseAbortController = streamChatRequest(
      chineseMessagesToSend,
      (chunk, isReasoning) => {
        if (!isReasoning) {
          chineseResponse.content += chunk;
          // Update dual responses as we stream
          setDualResponses(current => ({
            english: current?.english || '',
            chinese: chineseResponse.content
          }));
        }
      },
      () => {
        chineseComplete = true;
        if (englishComplete) setIsThinking(false);
      },
      (error) => {
        console.error('Chinese streaming error:', error);
        chineseResponse.content = '连接不稳定。数字人行道似乎出现故障...';
        chineseComplete = true;
        if (englishComplete) setIsThinking(false);
      },
      'arliai/qwq-32b-arliai-rpr-v1:free',
      false
    );
    
    // Combine abort controllers
    abortControllerRef.current = () => {
      englishAbortController();
      chineseAbortController();
    };
  };

  return (
    <div className="bg-black text-white font-['Share_Tech_Mono'] overflow-hidden">
      {/* Noise and scanline effects */}
      <div className="noise"></div>
      <div className="scanlines"></div>
      
      {/* Interactive particle background or talking head */}
      {showTalkingHead ? (
        <TalkingHead isActive={showTalkingHead} />
      ) : (
        <ParticleBackground />
      )}
      
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
                    <div 
                      key={index} 
                      className={`${message.role === 'user' ? 'text-right' : 'text-left'}`}
                    >
                      <div 
                        className={`inline-block max-w-[80%] p-2 rounded ${
                          message.role === 'user' 
                            ? 'bg-[#1a1a1a] text-white' 
                            : 'bg-[#001a08] text-[#00FF41] border border-[#00FF41]/30'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      </div>
                    </div>
                  ))}
                  
                  {/* Dual language response selector */}
                  {dualResponses && (
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div 
                        className="bg-[#001a08] text-[#00FF41] border border-[#00FF41]/30 p-3 rounded cursor-pointer hover:bg-[#002a10] transition-colors"
                        onClick={() => handleLanguageSelect('english')}
                      >
                        <div className="text-[#00FF41] opacity-70 mb-1 text-xs">English</div>
                        <p className="whitespace-pre-wrap">{dualResponses.english}</p>
                      </div>
                      <div 
                        className="bg-[#001a08] text-[#00FF41] border border-[#00FF41]/30 p-3 rounded cursor-pointer hover:bg-[#002a10] transition-colors"
                        onClick={() => handleLanguageSelect('chinese')}
                      >
                        <div className="text-[#00FF41] opacity-70 mb-1 text-xs">中文</div>
                        <p className="whitespace-pre-wrap">{dualResponses.chinese}</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Reference for scrolling to bottom */}
                  <div ref={messagesEndRef}></div>
                  
                  {/* Chat input */}
                  <div className="mt-4 flex items-center border-b border-[#00FF41]/30 pb-2">
                    <input
                      type="text"
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                      className="flex-1 bg-transparent border-none focus:outline-none text-white"
                      placeholder="Type your message..."
                      disabled={isThinking || dualResponses !== null}
                    />
                    {/* Glowing green dot cursor/indicator */}
                    <div className={`green-dot-cursor ml-2 ${isThinking ? 'opacity-0' : ''}`}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
