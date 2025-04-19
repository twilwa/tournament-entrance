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
      isSpeaking: boolean;
      originalSize: number;
    }[] = [];
    
    // Generate random particles across the screen
    const generateParticles = () => {
      const particleCount = Math.floor((window.innerWidth * window.innerHeight) / 1500); // Increased particle count
      
      for (let i = 0; i < particleCount; i++) {
        const size = Math.random() * 3 + 1;
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: size,
          originalSize: size,
          targetX: 0,
          targetY: 0,
          speed: Math.random() * 0.5 + 0.2,
          color: `rgba(0, ${Math.floor(Math.random() * 155) + 100}, ${Math.floor(Math.random() * 65)}, ${Math.random() * 0.5 + 0.5})`,
          isSpeaking: false
        });
      }
    };
    
    // Generate target positions in shape of a talking head (Stallman-like)
    const generateTargetPositions = () => {
      // Center of the screen
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      // Size of the head
      const headSize = Math.min(canvas.width, canvas.height) * 0.4;
      
      for (let i = 0; i < particles.length; i++) {
        const particle = particles[i];
        
        // Determine if this particle is part of the head outline or features
        const isFeature = Math.random() > 0.8;
        const isOutline = Math.random() > 0.7;
        const isMouth = Math.random() > 0.8;
        
        if (isFeature || isOutline) {
          // This particle will be part of a defined feature (eyes, beard, hair, etc.)
          const featureType = Math.floor(Math.random() * 5); // 0-4 different features
          let x, y;
          
          switch (featureType) {
            case 0: // Head outline
              const angle = Math.random() * Math.PI * 2;
              const jitter = Math.random() * (headSize * 0.1);
              x = centerX + Math.cos(angle) * (headSize/2 - jitter);
              y = centerY + Math.sin(angle) * (headSize/2 - jitter);
              particle.color = "rgba(0, 255, 65, 0.8)";
              break;
              
            case 1: // Beard
              x = centerX + (Math.random() * headSize - headSize/2);
              y = centerY + (Math.random() * headSize/2) + headSize/4;
              if (Math.abs(x - centerX) < headSize/4) {
                y += Math.random() * headSize/4; // Longer at center
              }
              particle.color = "rgba(0, 200, 65, 0.7)";
              break;
              
            case 2: // Hair
              x = centerX + (Math.random() * headSize - headSize/2);
              y = centerY - (Math.random() * headSize/2);
              if (Math.abs(x - centerX) > headSize/4) {
                y -= Math.random() * headSize/5; // Longer at sides
              }
              particle.color = "rgba(0, 180, 65, 0.7)";
              break;
              
            case 3: // Glasses
              const isLeftEye = Math.random() > 0.5;
              const eyeOffset = headSize * 0.15;
              x = centerX + (isLeftEye ? -eyeOffset : eyeOffset);
              y = centerY - headSize * 0.05;
              
              // Create rectangular glasses
              x += (Math.random() * headSize * 0.12) - (headSize * 0.06);
              y += (Math.random() * headSize * 0.1) - (headSize * 0.05);
              
              particle.size = Math.random() * 2 + 1;
              particle.color = "rgba(0, 255, 85, 0.9)";
              break;
              
            case 4: // Mouth/speaking area
              x = centerX + (Math.random() * headSize/2 - headSize/4);
              y = centerY + headSize/5 + (Math.random() * headSize/8);
              particle.color = "rgba(0, 230, 65, 0.8)";
              particle.isSpeaking = true; // Mark as a speaking particle
              break;
              
            default:
              x = centerX + (Math.random() * headSize - headSize/2);
              y = centerY + (Math.random() * headSize - headSize/2);
          }
          
          particle.targetX = x;
          particle.targetY = y;
        } else {
          // Random positioning for non-feature particles (general face area)
          const angle = Math.random() * Math.PI * 2;
          const distance = Math.random() * headSize * 0.45;
          
          particle.targetX = centerX + Math.cos(angle) * distance;
          particle.targetY = centerY + Math.sin(angle) * distance;
        }
      }
    };
    
    // Add connection lines between particles to create a wireframe effect
    const drawConnections = (ctx: CanvasRenderingContext2D) => {
      const maxDist = 30; // Maximum distance for connection
      
      ctx.strokeStyle = "rgba(0, 255, 65, 0.15)"; // Subtle green connections
      ctx.lineWidth = 0.5;
      
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        
        // Only draw connections for a subset of particles to avoid too many lines
        if (Math.random() > 0.7) continue;
        
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < maxDist) {
            // Draw line with opacity based on distance
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.globalAlpha = 1 - (dist / maxDist);
            ctx.stroke();
            ctx.globalAlpha = 1;
          }
        }
      }
    };
    
    // Generate initial particles and set target positions
    generateParticles();
    generateTargetPositions();
    
    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw connections between particles (wireframe)
      drawConnections(ctx);
      
      // Update and draw particles
      for (const particle of particles) {
        // Move particles toward their target position
        particle.x += (particle.targetX - particle.x) * particle.speed;
        particle.y += (particle.targetY - particle.y) * particle.speed;
        
        // Add "talking" animation for mouth particles
        if (particle.isSpeaking) {
          if (Math.random() > 0.7) {
            // Randomly adjust position to simulate talking
            particle.x += Math.random() * 3 - 1.5;
            particle.y += Math.random() * 2 - 1;
            
            // Pulse size for speaking effect
            const sizePulse = Math.sin(Date.now() * 0.01) * 0.5 + 1;
            particle.size = particle.originalSize * sizePulse;
          }
        } else {
          // Add slight wobble for all other particles
          if (Math.random() > 0.9) {
            particle.x += Math.random() * 1 - 0.5;
            particle.y += Math.random() * 1 - 0.5;
          }
        }
        
        // Draw particle with glow effect
        const glow = Math.random() > 0.95; // Occasional glow
        
        if (glow) {
          ctx.shadowBlur = 5;
          ctx.shadowColor = "rgba(0, 255, 65, 0.8)";
        }
        
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        
        if (glow) {
          ctx.shadowBlur = 0;
        }
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