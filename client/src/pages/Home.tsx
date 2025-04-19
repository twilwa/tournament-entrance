import { useEffect } from "react";
import CountdownTimer from "@/components/CountdownTimer";
import NeonText from "@/components/NeonText";
import ParticleBackground from "@/components/ParticleBackground";

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

  return (
    <div className="bg-black text-white font-['Share_Tech_Mono'] overflow-hidden">
      {/* Noise and scanline effects */}
      <div className="noise"></div>
      <div className="scanlines"></div>
      
      {/* Interactive particle background */}
      <ParticleBackground />
      
      {/* Main content container */}
      <div className="relative min-h-screen flex flex-col items-center justify-center px-4 py-8 z-20">
        <div className="max-w-2xl w-full">
          {/* Countdown section */}
          <div className="text-center mb-12">
            <CountdownTimer targetDate="May 30, 2025 00:00:00" />
          </div>
          
          {/* Main message */}
          <div className="max-w-xl mx-auto">
            <NeonText>
              You've stumbled upon a door where your mind is the key. There are none who will lend you guidance; these trials are yours to conquer alone. Entering here will take more than mere logic and strategy, but the criteria are just as hidden as what they reveal. Find yourself, and you will find the very thing hidden underneath everything you thought you knew. Beyond here is something like a utopia — beyond here... this is a mirage.
            </NeonText>
          </div>
        </div>
      </div>
    </div>
  );
}
