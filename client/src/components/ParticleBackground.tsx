import { useEffect } from "react";

declare global {
  interface Window {
    particlesJS: any;
  }
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
                "enable": true,
                "mode": "push"
              },
              "resize": true
            },
            "modes": {
              "grab": {
                "distance": 140,
                "line_linked": {
                  "opacity": 0.8
                }
              },
              "push": {
                "particles_nb": 3
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

  return <div id="particles-js" className="fixed inset-0 z-0"></div>;
}
