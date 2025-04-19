import { useEffect, useRef } from "react";

declare global {
  interface Window {
    particlesJS: any;
  }
}

// Custom polygons component with floating shapes
function FloatingPolygons() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Resize canvas to fill window
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Create polygons
    const polygons: {
      x: number;
      y: number;
      size: number;
      sides: number;
      rotation: number;
      rotationSpeed: number;
      speedX: number;
      speedY: number;
      color: string;
      opacity: number;
    }[] = [];
    
    // Generate random wireframe polygons
    const generatePolygons = () => {
      const count = Math.min(20, Math.max(8, Math.floor(window.innerWidth * window.innerHeight / 70000)));
      
      for (let i = 0; i < count; i++) {
        // Generate more complex wireframe shapes with more sides
        const sides = Math.floor(Math.random() * 5) + 3; // 3 to 7 sides
        
        // For wireframes, we can make them larger since they're not solid
        const size = Math.random() * 60 + 20; // Size between 20-80
        
        polygons.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: size, 
          sides: sides,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.005, // Slower rotation for larger shapes
          speedX: (Math.random() - 0.5) * 0.3, // Slower movement
          speedY: (Math.random() - 0.5) * 0.3, // Slower movement
          color: `rgba(0, ${Math.floor(Math.random() * 155) + 100}, ${Math.floor(Math.random() * 65)}, 0.2)`,
          opacity: Math.random() * 0.2 + 0.1
        });
      }
    };
    
    // Draw a wireframe polygon
    const drawPolygon = (x: number, y: number, size: number, sides: number, rotation: number, color: string) => {
      // Draw the outline only
      ctx.beginPath();
      
      // Calculate all the points
      const points = [];
      for (let i = 0; i < sides; i++) {
        const angle = rotation + (i * 2 * Math.PI / sides);
        const pointX = x + size * Math.cos(angle);
        const pointY = y + size * Math.sin(angle);
        points.push({ x: pointX, y: pointY });
        
        if (i === 0) {
          ctx.moveTo(pointX, pointY);
        } else {
          ctx.lineTo(pointX, pointY);
        }
      }
      ctx.closePath();
      
      // Set styles for wireframe
      ctx.strokeStyle = 'rgba(0, 255, 65, 0.3)';
      ctx.lineWidth = 0.5;
      ctx.stroke();
      
      // Draw inner connection lines for complex shapes (if more than 3 sides)
      if (sides > 3) {
        ctx.beginPath();
        for (let i = 0; i < sides; i++) {
          for (let j = i + 2; j < sides; j++) {
            if (j !== i + sides - 1) { // Skip directly opposite vertices for even-sided polygons
              ctx.moveTo(points[i].x, points[i].y);
              ctx.lineTo(points[j].x, points[j].y);
            }
          }
        }
        ctx.strokeStyle = 'rgba(0, 255, 65, 0.15)';
        ctx.lineWidth = 0.3;
        ctx.stroke();
      }
    };
    
    // Animate polygons
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      for (const polygon of polygons) {
        // Move polygon
        polygon.x += polygon.speedX;
        polygon.y += polygon.speedY;
        polygon.rotation += polygon.rotationSpeed;
        
        // Bounce off edges
        if (polygon.x < -polygon.size || polygon.x > canvas.width + polygon.size) {
          polygon.speedX *= -1;
        }
        if (polygon.y < -polygon.size || polygon.y > canvas.height + polygon.size) {
          polygon.speedY *= -1;
        }
        
        // Draw polygon
        drawPolygon(
          polygon.x, 
          polygon.y, 
          polygon.size, 
          polygon.sides, 
          polygon.rotation, 
          polygon.color
        );
      }
      
      requestAnimationFrame(animate);
    };
    
    generatePolygons();
    animate();
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);
  
  return (
    <canvas 
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
    />
  );
}

export default function ParticleBackground() {
  useEffect(() => {
    // Load particles.js script dynamically
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/particles.js@2.0.0/particles.min.js";
    script.async = true;
    
    script.onload = () => {
      if (window.particlesJS) {
        // Particles.js configuration
        window.particlesJS("particles-js", {
          "particles": {
            "number": {
              "value": 25,
              "density": {
                "enable": true,
                "value_area": 800
              }
            },
            "color": {
              "value": ["#00FF41", "#007320", "#00A032"]
            },
            "shape": {
              "type": "circle",
              "stroke": {
                "width": 0,
                "color": "#000000"
              }
            },
            "opacity": {
              "value": 0.3,
              "random": true,
              "anim": {
                "enable": true,
                "speed": 0.2,
                "opacity_min": 0.1,
                "sync": false
              }
            },
            "size": {
              "value": 1.5,
              "random": true,
              "anim": {
                "enable": true,
                "speed": 1,
                "size_min": 0.1,
                "sync": false
              }
            },
            "line_linked": {
              "enable": true,
              "distance": 150,
              "color": "#00FF41",
              "opacity": 0.2,
              "width": 1
            },
            "move": {
              "enable": true,
              "speed": 0.3,
              "direction": "none",
              "random": true,
              "straight": false,
              "out_mode": "out",
              "bounce": false,
              "attract": {
                "enable": true,
                "rotateX": 600,
                "rotateY": 1200
              }
            }
          },
          "interactivity": {
            "detect_on": "canvas",
            "events": {
              "onhover": {
                "enable": true,
                "mode": "grab"
              },
              "onclick": {
                "enable": false, // Disabled click effects
                "mode": "push"
              },
              "resize": true
            },
            "modes": {
              "grab": {
                "distance": 140,
                "line_linked": {
                  "opacity": 0.5
                }
              }
            }
          },
          "retina_detect": true
        });
      }
    };
    
    document.body.appendChild(script);
    
    return () => {
      // Clean up script when component unmounts
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  return (
    <>
      <div id="particles-js" className="fixed inset-0 z-0"></div>
      <FloatingPolygons />
    </>
  );
}
