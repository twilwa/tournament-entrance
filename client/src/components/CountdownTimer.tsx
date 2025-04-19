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
    <div className="glitch-container w-full" data-text={timeString}>
      <div 
        className="font-['Share_Tech_Mono'] inline-block text-4xl md:text-5xl lg:text-6xl digital-clock"
      >
        <span className="text-[#00FF41] animate-digital-flicker">
          {formatTime(days)}:{formatTime(hours)}:{formatTime(minutes)}:{formatTime(seconds)}
        </span>
      </div>
    </div>
  );
}
