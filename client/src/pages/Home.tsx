import { useEffect } from "react";
import CountdownTimer from "@/components/CountdownTimer";
import NeonText from "@/components/NeonText";
import ParticleBackground from "@/components/ParticleBackground";
import AugmentedBorder from "@/components/AugmentedBorder";
import InteractivePrompt from "@/components/InteractivePrompt";

export default function Home() {
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
      ripple.style.background = Math.random() > 0.5 ? "#FF2E9D" : "#0CEAFF";
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
      flash.style.background = "linear-gradient(45deg, rgba(255,46,157,0.1) 0%, rgba(12,234,255,0.1) 100%)";
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

  return (
    <div className="bg-[#0A0C10] text-white font-[Rajdhani] overflow-hidden">
      {/* Noise and scanline effects */}
      <div className="noise"></div>
      <div className="scanlines"></div>
      
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-tr from-[#0A0C10] via-[#0A0C10] to-[#541EBE]/20 z-0"></div>
      
      {/* Interactive particle background */}
      <ParticleBackground />
      
      {/* Main content container */}
      <div className="relative min-h-screen flex flex-col items-center justify-center px-4 z-20">
        <AugmentedBorder>
          <div className="p-8 md:p-10 bg-[#0A0C10]/90 backdrop-blur-sm">
            {/* Countdown section */}
            <div className="text-center mb-8">
              <h1 className="text-2xl mb-2 font-['Share_Tech_Mono'] animate-pulse-slow opacity-80">THE ARENA</h1>
              <CountdownTimer targetDate="May 30, 2025 00:00:00" />
            </div>
            
            {/* Main message */}
            <div className="max-w-xl mx-auto">
              <NeonText>
                You've stumbled upon a door where your mind is the key. There are none who will lend you guidance; these trials are yours to conquer alone. Entering here will take more than mere logic and strategy, but the criteria are just as hidden as what they reveal. Find yourself, and you will find the very thing hidden underneath everything you thought you knew. Beyond here is something like a utopia — beyond here... this is a mirage.
              </NeonText>
            </div>
          </div>
        </AugmentedBorder>
        
        {/* Interactive prompt */}
        <InteractivePrompt />
      </div>
    </div>
  );
}
