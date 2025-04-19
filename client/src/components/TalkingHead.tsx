import { useEffect, useRef } from 'react';

interface TalkingHeadProps {
  isActive: boolean;
}

export default function TalkingHead({ isActive }: TalkingHeadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    if (!isActive || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Create particles for the talking head
    const particles: {
      x: number;
      y: number;
      size: number;
      targetX: number;
      targetY: number;
      speed: number;
      color: string;
    }[] = [];
    
    // Generate random particles across the screen
    const generateParticles = () => {
      const particleCount = Math.floor((window.innerWidth * window.innerHeight) / 2000);
      
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 3 + 1,
          targetX: 0,
          targetY: 0,
          speed: Math.random() * 0.5 + 0.2,
          color: `rgba(0, ${Math.floor(Math.random() * 155) + 100}, ${Math.floor(Math.random() * 65)}, ${Math.random() * 0.5 + 0.5})`
        });
      }
    };
    
    // Generate target positions in shape of a talking head
    const generateTargetPositions = () => {
      // Center of the screen
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      // Size of the head
      const headSize = Math.min(canvas.width, canvas.height) * 0.4;
      
      // Calculate positions to form a bearded figure with long hair
      for (let i = 0; i < particles.length; i++) {
        const particle = particles[i];
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * headSize;
        
        // Base head shape (circle)
        let x = centerX + Math.cos(angle) * distance;
        let y = centerY + Math.sin(angle) * distance;
        
        // Modify to make it look like a bearded figure
        // Add more particles to beard area
        if (Math.random() > 0.5 && y > centerY) {
          y += Math.random() * headSize * 0.5;
        }
        
        // Add more particles to hair area
        if (Math.random() > 0.7 && Math.abs(x - centerX) > headSize * 0.3) {
          y -= Math.random() * headSize * 0.3;
        }
        
        // Add rectangular glasses
        if (Math.random() > 0.7 && 
            Math.abs(y - (centerY - headSize * 0.15)) < headSize * 0.05) {
          if ((Math.abs(x - (centerX - headSize * 0.2)) < headSize * 0.1) || 
              (Math.abs(x - (centerX + headSize * 0.2)) < headSize * 0.1)) {
            // These are glasses
            particle.color = "rgba(0, 255, 65, 0.9)";
          }
        }
        
        particle.targetX = x;
        particle.targetY = y;
      }
    };
    
    generateParticles();
    generateTargetPositions();
    
    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update and draw particles
      for (const particle of particles) {
        // Move particles toward their target position
        particle.x += (particle.targetX - particle.x) * particle.speed;
        particle.y += (particle.targetY - particle.y) * particle.speed;
        
        // Add slight wobble effect for a "talking" appearance
        if (Math.random() > 0.9) {
          particle.x += Math.random() * 2 - 1;
          particle.y += Math.random() * 2 - 1;
        }
        
        // Draw particle
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
      }
      
      animationId = requestAnimationFrame(animate);
    };
    
    let animationId = requestAnimationFrame(animate);
    
    // Cleanup
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [isActive]);
  
  if (!isActive) return null;
  
  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ opacity: isActive ? 1 : 0, transition: 'opacity 2s ease-in' }}
    />
  );
}