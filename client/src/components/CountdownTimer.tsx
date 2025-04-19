import { useState, useEffect } from "react";
import { formatTime, calculateTimeRemaining } from "@/lib/utils/countdownUtils";

interface CountdownTimerProps {
  targetDate: string;
}

export default function CountdownTimer({ targetDate }: CountdownTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(calculateTimeRemaining(targetDate));

  useEffect(() => {
    // Update countdown every second
    const interval = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining(targetDate));
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  const { days, hours, minutes, seconds } = timeRemaining;
  const timeString = `${formatTime(days)}:${formatTime(hours)}:${formatTime(minutes)}:${formatTime(seconds)}`;

  return (
    <div className="flex justify-center space-x-2 md:space-x-4 my-6 glitch-container" data-text={timeString}>
      {/* Days */}
      <div className="flex flex-col items-center">
        <div 
          className="font-['Share_Tech_Mono'] text-3xl md:text-5xl lg:text-6xl bg-[#0A0C10] p-2 md:p-3"
          data-augmented-ui="tl-clip tr-clip br-clip bl-clip border" 
          style={{ "--aug-border-all": "1px", "--aug-border-bg": "#FF2E9D" } as React.CSSProperties}>
          <span id="days" className="text-[#FF2E9D] animate-glow">{formatTime(days)}</span>
        </div>
        <span className="text-xs md:text-sm mt-1 opacity-70">DAYS</span>
      </div>
      
      {/* Hours */}
      <div className="flex flex-col items-center">
        <div 
          className="font-['Share_Tech_Mono'] text-3xl md:text-5xl lg:text-6xl bg-[#0A0C10] p-2 md:p-3"
          data-augmented-ui="tl-clip tr-clip br-clip bl-clip border" 
          style={{ "--aug-border-all": "1px", "--aug-border-bg": "#FF2E9D" } as React.CSSProperties}>
          <span id="hours" className="text-[#FF2E9D] animate-glow">{formatTime(hours)}</span>
        </div>
        <span className="text-xs md:text-sm mt-1 opacity-70">HOURS</span>
      </div>
      
      {/* Minutes */}
      <div className="flex flex-col items-center">
        <div 
          className="font-['Share_Tech_Mono'] text-3xl md:text-5xl lg:text-6xl bg-[#0A0C10] p-2 md:p-3"
          data-augmented-ui="tl-clip tr-clip br-clip bl-clip border" 
          style={{ "--aug-border-all": "1px", "--aug-border-bg": "#0CEAFF" } as React.CSSProperties}>
          <span id="minutes" className="text-[#0CEAFF] animate-glow">{formatTime(minutes)}</span>
        </div>
        <span className="text-xs md:text-sm mt-1 opacity-70">MINUTES</span>
      </div>
      
      {/* Seconds */}
      <div className="flex flex-col items-center">
        <div 
          className="font-['Share_Tech_Mono'] text-3xl md:text-5xl lg:text-6xl bg-[#0A0C10] p-2 md:p-3"
          data-augmented-ui="tl-clip tr-clip br-clip bl-clip border" 
          style={{ "--aug-border-all": "1px", "--aug-border-bg": "#0CEAFF" } as React.CSSProperties}>
          <span id="seconds" className="text-[#0CEAFF] animate-glow">{formatTime(seconds)}</span>
        </div>
        <span className="text-xs md:text-sm mt-1 opacity-70">SECONDS</span>
      </div>
    </div>
  );
}
