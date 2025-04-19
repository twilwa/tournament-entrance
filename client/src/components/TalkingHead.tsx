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
      type: 'outline' | 'fill' | 'glasses' | 'beard';
    }[] = [];
    
    // Generate random particles across the screen
    const generateParticles = () => {
      // Create more particles for a clearer image
      const particleCount = Math.floor((window.innerWidth * window.innerHeight) / 1000);
      
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 3 + 1,
          targetX: 0,
          targetY: 0,
          speed: Math.random() * 0.5 + 0.4, // Slightly faster movement
          color: `rgba(0, ${Math.floor(Math.random() * 155) + 100}, ${Math.floor(Math.random() * 65)}, ${Math.random() * 0.5 + 0.5})`,
          type: 'fill'
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
      
      // Generate outline points first
      const outlineCount = 100; // Number of particles for the head outline
      const outlineParticles = [];
      for (let i = 0; i < outlineCount; i++) {
        const angle = (i / outlineCount) * Math.PI * 2;
        const x = centerX + Math.cos(angle) * headSize * 0.8;
        const y = centerY + Math.sin(angle) * headSize * 0.7;
        
        // Modify shape for beard and hair
        let modifiedY = y;
        if (angle > Math.PI) { // Bottom half - add beard
          modifiedY += headSize * 0.25 * Math.sin(angle);
        } else if (angle > Math.PI/2 && angle < Math.PI*3/2) { // Top half - add hair
          modifiedY -= headSize * 0.1 * Math.sin(angle * 2);
        }
        
        outlineParticles.push({
          x: x,
          y: modifiedY,
          size: 3, // Larger particles for outline
          color: "rgba(0, 255, 65, 0.9)",
          type: 'outline'
        });
      }
      
      // Add glasses
      const glassesParticles = [];
      
      // Left glasses
      for (let i = 0; i < 30; i++) {
        const theta = (i / 30) * Math.PI * 2;
        const x = centerX - headSize * 0.25 + Math.cos(theta) * headSize * 0.15;
        const y = centerY - headSize * 0.1 + Math.sin(theta) * headSize * 0.1;
        glassesParticles.push({
          x, y,
          size: 2,
          color: "rgba(0, 255, 65, 0.9)",
          type: 'glasses'
        });
      }
      
      // Right glasses
      for (let i = 0; i < 30; i++) {
        const theta = (i / 30) * Math.PI * 2;
        const x = centerX + headSize * 0.25 + Math.cos(theta) * headSize * 0.15;
        const y = centerY - headSize * 0.1 + Math.sin(theta) * headSize * 0.1;
        glassesParticles.push({
          x, y,
          size: 2,
          color: "rgba(0, 255, 65, 0.9)",
          type: 'glasses'
        });
      }
      
      // Add beard particles
      const beardParticles = [];
      for (let i = 0; i < 50; i++) {
        const angle = Math.PI / 2 + (i / 50) * Math.PI;
        const dist = headSize * (0.7 + Math.random() * 0.3);
        const x = centerX + Math.cos(angle) * dist * 0.8;
        const y = centerY + Math.sin(angle) * dist;
        beardParticles.push({
          x, y,
          size: 2 + Math.random() * 2,
          color: "rgba(0, 255, 65, 0.7)",
          type: 'beard'
        });
      }
      
      // Combine target positions
      const targetPositions = [
        ...outlineParticles,
        ...glassesParticles,
        ...beardParticles
      ];
      
      // Assign target positions to particles
      for (let i = 0; i < Math.min(particles.length, targetPositions.length); i++) {
        const targetPos = targetPositions[i];
        particles[i].targetX = targetPos.x;
        particles[i].targetY = targetPos.y;
        particles[i].color = targetPos.color;
        particles[i].size = targetPos.size;
        particles[i].type = targetPos.type;
      }
      
      // For any remaining particles, distribute them randomly within the head shape
      for (let i = targetPositions.length; i < particles.length; i++) {
        const particle = particles[i];
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * headSize * 0.7;
        
        // Base head shape (circle)
        let x = centerX + Math.cos(angle) * distance;
        let y = centerY + Math.sin(angle) * distance;
        
        // Modify to make it look like a bearded figure
        if (Math.random() > 0.5 && y > centerY) {
          // Beard area
          y += Math.random() * headSize * 0.3;
          particle.color = "rgba(0, 255, 65, 0.6)";
          particle.type = 'beard';
        } else {
          // General fill
          particle.color = `rgba(0, ${Math.floor(Math.random() * 155) + 100}, ${Math.floor(Math.random() * 65)}, ${Math.random() * 0.3 + 0.2})`;
          particle.type = 'fill';
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