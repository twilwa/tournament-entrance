import { useEffect, useRef } from 'react';

interface WireframeHeadProps {
  isActive: boolean;
}

export default function WireframeHead({ isActive }: WireframeHeadProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  
  // Add subtle animation to the SVG paths
  useEffect(() => {
    if (!isActive || !svgRef.current) return;
    
    const svg = svgRef.current;
    const paths = svg.querySelectorAll('path');
    
    // Function to add random subtle movement to elements
    const animatePaths = () => {
      paths.forEach((path) => {
        // Occasionally pulse opacity or glow strength
        if (Math.random() > 0.9) {
          const newOpacity = 0.7 + Math.random() * 0.3;
          path.style.opacity = newOpacity.toString();
          
          // Occasionally make the stroke glow stronger
          if (Math.random() > 0.8) {
            const glowStrength = 2 + Math.random() * 3;
            path.style.filter = `drop-shadow(0 0 ${glowStrength}px #00FF41)`;
          } else {
            path.style.filter = 'drop-shadow(0 0 2px #00FF41)';
          }
        }
        
        // Animate mouth area more actively
        if (path.classList.contains('mouth') && Math.random() > 0.5) {
          const distortion = Math.random() * 2 - 1;
          path.style.transform = `translateY(${distortion}px)`;
        }
      });
      
      requestAnimationFrame(animatePaths);
    };
    
    const animationId = requestAnimationFrame(animatePaths);
    
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [isActive]);
  
  if (!isActive) return null;

  return (
    <div className="fixed inset-0 z-0 flex items-center justify-center pointer-events-none">
      <svg
        ref={svgRef}
        viewBox="0 0 500 600"
        className="w-full h-full max-w-2xl max-h-2xl opacity-80"
        style={{
          stroke: '#00FF41',
          strokeWidth: '1.5',
          fill: 'none',
          filter: 'drop-shadow(0 0 2px #00FF41)',
          transition: 'opacity 2s ease-in'
        }}
      >
        {/* Head outline */}
        <path 
          d="M250,100 C350,100 400,200 400,300 C400,400 350,500 250,500 C150,500 100,400 100,300 C100,200 150,100 250,100 Z" 
          className="head-outline"
        />
        
        {/* Hair */}
        <path 
          d="M150,150 C180,100 220,80 250,80 C280,80 320,100 350,150" 
          className="hair"
        />
        <path 
          d="M120,200 C100,150 120,100 150,120" 
          className="hair-side"
        />
        <path 
          d="M380,200 C400,150 380,100 350,120" 
          className="hair-side"
        />
        <path 
          d="M170,100 C190,70 210,60 230,50" 
          className="hair-top"
        />
        <path 
          d="M270,50 C290,60 310,70 330,100" 
          className="hair-top"
        />

        {/* Left eye with tech circles */}
        <circle cx="180" cy="250" r="30" className="eye-outline" />
        <circle cx="180" cy="250" r="25" className="eye-inner" />
        <circle cx="180" cy="250" r="15" className="eye-inner" />
        <circle cx="180" cy="250" r="5" className="eye-center" />
        <path 
          d="M155,240 L205,240" 
          className="eye-detail"
        />
        <path 
          d="M155,260 L205,260" 
          className="eye-detail"
        />
        <path 
          d="M170,225 L170,275" 
          className="eye-detail"
        />
        <path 
          d="M190,225 L190,275" 
          className="eye-detail"
        />

        {/* Right eye with tech circles */}
        <circle cx="320" cy="250" r="30" className="eye-outline" />
        <circle cx="320" cy="250" r="25" className="eye-inner" />
        <circle cx="320" cy="250" r="15" className="eye-inner" />
        <circle cx="320" cy="250" r="5" className="eye-center" />
        <path 
          d="M295,240 L345,240" 
          className="eye-detail"
        />
        <path 
          d="M295,260 L345,260" 
          className="eye-detail"
        />
        <path 
          d="M310,225 L310,275" 
          className="eye-detail"
        />
        <path 
          d="M330,225 L330,275" 
          className="eye-detail"
        />
        
        {/* Nose */}
        <path 
          d="M250,280 C260,300 260,320 250,330 C240,320 240,300 250,280" 
          className="nose"
        />
        
        {/* Mouth - this will be animated more */}
        <path 
          d="M200,370 C220,390 280,390 300,370" 
          className="mouth"
        />
        <path 
          d="M190,360 C230,380 270,380 310,360"
          className="mouth"
        />
        
        {/* Beard */}
        <path 
          d="M170,330 C190,400 220,430 250,440 C280,430 310,400 330,330" 
          className="beard"
        />
        <path 
          d="M160,350 C180,420 220,460 250,470 C280,460 320,420 340,350" 
          className="beard"
        />
        
        {/* Tech lines and circuit patterns */}
        <path 
          d="M100,280 L150,280" 
          className="tech-line"
        />
        <path 
          d="M350,280 L400,280" 
          className="tech-line"
        />
        <path 
          d="M120,230 L150,250" 
          className="tech-line"
        />
        <path 
          d="M380,230 L350,250" 
          className="tech-line"
        />
        <path 
          d="M250,500 L250,550" 
          className="tech-line"
        />
        <circle cx="250" cy="560" r="10" className="tech-node" />
        
        {/* Shoulders/clothing hints */}
        <path 
          d="M150,500 C160,520 180,540 200,550" 
          className="clothing"
        />
        <path 
          d="M350,500 C340,520 320,540 300,550" 
          className="clothing"
        />
      </svg>
    </div>
  );
}