import { useState, useEffect } from 'react';

interface ReverseTypingAnimationProps {
  originalText: string;
  onAnimationComplete: () => void;
}

export default function ReverseTypingAnimation({ originalText, onAnimationComplete }: ReverseTypingAnimationProps) {
  const [text, setText] = useState(originalText);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (isDeleting) {
      if (text.length === 0) {
        // Animation completed, notify parent
        onAnimationComplete();
        return;
      }

      // Delete one character at a time with random delay
      const timeout = setTimeout(() => {
        setText(text.slice(0, -1));
      }, Math.random() * 20 + 30); // Between 30-50ms

      return () => clearTimeout(timeout);
    }
  }, [text, isDeleting, onAnimationComplete]);

  // Public method to start the animation
  const startAnimation = () => {
    setIsDeleting(true);
  };

  return {
    renderedText: text,
    startAnimation,
  };
}