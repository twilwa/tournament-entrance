import { useEffect, useRef, useState, ReactNode } from "react";

interface NeonTextProps {
  children: ReactNode;
}

export default function NeonText({ children }: NeonTextProps) {
  const textRef = useRef<HTMLParagraphElement>(null);
  const [flickerIntensity, setFlickerIntensity] = useState(0.97);
  
  useEffect(() => {
    const textElement = textRef.current;
    if (!textElement) return;
    
    let animationFrameId: number;
    
    // Enhanced neon text flicker effect
    function flickerText() {
      // Randomly adjust flicker intensity
      if (Math.random() > 0.95) {
        const newIntensity = Math.random() * 0.3 + 0.7; // Between 0.7 and 1.0
        setFlickerIntensity(newIntensity);
      } else {
        setFlickerIntensity(0.97); // Default
      }
      
      // Add occasional glitch effect
      if (Math.random() > 0.98 && textElement) {
        textElement.style.textShadow = `0 0 5px #fff, 0 0 10px #00FF41, 0 0 15px #00FF41`;
        
        setTimeout(() => {
          if (textElement) {
            textElement.style.textShadow = '';
          }
        }, 50);
      }
      
      animationFrameId = requestAnimationFrame(flickerText);
    }
    
    flickerText();
    
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);
  
  return (
    <p 
      ref={textRef} 
      className="text-center text-sm md:text-base lg:text-lg tracking-wider font-light leading-relaxed animate-flicker mt-10"
      style={{ opacity: flickerIntensity, color: "#eeeeee" }}
    >
      {children}
    </p>
  );
}
