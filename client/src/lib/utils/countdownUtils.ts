export interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

// Format time to always show two digits
export function formatTime(time: number): string {
  return time < 10 ? `0${time}` : `${time}`;
}

// Calculate remaining time from now to target date
export function calculateTimeRemaining(targetDateString: string): TimeRemaining {
  const targetDate = new Date(targetDateString).getTime();
  const now = new Date().getTime();
  const distance = targetDate - now;
  
  // Ensure we don't get negative values if target date is in the past
  const safeDistance = Math.max(0, distance);
  
  // Time calculations
  const days = Math.floor(safeDistance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((safeDistance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((safeDistance % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((safeDistance % (1000 * 60)) / 1000);
  
  return { days, hours, minutes, seconds };
}
